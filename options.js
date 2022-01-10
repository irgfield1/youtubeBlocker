'use strict'
let pattern = /(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/;
let radioStatus;


/**
 * displays url : blocking pairs in options menu
 */
function fillHtml() {
    console.log("options.js - fill html");
    browser.storage.local.get(null)
        .then((data) => {
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
            }

        })
        .catch(err => console.error(err));

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
            let myRadio = document.getElementById("dynamic");
            myRadio.checked = true;
        })

}

/**
 * creates checkbox for each map entry, checkboxes toggle block status
 */
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
                         <label for="youtubeURL${i}" id="checkboxLabel${i}"> ${Object.keys(data)[i]} : ${Object.values(data)[i]}</label><br>`;
                    myList.innerHTML += html;

                }
                let checklist = document.querySelectorAll(".checks");
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

            }
        })
        .catch(err => console.error(err));
}

function clearHtmlList(list) {
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
}

/**
 * block button handler for text field
 */
function writeBlockToBrowser(tab) {
    console.log(tab);
    console.log(pattern.test(tab));
    if (pattern.test(tab)) {
        console.log(tab + " new youtube url");
        let contentToStore = {};
        contentToStore[tab] = document.getElementById("postBtn").textContent.toLowerCase();
        browser.storage.local.set(contentToStore);
        fillHtml();
    } else {
        console.log(tab + " not youtube");
    }
}

//switches status in storage.local
function radioButtonHandler(e) {
    e.preventDefault();
    let val = e.target.value;
    let contentToStore = {
        "radio": val
    };
    if (val === "Whitelist") {
        whitelistInit("allow");
    } else if (val === "Blacklist") {
        blocklistInit("block");
    }
    browser.storage.local.set(contentToStore);

}

function blocklistInit(value) {
    document.getElementById("postBtn").textContent = "Block";

    browser.storage.local.get(null)
        .then(data => {
            let contentToStore = {};
            for (let i = 0; i < Object.keys(data).length; i++) {
                if (Object.keys(data)[i] == "radio") {
                    continue;
                }
                contentToStore[Object.keys(data)[i]] = "block";
            }
            return contentToStore;
        })
        .then(data => {
            browser.storage.local.set(data);
        });
}

function whitelistInit(value) {
    document.getElementById("postBtn").textContent = "Allow"
    browser.storage.local.get(null)
        .then(data => {
            let contentToStore = {};
            for (let i = 0; i < Object.keys(data).length; i++) {
                if (Object.keys(data)[i] == "radio") {
                    continue;
                }
                contentToStore[Object.keys(data)[i]] = "allow";
            }
            return contentToStore;
        })
        .then(data => {
            browser.storage.local.set(data);
        });
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
    let currentValue = "";
    const blockButton = document.getElementById('postBtn');
    const blockWebInputField = document.getElementById("blockWeb");
    const checkDisplayButton = document.getElementById("blockButton");
    const radios = document.getElementById("proxy_style_form")

    blockButton.addEventListener("click", () => {
        if (currentValue) {
            writeBlockToBrowser(currentValue);
        }
    });
    blockWebInputField.addEventListener("change", (e) => {
        currentValue = e.target.value;
    });

    checkDisplayButton.addEventListener("click", fillHtmlChecks);
    radios.addEventListener("change", radioButtonHandler);
    fillHtml();
})();

//Test block/allow button