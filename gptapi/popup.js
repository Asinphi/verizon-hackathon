document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('sendButton').addEventListener('click', async function() {
        var inputField = document.getElementById('userInput');
        var question = inputField.value;
  
        console.log('User Question:', question);

        try {
            let answer = await getAnswerFromGPT3(question);
            console.log('Bot Answer:', answer);
    
            // Display the question and answer in the chatbox
            var chatbox = document.getElementById('chatbox');
            chatbox.innerHTML += "User: " + question + "<br>";
            chatbox.innerHTML += "Bot: " + answer + "<br>";
            
            // Clear the input field for the next question
            inputField.value = '';
        } 
        catch (error) {
            console.error('Error:', error);
        }
 
    }, false);
});

async function getAnswerFromGPT3(question){
    // Store the question 
    chrome.storage.sync.set({"question": question}, function() {
        console.log("Question saved");
    });

    var url = 'https://api.openai.com/v1/completions'; // Replace it with the correct URL
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + document.apiKey,
        },
        body: JSON.stringify({
            'prompt': question,
            'max_tokens': 60,
            'model': 'text-davinci-003'
        })
    };
    
    try {
        var response = await fetch(url, options);
        var data = await response.json();
        var answer = data.choices[0].text;
    
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