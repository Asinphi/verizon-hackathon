async function page_mapper(prompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${document.apiKey}`
        },
        body: JSON.stringify({
            "model": "gpt-3.5-turbo-0613",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a function mapper. The page options that exist are ['prepaid_overview', 'prepaid_plans', 'smartphones', 'apple_iphone_14', 'accessories', 'cart', 'billing_information']"
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "functions": [
                {
                    "name": "page_mapper",
                    "description": "Given a prompt, figure out which page to redirect to",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "page": {
                                "type": "string",
                                "description": "The name of the page to redirect to. (eg: 'prepaid_overview', 'prepaid_plans', 'smartphones', 'apple_iphone_14', 'accessories', 'cart', 'billing_information'))"
                            }
                        },
                        "required": ["page"]
                    }
                }
            ]
        })
    });
    const data = await response.json();
    console.log(data);
    // this will return the following for example:
    //    {
    //     "name": "page_mapper",
    //     "arguments": "{\n  \"page\": \"prepaid_plans\"\n}"
    //     }
    return data.choices[0].message.function_call;
}

function prepaid_overview() {
    return 'https://www.verizon.com/';
}

function prepaid_plans() {
    return 'https://www.verizon.com/';
}

function smartphones() {
    return 'https://www.verizon.com/';
}

function apple_iphone_14() {
    return 'https://www.verizon.com/';
}

function accessories() {
    return 'https://www.verizon.com/';
}

function cart() {
    return 'https://www.verizon.com/';
}

function billing_information() {
    return 'https://www.verizon.com/';
}
