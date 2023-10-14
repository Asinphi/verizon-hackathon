// This is the service worker script, which executes in its own context
// when the extension is installed or refreshed (or when you access its console).
// It would correspond to the background script in chrome extensions v2.

contentScriptPorts = {};

chrome.runtime.onConnect.addListener(function(port) {
    contentScriptPorts[port.name] = port;
});

contentScriptPorts["recorder"].postMessage("start");

setTimeout(() => {contentScriptPorts["recorder"].stop()}, 5000);