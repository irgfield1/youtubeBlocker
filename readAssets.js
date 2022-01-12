


function interpret(data) {
    if (typeof data == "undefined") {
        console.log("nodata");
        return;
    } else {
        console.log(data);
        return;
    }
}


function fetchStorage(textAsset = "assets/blockfolder/data.txt") {
    // let textAsset = "assets/blockfolder/data.txt";
    console.log(textAsset);

    fetch(textAsset)
        .then(async data => {
            let j = data.body.getReader();
            let k = await j.read()
            const utf8Decoder = new TextDecoder('utf-8');
            console.log(utf8Decoder.decode(k?.value));

        });
}