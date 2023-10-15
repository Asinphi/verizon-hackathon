<p align="center">
  <img src="https://github.com/Rebeljah/verizon-hackathon/blob/main/assets/head.png" />
</p>

## AIRA
## Inspiration
We were inspired to create a click less interaction with a retail website. Our inspiration was to mirror the experience of walking into a retail location and talking to an associate in person.

## What it does
AIRA, which stands for A.I. Retail Assistant, is a innovative web browser extension designed to enhance the online shopping experience by providing users with a seamless, voice-driven interface for interacting with retail websites.

## How we built it
**OpenAI APIs for Intelligent Webpage Scanning - **
AIRA relies on OpenAI APIs to intelligently scan webpages and highlight relevant information based on voice queries. Specifically, we employed OpenAI's ChatGPT in conjunction with OpenAI functions to discern the user's intent. Depending on this intent, AIRA can either navigate to the correct webpage or locate the desired information on the current page.
**User Speech Recognition - **
To keep operating costs at a minimum, we utilized the built-in speech recognition functionalities of web browsers. While OpenAI's Whisper was considered, we found the browser's speech recognition to be sufficiently accurate for our needs.
**Conversational Voice with ElevenLabs Text-to-Speech - **
We wanted AIRA to offer a lifelike and friendly voice, so we integrated ElevenLabs' generative AI text-to-speech service. This allows users to hear AIRA as if they were engaging in a conversation with a live person.

## Challenges we ran into
**User Intent Inference - **
current webpage or refer to the ChatGPT training set was a significant challenge. We needed to accurately deduce user intent.
**Codebase Refactoring - **
We had to refactor our codebase multiple times to create a more modular and flexible framework, making it easier to customize the user experience.
**Asynchronous Requests and Chrome Runtime Messages - **
Interacting with asynchronous requests, Chrome runtime messages, and Chrome storage was complex. We initially encountered limitations with the storage of website parse trees in Chrome storage and had to find alternative solutions.
**Optimizing Website Parse Tree - **
To ensure that our website parse tree remained within the maximum 16,000 tokens for GPT requests, we developed three different algorithms. Ultimately, we arrived at a solution that involved grouping text in containers of a sufficiently low size.

## Accomplishments we're proud of
**Working Prototype - **
We successfully developed a working prototype of AIRA, demonstrating the feasibility of our concept.
**Innovative Use of Generative AI**
We found a novel application for generative AI, addressing a real-world problem in a new and innovative way.
**High-Value Concept with User Experience Focus**
We created a concept that adds substantial value to users while emphasizing a user-friendly and engaging experience.

## What we learned
**Team Collaboration - **
We gained experience in working effectively as a team, fostering cooperation and coordination among team members.
**Applying OpenAI Functions Dynamically - **
We learned how to apply OpenAI functions to dynamically react to user input, ensuring that AIRA responded effectively.
**Utilizing Collaboration Software - **
We became proficient in using collaboration software such as Miro and Notion, and Git enhancing our project management and communication.

## Looking ahead
**Expanding to Other Websites - **
AIRA could be expanded to work with websites within the Verizon network and potentially extend its services to other businesses.
**Enhancing Knowledge Base - **
We aim to give AIRA a broader knowledge base, enabling it to provide even more comprehensive information about company products and services.
