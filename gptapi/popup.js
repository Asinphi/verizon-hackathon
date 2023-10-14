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

document.addEventListener('DOMContentLoaded', function () {

    readTextWithElevenLabs("Hello, I am your personal assistant. How can I help you?");

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

async function readTextWithElevenLabs(msg) {
    const url = "https://api.elevenlabs.io/v1/text-to-speech/ThT5KcBeYPX3keUQqHPh";

    // Randomly select API key
    let selectedKey = elevenKey;

    const headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": selectedKey
    };

    const data = {
        "text": msg,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.66,
            "similarity_boost": 0.72,
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
        const blob = await response.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audio.play();
    } catch (error) {
        console.error('Error:', error);
    }
}


async function getAnswerFromGPT3(question){
    // Store the question 
    chrome.storage.sync.set({"question": question}, function() {
        console.log("Question saved");
    });

    var url = 'https://api.openai.com/v1/chat/completions';
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + document.apiKey,
        },
        body: JSON.stringify({
            'model': 'gpt-3.5-turbo',
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are a chrome extension assistant helping the user with information'
                },
                {
                    'role': 'user',
                    'content': question
                }
            ]
        })
    };
    
    try {
        var response = await fetch(url, options);
        var data = await response.json();
        var answer = data.choices[0].message.content;
    
        // Store the answer
        chrome.storage.sync.set({"answer": answer}, function() {
          console.log("Answer saved");
        });
             
        return answer;
    } 
    catch(error){
        console.error('Error:', error);
        throw error;
    }
}

async function getUserIntentGPT3(prompt){
    var url = 'https://api.openai.com/v1/chat/completions';
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + document.apiKey,
        },
        body: JSON.stringify({
            'model': 'gpt-3.5-turbo',
            'messages': [
                {
                    'role': 'system',
                    'content': 'Return the user intent as a one-word answer from these: ["navigate", "information"]\n\n-----\n\nINPUT: I want to buy a plan\nOUTPUT: navigate\n\nINPUT: what are the plans available?\nOUTPUT: information'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'temperature': 0.0,
            'max_tokens': 10,
        })
    };
    
    try {
        var response = await fetch(url, options);
        var data = await response.json();
        var intent = data.choices[0].message.content;
        console.log("The user intent is: " + intent)
        return intent;
    } 
    catch(error){
        console.error('Error:', error);
        throw error;
    }
}

async function parsedPageDictionary(parsedTree, prompt){
    var url = 'https://api.openai.com/v1/chat/completions';
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + document.apiKey,
        },
        body: JSON.stringify({
            'model': 'gpt-3.5-turbo-16k',
            'messages': [
                {
                    'role': 'system',
                    'content': `You are helping figure out the parentElementId that is the most appropriate for a given query. Your response is only one word which is the parentElementId. This is the entire website tree with the parentElementId: ${parsedTree}`
                },
                {
                    'role': 'user',
                    'content': 'what is the closest parentElementId for this prompt: ' +prompt
                }
            ],
            'temperature': 0.5,
            'max_tokens': 10,
        })
    };
    
    try {
        var response = await fetch(url, options);
        var data = await response.json();
        var intent = data.choices[0].message.content;
        console.log("The user intent is: " + intent)
        return intent;
    } 
    catch(error){
        console.error('Error:', error);
        throw error;
    }
} 

  
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