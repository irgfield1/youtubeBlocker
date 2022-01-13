
let youtubeVideoPattern = /(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/;

function interpret(data) {
    if (typeof data == "undefined") {
        console.log("nodata");
        return;
    } else {
        return JSON.parse(data);
        // let j = data.split(';');
        // console.log(j);
        // let blocks = j[0].trim();
        // let allows = j[1].trim();
        // console.log(blocks);
        // console.log(allows);
        // console.log(arrayify(blocks));
        // console.log(arrayify(allows));
        // let contentToStore = { arrayify(blocks), arrayify(allows) }
        // return;
    }
}

function arrayify(myString) {
    let contentToStore = {}
    let blockStatus = [myString.substring(myString.indexOf(":="), -1)];
    myString = myString.substring(myString.indexOf(":=") + 2).trim();
    myString = myString.split(",").map(s => s.trim());
    contentToStore[blockStatus] = myString;
    return contentToStore;
}

function objectify(array1, array2) {


}

async function fetchStorage(textAsset = "assets/blockfolder/data.txt") {
    // let textAsset = "assets/blockfolder/data.txt";
    console.log(textAsset);
    let contentToStore = {};

    await fetch(textAsset)
        .then(async data => {
            let dataReader = data.body.getReader();
            let codedText = await dataReader.read()
            const utf8Decoder = new TextDecoder('utf-8');
            let plainText = utf8Decoder.decode(codedText?.value);
            contentToStore = JSON.parse(plainText);
        });

    console.log(contentToStore);
    return contentToStore;
}