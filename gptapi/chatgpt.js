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