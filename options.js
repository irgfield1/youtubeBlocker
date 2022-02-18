"use strict";

const pattern =
    /(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/;
const youtubeString = "https://www.youtube.com/watch?"
let radioStatus;

///////////////////////////////////////////////
/**************HTML FUNCTIONS*****************/
// displays url : blocking pairs in options menu
async function fillHtml() {
    console.log("Line 9");
    browser.storage.local
        .get(null)
        .then((data) => {
            if (typeof data != "undefined") {
                let myList = document.getElementById("history");
                while (myList.firstChild) {
                    myList.removeChild(myList.firstChild);
                }
                for (let i = 0; i < Object.keys(data).length; i++) {
                    if (Object.keys(data)[i].includes("v=")) {
                        let myUrl = Object.values(data)[i][1] == null ? youtubeString + Object.keys(data)[i] : Object.values(data)[i][1] + " : " + Object.values(data)[i][0];
                        var li = document.createElement("li");
                        li.appendChild(document.createTextNode(myUrl));
                        myList.appendChild(li);
                    }
                }
            } else {
                let myList = document.getElementById("history");
                var li = document.createElement("li");
                li.appendChild(document.createTextNode("Storage is empty"));
                myList.appendChild(li);
            }
        })
        .catch((err) => console.error(err));
}

//creates checkbox for each map entry, checkboxes toggle block status
function fillHtmlChecks() {
    browser.storage.local.get().then((data) => {
        if (data != undefined && data != null) {
            let myList = document.querySelector(".blockable_url_list");
            while (myList.firstChild) {
                myList.removeChild(myList.firstChild);
            }
            for (let i = 0; i < Object.keys(data).length; i++) {
                if (Object.keys(data)[i].includes("v=")) {
                    makeCheckboxHtml(myList, data, i)
                    addCheckboxHandlers(Object.values(data)[i], i);
                }
            }
        } else {
            // console.log("empty storage");
        }
    })
        .catch(err => {
            err != null ? console.error(err) : console.log("Unknown Error");
        })
}

// Radio button selection persists
function precheckRadioBtn() {
    readLocalStorage("radio")
        .then((data) => {
            let myRadio = document.getElementById(data.toLowerCase());
            myRadio.checked = "true";

            if (myRadio.value.toLowerCase() == "whitelist") {
                document.getElementById("postBtn").textContent = "Allow";
            }
        })
        .catch(() => {
            document.getElementById("split").checked = true;
        });
}

// Checkboxes toggle with list
function toggleChecks() {
    let bulletList = document.getElementById("history");
    let checksList = document.getElementById("checks");
    let button = document.getElementById("checksBtn");

    if (bulletList.classList.contains("hidden")) {
        bulletList.classList.remove("hidden");
        checksList.classList.add("hidden");
        button.textContent = "Checkbox Style";
    } else {
        bulletList.classList.add("hidden");
        checksList.classList.remove("hidden");
        button.textContent = "Bullets Style";
    }
    updateHtml();
}

// updates HTML (from storage) and hides whichever was hidden before... probably could load only whichever is currently displayed...
function updateHtml() {
    let status = document.getElementById("history").classList.contains("hidden");

    fillHtml();
    fillHtmlChecks();

    if (status || typeof status == "undefined") {
        document.getElementById("history").classList.add("hidden");
    } else {
        document.getElementById("checks").classList.add("hidden");
    }
}

function makeCheckboxHtml(insertNode, data, i) {
    let checkbox = document.createElement("input");
    let label = document.createElement("label");
    let copyBtn = document.createElement("button");
    let clearBtn = document.createElement("button");

    checkbox.type = "checkbox"; checkbox.id = `youtubeURL${i}`; checkbox.classList.add("checks");
    checkbox.checked = Object.values(data)[i][0] == "allow"; checkbox.value = Object.keys(data)[i];

    label.textContent = `${Object.values(data)[i][1] == null ? youtubeString + Object.keys(data)[i] : Object.values(data)[i][1]} : ${Object.values(data)[i][0]}`;
    label.htmlFor = `youtubeURL${i}`; label.id = `checkboxLabel${i}`;

    copyBtn.id = `copyBtn${i}`; copyBtn.type = "button"; copyBtn.classList.add("btn", "btn-outline-info");
    copyBtn.textContent = "Copy"; copyBtn.value = Object.keys(data)[i];

    clearBtn.id = `clearBtn${i}`; clearBtn.type = "button"; clearBtn.classList.add("btn", "btn-outline-danger");
    clearBtn.textContent = "Delete"; clearBtn.value = Object.keys(data)[i];

    insertNode.append(checkbox, label, copyBtn, clearBtn, document.createElement("br"));
}

//////////////////////////////////////////////
/*******************Handlers*****************/
function addCheckboxHandlers(data, i) {
    //Checkbox
    document.getElementById(`youtubeURL${i}`).addEventListener("input", (e) => {
        let contentToStore = {};
        let urlBlockStatus = e.target.checked ? "allow" : "block";
        document.getElementById(`checkboxLabel${i}`).innerHTML = `${data[1]} : ${urlBlockStatus}`;

        browser.storage.local.get(e.target.value).then(data => {
            contentToStore[e.target.value] = [urlBlockStatus, data[e.target.value][1]];
            browser.storage.local.set(contentToStore);
        })
    });
    //Buttons
    document.getElementById(`clearBtn${i}`).addEventListener("click", async (e) => {
        let checkboxBOI = document.getElementById(`youtubeURL${i}`);
        await browser.storage.local.remove(checkboxBOI.value);
        fillHtmlChecks();
    });

    document.getElementById(`copyBtn${i}`).addEventListener("click", async (e) => {
        navigator.clipboard.writeText(youtubeString + e.target.value);
    });
}

//switches radio button status in storage.local
async function radioButtonHandler(e) {
    e.preventDefault();
    let val = e.target.value;
    let contentToStore = {
        radio: val,
    };

    if (val === "Whitelist") {
        document.getElementById("postBtn").textContent = "Allow";
        await storageSweep("Allow");

    } else if (val === "Blacklist") {
        document.getElementById("postBtn").textContent = "Block";
        await storageSweep("Block");

    } else if (val == "Split") {
        document.getElementById("postBtn").textContent = "Block";
    }

    updateHtml();
    browser.storage.local.set(contentToStore);
}

function exportListHandle() {
    browser.storage.local.get().then(data => {
        console.log(Object.entries(data));
        let title = prompt("What title do you want to put on this array?")
        let contentToStore = {};
        contentToStore[title] = {};
        for (let i = 0; i < Object.keys(data).length; i++) {
            if (Object.keys(data)[i].includes("v=")) {
                console.log(Object.entries(data)[i]);
                if (Object.values(data)[i][0] == "block") {
                    // console.log(data[Object.keys(data)[i]]);
                    if (contentToStore[title]?.block == null) {
                        contentToStore[title].block = []
                        contentToStore[title].block.push(Object.entries(data)[i]);
                    } else {
                        contentToStore[title].block.push(Object.entries(data)[i]);
                    }

                } else if (Object.values(data)[i][0] == "allow") {
                    if (contentToStore[title]?.allow == null) {
                        contentToStore[title].allow = []
                        contentToStore[title].allow.push(Object.entries(data)[i]);
                    } else {
                        contentToStore[title].allow.push(Object.entries(data)[i]);
                    }
                }
                console.log(Object.keys(data)[i]);
            } else {
                console.log(`${Object.keys(data)[i]} is not a video id`);
            }
        }
        console.log(contentToStore[title]);
        browser.storage.local.set(contentToStore);
    })
}

async function addResourceHandle() {
    console.log(resourceUrl);
    let result = {};
    if (typeof resourceUrl == "undefined" || resourceUrl.length < 1) {
        result = await readAsset();
    } else {
        result = await readAsset(resourceUrl);
    }
    console.log(result);
    let promiseArray = [];
    for (let i = 0; i < Object.keys(result).length; i++) {
        if (Object.values(result)[i] == "allow") {
            promiseArray.push(storagePut(Object.keys(result)[i], false));
        } else {
            promiseArray.push(storagePut(Object.keys(result)[i], true));
        }
    }
    Promise.allSettled(promiseArray).then(updateHtml);
}

////////////////////////////////////////////
/***************Helper Functions**********/
//block button handler for first textbox
async function writeBlockToBrowser(url, text) {
    console.log("WriteBlockToBrowser");
    if (trimYoutubeUrl(url) != "Fail") {
        await storagePut(trimYoutubeUrl(url), text.toLowerCase() == "block" ? true : false)
        updateHtml();
    }
}

function trimYoutubeUrl(url) {
    if (youtubeVideoPattern.test(url)) {
        return url.slice(url.search("v="))
    } else if (url.length == 13 && url.includes("v=")) {
        if (new RegExp(/[~`!#$%\^&*+=\[\]\\';,/{}|\\":<>\?]/g).test(url.slice(2))) {//prevent v=...&c=...
            return "Fail"
        } else {
            return url
        }
    } else {
        return "Fail";
    }
}

//url that matches youtubeVideoPattern and a block status
async function storagePut(url, block = true) {
    await readLocalStorage(url)
        .then(async (data) => {
            let contentToStore = {};
            if (data[1].length == null) {
                data[1] = await noAPITitleFromUrl(url);
            }
            contentToStore[url] = [`${block ? "block" : "allow"}`, data[1]];
            browser.storage.local.set(contentToStore);
        })
        .catch(async () => {
            let contentToStore = {}
            const title = await noAPITitleFromUrl(url);
            contentToStore[url] = [`${block ? "block" : "allow"}`, title];
            browser.storage.local.set(contentToStore);
        })
}

/* @param pattern matching url */
async function noAPITitleFromUrl(url) {
    let title = "";
    if (url.length == 13) {
        url = youtubeString + url;
    } else if (!pattern.test(url)) {
        return "Invalid video";
    }
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
            console.log('Not Found');
            return `"${url}" is not a valid video`;
    }
}

// Changes every video stored to block or allow
async function storageSweep(value) {
    await browser.storage.local.get(null)
        .then((data) => {
            let contentToStore = {};
            for (let i = 0; i < Object.keys(data).length; i++) {
                if (Object.keys(data)[i].includes("v=")) {
                    contentToStore[Object.keys(data)[i]] = [value.toLowerCase(), Object.values(data)[i][1]];
                }
            }
            browser.storage.local.set(contentToStore);
        })
        .catch(err => console.error(err));
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

//Executable code
//(() => {
/**
* Initalize function that sets browser extension UI event listeners
*/
let youtubeUrl = "";
let resourceUrl = "";
const blockButton = document.getElementById("postBtn");
const blockUrlInputField = document.getElementById("blockUrl");
const checkToggleButton = document.getElementById("checksBtn");
const exportListButton = document.getElementById("exportBtn");
const clearStorageButton = document.getElementById("strClearBtn");
const resourceFetchInputField = document.getElementById("resourceFetch");
const addResourceButton = document.getElementById("strLoadBtn");
const radios = document.getElementById("proxy_style_form");

blockButton.addEventListener("click", (e) => {
    if (youtubeUrl) {
        writeBlockToBrowser(youtubeUrl, blockButton.textContent);
    }
});
blockUrlInputField.addEventListener("change", (e) => {
    youtubeUrl = e.target.value;
});

checkToggleButton.addEventListener("click", toggleChecks);
exportListButton.addEventListener("click", exportListHandle)

clearStorageButton.addEventListener("click", async () => {
    browser.storage.local.get().then((data) => {
        let promiseArray = [];
        for (let i = 0; i < Object.keys(data).length; i++) {
            if (Object.keys(data)[i].includes("v=")) {
                promiseArray.push(browser.storage.local.remove(Object.keys(data)[i]));
            }
        }
        Promise.allSettled(promiseArray).then(updateHtml);
    })
});

addResourceButton.addEventListener("click", addResourceHandle);

resourceFetchInputField.addEventListener("change", (e) => {
    resourceUrl = e.target.value;
});

radios.addEventListener("change", radioButtonHandler);
fillHtml();
precheckRadioBtn();
//})();
