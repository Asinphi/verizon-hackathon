const promptedFunctions = {}; // Functions that can be called if the AI prompts the user for a specific response
const promptedArguments = {}
let lastBotPrompt = "";

async function getAnswerFromGPT3(question){
    // Store the question
    chrome.storage.sync.set({"question": question}, function() {
        console.log("Question saved");
    });

    var url = 'https://api.openai.com/v1/chat/completions';
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey,
        },
        body: JSON.stringify({
            'model': 'gpt-3.5-turbo',
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are a chrome extension assistant helping the user with information'
                },
                {
                    'role': 'user',
                    'content': question
                }
            ]
        })
    };

    try {
        var response = await fetch(url, options);
        var data = await response.json();
        var answer = data.choices[0].message.content;

        // Store the answer
        chrome.storage.sync.set({"answer": answer}, function() {
          console.log("Answer saved");
        });

        return answer;
    }
    catch(error){
        console.error('Error:', error);
        throw error;
    }
}

async function getUserIntentAndInfo(prompt){
    var url = 'https://api.openai.com/v1/chat/completions';
    const argumentsList = Object.values(promptedArguments).map((data) => data.obj)
    const onlyIntents = argumentsList.length === 0;

    const body = {
        'model': 'gpt-3.5-turbo',
        'messages': [
            {
                'role': 'system',
                'content': 'Set the user intent as one of these: ["navigate", "information"]\n\n-----\n\nINPUT: I want to buy a plan\nOUTPUT: navigate\n\nINPUT: What are the plans available?\nOUTPUT: information'
            },
            {
                'role': 'user',
                'content': prompt
            }
        ],
        'max_tokens': onlyIntents ? 10 : 50,
        'temperature': 0.1,
        function_call: {
            name: "set_intent_and_info"
        },
        functions: [
            {
                "name": "set_intent_and_info",
                "description": "Set the user intent as either 'navigate' or 'information' and any other relevant information from the prompt.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "intent": {
                            "type": "string",
                            "enum": ["navigate", "information"],
                            "description": "Whether to 'navigate' and perform an action or give the user 'information'."
                        }
                    },
                    "required": ["intent"]
                }
            }
        ]
    }
    if (lastBotPrompt)
        body.messages.splice(1, 0, {
            role: "assistant",
            content: lastBotPrompt
        });
    if (argumentsList.length > 0)
        for (const [name, arg] of Object.entries(promptedArguments))
            body.functions[0].parameters.properties[name] = arg.obj;
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey,
        },
        body: JSON.stringify(body)
    };

    try {
        var response = await fetch(url, options);
        var data = await response.json();
        console.log("Intent obj:", data, "and there were", argumentsList.length, "arguments:", promptedArguments);
        const message = data.choices[0].message;
        const args = JSON.parse(message.function_call.arguments);
        let hasExtraArg = false;
        if (argumentsList.length > 0)
            for (const [name, param] of Object.entries(promptedArguments)) {
                if (args[name]) {
                    console.log("Arg", name, "is", args[name]);
                    param.callback(args[name]);
                    delete promptedArguments[name];
                    hasExtraArg = true;
                }
            }
        if (hasExtraArg)
            return;

        var intent = args.intent;
        console.log("The user intent is: " + intent)
        return intent;
    }
    catch(error){
        console.error('Error:', error);
        throw error;
    }
}

async function getUserIntentGPT3(prompt, onlyIntents = false){
    var url = 'https://api.openai.com/v1/chat/completions';
    const functionsList = Object.values(promptedFunctions).map((data) => data.obj)
    if (functionsList.length === 0)
        onlyIntents = true;
    const body = {
        'model': 'gpt-3.5-turbo',
        'messages': [
            {
                'role': 'user',
                'content': prompt
            }
        ],
        'max_tokens': onlyIntents ? 10 : 50,
    }
    if (onlyIntents) {
        body.messages.unshift({
            'role': 'system',
            'content': 'Return the user intent as a one-word answer from these: ["navigate", "information"]\n\n-----\n\nINPUT: I want to buy a plan\nOUTPUT: navigate\n\nINPUT: What are the plans available?\nOUTPUT: information'
        });
        body.temperature = 0.0;
    } else
        body.messages.unshift({
            role: "system",
            content: "You are a website assistant that will call the function relevant to the user's request, if one exists."
        });
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey,
        },
        body: JSON.stringify(body)
    };
    if (functionsList.length > 0)
        options["functions"] = functionsList;

    try {
        var response = await fetch(url, options);
        var data = await response.json();
        console.log("Intent obj:", data, "and there were", functionsList.length, "functions:", functionsList);
        const message = data.choices[0].message;
        if (message.function_call) {
            console.log("Calling function", message.function_call.name, "with", message.function_call.arguments);
            promptedFunctions[message.function_call.name].callback(message.function_call.arguments);
            delete promptedFunctions[message.function_call.name];
            return;
        }
        var intent = message.content;
        console.log("The user intent is: " + intent)
        if (!onlyIntents && intent !== "navigation" && intent !== "information")
            return await getUserIntentGPT3(prompt, true);
        return intent;
    }
    catch(error){
        console.error('Error:', error);
        throw error;
    }
}

