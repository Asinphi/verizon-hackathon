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

container.innerHTML = `<canvas class="natural-search__mascot" id="mascotCanvas"></canvas><span class="natural-search__bot-msg"></span>
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

// Mascot Animation
class BodyPart {
    constructor(image, id, width, height) {
        this.img = image;
        this.id = id;
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.centerX = 0;
        this.centerY = 0;
        this.right = 0;
        this.bottom = 0;
        this.left = 0;
        this.top = 0;

        this.isBouncing = false;
        this.yOffset = 0;
        this.xOffset = 0;
        this.sinBounceAngle = 0;
        this.sinBounceHeight = 0;
        this.sinBounceDelta = 0;
    }
  
    draw(ctx) {
        ctx.drawImage(this.img, this.origin().x + this.xOffset, this.origin().y + this.yOffset, this.width, this.height);
    }
  
    setX(x) {
        this.x = x;
        this.left = x;
        this.centerX = x + this.width / 2;
        this.right = x + this.width;
    }
  
    setLeft(x) {
        this.setX(x);
    }

    setY(y) {
        this.y = y;
        this.top = y;
        this.centerY = y + this.height / 2;
        this.bottom = y + this.height;
    }
  
    setTop(y) {
        this.setY(y);
    }

    setCenterX(x) {
        this.setX(x - this.width / 2);
    }

    setCenterY(y) {
        this.setY(y - this.height / 2);
    }

    setRight(x) {
        this.setX(x - this.width);
    }

    setBottom(y) {
        this.setY(y - this.height);
    }

    startBouncing(height, sinDelta) {
        this.isBouncing = true;
        this.sinBounceHeight = height;
        this.sinBounceDelta = sinDelta;
    }

    stopBouncing() {
        this.isBouncing = false;
        this.yOffset = 0;
        this.sinBounceAngle = 0;
    }

    update() {
        if (this.isBouncing) {
            this.yOffset = -Math.sin(this.sinBounceAngle) * this.sinBounceHeight;
            this.setY(this.origin().y + this.yOffset);
            this.sinBounceAngle += this.sinBounceDelta;
            this.sinBounceAngle %= Math.PI;
        }

        requestAnimationFrame(() => this.update());
    }
}


class Mascot {
    constructor(canvas, head, torso, handR, handL) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");

        this.height = canvas.height;
        this.width = canvas.width;
        const h = this.height
        console.log(canvas)

        this.torso = new BodyPart(torso, "torso", .40*h, .49*h)
        this.torso.setBottom(canvas.height);
        this.torso.setCenterX(canvas.width/2);
        this.head = new BodyPart(head, "head", .44*h, .42*h)
        this.handR = new BodyPart(handR, "handR" ,.18*h,.18*h)
        this.handL = new BodyPart(handL, "handL",.18*h,.18*h)

        this.head.origin = () => {
            return {x: this.torso.centerX - this.head.width/2 + .02*this.height, y: this.torso.top - this.head.height - .03*this.height};
        }
        this.handL.origin = () => {
            return {x: this.torso.left - this.handL.width - .03*this.height, y: this.torso.centerY - .15*this.height};
        }
        this.handR.origin = () => {
            return {x: this.torso.right + .03*this.height, y: this.torso.centerY - .15*this.height};
        }
        this.torso.origin = () => {
            return {x: canvas.width/2 - this.torso.width/2, y: canvas.height - this.torso.height}
        }


        [this.torso, this.head, this.handL, this.handR].forEach((part) => {
            part.update();
            part.setX(part.origin().x);
            part.setY(part.origin().y);
        });
        
    }

    startTalking() {
        this.head.startBouncing(.008*this.height, Math.PI / 20);
    }

    stopTalking() {
        this.head.stopBouncing();
    }

    startBouncing() {
        this.torso.startBouncing(.01*this.height, Math.PI / 110);
    }

    stopBouncing() {
        this.torso.stopBouncing();
    }

    startWaving(hand) {
        hand.startBouncing(.10*this.height, Math.PI/40)
    }
    stopWaving(hand) {
        hand.stopBouncing();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.torso.draw(this.ctx);
        this.head.draw(this.ctx);
        this.handL.draw(this.ctx);
        this.handR.draw(this.ctx);

        requestAnimationFrame(() => this.draw());
    }
}

function loadImage(fp) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = fp;

        image.onload = () => {
            resolve(image);
        };

        image.onerror = (error) => {
            reject(error);
        };
    });
}

(async () => {
    const canvas = document.getElementById("mascotCanvas")

    const head = await loadImage(chrome.runtime.getURL("/assets/head.png"));
    const torso = await loadImage(chrome.runtime.getURL("/assets/torso.png"));
    const handL = await loadImage(chrome.runtime.getURL("/assets/hand.png"));
    const handR = await loadImage(chrome.runtime.getURL("/assets/hand.png"));

    const mascot = new Mascot(canvas, head, torso, handR, handL);
    mascot.startTalking()
    mascot.startBouncing()
    mascot.startWaving(mascot.handR);
    mascot.startWaving(mascot.handL);
    mascot.draw();
})();