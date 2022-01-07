
let youtubeVideoPattern = /(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/;
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
            if (youtubeVideoPattern.test(tempUrl)) {
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

function handleProxyRequest3(requestInfo) {
    console.log(requestInfo);
    return new Promise((resolve, reject) => {
        if (!requestInfo.url.includes("googlevideo")) {
            console.log("Not block worthy");
            reject({ type: "direct" });
        }
        browser.tabs.query({ active: true }).then(async (tabs) => {
            let tempUrl = tabs[0].url.slice();
            await readLocalStorage(tempUrl)
                .then(data => {//found in storage
                    if (data == "allow") {
                        console.log("pass");
                        reject({ type: "direct" });
                    } else if (data == "block") {
                        console.log("proxy");
                        resolve({ type: "http", host: "127.0.0.1", port: 65535 });
                    }
                }, async data => {//not found in storage
                    if (typeof radioStatus == "undefined") {
                        radioStatus = (await readLocalStorage("radio")).toLowerCase();
                    }
                    console.log("not found in storage");
                    if (radioStatus == "blacklist") {
                        console.log("pass");
                        reject({ type: "direct" })
                    } else if (radioStatus == "whitelist") {
                        console.log("proxy");
                        resolve({ type: "http", host: "127.0.0.1", port: 65535 })
                    }
                });
        });
    });
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

// Log any errors from the proxy script
browser.proxy.onError.addListener(error => {
    console.error(`Proxy error: ${error.message}`);
});

// Listen for a request to open a webpage// calls on every https req
browser.proxy.onRequest.addListener(handleProxyRequest3, { urls: ["<all_urls>"] });
