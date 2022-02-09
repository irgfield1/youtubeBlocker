chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(request);// In current tab console, not extension console
        if (request?.title) {
            // setTimeout((){
            console.log(document.title);
            sendResponse({ title: `${document.title}` })
            //    }, 100);
        } else {
            if (request?.cover) {
                coverGreen();
            } else {
                uncoverGreen();
            }
            return true;
        }
    }
);
// browser.runtime.onMessage.addListener((data) => {
//     console.log(data);
//     if (data.cover) {
//         coverGreen();
//     } else {
//         uncoverGreen();
//     }
//     return true;
// });

function coverGreen() {
    setTimeout(() => {
        console.log("In coverGreen");
        let videoContainer = document.getElementById("player-container-outer");
        console.log(videoContainer);
        if (videoContainer == "null") return;
        let blockDiv = document.createElement('div');
        blockDiv.id = "coverGreen";
        blockDiv.style.cssText += "position: absolute;width: 100%;height: 100%;background: green;text-align:center;vertical-align:middle;z-index: 99999;";
        let header = document.createElement('h1');
        header.innerText = document.title;
        blockDiv.prepend(header);
        videoContainer.prepend(blockDiv);
    }, 2000)
}

function uncoverGreen() {
    setTimeout(() => {
        let blockDiv = document.getElementById("coverGreen");
        console.log(blockDiv);
        if (blockDiv != null) {
            blockDiv.remove();
        }
    }, 2000);
}


/*
Get title from url 2
Notify Blocked 2
Block library

*/


///Bad behavior := message not received, end does not exist