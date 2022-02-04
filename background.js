//const { contextualIdentities } = require("webextension-polyfill");
let youtubeVideoPattern =
    /(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/;
let radioStatus;
let currentTabBlock = false;

/*******************FUNCTIONS********************/
//map entry creation for url, defaults to allow on pageload
function write2Browser() {
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
    console.log(key);
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

// Updates radioStatus within this file
// function radioChangeListener(changes = {}) {
//     console.log(changes);
//   if (changes.hasOwnProperty("radio")) {
//       console.log("Has radio");
//     radioStatus = changes.radio.newValue.toLowerCase();
//   } else {
//       console.log("has not radio");
//     radioStatus = "split";
//   }
//   console.log(radioStatus);
function radioChangeListener(changes, area) {
    if (changes.hasOwnProperty("radio")) {
        radioStatus = changes.radio.newValue.toLowerCase();
    }
}

async function setTabBlock() {
    await browser.tabs.query({ active: true }).then(async (tabs) => {
        let tempUrl = tabs[0].url.slice();
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
    });
}


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
    browser.tabs.query({ active: true }).then(async (tabs) => {
        let tempUrl = tabs[0].url.slice();
        let tab = tabs[0];
        console.log(tempUrl);
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
    });
}

function chromeProxyHandle() {
    //check url using tabs,
    //apply rule
    //detect changes in url
    //add or remove rule...
    if (!requestInfo.url.includes("googlevideo")) {
        console.log("Not block worthy");
        resolve({ type: "direct" });
    }
    browser.tabs.query({ active: true }).then(async (tabs) => {
        let tempUrl = tabs[0].url.slice();
        await readLocalStorage(tempUrl).then(
            (data) => {
                //found in storage
                if (data == "allow") {
                    console.log("pass");
                    resolve({ type: "direct" });
                } else if (data == "block") {
                    console.log("proxy");
                    resolve({ type: "http", host: "127.0.0.1", port: 65535 });
                }
            },
            async (data) => {
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
                }
            }
        );
    });
}

async function blockCheck() {
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
        await readLocalStorage(tab.url).then(
            (data) => {
                console.log(data); //block/allow
                //base rule
                setBrowserRules(data);

                chrome.declarativeNetRequest
                    .getDynamicRules()
                    .then((data) => console.log(data));
            },
            async (data) => {
                //current url not found in storage
                if (typeof radioStatus == "undefined") {
                    radioStatus = (await readLocalStorage("radio")).toLowerCase();
                }
                if (radioStatus == "blacklist") {
                    setBrowserRules("allow");
                } else if (radioStatus == "whitelist") {
                    setBrowserRules("block");
                }
            }
        );
    }
}

function setBrowserRules(blockStatus) {
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

browser.tabs.onActivated.addListener(async () => {
    write2Browser();
    blockCheck();
    setTabBlock();
    greenTab();
});
browser.tabs.onUpdated.addListener(() => {
    write2Browser();
    blockCheck();
    setTabBlock();
    greenTab();
});

browser.storage.onChanged.addListener(radioChangeListener);

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