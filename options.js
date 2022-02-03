"use strict";

let pattern =
    /(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/;
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
                clearHtmlList(myList);

                for (let i = 0; i < Object.keys(data).length; i++) {
                    if (Object.keys(data)[i] == "radio") {
                        continue;
                    }
                    let myUrl = Object.values(data)[i][1] + " : " + Object.values(data)[i][0];
                    var li = document.createElement("li");
                    li.appendChild(document.createTextNode(myUrl));
                    myList.appendChild(li);
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

// Radio button selection persists
function radioInit() {
    readLocalStorage("radio")
        .then((data) => {
            let value = data.toLowerCase();
            let myRadio = document.getElementById(value);
            myRadio.checked = "true";
            if (myRadio.value.toLowerCase() == "whitelist") {
                document.getElementById("postBtn").textContent = "Allow";
            }
        })
        .catch(() => {
            let myRadio = document.getElementById("split");
            myRadio.checked = true;
        });
}

//creates checkbox for each map entry, checkboxes toggle block status
function fillHtmlChecks() {
    browser.storage.local
        .get(null)
        .then((data) => {
            if (typeof data != "undefined") {
                let myList = document.querySelector(".blockable_url_list");
                clearHtmlList(myList);

                for (let i = 0; i < Object.keys(data).length; i++) {
                    if (Object.keys(data)[i] == "radio") {
                        continue;
                    }
                    const html = `<input type="checkbox" id="youtubeURL${i}" class="checks" ${Object.values(data)[i][0] == "allow" ? "checked" : ""
                        } name="url${i}" value="${Object.keys(data)[i]}">
                         <label for="youtubeURL${i}" id="checkboxLabel${i}"> ${Object.values(data)[i][1]
                        } : ${Object.values(data)[i][0]}</label>
                         <button id="copyBtn${i}" type="button" class="btn btn-outline-info">Copy</button>
                         <button id="clearBtn${i}" type="button" class="btn btn-outline-danger" align="right">Delete</button><br>`;

                    myList.innerHTML += html;
                }
                let checklist = document.querySelectorAll(".checks");

                // Event listener for checkbox toggle
                for (let i = 0; i < checklist.length; i++) {
                    checklist[i].addEventListener("input", async () => {
                        let myList = document.querySelector(".blockable_url_list");
                        let contentToStore = {};
                        let data = await browser.storage.local.get(Object.keys(data)[i])
                        console.log(data);

                        let urlBlockStatus = document.querySelector(`#youtubeURL${i}`)
                            .checked
                            ? "allow"
                            : "block";
                        contentToStore[Object.keys(data)[i]] = [urlBlockStatus, data[1]];

                        browser.storage.local.set(contentToStore);
                        document.getElementById(`checkboxLabel${i}`).innerHTML = `${Object.values(data)[i][1]
                            } : ${urlBlockStatus}`;
                    });
                }

                //Add delete and click button functionality
                for (let i = 0; i < checklist.length; i++) {
                    document
                        .getElementById(`clearBtn${i}`)
                        .addEventListener("click", async () => {
                            let checkboxBOI = document.getElementById(`youtubeURL${i}`);
                            await browser.storage.local.remove(checkboxBOI.value);
                            fillHtmlChecks();
                        });
                    document
                        .getElementById(`copyBtn${i}`)
                        .addEventListener("click", async () => {
                            let checkboxBOI = document.getElementById(`youtubeURL${i}`);
                            navigator.clipboard.writeText(checkboxBOI.value);
                        });
                }
            }
        })
        .catch((err) => console.error(err));
}

// Checkboxes toggle with list
function toggleChecksDisplay() {
    fillHtml();
    fillHtmlChecks();
    let bulletList = document.getElementById("history");
    let checksList = document.getElementById("checks");
    let button = document.getElementById("checksButton");

    if (bulletList.classList.contains("hidden")) {
        bulletList.classList.remove("hidden");
        checksList.classList.add("hidden");
        button.textContent = "Checkbox Style";
    } else {
        bulletList.classList.add("hidden");
        checksList.classList.remove("hidden");
        button.textContent = "Bullets Style";
    }
}

// updates HTML (from storage) and hides whichever was hidden before... probably could load only whichever is currently displayed...
function updateHtml() {
    let status = document.getElementById("history").classList.contains("hidden");
    console.log(status);

    fillHtml();
    fillHtmlChecks();

    if (status || typeof status == "undefined") {
        document.getElementById("history").classList.add("hidden");
    } else {
        document.getElementById("checks").classList.add("hidden");
    }
}


// function nameList() {
//     let videosArray = [];
//     let titlesArray = [];
//     browser.storage.local.get()
//         .then(async (data) => {
//             console.log(data);
//             for (let i = 0; i < Object.keys(data).length; i++) {
//                 if (Object.keys(data)[i] == "radio") {
//                     continue;
//                 }
//                 videosArray.push(Object.keys(data)[i]);
//             }
//             console.log(videosArray);
//             return buildRequest(videosArray);
//         })
//         .then(data => {
//             console.log(data);
//             return fetch(data)
//         })
//         .then(response => response.json())
//         .then(data => {
//             console.log(data);
//             for (let i = 0; i < data?.items.length; i++) {
//                 console.log(data?.items[i]?.snippet?.title);
//                 titlesArray.push(data?.items[i]?.snippet?.title);
//             }
//         })
//         .then(data => {
//             // console.log(videosArray);
//             // console.log(titlesArray);
//             littleHtml(videosArray, titlesArray)
//         })

// }

// function buildRequest(videoStringArray) {
//     let requestBase = "https://www.googleapis.com/youtube/v3/videos?part=snippet&"
//     let requestIDs = "";
//     let requestEnd = "key=AIzaSyCCxgNzq2dbazIktxBK4MJhpWRpvP0HTvU"
//     for (let i = 0; i < videoStringArray.length; i++) {
//         requestIDs += `id=${videoStringArray[i].slice(-11)}&`;

//     }
//     console.log(requestBase + requestIDs + requestEnd);
//     return (requestBase + requestIDs + requestEnd);

// }

// async function nameFromUrls() {
//     let videoArray = [];
//     let titleArray = [];
//     await browser.storage.local.get().then(async (data) => {
//         for (let i = 0; i < Object.keys(data).length; i++) {

//             // console.log(i + " " + Object.keys(data)[i].slice(-11) + " / " + Object.keys(data).length);
//             videoArray.push(Object.keys(data)[i]);
//             titleArray.push(await apiWrap(Object.keys(data)[i].slice(-11)));
//         }
//     })
//     // console.log(videoArray);
//     // console.log(titleArray);
//     littleHtml(videoArray, titleArray);
// }

// function littleHtml(arrayOne, arrayTwo) {
//     let base = document.getElementById("endElement");
//     base.innerHTML = "";
//     // console.log(arrayOne.length + " " + arrayTwo.length);
//     if (arrayOne.length != arrayTwo.length) {
//         console.log("cannot preform operation, arrays of different lengths");
//     }
//     for (let i = 0; i < arrayOne.length; i++) {
//         // console.log(`${i}`);
//         let html = `<p id="tuple${i}">${arrayOne[i].slice(-31)} : ${arrayTwo[i]}</p>`;
//         // console.log(html);
//         base.innerHTML += html;
//     }

// }

// function apiWrap(string) {
//     return fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${string}&key=AIzaSyCCxgNzq2dbazIktxBK4MJhpWRpvP0HTvU`)
//         .then(response => response.json())
//         .then(data => {
//             // console.log(data?.items[0]?.snippet?.title);
//             return data?.items[0]?.snippet?.title;
//         });
// }

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

//url that matches youtubeVideoPattern and a block status
async function storagePut(url, block = true) {
    console.log("storagePut");
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
            console.log("catch storage put" + title);
            contentToStore[url] = [`${block ? "block" : "allow"}`, title]
            console.log(contentToStore);
            browser.storage.local.set(contentToStore);
        })
}

