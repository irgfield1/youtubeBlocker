let youtubeVideoPattern =
    /(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/;
let youtubeString = "https://www.youtube.com/watch?"
let radioStatus;
let currentTabBlock = false;

/*******************FUNCTIONS********************/
//map entry creation for url, defaults to allow on pageload
function write2Browser() {
    if (radioStatus == "blacklist" || radioStatus == "whitelist") {
        return;
    }
    browser.tabs.query({ active: true }).then(async (tabs) => {
        if (youtubeVideoPattern.test(tabs[0].url.slice())) {
            let tempUrl = trimYoutubeUrl(tabs[0].url.slice());

            if (tempUrl != "Fail") {
                readLocalStorage(tempUrl)
                    .catch(() => (storagePut(tempUrl, false)));
            }
        }
    });
}


// Updates radioStatus within this file
function radioChangeListener(changes, area) {
    if (changes.hasOwnProperty("radio")) {
        radioStatus = changes.radio.newValue.toLowerCase();
    }
}

async function setTabBlock() {
    await browser.tabs.query({ active: true }).then(async (tabs) => {
        if (youtubeVideoPattern.test(tabs[0].url.slice())) {
            let tempUrl = trimYoutubeUrl(tabs[0].url.slice());
            console.log(tabs[0].url.slice());
            console.log(tempUrl);
            await readLocalStorage(tempUrl).then(
                (data) => {
                    console.log(data);
                    //found in storage
                    currentTabBlock = data[0] == "allow" ? false : true;
                },
                async () => {
                    //not found in storage
                    if (typeof radioStatus == "undefined") {
                        radioStatus = (await readLocalStorage("radio")).toLowerCase();
                    }
                    if (radioStatus == "blacklist") {
                        currentTabBlock = false;
                    } else if (radioStatus == "whitelist") {
                        currentTabBlock = true
                    }
                }
            );
        }
    })
        .catch(err => console.error(err));
}


function handleProxyRequest(requestInfo) {
    console.log(requestInfo);
    blockSideTab(requestInfo);
    return new Promise((resolve, reject) => {
        if (!requestInfo.url.includes("googlevideo")) {
            resolve({ type: "direct" });
        }

        if (fromCurrentTab(requestInfo)) {
            console.log(`currentTabBlock ${currentTabBlock}`);
            if (currentTabBlock) {
                resolve({ type: "http", host: "127.0.0.1", port: 65535 })
            } else {
                resolve({ type: "direct" })
            }
        } else {
            if (blockSideTab(requestInfo)) {
                resolve({ type: "http", host: "127.0.0.1", port: 65535 });
            } else {
                resolve({ type: "direct" });
            }
        }

        // evaluate request from separate tab -- blockSideTab()
    });
}
async function fromCurrentTab(requestInfo) {
    return browser.tabs.query({ active: true }).then(data => {
        return (data[0]?.id) == (requestInfo?.tabId);
    })
}

// True if block
async function blockSideTab(requestInfo) {
    if (requestInfo?.tabId > 0) {
        return await browser.tabs.get(requestInfo?.tabId).then(async tab => {
            return await readLocalStorage(trimYoutubeUrl(tab?.url)).then((data) => {
                //found in storage
                return data[0] == "allow";
            }, async (err) => {
                console.error(err)
                if (typeof radioStatus == "undefined") {
                    radioStatus = (await readLocalStorage("radio")).toLowerCase();
                }
                if (radioStatus == "blacklist") {
                    return false;
                } else if (radioStatus == "whitelist") {
                    return true
                }
            }
            )
        }).catch(err => console.error(err))
    }
}

function greenTab() {
    browser.tabs.query({ active: true }).then(async (tabs) => {
        if (youtubeVideoPattern.test(tabs[0].url.slice())) {
            let tempUrl = trimYoutubeUrl(tabs[0].url.slice())
            let tab = tabs[0];
            await readLocalStorage(tempUrl).then(async (data) => {
                //Success case
                if (data[0] == "block") {
                    console.log("coverGreen");
                    browser.tabs.sendMessage(tab.id, { cover: true });
                    // coverGreen();
                } else if (data[0] == "allow") {
                    console.log("This video should play");
                    browser.tabs.sendMessage(tab.id, { cover: false })
                }
            },
                (errInfo) => {
                    //failure case
                    if (radioStatus == "blacklist") {
                        console.log("This video should play");
                        browser.tabs.sendMessage(tab.id, { cover: false });
                    } else if (radioStatus == "whitelist") {
                        console.log("coverGreen");
                        browser.tabs.sendMessage(tab.id, { cover: true })
                        // coverGreen();
                    }
                });
        }
    });
}

//url that matches youtubeVideoPattern and a block status
function storagePut(url, block = true) {
    readLocalStorage(url)
        .then((data) => {
            console.log(data);
            let contentToStore = {};
            if (block) {
                contentToStore[url] = ["block", data[1]];
            } else {
                contentToStore[url] = ["allow", data[1]];
            }
            console.log(contentToStore);
            browser.storage.local.set(contentToStore);
        })
        .catch(async () => {
            let contentToStore = {}
            const title = await noAPITitleFromUrl(url);
            contentToStore[url] = [`${block ? "block" : "allow"}`, title]
            console.log(contentToStore);
            browser.storage.local.set(contentToStore);
        })
}

async function noAPITitleFromUrl(url) {
    console.log("noAPITitleFromUrl");
    let title = "";
    if (url.length == 13) {
        url = youtubeString + url;
    }
    var response = await fetch(url);
    switch (response.status) {
        // status "OK"
        case 200:
            let result = await response.blob()
            console.log(result);
            await result.text().then(text => {
                title = text.slice(text.indexOf("<title>") + 7, text.indexOf("</title>"));
            });
            console.log(title);
            return title;
        // status "Not Found"
        case 404:
            console.log('Not Found');
            return `"${url}" is not a valid video`;

    }

}

// TODO: get rid of this
//On Firefox Branch, JUST HERE TO PREVENT "let result = chromeBlocking(info);" from breaking
function chromeBlocking(requestInfo) {
    //technically we can use promises, I just don't know how
    chrome.tabs.query({ active: true }).then(async (tabs) => {
        let tempUrl = tabs[0].url.slice();
        console.log(tempUrl);
    });
    return { protect: "the child" };
}

/****************HELPERS ********************/

// Key helper function
const readLocalStorage = async (key) => {
    return new Promise((resolve, reject) => {
        browser.storage.local.get(key, function (result) {
            if (result[key] === undefined) {
                reject();
            } else {
                resolve(result[key]);
            }
        });
    });
};


function trimYoutubeUrl(url) {
    let trimUrl;
    if (youtubeVideoPattern.test(url)) {
        trimUrl = url.slice(url.search("v="))
    } else if (url.length == 11) {
        trimUrl = "v=" + url;
    } else if (url.length == 13) {
        trimUrl = url;
    } else if (url.length > 13) {
        console.log(`${url} is too long, should be "v=" and the next 11 chars`);
        return "Fail"
    } else if (url.length < 11 || url.length == 12) {
        console.log(`${url} is too short, should be "v=" and the next 11 chars`);
        return "Fail";
    }
    if (new RegExp(/[~`!#$%\^&*+=\[\]\\';,/{}|\\":<>\?]/g).test(trimUrl.slice(2))) {
        return "Fail"
    } else {
        return trimUrl
    }
}
/**************LISTENERS************************/

//document.addEventListener("DOMContentLoaded", listHistory);
browser.tabs.onActivated.addListener(async () => {
    // console.log("onActivated");
    write2Browser();
    setTabBlock();
    greenTab();
});
browser.tabs.onUpdated.addListener(() => {
    // console.log("onUpdated");
    write2Browser();
    setTabBlock();
    greenTab();
});

// Checks and updates radioStatus
browser.storage.onChanged.addListener(radioChangeListener);

//Browser differences
if (navigator.userAgent.indexOf("Chrome") != -1) {
    //chromeProxyHandle();
    chrome.webRequest.onBeforeRequest.addListener(
        (info) => {
            let result = chromeBlocking(info);
            console.log(result);
            console.log(info?.url);
            if (!info?.url.includes("googlevideo")) {
                console.log("Not block worthy");
                return;
            } else {
                console.log("block the dude");
                return { cancel: true };
            }
        },
        { urls: ["<all_urls>"] },
        ["blocking"]
    );

    console.log("Using Chrome");
    var config = {
        mode: "pac_script",
        pacScript: { url: "proxy.pac" },
    };
    chrome.proxy.settings.set(
        { value: config, scope: "regular" },
        function () { }
    );
    // chrome.proxy.onRequest.addListener(handleProxyRequest3, { urls: ["<all_urls>"] });
} else {
    console.log("firey foxy ditected");
    // Log any errors from the proxy script
    browser.proxy.onError.addListener((error) => {
        console.error(`Proxy error: ${error}`);
    });

    // Listen for a request to open a webpage// calls on every https req
    browser.proxy.onRequest.addListener(handleProxyRequest, {
        urls: ["<all_urls>"],
    });
}
//cross platform
//Lol he says working with an extension is painful
//Allow you to work on it without the browser extension

// Track all tabs and urls - It's invasive I know, but idk how else to do it
// Listen on all requests (already happening)
// Get request source tab & url
// 