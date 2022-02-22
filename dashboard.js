// Look into adding OAuth to chromeCompat branch
let youtubeString = "https://www.youtube.com/watch?";

function fillHtml() {
    let listLocal = document.getElementById("divLocal");
    while (listLocal.firstChild) {
        listLocal.removeChild(listLocal.firstChild)
    }
    browser.storage.local.get().then(data => {
        for (let i = 0; i < Object.keys(data).length; i++) {
            if (Object.keys(data)[i].includes("v=")) {
                continue;
            } else if (Object.keys(data)[i] == "radio" || Object.keys(data)[i] == "resource") {
                continue;
            } else {
                let bundle = ({ title: Object.keys(data)[i], url: null, tags: ["local"] })
                addList2(bundle, "divLocal", localButtonHandler);
            }
        }
    })

    let listWeb = document.getElementById("divWeb");
    while (listWeb.firstChild) {
        listWeb.removeChild(listWeb.firstChild);
    }
    readLocalStorage("resource").then((data) => {
        for (let i = 0; i < data.length; i++) {
            console.log(data[i]);
            addList2(data[i], "divWeb", applyResourceListener);
        }
    })

}

function addList2(data, location, listenerFun) {
    let editDiv = document.getElementById(location);
    let htmlText = data.title + (data.url != null ? " : " + data.url : "");

    var li = document.createElement("li");
    li.appendChild(document.createTextNode(htmlText));
    li.id = location + data.title;
    li.title = data.tags.toString();

    var btn = document.createElement("button");
    btn.id = "btn" + location + data.title;
    btn.value = data.url != null ? data.url : data.title;
    btn.classList.add("btn");
    btn.classList.add("btn-outline-info");
    btn.textContent = "Apply Resource";
    btn.addEventListener("click", listenerFun);

    editDiv.appendChild(li);
    editDiv.appendChild(btn);
}

function localButtonHandler(e) {
    console.log(e.target);
    console.log(document.getElementById(e.target.id));
    let key = e.target.value;
    console.log("key");
    clearVideos();
    browser.storage.local.get(key).then(async resData => {
        if (resData[key].allow != null) {
            for (let i = 0; i < resData[key].allow.length; i++) {
                let contentToStore = {};
                contentToStore[resData[key].allow[i][0]] = resData[key].allow[i][1];
                console.log(contentToStore);
                await browser.storage.local.set(contentToStore);
            }
        }
        if (resData[key].block != null) {
            for (let i = 0; i < resData[key].block.length; i++) {
                let contentToStore = {};
                contentToStore[resData[key].block[i][0]] = resData[key].block[i][1];
                console.log(contentToStore);
                await browser.storage.local.set(contentToStore)
            }
        }
    });
    let oldList = document.querySelector(".btn-info");
    if (oldList != null) {
        oldList.classList.remove("btn-info");
        oldList.classList.add("btn-outline-info");
        oldList.textContent = "Apply Resource";
    }
    // let buttons = document.querySelectorAll(".btn");
    // for (let i = 0; i < buttons.length; i++) {
    //     buttons[i].classList.remove("btn-info");
    //     buttons[i].classList.add("btn-outline-info");
    //     buttons[i].textContent = "Apply Resource"
    // }
    e.target.classList.add("btn-info");
    e.target.classList.remove("btn-outline-info");
    e.target.textContent = "Current List"
}

async function applyResourceListener(e) {
    console.log(e.target.id);
    console.log(e.target.value);
    let resourceUrl = e.target.value
    let result = {};
    if (typeof resourceUrl == "undefined" || resourceUrl.length < 1) {
        result = await readAsset();
    } else {
        result = await readAsset(resourceUrl);
    }
    console.log(result);

    clearVideos();
    let promiseArray = []
    for (let i = 0; i < Object.keys(result).length; i++) {
        if (Object.values(result)[i] == "allow") {
            promiseArray.push(storagePut(Object.keys(result)[i], false));
        } else if (Object.values(result)[i] == "block") {
            promiseArray.push(storagePut(Object.keys(result)[i], true));
        }
    }
    await Promise.allSettled(promiseArray);
    let oldList = document.querySelector(".btn-info");
    if (oldList != null) {
        oldList.classList.remove("btn-info");
        oldList.classList.add("btn-outline-info");
        oldList.textContent = "Apply Resource";
    }
    e.target.classList.add("btn-info");
    e.target.classList.remove("btn-outline-info");
    e.target.textContent = "Current List"

}

