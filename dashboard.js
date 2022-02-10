function fillHtml() {
    // Get title : Tags : Urls from storage
    // Make list out of them
    // Make it great!
    readLocalStorage("resource").then((data) => {
        for (let i = 0; i < data.length; i++) {
            addList(data[i].url, data[i].title, data[i].tags);
        }
    }).catch(() => {
        console.log("Nothing here");
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
    btn.addEventListener("click", async (e) => {
        console.log("Apply Resource");
        console.log(e.target);
        console.log(e.target.id.slice(3));
        let resourceUrl = e.target.id.slice(3)
        let result = {};
        if (typeof resourceUrl == "undefined" || resourceUrl.length < 1) {
            result = await interpret();
        } else {
            result = await interpret(resourceUrl);
        }
        console.log(result);

        let promiseArray = [];
        let blockNum, allowNum;
        for (let i = 0; i < Object.keys(result).length; i++) {
            if (Object.values(result)[i] == "allow") {
                promiseArray.push(storagePut(Object.keys(result)[i], false));
                allowNum++;
            } else {
                promiseArray.push(storagePut(Object.keys(result)[i], true));
                blockNum++;
            }
        }
        if (allowNum == 0 || blockNum == 0) {
            allowNum != 0 ? browser.storage.local.set({ "radio": "whitelist" }) : browser.storage.local.set({ "radio": "blacklist" })
        } else {
            browser.storage.local.set({ "radio": "split" });
        }
        Promise.allSettled(promiseArray);
    })
    return btn;
}

async function storeResource(address, resourceObj) {
    await readLocalStorage("resource")
        .then(data => {
            console.log(data);
            console.log(Array.isArray(data));
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
    await readLocalStorage(url)
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
            browser.storage.local.set(contentToStore);
        })
        .catch(async () => {
            let contentToStore = {}
            const title = await noAPITitleFromUrl(url);
            console.log("put as new video: " + title);
            contentToStore[url] = [`${block ? "block" : "allow"}`, title]
            console.log(contentToStore);
            browser.storage.local.set(contentToStore);
        })
}
/* @param pattern matching url */
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

let resourceUrl = "";
const resourceFetchInputField = document.getElementById("resourceFetch");
const addResourceButton = document.getElementById("strLoadBtn");
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

fillHtml();