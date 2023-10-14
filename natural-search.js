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

container.innerHTML = `<label for="natural-search__input" class="natural-search__input-label"></label>
<textarea class="natural-search__input" id="natural-search__input" placeholder="What are you looking for?"></textarea>
<input type="checkbox" style="display: none" id="natural-search__microphone-checkbox" class="natural-search__microphone-checkbox">
<label class="natural-search__microphone-btn" for="natural-search__microphone-checkbox">
    <img src="${chrome.runtime.getURL("/assets/microphone-80.png")}" class="natural-search__microphone-icon">
</label>
`

const inputEl = container.querySelector(".natural-search__input");

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
    await chrome.runtime.sendMessage({
        query: inputEl.value,
    });
});

{ // Microphone recording
    const recorder = new webkitSpeechRecognition();
    recorder.continuous = true;
    recorder.interimResults = false;
    recorder.onresult = (e) => {
       for (let i = e.resultIndex; i < e.results.length; i++)
           inputEl.value += e.results[i][0].transcript;
    };

    container.querySelector(".natural-search__microphone-checkbox").addEventListener("change", (e) => {
        if (e.currentTarget.checked)
            recorder.start();
        else
            recorder.stop();
    });
}