/**
 * The purpose of the background script is block or allow requests to googlevideo urls,
 * the only other task it has is to add new youtube videos to the history list
 * 
 * The browser.tabs.onActivated and onUpdated events set proxy behavior,
 * then handle proxy request manages the web requests themselves
 * 
 */
let youtubeVideoPattern =
    /(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/;
let radioStatus;


/*******************TOP LEVEL FUNCTIONS********************/
//map entry creation for url, defaults to allow on pageload
async function write2Browser() {
    radioStatus = await radioChangeListener();
    if (radioStatus != "split") {
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
    browser.tabs.query({ active: true }).then(async (tabs) => {
        let tempUrl = tabs[0].url.slice();
        let tab = tabs[0];
        if (trimYoutubeUrl(tempUrl) == "Fail") {
            return;
        }
        await readLocalStorage(trimYoutubeUrl(tempUrl)).then(async (data) => {
            //In storage
            chrome.tabs.sendMessage(tab?.id, { cover: data[0] == "block" });
        },
            async () => {
                //Not in storage
                radioStatus = await radioChangeListener();
                if (radioStatus == "whitelist") {
                    browser.tabs.sendMessage(tab.id, { cover: true });
                } else {
                    browser.tabs.sendMessage(tab.id, { cover: false })
                }
            });
    });
}

async function blockCheck() {
    //check url using tabs,
    //apply rule
    //detect changes in url
    //add or remove rule...
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    console.log(tab);
    if (typeof tab == "undefined" || typeof tab.url == "undefined") {
        return;
    }
    if (youtubeVideoPattern.test(tab.url)) {
        console.log("Youtube");

        await readLocalStorage(trimYoutubeUrl(tab.url)).then(
            (data) => {
                console.log(data[0]);
                setBrowserRules(data[0]);

                chrome.declarativeNetRequest
                    .getDynamicRules();
            },
            async (data) => {
                //current url not found in storage
                radioStatus = await radioChangeListener();
                console.log(radioStatus);
                if (radioStatus == "whitelist") {
                    setBrowserRules("block");
                } else {
                    setBrowserRules("allow");
                }
            }
        );
    } else {
        console.log("Didn't match regex");
    }
}
/**************HELPERS**************************/

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
    } else if (blockStatus == "allow") {
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [1],
        });
    }
}

function trimYoutubeUrl(url) {
    if (youtubeVideoPattern.test(url)) {
        return url.slice(url.search("v="))
    } else if (url.length == 13 && url.includes("v=")) {
        if (new RegExp(/[~`!#$%\^&*+=\[\]\\';,/{}|\\":<>\?]/g).test(url.slice(2))) { //prevent v=...&c=...
            return "Fail"
        } else {
            return url
        }
    } else {// Not youtube
        return "Fail";
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
        return data.toLowerCase();
    }).catch(() => {
        return "split";
    })
}

/**************LISTENERS************************/
//because blockCheck and greenTab have self contained logic, they can run without await-ing
browser.tabs.onActivated.addListener(() => {
    write2Browser();
    blockCheck();
    greenTab();
});
browser.tabs.onUpdated.addListener(() => {
    write2Browser();
    blockCheck();
    greenTab();
});

if (navigator.userAgent.indexOf("Chrome") != -1) {
    console.log("Using Chrome");
} else {
    console.log("firefox detected, this should cause a manifest version error");

}
