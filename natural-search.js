// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.
console.log("This prints to the console of the page (injected only if the page url matched)");

const sleep = ms => new Promise(r => setTimeout(r, ms));

const container = document.createElement("div");
container.classList.toggle("natural-search", true);
document.body.appendChild(container);

container.innerHTML = `<span class="natural-search__bot-msg"></span>
<label for="natural-search__input" class="natural-search__input-label"></label>
<textarea class="natural-search__input" id="natural-search__input" placeholder="What are you looking for?"></textarea>
<input type="checkbox" style="display: none" id="natural-search__microphone-checkbox" class="natural-search__microphone-checkbox">
<label class="natural-search__microphone-btn" for="natural-search__microphone-checkbox">
    <img src="${chrome.runtime.getURL("/assets/microphone-80.png")}" class="natural-search__microphone-icon">
</label>
`

const inputEl = container.querySelector(".natural-search__input");

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

let botMsg = container.querySelector(".natural-search__bot-msg");
const botMsgTemplate = botMsg.cloneNode();
async function botSpeech(msg) {
    if (botMsg.style.opacity !== "0") { // An old message exists
        const oldBotMsg = botMsg;
        oldBotMsg.style.opacity = "0";
        oldBotMsg.style.bottom = "300%";
        setTimeout(() => oldBotMsg.remove(), 1000);
        botMsg = botMsgTemplate.cloneNode();
        container.prepend(botMsg);
        await sleep(500);
    }

    botMsg.innerHTML = msg;
    botMsg.style.bottom = "150%";
    botMsg.style.opacity = "1";

    await readTextWithElevenLabs(msg);
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (!request.botMsg) return;
    await botSpeech(request.botMsg);
});

let starterPromptSent = false;
inputEl.addEventListener("focus", async () => {
    if (window.location.href === "https://www.verizon.com/" && !starterPromptSent) {
        await botSpeech("Hello, Justin, would you like information about any products or services that we offer, or can I help you order one?");
        starterPromptSent = true;
    }
});

setTimeout(() => {
    container.style.opacity = "1";
    container.style.bottom = "10%";
}, 500);

setTimeout(async () => { // animate placeholder text in input bar
    const prefix = "I am looking ";

    const placeholders = [
        "to replace my old phone.",
        "for prepaid plans.",
        "for my lost phone.",
        "for Verizon's roadside assistance.",
        "to chat with customer service.",
        "for benefits of switching to Verizon."
    ]

    let idx = 0;
    while (true) {
        inputEl.placeholder = prefix;
        for (const char of placeholders[idx]) {
            await sleep(80);
            inputEl.placeholder += char;
        }
        idx = (idx + 1) % placeholders.length;
        await sleep(2000);
    }

}, 3000);

inputEl.addEventListener("keydown", async (e) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    inputEl.value = "";
    await chrome.runtime.sendMessage({
        query: inputEl.value,
    });
});

{ // Microphone recording
    const recorder = new webkitSpeechRecognition();
    recorder.continuous = true;
    recorder.interimResults = true;
    let finalTranscript = "";
    recorder.onresult = (e) => {
        let interimTranscript = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isfinal) {
                finalTranscript += e.results[i][0].transcript;
            } else {
                interimTranscript += e.results[i][0].transcript;
            }
            inputEl.value = finalTranscript + interimTranscript;
        }
        recorder.onend = (e) => {
            finalTranscript = "";
        }
    };

    container.querySelector(".natural-search__microphone-checkbox").addEventListener("change", (e) => {
        if (e.currentTarget.checked)
            recorder.start();
        else
            recorder.stop();
    });
}