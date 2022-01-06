'use strict'
let pattern = /(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/;
let radioStatus;

//displays url : blocking pairs in options menu
function fillHtml() {
    console.log("line 14 - last");
    browser.storage.local.get(null)
        .then((data) => {
            if (typeof data != "undefined") {
                let myList = document.querySelector('.hList');

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
            // console.log(data);//just the value associated with radio
            let value = data.toLowerCase();
            // console.log(value);
            let myRadio = document.getElementById(value);
            myRadio.checked = "true";

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
                         <label for="youtubeURL${i}" id="checkboxLabel${i}"> ${Object.keys(data)[i]} : ${Object.values(data)[i]}</label><br>`;

                    myList.innerHTML += html;
                    //addListener(i);
                    // document.querySelector(`#youtubeURL${i}`).addEventListener('input', checkListener);

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
                        // console.log(document.querySelector(`#youtubeURL${i}`).checked);
                        // console.log(Object.keys(data)[i]);
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

//block button handler for text field
function writeBlockToBrowser(tab) {
    console.log(tab);
    console.log(pattern.test(tab));
    if (pattern.test(tab)) {
        console.log(tab + " new youtube url");
        let contentToStore = {};
        contentToStore[tab] = "block";
        browser.storage.local.set(contentToStore);
        fillHtml();
    } else {
        console.log(tab + " not youtube");
    }
}

//switches status in storage.local
function radioButtonHandler(e) {
    e.preventDefault();
    let radios = document.querySelector("form");
    let contentToStore = {};
    if (radios != "undefined") {
        if (radios[0].checked) {
            contentToStore["radio"] = radios[0].value;
            blocklistInit("block")
        } else if (radios[1].checked) {
            contentToStore["radio"] = radios[1].value;

        } else if (radios[2].checked) {
            contentToStore["radio"] = radios[2].value;
            whitelistInit("allow")
        }
    }
    browser.storage.local.set(contentToStore);

    //TODO change event listener based on radio button input
}

function blocklistInit(value) {
    alert(`allowing all nonlisted urls`)
    document.getElementById("postBtn").textContent = "Block";

    browser.storage.local.get(null)
        .then(data => {
            let contentToStore = {};
            for (let i = 0; i < Object.keys(data).length; i++) {
                if (Object.keys(data)[i] == "radio") {
                    continue;
                } else {

                }
                contentToStore[Object.keys(data)[i]] = "block";
            }
            return contentToStore;


        })
        .then(data => {
            browser.storage.local.set(data);
        });
    // if (confirm(`Changing to ${value} mode`)) {
    //     console.log("Changed!!");
    // } else {
    //     console.log("¡¡Avoided!!");
    // }
}

function whitelistInit(value) {
    alert(`Blocking all nonlisted urls`);
    document.getElementById("postBtn").textContent = "Allow"
    browser.storage.local.get(null)
        .then(data => {
            let contentToStore = {};
            for (let i = 0; i < Object.keys(data).length; i++) {
                if (Object.keys(data)[i] == "radio") {
                    continue;
                } else {

                }
                contentToStore[Object.keys(data)[i]] = "allow";
            }
            return contentToStore;


        })
        .then(data => {
            browser.storage.local.set(data);
        });
    //Change block button to allow button
}

function radioButtonStorage() {
    return new Promise((resolve, reject) => {
        readLocalStorage("radio")
            .then(data => {
                console.log(data);
            })
            .catch(err => {
                console.error(err);
            });
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

const setLocalStorage = async (key) => {
    return new Promise((resolve, reject) => {
        browser.storage.local.set(key).then(resolve()).catch(reject());
    });
};

//Executable code
(() => {
    const blockButton = document.querySelector('.postButton');
    let myValue;
    document.querySelector("#blockWeb").addEventListener("change", () => myValue = document.querySelector("#blockWeb").value);
    blockButton.addEventListener("click", () => writeBlockToBrowser(myValue));
    const checkDisplayButton = document.querySelector(".checksButton");
    checkDisplayButton.addEventListener("click", fillHtmlChecks);
    /*let checklist = document.querySelectorAll(".checks");
    checklist.forEach(() => {
        console.log("beans");
    })*/
    fillHtml();
    let radios = document.querySelector("form");
    //console.log(radios);
    radios.addEventListener("submit", radioButtonHandler)

    // fillHtml();
})();

//EOF


/**
 * Radio buttons switch between the way we've been doing it,
 *   blocklist with every currently listed website blocked
 *   and whitelist with every listed url allowed but nothing else
 *
 */


//Get whitelist and blocklist to operate oppositely
//Split is current situation