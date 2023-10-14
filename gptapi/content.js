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
    let allText = [];
  
    allElements.map((el) => {
        switch (el.tagName.toLowerCase()) {
            case 'p':
                let text = el.textContent.trim();        
                if (text) {
                    let parent = el.parentElement;
                    let id = parent.id;
                    allText.push({
                        text: text,
                        parentElementId: id
                    });
                }
                break;
            default:
                break;
        }
    });

    return allText;
}

addUniqueID();

chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {
        console.log("REQUEST is in...")
        if (request.highlightId) {
            let element = document.getElementById(request.highlightId);
            if (element) {
                // Styling files get priority over inline styles
                var style = document.createElement('style');
                style.innerHTML = `
                #${request.highlightId} {
                    border: thick solid red !important;
                }`;
                document.head.appendChild(style);
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.focus();
                await botSpeech(await summarizeAnswer(element.querySelector("p").innerHTML, request.prompt));
            }
        }
        if (request.text == "send_tree") {
            var savedParsedTree = getTextFromPage();
            chrome.runtime.sendMessage({text: savedParsedTree});
        }
    }
);