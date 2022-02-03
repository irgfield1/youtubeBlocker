let youtubeVideoPattern =
    /(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/;
let radioStatus;

/*******************FUNCTIONS********************/
//map entry creation for url, defaults to allow on pageload
function write2Browser() {
    if (radioStatus == "blacklist" || radioStatus == "whitelist") {
        return;
    }
    browser.tabs.query({ active: true }).then(async (tabs) => {
        let tempUrl = tabs[0].url.slice();
        let present = true;
        await readLocalStorage(tempUrl)
            .then(() => (present = true))
            .catch(() => (present = false));
        // console.log(present);
        if (present) {
            // console.log(tempUrl + " found in storage");
            return;
        } else {
            if (youtubeVideoPattern.test(tempUrl)) {
                storagePut(tempUrl, false);
            } else {
                // console.log(tempUrl + " not youtube");
            }
        }
    });
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

// Updates radioStatus within this file
function radioChangeListener(changes, area) {
    if (changes.hasOwnProperty("radio")) {
        radioStatus = changes.radio.newValue.toLowerCase();
    }
}

// Handling for firefox
function handleProxyRequest3(requestInfo) {
    //  console.log(requestInfo);
    return new Promise((resolve, reject) => {
        if (!requestInfo.url.includes("googlevideo")) {
            // console.log("Not block worthy");
            resolve({ type: "direct" });
        }
        browser.tabs.query({ active: true }).then(async (tabs) => {
            let tempUrl = tabs[0].url.slice();
            await readLocalStorage(tempUrl).then(
                (data) => {
                    console.log(data);
                    //found in storage
                    if (data[0] == "allow") {
                        console.log("pass");
                        resolve({ type: "direct" });
                    } else if (data[0] == "block") {
                        console.log("proxy");
                        resolve({ type: "http", host: "127.0.0.1", port: 65535 });
                    } else {
                        resolve({ type: "direct" })
                    }
                },
                async () => {
                    //not found in storage
                    if (typeof radioStatus == "undefined") {
                        radioStatus = (await readLocalStorage("radio")).toLowerCase();
                    }
                    console.log("not found in storage");
                    if (radioStatus == "blacklist") {
                        console.log("pass");
                        resolve({ type: "direct" });
                    } else if (radioStatus == "whitelist") {
                        console.log("proxy");
                        resolve({ type: "http", host: "127.0.0.1", port: 65535 });
                    } else {
                        resolve({ type: "direct" })
                    }
                }
            );
        });
    });
}

function checkTab() {
    browser.tabs.query({ active: true }).then(async (tabs) => {
        let tempUrl = tabs[0].url.slice();
        let tab = tabs[0];
        console.log(tempUrl);
        await readLocalStorage(tempUrl).then(async (data) => {
            //Success case
            if (data == "block") {
                console.log("coverGreen");
                browser.tabs.sendMessage(tab.id, { cover: true });
                // coverGreen();
            } else if (data == "allow") {
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

//On Firefox Branch, JUST HERE TO PREVENT "let result = chromeBlocking(info);" from breaking
function chromeBlocking(requestInfo) {
    //technically we can use promises, I just don't know how
    chrome.tabs.query({ active: true }).then(async (tabs) => {
        let tempUrl = tabs[0].url.slice();
        console.log(tempUrl);
    });
    return { protect: "the child" };
}

/**************LISTENERS************************/

//document.addEventListener("DOMContentLoaded", listHistory);
browser.tabs.onActivated.addListener(async () => {
    // console.log("onActivated");
    write2Browser();
    checkTab();
});
browser.tabs.onUpdated.addListener(() => {
    // console.log("onUpdated");
    write2Browser();
    checkTab();
});

// Checks and updates radioStatus
browser.storage.onChanged.addListener(radioChangeListener);

/*/ // Log any errors from the proxy script
// chrome.proxy.onError.addListener(error => {
//     console.error(`Proxy error: ${error}`);
// });
 
// // Listen for a request to open a webpage// calls on every https req
// chrome.proxy.onRequest.addListener(handleProxyRequest3, { urls: ["<all_urls>"] });
*/
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
    browser.proxy.onRequest.addListener(handleProxyRequest3, {
        urls: ["<all_urls>"],
    });
}
//cross platform
//Lol he says working with an extension is painful
//Allow you to work on it without the browser extension

//Name
//Folder based blocking




////// SEND MESSAGE TO CONTENT SCRIPT, TAB.ID????