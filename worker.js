try {
    importScripts("node_modules/webextension-polyfill/dist/browser-polyfill.js");
  } catch (e) {
    console.error(e);
  }
  try {
    importScripts("background.js");
  } catch (e) {
    console.error(e);
  }