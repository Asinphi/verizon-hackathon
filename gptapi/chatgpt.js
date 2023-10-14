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
            'Authorization': 'Bearer ' + apiKey,
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
            'Authorization': 'Bearer ' + apiKey,
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
            'Authorization': 'Bearer ' + apiKey,
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