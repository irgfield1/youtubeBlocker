'use strict'

let pattern = /(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/;
let radioStatus;

///////////////////////////////////////////////
/**************HTML FUNCTIONS*****************/
/**
 * displays url : blocking pairs in options menu
 */
function fillHtml() {
    browser.storage.local.get(null)
        .then((data) => {
            console.log(data);
            if (typeof data != "undefined") {
                let myList = document.getElementById('history');
                clearHtmlList(myList);

                for (let i = 0; i < Object.keys(data).length; i++) {
                    if (Object.keys(data)[i] == "radio") {
                        continue;
                    }
                    let myUrl = Object.keys(data)[i] + " : " + Object.values(data)[i];
                    var li = document.createElement('li');
                    li.appendChild(document.createTextNode(myUrl));
                    myList.appendChild(li);
                }
            } else {
                let myList = document.getElementById('history');
                var li = document.createElement('li');
                li.appendChild(document.createTextNode("Storage is empty"));
                myList.appendChild(li);
            }

        })
        .catch(err => console.error(err));



}

function radioInit() {
    readLocalStorage("radio")
        .then(data => {
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
        })
}

//creates checkbox for each map entry, checkboxes toggle block status
function fillHtmlChecks() {
    browser.storage.local.get(null)
        .then((data) => {
            if (typeof data != "undefined") {
                let myList = document.querySelector('.blockable_url_list');
                clearHtmlList(myList);

                for (let i = 0; i < Object.keys(data).length; i++) {
                    if (Object.keys(data)[i] == "radio") {
                        continue;
                    }
                    const html =
                        `<input type="checkbox" id="youtubeURL${i}" class="checks" ${Object.values(data)[i] == "allow" ? "checked" : ""} name="url${i}" value="${Object.keys(data)[i]}">
                         <label for="youtubeURL${i}" id="checkboxLabel${i}"> ${Object.keys(data)[i]} : ${Object.values(data)[i]}</label>
                         <button id="copyBtn${i}" type="button" class="btn btn-outline-info">Copy</button>
                         <button id="clearBtn${i}" type="button" class="btn btn-outline-danger" align="right">Delete</button><br>`;
                    myList.innerHTML += html;

                }
                let checklist = document.querySelectorAll(".checks");
                // Event listener for checkbox toggle
                for (let i = 0; i < checklist.length; i++) {
                    checklist[i].addEventListener('input', async () => {
                        let myList = document.querySelector('.blockable_url_list');
                        let contentToStore = {};

                        let urlBlockStatus = document.querySelector(`#youtubeURL${i}`).checked ? "allow" : "block";
                        contentToStore[Object.keys(data)[i]] = urlBlockStatus;

                        browser.storage.local.set(contentToStore);
                        document.getElementById(`checkboxLabel${i}`).innerHTML = `${Object.keys(data)[i]} : ${urlBlockStatus}`;

                    });
                }

                for (let i = 0; i < checklist.length; i++) {
                    document.getElementById(`clearBtn${i}`).addEventListener("click", async () => {
                        console.log(`BOI${i}`);
                        let checkboxBOI = document.getElementById(`youtubeURL${i}`);
                        console.log(checkboxBOI.value);
                        await browser.storage.local.remove(checkboxBOI.value);
                        fillHtmlChecks();
                    })
                    document.getElementById(`copyBtn${i}`).addEventListener("click", async () => {
                        console.log(`COPY${i}`);
                        let checkboxBOI = document.getElementById(`youtubeURL${i}`);
                        console.log(checkboxBOI.value);
                        navigator.clipboard.writeText(checkboxBOI.value);
                    })
                }

            }
        })
        .catch(err => console.error(err));
}

function toggleChecksDisplay() {
    fillHtml();
    fillHtmlChecks();
    let bulletList = document.getElementById("history");
    let checksList = document.getElementById("checks");
    let button = document.getElementById("blockButton");

    if (bulletList.classList.contains("hidden")) {
        bulletList.classList.remove("hidden");
        checksList.classList.add("hidden");
        button.textContent = "Checkbox Style";
    } else {
        bulletList.classList.add("hidden");
        checksList.classList.remove("hidden");
        button.textContent = "Bullets Style"
    }
}

function updateHtml() {
    let status = document.getElementById("history").classList.contains("hidden");
    console.log(status);

    fillHtml()
    fillHtmlChecks();

    if (status) {
        document.getElementById("history").classList.add("hidden");
    } else {
        document.getElementById("checks").classList.add("hidden");
    }

}

function clearHtmlList(list) {
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
}

////////////////////////////////////////////
/***************Utility Functions**********/
//block button handler for text field
function writeBlockToBrowser(tab) {
    console.log(tab);
    console.log(pattern.test(tab));
    if (pattern.test(tab)) {
        console.log(tab + " new youtube url");
        let contentToStore = {};
        contentToStore[tab] = document.getElementById("postBtn").textContent.toLowerCase();
        browser.storage.local.set(contentToStore);
        fillHtml();
        fillHtmlChecks();
    } else {
        console.log(tab + " not youtube");
    }
}

//////////////////////////////////////////////
/*******************Handlers*****************/
//switches status in storage.local
async function radioButtonHandler(e) {
    e.preventDefault();
    let val = e.target.value;
    let contentToStore = {
        "radio": val
    };
    if (val === "Whitelist") {
        await blockmodeInit("Allow");
    } else if (val === "Blacklist") {
        await blockmodeInit("Block");
    }
    updateHtml();
    browser.storage.local.set(contentToStore);

}

async function blockmodeInit(value) {
    document.getElementById("postBtn").textContent = value;

    await browser.storage.local.get(null)
        .then(data => {
            let contentToStore = {};
            for (let i = 0; i < Object.keys(data).length; i++) {
                if (Object.keys(data)[i] == "radio") {
                    continue;
                }
                contentToStore[Object.keys(data)[i]] = value.toLowerCase();
            }
            return contentToStore;
        })
        .then(data => {
            browser.storage.local.set(data);
        });
}
////////////////////////////////////////////
/***************Utility Functions**********/
//block button handler for text field
function writeBlockToBrowser(tab) {
    console.log(tab);
    console.log(pattern.test(tab));
    if (pattern.test(tab)) {
        console.log(tab + " new youtube url");
        let contentToStore = {};
        contentToStore[tab] = document.getElementById("postBtn").textContent.toLowerCase();
        browser.storage.local.set(contentToStore);
        fillHtml();
        fillHtmlChecks();
    } else {
        console.log(tab + " not youtube");
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

//Executable code
(() => {
    /**
     * Init function that sets browser extension UI event listeners
     */
    let youtubeUrl = "";
    let resourceUrl = "";
    const blockButton = document.getElementById('postBtn');
    const blockWebInputField = document.getElementById("blockWeb");
    const checkDisplayButton = document.getElementById("checksButton");
    const clearStorageButton = document.getElementById("strClearBtn");
    const addResourceButton = document.getElementById('strLoadBtn');
    const radios = document.getElementById("proxy_style_form")

    blockButton.addEventListener("click", () => {
        if (youtubeUrl) {
            writeBlockToBrowser(youtubeUrl);
        }
    });
    blockWebInputField.addEventListener("change", (e) => {
        youtubeUrl = e.target.value;
    });

    checkDisplayButton.addEventListener("click", toggleChecksDisplay);
    clearStorageButton.addEventListener("click", () => {
        browser.storage.local.clear();
        // let radio = await readLocalStorage("radio");
        // await browser.storage.local.clear();
        // let contentToStore = { "radio": radio };
        // browser.storage.local.set(contentToStore);
        // updateHtml();
    })

    addResourceButton.addEventListener("click", async () => {
        console.log(resourceUrl);
        if (typeof resourceUrl == "undefined" || resourceUrl.length < 1) {
            await interpret();
        } else {
            await interpret(resourceUrl);
        }
        updateHtml();
    })
    blockWebInputField.addEventListener("change", (e) => {
        resourceUrl = e.target.value;
    });

    radios.addEventListener("change", radioButtonHandler);
    fillHtml();
    radioInit();
})();

//https://www.geeksforgeeks.org/how-to-add-a-custom-right-click-menu-to-a-webpage/ - Remove and copy?
//