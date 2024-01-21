const OPENAI_KEY = "INSERT ME";
const GPT_VISION_MODEL = "gpt-4-vision-preview"
const GPT_TEXT_MODEL = "gpt-3.5-turbo-1106"
// Longer messages are not read out by Meta Glasses, play with this number if needed
const GPT_REPONSE_CHARACTER_LIMIT = "100"

const FB_API_VERSION = "v18.0"
// The ID of your FB Page with which you your main FB Account has started a chat with
const FB_PAGE_ID = "INSERT ME"
// The page-scoped user ID of your main FB Account
const FB_PAGE_SCOPED_USER_ID = "INSERT ME"
// The never-expiring page access token for your FB Page, see tutorial here: https://docs.squiz.net/funnelback/docs/latest/build/data-sources/facebook/facebook-page-access-token.html 
const FB_PAGE_ACCESS_TOKEN = "INSERT ME"

let temporaryImageUrlStorage = null;

async function getGPTResponse(query) {
    let res;

    // If image URL sent, save it and wait for followup query
    if (query.startsWith("https://")) {
        console.log('Got image URL, saving and awaiting next query');
        temporaryImageUrlStorage = query;
        return null;
    }

    console.log(`Requesting ChatGPT data for query: ${query}`);
    gpt_query_body = {
        'model': temporaryImageUrlStorage == null ? GPT_TEXT_MODEL : GPT_VISION_MODEL,
        'messages': [
            {
                'role': 'user',
                'content': [
                    {
                        type: "text", text: `Limit your response to ${GPT_REPONSE_CHARACTER_LIMIT} characters for this query: ${query}`
                    },
                ]
            }
        ],
    };

    // If saved image, add to query body
    if (temporaryImageUrlStorage != null) {
        console.log(`Saved image found, adding to query: ${temporaryImageUrlStorage}`);
        gpt_query_body.messages[0].content.push({
            type: "image_url", image_url: { url: temporaryImageUrlStorage }
        });
        temporaryImageUrlStorage = null;
    }


    res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_KEY}`
        },
        body: JSON.stringify(gpt_query_body)
    });



    console.log("Got ChatGPT response!");
    const data = res.json();
    return data;
}


browser.runtime.onMessage.addListener(request => {
    if (request.action === "sendData") {
        getGPTResponse(request.data).then(function (result) {
            let reply_message = "";
            if (result != null) {
                reply_message = result.choices[0].message.content;
            }
            else {
                reply_message = "Got your image, what would you like to know?";
            }

            console.log(`Sending to FB Page chat thread: ${reply_message}`);
            fetch(`https://graph.facebook.com/${FB_API_VERSION}/${FB_PAGE_ID}/messages?recipient={"id":"${FB_PAGE_SCOPED_USER_ID}"}&messaging_type=UPDATE&message={"text":"${reply_message}"}&access_token=${FB_PAGE_ACCESS_TOKEN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        });
    }
});
