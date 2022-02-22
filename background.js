/**
 * The purpose of the background script is specifically to proxy requests,
 * the only other task it has is to add new youtube videos to the history list
 * 
 * The browser.tabs.onActivated and onUpdated events set proxy behavior,
 * then handle proxy request manages the web requests themselves
 * 
 */

const youtubeVideoPattern =
    /(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/;
const youtubeString = "https://www.youtube.com/watch?"
let radioStatus;
let currentTabBlock = false;

/*******************onActivated, onUpdated********************/
//map entry creation for url, defaults to allow on pageload
function write2Browser() {
    if (radioStatus != "split") {
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

//Sets currentTabBlock for active tab, so it only runs the logic once while you're on the page
async function setTabBlock() {
    await browser.tabs.query({ active: true })
        .then(async (tabs) => {
            if (youtubeVideoPattern.test(tabs[0].url.slice())) {
                let tempUrl = trimYoutubeUrl(tabs[0].url.slice());
                if (tempUrl == "Fail") {
                    currentTabBlock = false;
                }
                await readLocalStorage(tempUrl).then(
                    (data) => {
                        //found in storage
                        currentTabBlock = (data[0] == "allow" ? false : true);
                    }).catch(async () => {
                        //not found in storage
                        if (typeof radioStatus == "undefined") {
                            readLocalStorage("radio")
                                .then(data => radioStatus = data.toLowerCase())
                                .catch(() => {
                                    radioStatus = "split";
                                    currentTabBlock = false;
                                });

                        }
                        if (radioStatus == "blacklist") {
                            currentTabBlock = false;
                        } else if (radioStatus == "whitelist") {
                            currentTabBlock = true
                        }
                    });
            } else {
                currentTabBlock = false;
            }
        })
        .catch(err => console.error(err));
}

// Send message to content script to overlay video html element with green div
function greenTab() {
    browser.tabs.query({ active: true }).then(async (tabs) => {
        if (youtubeVideoPattern.test(tabs[0].url.slice())) {
            let tempUrl = trimYoutubeUrl(tabs[0].url.slice())
            let tab = tabs[0];

            await readLocalStorage(tempUrl).then(async (data) => {
                //In Storage
                if (data[0] == "block") {
                    browser.tabs.sendMessage(tab.id, { cover: true });
                } else if (data[0] == "allow") {
                    browser.tabs.sendMessage(tab.id, { cover: false })
                }
            },
                () => {
                    //Not in storage
                    if (radioStatus == "whitelist") {
                        browser.tabs.sendMessage(tab.id, { cover: true });
                    } else {
                        browser.tabs.sendMessage(tab.id, { cover: false })
                    }
                });
        }
    });
}

/******************PROXY********************/
function handleProxyRequest(requestInfo) {
    // console.log(requestInfo);
    return new Promise(async (resolve, reject) => {
        if (!requestInfo.url.includes("googlevideo")) {
            resolve({ type: "direct" });
        }

        if (await fromCurrentTab(requestInfo)) {
            if (currentTabBlock) {
                resolve({ type: "http", host: "127.0.0.1", port: 65535 })
            } else {
                resolve({ type: "direct" })
            }
        } else {
            if (await blockSideTab(requestInfo)) {
                resolve({ type: "http", host: "127.0.0.1", port: 65535 });
            } else {
                resolve({ type: "direct" });
            }
        }
    });
}


/****************HELPERS*********************/
//handleProxyRequest
async function fromCurrentTab(requestInfo) {
    return browser.tabs.query({ active: true }).then(data => {
        return (data[0]?.id) == (requestInfo?.tabId);
    })
}

//handleProxyRequest
// block if true
async function blockSideTab(requestInfo) {
    if (requestInfo?.tabId > 0) {
        return await browser.tabs.get(requestInfo?.tabId).then(async tab => {
            return await readLocalStorage(trimYoutubeUrl(tab?.url)).then((data) => {
                //found in storage
                return data[0] == "allow";
            }).catch(async () => {
                if (typeof radioStatus == "undefined") {
                    return readLocalStorage("radio")
                        .then(data => {
                            radioStatus = data.toLowerCase();
                            if (radioStatus == "blacklist") {
                                return false;
                            } else if (radioStatus == "whitelist") {
                                return true
                            }
                        })
                        .catch(() => {
                            radioStatus = "split";
                            return false;
                        });

                }
                if (radioStatus == "blacklist") {
                    return false;
                } else if (radioStatus == "whitelist") {
                    return true;
                }

            });
        });
    }
}

//write2Browser
async function storagePut(url, block = true) {
    await readLocalStorage(url)
        .then(async (data) => {
            let contentToStore = {};
            if (data[1].length == 0) data[1] = await noAPITitleFromUrl(url);

            contentToStore[url] = [`${block ? "block" : "allow"}`, data[1]];
            await browser.storage.local.set(contentToStore);
        })
        .catch(async () => {
            let contentToStore = {};
            const title = await noAPITitleFromUrl(url);
            contentToStore[url] = [`${block ? "block" : "allow"}`, title];
            await browser.storage.local.set(contentToStore);
        })
}

//storagePut
async function noAPITitleFromUrl(url) {
    let title = "";
    if (url.length == 13) url = youtubeString + url;

    var response = await fetch(url);
    switch (response.status) {
        // status "OK"
        case 200:
            let result = await response.blob()
            await result.text().then(text => {
                title = text.slice(text.indexOf("<title>") + 7, text.indexOf("</title>"));
            });
            return title;
        // status "Not Found"
        case 404:
            return `"${url}" is not a valid video`;

    }

}

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

// Key helper function
function trimYoutubeUrl(url) {
    if (youtubeVideoPattern.test(url)) {
        return url.slice(url.search("v="))
    } else if (url.length == 13 && url.includes("v=")) {
        if (new RegExp(/[~`!#$%\^&*+=\[\]\\';,/{}|\\":<>\?]/g).test(url.slice(2))) { //prevent v=...&c=...
            return "Fail"
        } else {
            return url
        }
    } else {
        // Not youtube
        return "Fail";
    }
}

/**************LISTENERS************************/
browser.tabs.onActivated.addListener(async () => {
    write2Browser();
    await setTabBlock();
    greenTab();
});
browser.tabs.onUpdated.addListener(async () => {
    write2Browser();
    await setTabBlock();
    greenTab();
});

// Checks and updates radioStatus
browser.storage.onChanged.addListener((changes) => {
    if (changes.hasOwnProperty("radio")) {
        radioStatus = changes.radio.newValue.toLowerCase();
    }
});

// Log any errors from the proxy script
browser.proxy.onError.addListener((error) => {
    console.error(`Proxy error: ${error}`);
});

// Listen for a request to open a webpage// calls on every https req
browser.proxy.onRequest.addListener(handleProxyRequest, {
    // Track all tabs and urls - It's invasive I know, but idk what url of the request this field looks at
    urls: ["<all_urls>"],
});
