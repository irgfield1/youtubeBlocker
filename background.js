
let pattern = /(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/;
/*
radioStatus - one of 3, 
blacklist - all non listed are allowed, 
whitelist - all nonlisted are blocked,
split - add new urls when visiting a youtube page, default to allow
*/
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
        await readLocalStorage(tempUrl).then(() => present = true).catch(() => present = false);
        // console.log(present);
        if (present) {
            // console.log(tempUrl + " found in storage");
            return;
        } else {
            if (pattern.test(tempUrl)) {
                // console.log(pattern);
                // console.log(tempUrl + " new youtube url");
                let contentToStore = {};
                contentToStore[tempUrl] = "allow";
                browser.storage.local.set(contentToStore);
            } else {
                // console.log(tempUrl + " not youtube");
            }
        }

    })
}

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

function radioChangeListener(changes, area) {
    if (changes.hasOwnProperty("radio")) {
        radioStatus = changes.radio.newValue.toLowerCase();
    }
    console.log(radioStatus);
    console.log(area);
}

function handleProxyRequest2(requestInfo) {
    console.log(requestInfo);
    return new Promise(async (resolve, reject) => {
        let proxyObj = {};
        if (requestInfo.hasOwnProperty("originUrl")) {
            if (!youtubeVideoPattern.test(requestInfo.originUrl)) {
                proxyObj.type = "direct";
                reject({ type: "direct" });
            }
            await readLocalStorage(requestInfo.originUrl)
                .then(data => {//found in storage
                    console.log("found in storage");
                    if (data == "allow") {
                        console.log("pass");
                        proxyObj = { type: "direct", url: requestInfo.originUrl, destUrl: requestInfo.url };
                        reject({ type: "direct" });
                    } else if (data == "block") {
                        console.log("proxy");
                        proxyObj = { type: "http", host: "127.0.0.1", port: 65535, url: requestInfo.originUrl, destUrl: requestInfo.url };
                        resolve({ type: "http", host: "127.0.0.1", port: 65535 });
                    }
                }, async data => {//not found in storage
                    if (typeof radioStatus == "undefined") {
                        radioStatus = (await readLocalStorage("radio")).toLowerCase();

                    }
                    console.log("not found in storage");
                    if (radioStatus == "blacklist") {
                        console.log("pass");
                        proxyObj = { type: "direct", url: requestInfo.originUrl, destUrl: requestInfo.url };
                        reject({ type: "direct" })
                    } else if (radioStatus == "whitelist") {
                        console.log("proxy");
                        proxyObj = { type: "http", host: "127.0.0.1", port: 65535, url: requestInfo.originUrl, destUrl: requestInfo.url };
                        resolve({ type: "http", host: "127.0.0.1", port: 65535 })
                    }
                });
            console.log(proxyObj);
            if (proxyObj.hasOwnProperty("port")) {
                console.log("block");
                resolve({ type: "http", host: "127.0.0.1", port: 65535 })
            } else {
                console.log("pass");
                reject({ type: "direct" })
            }
            console.log("unreachable");
        } else {
            reject({ type: "direct" });
        }
    })
}

//checks for url match, and proxys the whole page based on originURL
function handleProxyRequest(requestInfo) {
    console.log(requestInfo);
    return new Promise(async (resolve, reject) => {
        if (!pattern.test(requestInfo.originUrl)) {
            reject({ type: "direct" })
        }
        if (typeof radioStatus == "undefined") {
            radioStatus = (await readLocalStorage("radio")).toLowerCase();

        }
        if (radioStatus == "blacklist") {
            console.log("line 75");
            resolve(blacklistProxyHandler(requestInfo));
        } else if (radioStatus == "split") {
            console.log("line 78");
        } else if (radioStatus == "whitelist") {
            console.log("line81");
            resolve(whitelistProxyHandler(requestInfo));
        }
        await browser.storage.local.get(requestInfo.originUrl)
            .then(data => {
                //console.log(data[requestInfo.originUrl]);
                if (data[requestInfo.originUrl] == "block") {
                    console.log("block");
                    resolve({ type: "http", host: "127.0.0.1", port: 65535 });
                } else {
                    // console.log("pass through - ");
                    reject({ type: "direct" });
                }
            })
            .catch(err => console.error(err));


    })
    //return new Promise((resolve, reject) => {


    //})


    // // Read the web address of the page to be visited
    // const url = new URL(requestInfo.originUrl);
    // console.log(url.hostname);
    // // Determine whether the domain in the web address is on the blocked hosts list
    // if (blockedHosts.findIndex(requestInfo.originUrl) != -1) {

    //     // Write details of the proxied host to the console and return the proxy address
    //     console.log(`Proxying: ${requestInfo.url.hostname}`);
    //     return { type: "http", host: "127.0.0.1", port: 65535 };
    // }
    // // Return instructions to open the requested webpage
    // return { type: "direct" };
}


function blacklistProxyHandler(requestInfo) {
    return new Promise(async (resolve, reject) => {
        console.log("blacklist reqs");
        await readLocalStorage(requestInfo.originUrl)
            .then(data => {
                if (data == "block") {
                    resolve({ type: "http", host: "127.0.0.1", port: 65535 });

                }
                console.log(data[requestInfo.originUrl]);
                if (data[requestInfo.originUrl] != "allow") {
                    console.log("block");
                    resolve({ type: "http", host: "127.0.0.1", port: 65535 });
                } else {
                    reject({ type: "direct" });
                }
            })
            .catch(err => {
                console.error(err)

                reject({ type: "direct" })
            });

    })
}

function whitelistProxyHandler(requestInfo) {
    return new Promise(async (resolve, reject) => {
        console.log("whitelist reqs");
        await readLocalStorage(requestInfo.originUrl)
            .then(data => {
                if (data == "allow") {
                    reject({ type: "direct" });
                }
                console.log(data[requestInfo.originUrl]);
                if (data[requestInfo.originUrl] == "block") {
                    resolve({ type: "http", host: "127.0.0.1", port: 65535 });
                } else {
                    reject({ type: "direct" });
                }
            })
            .catch(err => {
                console.error(err);
                console.error(requestInfo.originUrl);
                if (pattern.test(requestInfo.originUrl)) {
                    requestInfo({ type: "http", host: "127.0.0.1", port: 65535 });
                }
            });

    })
}

async function updateBlocklist() {
    return new Promise((resolve, reject) => {
        browser.storage.get()
            .then(data => {

            })
            .catch(err => console.error(err));


    })
}


/**************LISTENERS************************/

//document.addEventListener("DOMContentLoaded", listHistory);
browser.tabs.onActivated.addListener(async () => {
    // console.log("onActivated");
    write2Browser();
});
browser.tabs.onUpdated.addListener(() => {
    // console.log("onUpdated");
    write2Browser();
});

browser.storage.onChanged.addListener(radioChangeListener)

//New Stuff

// Log any errors from the proxy script
browser.proxy.onError.addListener(error => {
    console.error(`Proxy error: ${error.message}`);
});

// Listen for a request to open a webpage// calls on every https req
browser.proxy.onRequest.addListener(handleProxyRequest, { urls: ["<all_urls>"] });

/***************EXTRA****************************/

/* mad useful
browser.tabs.query({ windowId: myWindowId, active: true }).then((tabs) => {
        let contentToStore = {};
        contentToStore[tabs[0].url] = contentBox.textContent;
        browser.storage.local.set(contentToStore);
    });
*/

//Or maybe cause pulling from storage doesn't take too long just do that real quicky-icky
