//const { contextualIdentities } = require("webextension-polyfill");
let youtubeVideoPattern =
    /(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/;
let radioStatus;


/*******************TOP LEVEL FUNCTIONS********************/
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
            readLocalStorage(trimYoutubeUrl(tempUrl))
                .catch(() => (storagePut(trimYoutubeUrl(tempUrl), false)));
        }
    });
}

function greenTab() {
    console.log("greenTab init");
    browser.tabs.query({ active: true }).then(async (tabs) => {
        let tempUrl = tabs[0].url.slice();
        let tab = tabs[0];
        console.log(tempUrl);
        if (trimYoutubeUrl(tempUrl) == "Fail") {
            return;
        }
        await readLocalStorage(trimYoutubeUrl(tempUrl)).then(async (data) => {
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

        await readLocalStorage(trimYoutubeUrl(tab.url)).then(
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
/**************HELPERS**************************/

function trimYoutubeUrl(url) {
    console.log(url);
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

// Redefines browser.storage.local.get
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

//url that matches youtubeVideoPattern and a block status
function storagePut(url, block = true) {
    readLocalStorage(url)
        .then(async (data) => {
            console.log(data);
            let contentToStore = {};
            contentToStore[url] = [`${block ? "block" : "allow"}`, data[1]]
            browser.storage.local.set(contentToStore);
        })
        .catch(async () => {
            console.log("storagePut new url");
            let contentToStore = {}
            contentToStore[url] = [`${block ? "block" : "allow"}`, null]
            console.log(contentToStore);
            browser.storage.local.set(contentToStore);
        })
}

// Fetches radio button state from storage with default
async function radioChangeListener() {
    return await readLocalStorage("radio").then(data => {
        console.log(data);
        return data.toLowerCase();
    }).catch(() => {
        return "split";
    })
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
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
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

if (navigator.userAgent.indexOf("Chrome") != -1) {
    console.log("Using Chrome");
} else {
    console.log("firefox detected, this branch compatible with chrome");

}

//****************Code That Doesn't Work******************************* */

// async function onOptionsMessage(message, sender, sendResponse) {
//     console.log(message);
//     let url = message?.data;
//     let videoTitle = await noAPITitleFromUrl(url);
//     console.log(videoTitle);
//     console.log(videoTitle + " is the title");
//     sendResponse({ title: videoTitle })
// }

// async function noAPITitleFromUrl(url) {
//     console.log("noAPITitleFromUrl : background.js : " + url);
//     let title = "";
//     var response = await fetch(url);
//     switch (response.status) {
//         // status "OK"
//         case 200:
//             let result = await response.blob()
//             console.log(result);
//             await result.text().then(text => {
//                 title = text.slice(text.indexOf("<title>") + 7, text.indexOf("</title>"));
//             });
//             console.log(title);
//             return title;
//         // status "Not Found"
//         case 404:
//             console.log('Not Found');
//             return `"${url}" is not a valid video`;
//     }
// }

// async function titleFromCurrentPage() {
//     return new Promise((resolve, reject) => {
//         let title;
//         chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//             if (tabs[0] != null) {
//                 chrome.tabs.sendMessage(tabs[0]?.id, { title: true }, function (response) {
//                     console.log(response);
//                     title = response?.title;
//                     console.log(title);
//                 });
//             }
//         });
//         resolve(title);

//     });
// }






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
