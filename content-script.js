let html = `<div id="myheader" z-index="-1" position="relative" border="1px solid black">
        <h1>THIS IS A INSURRECTION</h1>
        </div>`;
var body = document.body;
// if (typeof document.getElementById("myheader") != "null") {
body.insertAdjacentHTML('afterbegin', html);

// }