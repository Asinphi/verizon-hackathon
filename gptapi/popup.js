document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('sendButton').addEventListener('click', async function() {
        var inputField = document.getElementById('userInput');
        var question = inputField.value;
  
        console.log('User Question:', question);

        try {
            let answer = "<answer goes here>"
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