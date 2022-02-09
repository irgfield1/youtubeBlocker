
function addList(title, tags) {
    let editDiv = document.getElementById("divWeb");
    // editDiv.add
    let myUrl = title + " : " + resourceUrl;
    console.log(myUrl);
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(myUrl));
    li.id = resourceUrl;
    li.title = tags.toString();
    if (document.getElementById(resourceUrl) == null) {
        editDiv.appendChild(li);
    }
}

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
        addList(result.title, result.tags);
    }
    let promiseArray = [];
    for (let i = 0; i < Object.keys(result).length; i++) {
        if (Object.values(result)[i] == "allow") {
            promiseArray.push(storagePut(Object.keys(result)[i], false));
        } else {
            promiseArray.push(storagePut(Object.keys(result)[i], true));
        }
    }
    Promise.allSettled(promiseArray)/*.then(updateHtml)*/;
});