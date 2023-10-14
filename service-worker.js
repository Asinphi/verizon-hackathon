// This is the service worker script, which executes in its own context
// when the extension is installed or refreshed (or when you access its console).
// It would correspond to the background script in chrome extensions v2.

const sleep = ms => new Promise(r => setTimeout(r, ms));

console.log("This prints to the console of the service worker (background script)")

// Importing and using functionality from external files is also possible.
//importScripts('service-worker-utils.js')
importScripts("gptapi/apiKey.js");
importScripts("gptapi/chatgpt.js");

// If you want to import a file that is deeper in the file hierarchy of your
// extension, simply do `importScripts('path/to/file.js')`.
// The path should be relative to the file `manifest.json`.

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    /* TODO Send to ChatGPT and execute corresponding website section code, which sends to URL, maybe also establishes
        a connnection with the active tab for more follow-up questions and such
     */
    if (!request.query) return;

    try {
        // get the user intent with their question:
        let intent = await getUserIntentGPT3(request.query);
        console.log('User Intent:', intent);
        // if the intent is to information, then we need to parse the page and return the parentElementId
        if (intent == "information") {
            // get the parsedtree from storage
            chrome.storage.local.get('parsedTree', async function(data) {
                var savedParsedTree = data.parsedTree ? data.parsedTree : 'No parsed tree saved';
                console.log("Saved Parsed Tree: " + savedParsedTree);
                let elementId = await parsedPageDictionary(savedParsedTree, request.query);
                console.log('Element ID:', elementId);
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {highlightId: elementId}, function(response) {
                        console.log("Sent message to scroll & highlight element");
                        return true;
                    });
                });
            });
            return;
        }
        else{
            let answer = await getAnswerFromGPT3(request.query);
            console.log('Bot Answer:', answer);

        }
    }
    catch (error) {
        console.error('Error:', error);
    }
})
