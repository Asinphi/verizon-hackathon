
export {runTranscriptionWorker};

function runTranscriptionWorker() {
    var recognition = new webkitSpeechRecognition()
    recognition.continuous = true;
    recognition.interimResults = false;
    
    recognition.onstart = function() {
        
    };
    
    recognition.onresult = function(event) {
        transcript = '';
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            final_transcript += event.results[i][0].transcript;
        }
        console.log(transcript);
    };

    recognition.start();
}