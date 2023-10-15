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

async function summarizeAnswer(info, prompt){
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
                    'content': `Give a short answer based on the prompt and relevant info. Here is the relevant information: ${info}`
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'temperature': 0.5,
            'max_tokens': 100,
        })
    };

    try {
        var response = await fetch(url, options);
        var data = await response.json();
        var answer = data.choices[0].message.content;
        console.log("The answer is: " + answer)
        return answer;
    }
    catch(error){
        console.error('Error:', error);
        throw error;
    }
}

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