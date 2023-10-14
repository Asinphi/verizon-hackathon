// This is the service worker script, which executes in its own context
// when the extension is installed or refreshed (or when you access its console).
// It would correspond to the background script in chrome extensions v2.

const contentScriptPorts = {};

chrome.runtime.onConnect.addListener(function(port) {
    contentScriptPorts[port.name] = port;

    if (port.name === "recorder") {
        port.postMessage("start");
        port.onMessage.addListener((msg) => {
            console.log(msg);
        })
    }
});
