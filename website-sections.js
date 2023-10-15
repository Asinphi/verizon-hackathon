function sendMessage(msgObj) {
    return chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, msgObj);
    });
}

async function goToUrl(url) {
    sendMessage({
        destinationURL: url
    });
}

async function execute(sectionName, funcName, args) {
    console.log("Executing", funcName, "with args", args);
    sendMessage({
        section: sectionName,
        execute: funcName,
        args: args
    });
}

async function sendBotMsg(msg) {
    console.log("Sending bot msg", msg);
    lastBotPrompt = msg;
    sendMessage({
        botMsg: msg
    });
}

function addPromptedFunction(name, obj, callback) {
    const now = new Date().getTime();
    promptedFunctions[name] = {
        obj: obj,
        callback: callback,
        time: now
    }

    setTimeout(() => {
        if (promptedFunctions[name] && promptedFunctions[name].time === now) {
            delete promptedFunctions[name];
        }
    }, 60 * 4 * 1000)
}

function addPromptedArg(obj, callback) {
    const name = Object.keys(obj)[0];
    const now = new Date().getTime();
    promptedArguments[name] = {
        obj: obj,
        callback: callback,
        time: now
    }

    setTimeout(() => {
        if (promptedArguments[name] && promptedArguments[name].time === now) {
            delete promptedArguments[name];
        }
    }, 60 * 4 * 1000)
}

const websiteSections = {
    "Cart": "https://www.verizon.com/sales/prepaid/expresscart.html?promohub=true",
    "Smartphones": "https://www.verizon.com/smartphones/prepaid/",
    "Billing Information": {
        url: "https://www.verizon.com/sales/prepaid/aboutyourself.html",
        background: async () => {
            await sendBotMsg("Tell us about yourself and join the Verizon family.");
        }
    },
    "Accessories": {
        url: "https://www.verizon.com/sales/prepaid/accessoryInterstitial.html",
        background: async () => {
            await sendBotMsg("Care for additional accessories?");
        }
    },
    "Apple iPhone 14": {
        url: "https://www.verizon.com/smartphones/apple-iphone-14-prepaid/",
        background: async () => {
            await sendBotMsg("Do you have a preferred phone color? Storage capacity?");

            let colorSet = false;
            let storageSet = false;

            addPromptedArg({
                "phone_color": {
                    type: "string",
                    enum: ["Starlight", "Yellow", "Purple", "Blue", "(PRODUCT)RED", "Midnight"]
                }
            }, async (color) => {
                colorSet = true;
                onReady();
                await execute("Apple iPhone 14", "setColor", [color.charAt(0).toUpperCase() + color.slice(1)])
            });

            addPromptedArg({
                "storage_capacity": {
                    type: "string",
                    enum: ["128GB", "256GB", "512GB"]
                }
            }, async (storage) => {
                storageSet = true;
                onReady();
                await execute("Apple iPhone 14", "setStorage", [storage]);
            });

            const onReady = async () => {
                if (colorSet && storageSet) {
                    colorSet = false; // Make sure it can't execute multiple times

                    await sleep(1000);
                    await sendBotMsg("Great choice! If you're ready to buy, just enter your zip code.");
                    await sleep(4000);
                    await execute("Apple iPhone 14", "addToCart")
                }
            }
        },
        foreground: {
            setColor: (color) => {
                document.querySelector(`input[aria-label='${color} color']`).click();
            },
            setStorage: (storage) => {
                document.querySelector(`input[aria-label='${storage} storage']`).click();
            },
            addToCart: () => {
                document.getElementById("ATC-Btn").click();
            }
        }
    },
    "Prepaid Plans": {
        url: "https://www.verizon.com/plans/prepaid/",
        background: async () => {
            await sendBotMsg("What plan would you like? 15 GB data, Unlimited Data, or Unlimited Plus?")

            addPromptedArg({
                "num_phone_lines": {
                    type: "number",
                    description: "The number of phone lines the user wants to activate."
                }
            }, async (numLines) => {
                await execute("Prepaid Plans", "setNumLines", [numLines]);
                await sleep(2000);
                await sendBotMsg("If you don't have a smartphone, you can buy one from Verizon to use with your plan. Would you like to check out our smartphones?");
            });
        },
        foreground: {
            setNumLines: async (numLines) => {
                const addBtn = document.getElementById("overview-increment");
                const subBtn = document.getElementById("overview-decrement");
                const display = document.getElementById("overview-lines");
                display.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await sleep (800);
                while (display.innerText < numLines) {
                    addBtn.click();
                    await sleep(200);
                }
                while (display.innerText > numLines) {
                    subBtn.click();
                    await sleep(500);
                }
            }
        }
    }
};

const navigateToSection = async (sectionName) => {
    const callback = websiteSections[sectionName];
    if (typeof callback === "string")
        return goToUrl(callback);
    if (callback.url) {
        await goToUrl(callback.url);
    }
}