// path: webapp/src/api/azureML.js

export async function postAzureMLMessagesData(question, my_chat_history) {
    const chat_history = transformChatHistory(my_chat_history);
    try {
        const response = await fetch("https://verison-promptflow-endpoint.azurewebsites.net/api/telecom_ai?code=C6KHHaZ3cNMmGVWW7ushnnFT9vpbb2FSlh9iU_fY6IvFAzFuORW-aQ==", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({"question": question, "chat_history": chat_history}),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const responseData = await response.json(); // Parse the response as JSON
        //console.log('AZURE ML CHAT BOT RESPONSE:', responseData);
        return responseData;
    } catch (error) {
        if (error.response) {
            console.error("The request failed with status code: ", error.response.status);
            console.error(error.response.data);
            throw new Error(`Error: ${error.response.data}`);
        } else {
            console.error(error.message);
            throw new Error(error.message);
        }
    }
}

export async function postAzureMLRecommendationsData(question, my_chat_history) {
    const chat_history = transformChatHistory(my_chat_history);
    question = 'Please provide me three possible question recommendations I can ask the AI to develop the conversation, make the recommendations short and concise.';
    try {
        let response = await fetch("https://verison-promptflow-endpoint.azurewebsites.net/api/recommendation-helper?code=oXnQ2KQ_SnevcpIy-Dw8BheBZEsVnCu0tS1Ci_RYSgOXAzFu26mFDA==", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({"question": question, "chat_history": chat_history}),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const responseData = await response.json(); // Parse the response as JSON
        if (responseData.answer == "out of my scope") {
            return ["N/A", "N/A", "N/A"]
        }
       // console.log('AZUREML RECOMMENDATIONS RESPONSE:', responseData);
        response = {
            answer: convertToListItems(responseData.answer)
        }
        return response;
    } catch (error) {
        if (error.response) {
            console.error("The request failed with status code: ", error.response.status);
            console.error(error.response.data);
            throw new Error(`Error: ${error.response.data}`);
        } else {
            console.error(error.message);
            throw new Error(error.message);
        }
    }
}

export async function postAzureMLAnimationsData(question, my_chat_history) {
   const chat_history = transformChatHistory(my_chat_history);
   try {
        let response = await fetch("https://verison-promptflow-endpoint.azurewebsites.net/api/animation-helper?code=4qC7KQZqu6ojcca2vSRa_BlVfCzBVJ01FYWGr5WGZyabAzFu3-XCIg==", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({"question": question, "chat_history": chat_history})
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const responseData = await response.json(); // Parse the response as JSON
        console.log('AZURE ML ANIMATIONS RESPONSE:', responseData);
        return responseData;

    } catch (error) {
        if (error.response) {
            console.error("The request failed with status code: ", error.response.status);
            console.error(error.response.data);
            throw new Error(`Error: ${error.response.data}`);
        } else {
            console.error(error.message);
            throw new Error(error.message);
        }
    }
}

function transformChatHistory(history) {
    const outputArray = []; 
    for (let i = 0; i < history.length - 1; i += 2) {
        const input = history[i];
        const output = history[i + 1];

        outputArray.push({ 
            inputs: {
                question: input.message
            },
            outputs: {
                answer: output.message
            }
        });
    }
    return outputArray;
}


function concatenateMessages(data) {
    let concatenatedMessage = "This is my sitation: ";

    for (let entry of data) {
        if (entry.sender === "me") {
            concatenatedMessage += entry.message + ",";
        }
    }

    return concatenatedMessage.trim();
}

function convertToListItems(str) {
    const matches = str.match(/"([^"]+)"/g);
    return matches ? matches.map(item => item.replace(/"/g, '')) : [];
}