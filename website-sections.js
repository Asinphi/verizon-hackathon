async function goToUrl(url) {
    return chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            destinationURL: url
        });
    });
}

async function sendBotMsg(msg) {
    console.log("Sending bot msg", msg);
    return chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            botMsg: msg
        });
    });
}

const websiteSections = {
    "Smartphones": "https://www.verizon.com/smartphones/prepaid/",
    "Apple iPhone 14": "https://www.verizon.com/smartphones/apple-iphone-14-prepaid/",
    "Accessories": "https://www.verizon.com/sales/prepaid/accessoryInterstitial.html",
    "Cart": "https://www.verizon.com/sales/prepaid/expresscart.html?promohub=true",
    "Billing Information": "https://www.verizon.com/sales/prepaid/aboutyourself.html",
    "Prepaid Plans": async () => {
        await goToUrl("https://www.verizon.com/plans/prepaid/");
        await sleep(3000);
        await sendBotMsg("Okay, what plan would you like? 15GB data, Unlimited Data, or Unlimited Plus?")
    }
};

const navigateToSection = async (sectionName) => {
    const callback = websiteSections[sectionName];
    if (typeof callback === "string")
        return goToUrl(callback);
    return await callback();
}