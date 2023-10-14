function addUniqueID() {
    let all = document.getElementsByTagName("*");
    for (let i=0, max=all.length; i < max; i++) {
        if (!all[i].id) {
            all[i].id = 'uniqueID-'+i;
        }
    }
}

function getTextFromPage() {
    let allElements = Array.prototype.slice.call(document.body.getElementsByTagName('*'));
    let allText = [];
  
    allElements.map((el) => {
        switch (el.tagName.toLowerCase()) {
            case 'h1':
            case 'h2':
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

// Send a message containing the page text to the extension
console.log(getTextFromPage());
chrome.runtime.sendMessage({text: getTextFromPage()});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.highlightId) {
            let element = document.getElementById(request.highlightId);
            if (element) {
                element.style.border = "thick solid red";
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.focus();
            }
        }
    }
);