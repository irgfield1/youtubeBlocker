// TODO: Optimize storage by only saving video IDs <- WIP
// TODO: Accept youtube short urls... "youtu.be/***"
// Look into adding OAuth to chromeCompat branch - fetch is now working in ChromeCompat branch...
let youtubeString = "https://www.youtube.com/watch?"
function fillHtml() {
    let list = document.getElementById("divWeb");
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
    readLocalStorage("resource").then((data) => {
        for (let i = 0; i < data.length; i++) {
            addList(data[i].url, data[i].title, data[i].tags);
        }
    })

}

function addList(thisUrl, title, tags) {
    let editDiv = document.getElementById("divWeb");
    let htmlText = title + " : " + thisUrl;
    console.log(htmlText);
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(htmlText));
    li.id = thisUrl;
    li.title = tags.toString();
    let btn = addApplyButton(thisUrl)
    if (document.getElementById(thisUrl) == null) {
        editDiv.appendChild(li);
        editDiv.appendChild(btn);
    }
}

function addApplyButton(myUrl) {
    var btn = document.createElement("button");
    btn.id = "btn" + myUrl;
    btn.classList.add("btn");
    btn.classList.add("btn-outline-info");
    btn.textContent = "Apply Resource";
    btn.addEventListener("click", applyResourceListener)
    return btn;
}

async function applyResourceListener(e) {
    // console.log("Apply Resource");
    // console.log(e.target);
    // console.log(e.target.id.slice(3));
    let resourceUrl = e.target.id.slice(3)
    clearVideos();
    let result = {};
    if (typeof resourceUrl == "undefined" || resourceUrl.length < 1) {
        result = await interpret();
    } else {
        result = await interpret(resourceUrl);
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
    Promise.allSettled(promiseArray);

}

async function clearVideos() {
    await browser.storage.local.get().then((data) => {
        let promiseArray = [];
        for (let i = 0; i < Object.keys(data).length; i++) {
            if (Object.keys(data)[i] == "radio" || Object.keys(data)[i] == "resource") {
                continue;
            }
            promiseArray.push(browser.storage.local.remove(Object.keys(data)[i]));
        }
        Promise.allSettled(promiseArray).then(browser.storage.local.get().then(data => console.log(data)));
    })
}

async function storeResource(address, resourceObj) {
    await readLocalStorage("resource")
        .then(data => {
            console.log(data);
            if (Array.isArray(data)) {
                console.log("Is Array");
                let storageObj = {};
                storageObj.url = address;
                storageObj.title = resourceObj.title;
                storageObj.tags = resourceObj.tags;
                console.log(storageObj);
                data.push(storageObj);
                console.log(data);
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
    // console.log("storagePut" + url);
    return await readLocalStorage(url)
        .then(async (data) => {
            console.log(data);
            let contentToStore = {};
            if (data[1].length == 0) {
                data[1] = await noAPITitleFromUrl(url);
            }
            if (block) {
                contentToStore[url] = ["block", data[1]];
            } else {
                contentToStore[url] = ["allow", data[1]];
            }
            console.log(contentToStore);
            await browser.storage.local.set(contentToStore);
            return true;
        })
        .catch(async () => {
            console.log("StoragePut.catch");
            let contentToStore = {}
            const title = await noAPITitleFromUrl(url);
            console.log("put as new video: " + title);
            contentToStore[url] = [`${block ? "block" : "allow"}`, title]
            console.log(contentToStore);
            await browser.storage.local.set(contentToStore);
            return true;
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

let resourceUrl = "";
const resourceFetchInputField = document.getElementById("resourceFetch");
const addResourceButton = document.getElementById("strLoadBtn");
const clearLibraryBtn = document.getElementById("rscStrClearBtn");
const clearAllStorageBtn = document.getElementById("allStrClearBtn");

console.log(addResourceButton);
resourceFetchInputField.addEventListener("change", (e) => {
    resourceUrl = e.target.value;
});

addResourceButton.addEventListener("click", async () => {
    console.log(resourceUrl);
    let result = {};
    if (typeof resourceUrl == "undefined" || resourceUrl.length < 1) {
        result = await interpret();
    } else {
        result = await interpret(resourceUrl);
    }
    console.log(result);
    if (result?.title != null) {
        storeResource(resourceUrl, result);
        addList(resourceUrl, result.title, result.tags);
    }
    // let promiseArray = [];
    // for (let i = 0; i < Object.keys(result).length; i++) {
    //     if (Object.values(result)[i] == "allow") {
    //         promiseArray.push(storagePut(Object.keys(result)[i], false));
    //     } else {
    //         promiseArray.push(storagePut(Object.keys(result)[i], true));
    //     }
    // }
    // Promise.allSettled(promiseArray);
});
clearLibraryBtn.addEventListener("click", async () => {
    await browser.storage.local.remove("resource");
    fillHtml();
})
clearAllStorageBtn.addEventListener("click", () => {
    if (confirm("Do you want to completly empty your storage?")) {
        browser.storage.local.clear();
        fillHtml();
    }
})

fillHtml();