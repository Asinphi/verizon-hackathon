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
    console.log("Sent bot msg", msg);

    await readTextWithElevenLabs(msg);
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (!request.botMsg) return;
    await botSpeech(request.botMsg);
});

let starterPromptSent = false;
inputEl.addEventListener("focus", async () => {
    if (window.location.href === "https://www.verizon.com/" && !starterPromptSent) {
        await botSpeech("I am A.I.Ra. How can I help you today?");
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
    e.preventDefault();
    await chrome.runtime.sendMessage({
        query: inputEl.value,
    });
    console.log("Sent query", inputEl.value);
    inputEl.value = "";
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.destinationURL)
        window.location.href = request.destinationURL;
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
        inputEl.focus();
    };

    recorder.onend = (e) => {
        finalTranscript = "";
    }

    const checkboxEl = container.querySelector(".natural-search__microphone-checkbox");

    function onTranscriptionToggle() {
        if (checkboxEl.checked)
            recorder.start();
        else
            recorder.stop();
    }

    checkboxEl.addEventListener("change", onTranscriptionToggle);

    if (checkboxEl.checked)
        recorder.start();

    window.addEventListener("keyup", (e) => {
        if (e.key === "m" && e.altKey) {
            checkboxEl.checked = !checkboxEl.checked;
            onTranscriptionToggle();
        }
    });
}