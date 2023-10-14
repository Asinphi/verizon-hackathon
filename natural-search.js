// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.

console.log("This prints to the console of the page (injected only if the page url matched)");

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
