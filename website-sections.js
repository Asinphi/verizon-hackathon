function sendMessage(msgObj) {
    return chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
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
    "Accessories": "https://www.verizon.com/sales/prepaid/accessoryInterstitial.html",
    "Cart": "https://www.verizon.com/sales/prepaid/expresscart.html?promohub=true",
    "Billing Information": "https://www.verizon.com/sales/prepaid/aboutyourself.html",
    "Smartphones": "https://www.verizon.com/smartphones/prepaid/",
    "Apple iPhone 14": {
        background: async () => {
            await goToUrl("https://www.verizon.com/smartphones/apple-iphone-14-prepaid/");
            await sleep(3000);
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
        background: async () => {
            await goToUrl("https://www.verizon.com/plans/prepaid/");
            await sleep(3000);
            await sendBotMsg("Okay, what plan would you like? 15GB data, Unlimited Data, or Unlimited Plus?")

            addPromptedArg({
                "num_phone_lines": {
                    type: "number",
                    description: "The number of phone lines the user wants to activate."
                }
            }, async (numLines) => {
                await execute("Prepaid Plans", "setNumLines", [numLines]);
                await sleep(2000);
                await sendBotMsg("Would you like to check out the smartphones you can get along with your plan?");
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
    return await callback.background();
}