<p align="center">
  <img src="https://github.com/Rebeljah/verizon-hackathon/blob/main/assets/head.png" />
</p>

## AIRA
Winner of the Verizon award and 2nd place overall award at the 2023 University of Florida AI days Verizon Hackathon!
## Inspiration
We were inspired to create a click less interaction with a retail website. Our inspiration was to mirror the experience of walking into a retail location and talking to an associate in person.

## What it does
AIRA, which stands for A.I. Retail Assistant, is a innovative web browser extension designed to enhance the online shopping experience by providing users with a seamless, voice-driven interface for interacting with retail websites.

## How we built it
**OpenAI APIs for Intelligent Webpage Scanning**:<br>
AIRA relies on OpenAI APIs to intelligently scan webpages and highlight relevant information based on voice queries. Specifically, we employed OpenAI's ChatGPT in conjunction with OpenAI functions to discern the user's intent. Depending on this intent, AIRA can either navigate to the correct webpage or locate the desired information on the current page.
<br><br>**User Speech Recognition**:<br>
To keep operating costs at a minimum, we utilized the built-in speech recognition functionalities of web browsers. While OpenAI's Whisper was considered, we found the browser's speech recognition to be sufficiently accurate for our needs.
<br><br>**Conversational Voice with ElevenLabs Text-to-Speech**:<br>
We wanted AIRA to offer a lifelike and friendly voice, so we integrated ElevenLabs' generative AI text-to-speech service. This allows users to hear AIRA as if they were engaging in a conversation with a live person.

## Challenges we ran into
**User Intent Inference**:<br>
current webpage or refer to the ChatGPT training set was a significant challenge. We needed to accurately deduce user intent.
<br><br>**Codebase Refactoring**:<br>
We had to refactor our codebase multiple times to create a more modular and flexible framework, making it easier to customize the user experience.
<br><br>**Asynchronous Requests and Chrome Runtime Messages**:<br>
Interacting with asynchronous requests, Chrome runtime messages, and Chrome storage was complex. We initially encountered limitations with the storage of website parse trees in Chrome storage and had to find alternative solutions.
<br><br>**Optimizing Website Parse Tree**:<br>
To ensure that our website parse tree remained within the maximum 16,000 tokens for GPT requests, we developed three different algorithms. Ultimately, we arrived at a solution that involved grouping text in containers of a sufficiently low size.

## Accomplishments we're proud of
**Working Prototype**:<br>
We successfully developed a working prototype of AIRA, demonstrating the feasibility of our concept.
<br><br>**Innovative Use of Generative AI**:<br>
We found a novel application for generative AI, addressing a real-world problem in a new and innovative way.
<br><br>**High-Value Concept with User Experience Focus**:<br>
We created a concept that adds substantial value to users while emphasizing a user-friendly and engaging experience.

## What we learned
**Team Collaboration**:<br>
We gained experience in working effectively as a team, fostering cooperation and coordination among team members.
<br><br>**Applying OpenAI Functions Dynamically**:<br>
We learned how to apply OpenAI functions to dynamically react to user input, ensuring that AIRA responded effectively.
<br><br>**Utilizing Collaboration Software**:<br>
We became proficient in using collaboration software such as Miro and Notion, and Git enhancing our project management and communication.

## Looking ahead
**Expanding to Other Websites**:<br>
AIRA could be expanded to work with websites within the Verizon network and potentially extend its services to other businesses.
<br><br>**Enhancing Knowledge Base**:<br>
We aim to give AIRA a broader knowledge base, enabling it to provide even more comprehensive information about company products and services.

## Deploying the code
Our secret API keys are in a file not in this repository. To deploy it with your own API keys, add the file `gptapi/apiKey.js`:
```js
const apiKey = "Your OpenAI API key here";
const elevenKey = "Your Eleven Labs API key here";
```
For loading the extension into your Chromium-based (Chrome, Edge, Opera, etc.) browser, [see this tutorial](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked).
