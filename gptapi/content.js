function getTextFromPage() {
    let allElements = Array.prototype.slice.call(document.body.getElementsByTagName('*'));
    let allText = [];
  
    allElements.map((el) => {
        switch (el.tagName.toLowerCase()) {
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
            case 'p':
                let text = el.textContent.trim();        
                if (text) allText.push(text);
                break;
            default:
                break;
        }
    });

    return allText.join(' ');
}

// Send a message containing the page text to the extension
console.log(getTextFromPage());
chrome.runtime.sendMessage({text: getTextFromPage()});