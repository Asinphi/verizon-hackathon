// Add ids to all elements on the page
// necessary to be able to find the element later
function addUniqueID() {
    let all = document.getElementsByTagName("*");
    for (let i=0, max=all.length; i < max; i++) {
        if (!all[i].id) {
            all[i].id = 'uniqueID-'+i;
        }
    }
}

// Parses all h1,h2,and p elements on the page and returns an array of objects
function getTextFromPage() {
    let allElements = Array.prototype.slice.call(document.body.getElementsByTagName('*'));
    let allText = {};
  
    allElements.map((el) => {
        switch (el.tagName.toLowerCase()) {
            case 'span':
            case 'h4':
            case 'p':
                let text = el.textContent.trim().replace(/\s+/g, " ");
                if (text) {
                    let parent = el.parentElement;
                    let id = parent.id;
                    allText[text] = id;
                }
                break;
            default:
                break;
        }
    });
    const results = [];
    for (const [text, parentElementId] of Object.entries(allText))
        results.push({
            text: text,
            parentElementId: parentElementId
        });

    return results;
}

function getTextDataFromDiv(el) {
    const divText = [];
        const divTextDict = {};
        for (const textEl of el.querySelectorAll("p, span, h4")) {
            const text = el.textContent.trim().replace(/\s+/g, " ");
            if (text && !divTextDict[text]) {
                divText.push(text);
                divTextDict[text] = true;
            }
        }
    return divText;
}

function getGroupedTextFromPage(el = document.body, allDivs = []) {
    if (el.clientHeight < window.innerHeight * 0.8 && el.clientWidth < window.innerWidth * 0.3) {
        const divText = getTextDataFromDiv(el);
        if (divText.length > 0)
            allDivs.push({
                text: divText,
                parentElementId: el.id
            });
    } else {
        const subDivs = document.querySelectorAll(`#${el.id} > div, #${el.id} > main, #${el.id} > section`);
        subDivs.forEach((div) => getGroupedTextFromPage(div, allDivs));
    }

    return allDivs;
}

addUniqueID();

chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {
        console.log("REQUEST is in...")
        if (request.highlightId) {
            let element = document.getElementById(request.highlightId);
            if (element) {
                const highlightedEl = element.querySelector(`:is(main, section, div):has(> :is(p, span, h4))`) ?? element;
                highlightedEl.style.border = "thick solid #3932dc";
                highlightedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                highlightedEl.focus();
                await botSpeech(await summarizeAnswer(getTextDataFromDiv(element), request.prompt));
            }
        }
        if (request.text == "send_tree") {
            var savedParsedTree = getTextFromPage();
            chrome.runtime.sendMessage({text: savedParsedTree});
        }
    }
);

// Send tree to service worker
chrome.runtime.sendMessage({
    text: getGroupedTextFromPage()
});