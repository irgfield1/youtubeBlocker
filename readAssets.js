let youtubeVideoPattern =
    /(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/;

async function interpret(textAsset = "assets/blockfolder/data.txt") {

    textAsset = textAsset.replace(/\\+/g, "/");
    console.log(textAsset);
    let content = await fetchStorage(textAsset);

    console.log(Object.keys(content));
    console.log(Object.values(content));
    let contentToStore = {};
    for (let i = 0; i < Object.keys(content).length; i++) {
        if (Object.keys(content)[i].toLowerCase() == "allow") {
            for (let j = 0; j < Object.values(content)[i].length; j++) {
                contentToStore[Object.values(content)[i][j]] = "allow";
            }
        } else if (Object.keys(content)[i].toLowerCase() == "block") {
            for (let j = 0; j < Object.values(content)[i].length; j++) {
                contentToStore[Object.values(content)[i][j]] = "block";
            }
        } else {
            continue;
        }
    }
    console.log(contentToStore);

    return contentToStore;
}

function arrayify(myString) {
    let contentToStore = {};
    let blockStatus = [myString.substring(myString.indexOf(":="), -1)];
    myString = myString.substring(myString.indexOf(":=") + 2).trim();
    myString = myString.split(",").map((s) => s.trim());
    contentToStore[blockStatus] = myString;
    return contentToStore;
}

async function fetchStorage(textAsset) {
    console.log(textAsset);
    let contentToStore = {};

    await fetch(textAsset).then(
        async (data) => {
            console.log(data);
            let dataReader = data.body.getReader();
            console.log(dataReader);
            let codedText = await dataReader.read();
            console.log(codedText);
            const utf8Decoder = new TextDecoder("utf-8");
            let plainText = utf8Decoder.decode(codedText?.value);
            console.log(plainText);
            contentToStore = JSON.parse(plainText);
            console.log(contentToStore);
        },
        (err) => {
            console.error(err);
        }
    );

    let storage = await browser.storage.local.get();
    console.log(storage);

    console.log(contentToStore);
    return contentToStore;
}
