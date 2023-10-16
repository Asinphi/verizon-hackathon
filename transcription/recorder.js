
var recorder = new webkitSpeechRecognition()
recorder.continuous = true;
recorder.interimResults = false;
recorder.onstart = function() {
    
};
recorder.onresult = function(event) {
    transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
    }
    port.postMessage(transcript);
};

// setup connection to worker
var port = chrome.runtime.connect({name: "recorder"});
port.onMessage.addListener(function(msg) {
    if (msg === "stop") {
        recorder.stop();
    } else if (msg === "start") {
        recorder.start()
    }
});