async function parsedPageDictionary(parsedTree, prompt){
    var url = 'https://api.openai.com/v1/chat/completions';
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey,
        },
        body: JSON.stringify({
            'model': 'gpt-3.5-turbo-16k',
            'messages': [
                {
                    'role': 'system',
                    'content': `You are helping figure out the parentElementId that is the most appropriate for a given query. Your response is only one word which is the parentElementId. This is the entire website tree with the parentElementId: ${parsedTree}`
                },
                {
                    'role': 'user',
                    'content': 'what is the closest parentElementId for this prompt: ' +prompt
                }
            ],
            'temperature': 0.5,
            'max_tokens': 10,
        })
    };

    try {
        var response = await fetch(url, options);
        var data = await response.json();
        var intent = data.choices[0].message.content;
        console.log("The user intent is: " + intent)
        return intent;
    }
    catch(error){
        console.error('Error:', error);
        throw error;
    }
}

async function summarizeAnswer(info, prompt){
    var url = 'https://api.openai.com/v1/chat/completions';
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey,
        },
        body: JSON.stringify({
            'model': 'gpt-3.5-turbo-16k',
            'messages': [
                {
                    'role': 'system',
                    'content': `Give a short answer based on the question and relevant info. Here is the relevant information: ${info}`
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'max_tokens': 60,
        })
    };

    try {
        var response = await fetch(url, options);
        var data = await response.json();
        var answer = data.choices[0].message.content;
        console.log("The answer is: " + answer)
        return answer;
    }
    catch(error){
        console.error('Error:', error);
        throw error;
    }
}

async function pageMapper(prompt) {
    const pageDescriptions = `
Prepaid Plans: Choose the number of lines you are activating and then compare the different prices and plans to see what works for you. You can choose from the 15GB plan, the Unlimited plan and Unlimited Plus plan.

Smartphones: If you don't have a smartphone yet, you can buy one from Verizon to use with the plan that you like. Select from different model smartphones to come with your prepaid plans, including Apple iPhones, Samsung Galaxies, and Google Pixels. Each model can be viewed from multiple angles and have their specifications compared with others.

Apple iPhone 14: The user might choose an apple iPhone 14 Prepaid phone. You can choose a variety of colors and storage options and see the retail price for your selection, as well as images of various angles of the product.

Accessories: After choosing which model (like the iPhone 14), you have the option of choosing accessories like cases, screen protectors, chargers, etc. to add to your orders.

Cart: See all the items you currently have in your cart, some details about your products like color, storage, and price, and the plan you chose. Then when done, 'Begin secure checkout'

Billing Information / Tell us About Yourself Form: On this page the user will input their personal information to finalize their order and billing information.`;
    const body = {
        "model": "gpt-3.5-turbo-0613",
        "messages": [
            {
                "role": "system",
                "content": "You determine which page to send the user to based on their prompt and the following page descriptions:\n\n" + pageDescriptions
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "function_call": { name: "page_navigator" },
        "functions": [
            {
                "name": "page_navigator",
                "description": "Sends the user to the webpage they are looking for.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "page": {
                            "type": "string",
                            "enum": ['Smartphones', 'Apple iPhone 14', 'Accessories', 'Cart', 'Billing Information', 'Prepaid Plans'],
                            "description": "The name of the page to redirect to."
                        }
                    },
                    "required": ["page"]
                }
            }
        ]
    }
    if (lastBotPrompt)
        body.messages.splice(1, 0, {
            role: "assistant",
            content: lastBotPrompt
        });
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    console.log(data);
    // this will return the following for example:
    //    {
    //     "name": "page_mapper",
    //     "arguments": "{\n  \"page\": \"prepaid_plans\"\n}"
    //     }
    return JSON.parse(data.choices[0].message.function_call.arguments).page;
}

async function readTextWithElevenLabs(msg) {
    const url = "https://api.elevenlabs.io/v1/text-to-speech/ThT5KcBeYPX3keUQqHPh";

    // Randomly select API key
    let selectedKey = elevenKey;

    const headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": selectedKey
    };

    const data = {
        "text": msg,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.66,
            "similarity_boost": 0.72,
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
        const blob = await response.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audio.addEventListener("canplay", () => {
            mascot.startTalking();
        });
        audio.addEventListener("ended", () => {
            mascot.stopTalking();
        });
        audio.play();
    } catch (error) {
        console.error('Error:', error);
    }
}