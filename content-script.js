// document.addEventListener("load", (e) => {
//     console.log("shouldFire");
//     let videoContainer = document.getElementById("player-container-outer");
//     let blockDiv = document.createElement('div');
//     blockDiv.style.cssText += "position: absolute;width: 100%;height: 100%;background: green;text-align:center;z-index: 99999;";
//     blockDiv.innerText = "Blocked";
//     videoContainer.prepend(blockDiv);
// });
/*let html = `<div id="myheader" style="z-index: 9999999;position: fixed;top: 56px;width: 200px;height: 100px;background: white;box-shadow: 0 8px 8px 0 black;left: 100px;">
        <h1>THIS IS A INSURRECTION</h1>
        </div>`;
var body = document.body;
let title = document?.title;
// console.log(title);
// console.log(document);
// console.log(document.getElementById("myheader"));
// console.log(document.getElementById("myheader") == null);
// if (document.getElementById("myheader") == null) {
//     body.insertAdjacentHTML('afterbegin', html);
// }
browser.storage.local.get().then((data) => {
    console.log(data);
    if (data.hasOwnProperty(document.URL)) {
        console.log("In Storage");
    }
    if (data[document.URL] == "block") {
        if (document.getElementById("myheader") == null) {
            body.insertAdjacentHTML('afterbegin', html);
        }
    }
});*/

// (async () => {
//     console.log(document?.title);
//     browser.tabs.query({ active: true }).then(async (tabs) => {
//         let tempUrl = tabs[0].url.slice();
//         if (tempUrl.includes("youtube"));
//         var hope = document.getElementsByTagName("ytd-video-primary-info-renderer");
//         console.log(hope);
//         hope.insertAdjacentHTML('afterbegin', html);
//     });
// })();

// function getTitle(externalUrl) {
//     var proxyurl = "http://localhost/get_external_content.php?url=" + externalUrl;
//     $.ajax({
//         url: proxyurl,
//         async: true,
//         success: function (response) {
//             alert(response);
//         },
//         error: function (e) {
//             alert("error! " + e);
//         }
//     });
// }

// async function noAPITitleFromUrl(url) {
//     var response = await fetch(url);
//     switch (response.status) {
//         // status "OK"
//         case 200:
//             let result = await response.blob()
//             console.log(result);
//             result.text().then(text => {

//                 console.log(text.slice(text.indexOf("<title>") + 7, text.indexOf("</title>")));
//             });
//             break;
//         // status "Not Found"
//         case 404:
//             console.log('Not Found');
//             break;
//     }
// }
//*//
browser.runtime.onMessage.addListener((data) => {
    console.log(data);
    if (data.cover) {
        coverGreen();
    } else {
        uncoverGreen();
    }
});

function coverGreen() {
    setTimeout(() => {
        console.log("In coverGreen");
        let videoContainer = document.getElementById("player-container-outer");
        let blockDiv = document.createElement('div');
        blockDiv.id = "coverGreen";
        blockDiv.style.cssText += "position: absolute;width: 100%;height: 100%;background: green;text-align:center;z-index: 99999;";
        blockDiv.innerText = "Blocked";
        videoContainer.prepend(blockDiv);
    }, 1000)
}

function uncoverGreen() {
    let blockDiv = document.getElementById("coverGreen");
    console.log(blockDiv);
    blockDiv.remove();
}

// setTimeout(() => {
//     let videoContainer = document.getElementById("player-container-outer");
//     let blockDiv = document.createElement('div');
//     blockDiv.style.cssText += "position: absolute;width: 100%;height: 100%;background: green;text-align:center;z-index: 99999;";
//     blockDiv.innerText = "Blocked";
//     videoContainer.prepend(blockDiv);
// }, 5000)




/*
Get title from url 2
Notify Blocked 2
Block library

*/