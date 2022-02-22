let youtubeVideoPattern =
    /(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/;

async function readAsset(textAsset = "assets/blockfolder/data.txt") {
    textAsset = textAsset.replace(/\\+/g, "/");
    let content = await fetchStorage(textAsset);

    let contentToStore = {};
    for (let i = 0; i < Object.keys(content).length; i++) {
        if (Object.keys(content)[i].toLowerCase() == "allow") {
            for (let j = 0; j < Object.values(content)[i].length; j++) {
                let url = trimYoutubeUrl(Object.values(content)[i][j]);
                contentToStore[url] = "allow";
            }
        } else if (Object.keys(content)[i].toLowerCase() == "block") {
            for (let j = 0; j < Object.values(content)[i].length; j++) {
                let url = trimYoutubeUrl(Object.values(content)[i][j]);
                contentToStore[url] = "block";
            }
        } else if (Object.keys(content)[i].toLowerCase() == "title") {
            contentToStore.title = Object.values(content)[i];
        } else if (Object.keys(content)[i].toLowerCase() == "tags") {
            contentToStore.tags = Object.values(content)[i];
        } else {
            console.log("Invalid JSON key in key : value pair");
            continue;
        }
    }

    return contentToStore;
}

async function fetchStorage(textAsset) {
    let contentToStore = {};

    await fetch(textAsset).then(
        async (data) => {
            let dataReader = data.body.getReader();
            let codedText = await dataReader.read();
            const utf8Decoder = new TextDecoder("utf-8");
            let plainText = utf8Decoder.decode(codedText?.value);
            contentToStore = JSON.parse(plainText);
        },
        (err) => {
            console.error(err);
        }
    );
    return contentToStore;
}

function trimYoutubeUrl(url) {
    if (youtubeVideoPattern.test(url)) {
        return url.slice(url.search("v="))
    } else if (url.length == 13 && url.includes("v=")) {
        if (new RegExp(/[~`!#$%\^&*+=\[\]\\';,/{}|\\":<>\?]/g).test(url.slice(2))) {//prevent v=...&c=...
            return "Fail"
        } else {
            return url
        }
    } else {
        return "Fail";
    }
}
