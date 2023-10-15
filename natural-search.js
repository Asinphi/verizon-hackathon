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

setTimeout(() => {
    container.style.opacity = "1";
    container.style.bottom = "10%";
}, 500);

let starterPromptSent = false;
inputEl.addEventListener("focus", async () => {
    if (window.location.href === "https://www.verizon.com/" && !starterPromptSent) {
        await botSpeech("Hello, Justin, would you like information about any products or services that we offer, or can I help you order one?");
        starterPromptSent = true;
    }
});

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
    }

    update() {
        if (this.isBouncing) {
            this.yOffset = -Math.sin(this.sinBounceAngle) * this.sinBounceHeight;
            this.setY(this.origin().y + this.yOffset);
            this.sinBounceAngle += this.sinBounceDelta;
            if (this.sinBounceAngle >= Math.PI) {
                this.sinBounceAngle = 0;
            }
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

        this.wavingHand = this.handR;

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

    startWaving() {
        this.wavingHand.startBouncing(.10*this.height, Math.PI/40)
    }
    stopWaving() {
        this.wavingHand.stopBouncing();
        this.wavingHand = this.thisWavingHand === this.handL? this.handR : this.handL;
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
    mascot.startWaving()
    mascot.startBouncing()
    setTimeout(() => {
        mascot.stopWaving();
        setTimeout(()=>mascot.startWaving(), 1000)
    }, 2000)
    mascot.draw();
})();