chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("REQUEST is in...");
        if (request.text) {
            console.log('Received text:', request.text);
            // turn the given array into a json string
            var jsonString = JSON.stringify(request.text);
            console.log(jsonString);
            // Add additional functionality here:
            chrome.storage.local.set({"parsedTree": jsonString}, function() {
                console.log("Parsed tree saved");
            });
        }
    }
);

document.addEventListener('DOMContentLoaded', async function () {

    await readTextWithElevenLabs("Hello, I am your personal assistant. How can I help you?");

    // send a message to the content script to send the parsedTree over
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {text: "send_tree"}, function(response) {
            console.log("Sent message to content script to send parsedTree");
            return true;
        });
    });

    document.getElementById('sendButton').addEventListener('click', async function() {
        var inputField = document.getElementById('userInput');
        var question = inputField.value;
  
        console.log('User Question:', question);

        try {
            // get the user intent with their question:
            let intent = await getUserIntentGPT3(question);
            console.log('User Intent:', intent);
            // if the intent is to information, then we need to parse the page and return the parentElementId
            if (intent == "information") {
                // get the parsedtree from storage
                chrome.storage.local.get('parsedTree', async function(data) {
                    var savedParsedTree = data.parsedTree ? data.parsedTree : 'No parsed tree saved';
                    console.log("Saved Parsed Tree: " + savedParsedTree);
                    let elementId = await parsedPageDictionary(savedParsedTree, question);
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
                let answer = await getAnswerFromGPT3(question);
                console.log('Bot Answer:', answer);
                // Display the question and answer in the chatbox
                var chatbox = document.getElementById('chatbox');
                chatbox.innerHTML += "User: " + question + "<br>";
                chatbox.innerHTML += "Bot: " + answer + "<br>";
                await readTextWithElevenLabs(answer);
                // Clear the input field for the next question
                inputField.value = '';
            }
        } 
        catch (error) {
            console.error('Error:', error);
        }
 
    }, false);
});

  
window.onload = function() {

// Fetch question and answer from storage
chrome.storage.sync.get('question', function(data) {
  var savedQuestion = data.question ? data.question : 'No questions saved';
  var chatbox = document.getElementById('chatbox');
  chatbox.innerHTML += "Saved Question: " + savedQuestion + "<br>";
});

chrome.storage.sync.get('answer', function(data) {
  var savedAnswer = data.answer ? data.answer : 'No answers saved';
  var chatbox = document.getElementById('chatbox');
  chatbox.innerHTML += "Saved Answer: " + savedAnswer + "<br>";
});
};