//////////////////////////////////////////////
/*******************Handlers*****************/
//switches radio button status in storage.local
async function radioButtonHandler(e) {
    e.preventDefault();
    let val = e.target.value;
    let contentToStore = {
        radio: val,
    };
    if (val === "Whitelist") {
        await blockmodeInit("Allow");
    } else if (val === "Blacklist") {
        await blockmodeInit("Block");
    } else if (val == "Split") {
        document.getElementById("postBtn").textContent = "Block";
    }
    updateHtml();
    browser.storage.local.set(contentToStore);
}

// Changes blockmode between dynamic, whitelist and blacklist
async function blockmodeInit(value) {
    document.getElementById("postBtn").textContent = value;

    await browser.storage.local
        .get(null)
        .then((data) => {
            let contentToStore = {};
            for (let i = 0; i < Object.keys(data).length; i++) {
                if (Object.keys(data)[i] == "radio") {
                    continue;
                }
                contentToStore[Object.keys(data)[i]] = [value.toLowerCase(), Object.values(data)[i][1]];
            }
            return contentToStore;
        })
        .then((data) => {
            browser.storage.local.set(data);
        });
}

////////////////////////////////////////////
/***************Utility Functions**********/
//block button handler for first textbox
async function writeBlockToBrowser(url) {
    if (pattern.test(url)) {
        await storagePut(url, true)
        fillHtml();
        fillHtmlChecks();
    } else {
        console.log(url + " not youtube");
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

function clearHtmlList(list) {
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
}

//Executable code
(() => {
    /**
   * Init function that sets browser extension UI event listeners
   */
    let youtubeUrl = "";
    let resourceUrl = "";
    const blockButton = document.getElementById("postBtn");
    const blockUrlInputField = document.getElementById("blockUrl");
    const checkToggleButton = document.getElementById("checksButton");
    const clearStorageButton = document.getElementById("strClearBtn");
    const resourceFetchInputField = document.getElementById("resourceFetch");
    const addResourceButton = document.getElementById("strLoadBtn");
    const radios = document.getElementById("proxy_style_form");

    blockButton.addEventListener("click", () => {
        if (youtubeUrl) {
            writeBlockToBrowser(youtubeUrl);
        }
    });
    blockUrlInputField.addEventListener("change", (e) => {
        youtubeUrl = e.target.value;
    });

    checkToggleButton.addEventListener("click", toggleChecksDisplay);
    clearStorageButton.addEventListener("click", () => {
        browser.storage.local.clear();
        updateHtml();
    });

    addResourceButton.addEventListener("click", async () => {
        console.log(resourceUrl);
        let result = {};
        if (typeof resourceUrl == "undefined" || resourceUrl.length < 1) {
            result = await interpret();

        } else {
            result = await interpret(resourceUrl);
        }
        for (let i = 0; i < Object.keys(result).length; i++) {
            if (Object.values(result)[i] == "allow") {
                storagePut(Object.keys(result)[i], false);
            } else {
                storagePut(Object.keys(result)[i], true);
            }
        }
        updateHtml();
    });
    resourceFetchInputField.addEventListener("change", (e) => {
        resourceUrl = e.target.value;
    });

    radios.addEventListener("change", radioButtonHandler);
    fillHtml();
    radioInit();

    const apiBtn = document.getElementById("youtubeAPIBtn");
    apiBtn.addEventListener("click", () => {
        nameFromUrls();
    })
    const unifiedApiBtn = document.getElementById("unifiedFetch");
    unifiedApiBtn.addEventListener("click", () => {
        nameList();
    })

    let fetchUrl = ""
    const titleFetchInputField = document.getElementById("singleFetch");
    const noApiTitleButton = document.getElementById("getInfo");
    noApiTitleButton.addEventListener("click", async () => {
        console.log(fetchUrl);
        if (pattern.test(fetchUrl)) {
            noAPITitleFromUrl(fetchUrl)
        }
    });
    titleFetchInputField.addEventListener("change", (e) => {
        fetchUrl = e.target.value;
    });
})();

//https://www.geeksforgeeks.org/how-to-add-a-custom-right-click-menu-to-a-webpage/ - Remove and copy?

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// It would be nice to default to titles in fillHtml. I don't know if that's possible o sea, realistic //
/////////////////////////////////////////////////////////////////////////////////////////////////////////