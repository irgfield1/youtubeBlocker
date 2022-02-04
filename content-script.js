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
        blockDiv.style.cssText += "position: absolute;width: 100%;height: 100%;background: green;text-align:center;vertical-align:middle;z-index: 99999;";
        let header = document.createElement('h1');
        header.innerText = "Blocked";
        blockDiv.prepend(header);
        videoContainer.prepend(blockDiv);
    }, 1000)
}

function uncoverGreen() {
    let blockDiv = document.getElementById("coverGreen");
    console.log(blockDiv);
    blockDiv.remove();
}

/*
Get title from url 2
Notify Blocked 2
Block library

*/