async function clearVideos() {
    await browser.storage.local.get().then((data) => {
        let promiseArray = [];
        for (let i = 0; i < Object.keys(data).length; i++) {
            if (Object.keys(data)[i].includes("v="))
                promiseArray.push(browser.storage.local.remove(Object.keys(data)[i]));
        }
        Promise.allSettled(promiseArray);
    })
}

async function storeResource(address, resourceObj) {
    await readLocalStorage("resource")
        .then(data => {
            if (Array.isArray(data)) {
                let storageObj = {};
                storageObj.url = address;
                storageObj.title = resourceObj.title;
                storageObj.tags = resourceObj.tags;
                data.push(storageObj);

                let contentToStore = {};
                contentToStore.resource = data;
                browser.storage.local.set(contentToStore);
            }
        })
        .catch(() => {
            let storageObj = {};
            storageObj.url = address;
            storageObj.title = resourceObj.title;
            storageObj.tags = resourceObj.tags;

            let contentToStore = {};
            contentToStore.resource = [];
            contentToStore.resource.push(storageObj)

            browser.storage.local.set(contentToStore);
        })

}

async function storagePut(url, block = true) {
    await readLocalStorage(url)
        .then(async (data) => {
            let contentToStore = {};
            if (data[1].length == 0) data[1] = await noAPITitleFromUrl(url);

            contentToStore[url] = [`${block ? "block" : "allow"}`, data[1]];
            await browser.storage.local.set(contentToStore);
        })
        .catch(async () => {
            let contentToStore = {}
            const title = await noAPITitleFromUrl(url);
            contentToStore[url] = [`${block ? "block" : "allow"}`, title];
            await browser.storage.local.set(contentToStore);
        })
}

/* @param pattern matching url */
async function noAPITitleFromUrl(url) {
    // console.log("noAPITitleFromUrl");
    let title = "";
    var response = await fetch(youtubeString + url);
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
};

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
        // Not youtube
        return "Fail";
    }
}

let resourceUrl = "";
const resourceFetchInputField = document.getElementById("resourceFetch");
const addResourceButton = document.getElementById("strLoadBtn");
const clearLibraryBtn = document.getElementById("rscStrClearBtn");
const clearAllStorageBtn = document.getElementById("allStrClearBtn");

resourceFetchInputField.addEventListener("change", (e) => {
    resourceUrl = e.target.value;
});

addResourceButton.addEventListener("click", async () => {
    console.log(resourceUrl);
    let result = {};
    if (typeof resourceUrl == "undefined" || resourceUrl.length < 1) {
        result = await readAsset();
    } else {
        result = await readAsset(resourceUrl);
    }
    console.log(result);
    if (result?.title != null) {//potential error point, not every json with a title fits scheme
        storeResource(resourceUrl, result);
        let bundle = ({ url: resourceUrl, title: result.title, tags: result.tags })
        console.log(bundle);
        addList2(bundle, "divWeb", applyResourceListener);
    }
});

clearLibraryBtn.addEventListener("click", async () => {
    await browser.storage.local.remove("resource");
    browser.storage.local.get(null).then(data => {
        let promiseArray = [];
        for (let i = 0; i < Object.keys(data).length; i++) {
            if (Object.keys(data)[i].includes("v=") || Object.keys(data)[i] == "radio") {
                continue
            } else {
                promiseArray.push(browser.storage.local.remove(Object.keys(data)[i]));
            }
        }
        Promise.allSettled(promiseArray);
    })
    fillHtml();
});

clearAllStorageBtn.addEventListener("click", () => {
    if (confirm("Do you want to completly empty your storage?")) {
        browser.storage.local.clear();
        fillHtml();
    }
});

fillHtml();