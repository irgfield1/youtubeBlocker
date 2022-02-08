//const { contextualIdentities } = require("webextension-polyfill");
let youtubeVideoPattern =
    /(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/;
let radioStatus;


/*******************FUNCTIONS********************/
//map entry creation for url, defaults to allow on pageload
async function write2Browser() {
    radioStatus = await radioChangeListener();
    console.log(radioStatus);
    if (radioStatus == "blacklist" || radioStatus == "whitelist") {
        return;
    }
    browser.tabs.query({ active: true }).then(async (tabs) => {
        let tempUrl = tabs[0].url.slice();
        if (youtubeVideoPattern.test(tempUrl)) {
            readLocalStorage(tempUrl)
                .catch(() => (storagePut(tempUrl, false)));
        }
    });
}

// Key helper function
const readLocalStorage = async (key) => {
    return new Promise((resolve, reject) => {
        browser.storage.local.get(key).then(function (result) {
            if (result[key] === undefined) {
                reject();
            } else {
                resolve(result[key]);
            }
        });
    });
}

async function radioChangeListener() {
    await readLocalStorage("radio").then(data => {
        return data.toLowerCase();
    }).catch(() => {
        return "split";
    })
}

// chrome.extension.onConnect.addListener(function (port) {
//     console.log("Connected .....");
//     port.onMessage.addListener(function (msg) {
//         console.log("message recieved" + msg);
//         port.postMessage("Hi Popup.js");
//     });
// })

function handleProxyRequest(requestInfo) {
    return new Promise((resolve, reject) => {
        if (!requestInfo.url.includes("googlevideo")) {
            resolve({ type: "direct" });
        }
        console.log(`currentTabBlock ${currentTabBlock}`);
        if (currentTabBlock) {
            resolve({ type: "http", host: "127.0.0.1", port: 65535 })
        } else {
            resolve({ type: "direct" })
        }
    });
}

function greenTab() {
    console.log("greenTab init");
    browser.tabs.query({ active: true }).then(async (tabs) => {
        let tempUrl = tabs[0].url.slice();
        let tab = tabs[0];
        console.log(tempUrl);
        await readLocalStorage(tempUrl).then(async (data) => {
            //Success case
            console.log(data);
            if (data[0] == "block") {
                // browser.tabs.sendMessage(tab.id, { cover: true });
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    console.log(tabs);
                    chrome.tabs.sendMessage(tabs[0]?.id, { cover: true }, function (response) {
                        console.log(response);
                    });
                });
                // coverGreen();
            } else if (data[0] == "allow") {
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0]?.id, { cover: false }, function (response) {
                        console.log(response);
                    });
                });
            }
        },
            async (errInfo) => {
                //failure case
                radioStatus = await radioChangeListener();
                if (radioStatus == "blacklist") {
                    browser.tabs.sendMessage(tab.id, { cover: false });
                } else if (radioStatus == "whitelist") {
                    browser.tabs.sendMessage(tab.id, { cover: true })
                    // coverGreen();
                }
            });
    });
}

async function blockCheck() {
    console.log("blockCheck");
    //check url using tabs,
    //apply rule
    //detect changes in url
    //add or remove rule...
    let tab = await getCurrentTab();
    if (typeof tab == "undefined" || typeof tab.url == "undefined") {
        return;
    }
    console.log(tab);
    if (youtubeVideoPattern.test(tab.url)) {
        console.log("Matches regex");
        await readLocalStorage(tab.url).then(
            (data) => {
                console.log(data); //block/allow
                //base rule
                setBrowserRules(data[0]);

                chrome.declarativeNetRequest
                    .getDynamicRules()
                    .then((data) => console.log(data));
            },
            async (data) => {
                //current url not found in storage
                radioStatus = await radioChangeListener();
                if (radioStatus == "blacklist") {
                    setBrowserRules("allow");
                } else if (radioStatus == "whitelist") {
                    setBrowserRules("block");
                }
            }
        );
    } else {
        console.log("Didn't match regex");
    }
}

function setBrowserRules(blockStatus) {
    console.log(blockStatus);
    if (blockStatus == "block") {
        let rule = {
            id: 1,
            priority: 1,
            action: { type: "block" },
            condition: {
                urlFilter: "googlevideo",
                domains: ["youtube.com"],
            },
        };

        chrome.declarativeNetRequest.updateDynamicRules({
            addRules: [rule],
            removeRuleIds: [1],
        });
        console.log(rule);
    } else if (blockStatus == "allow") {
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [1],
        });
    }
}

async function getCurrentTab() {
    chrome.storage.local.get(null).then((data) => console.log(data));
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
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

async function onOptionsMessage(message, sender, sendResponse) {
    console.log(message);
    let url = message?.data;
    let videoTitle = await noAPITitleFromUrl(url);
    console.log(videoTitle);
    console.log(videoTitle + " is the title");
    sendResponse({ title: videoTitle })
}

async function noAPITitleFromUrl(url) {
    console.log("noAPITitleFromUrl : background.js : " + url);
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

/**************LISTENERS************************/

browser.tabs.onActivated.addListener(async () => {
    console.log("onActivated");
    write2Browser();
    blockCheck();
    greenTab();
});
browser.tabs.onUpdated.addListener(() => {
    console.log("onUpdated");
    write2Browser();
    blockCheck();
    greenTab();
});

browser.storage.onChanged.addListener(radioChangeListener);

browser.runtime.onMessage.addListener(onOptionsMessage);

/*/ // Log any errors from the proxy script
// chrome.proxy.onError.addListener(error => {
//     console.error(`Proxy error: ${error}`);
// });
 
// // Listen for a request to open a webpage// calls on every https req
// chrome.proxy.onRequest.addListener(handleProxyRequest3, { urls: ["<all_urls>"] });
*/

if (navigator.userAgent.indexOf("Chrome") != -1) {
    //chromeProxyHandle();
    console.log("Using Chrome");
    var config = {
        mode: "pac_script",
        pacScript: { url: "proxy.pac" },
    };
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
//if statement?
//Lol he says working with an extension is painful
//Allow you to work on it without the browser extension

//check url using tabs,
//apply rule
//detect changes in url
//add or remove rule...
//Lol he says working with an extension is painful
//Allow you to work on it without the browser extension

//Name
//Folder based blocking




// Enumerated changes from main : f36cbef Merge branch videoTitles
// Get video titles from fetch request, not API
// Change Proxy logic from every request to onTabChange
// Change storage data structure
// Element cover for blocked pages
// Is the best option to merge?????? -> could be.....
