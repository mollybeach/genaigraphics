// path: src/api/azureML.js
import {previousAnimationState} from '../stores/store';

export async function postAzureMLMessagesData(question, my_chat_history) {
    const chat_history = transformChatHistory(my_chat_history);
   try {
        const response = await fetch(import.meta.env.PUBLIC_AZURE_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({"question": question, "chat_history": chat_history, "endpoint": "AI"}),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const responseData = await response.json(); // Parse the response as JSON
        console.log('Response from server:', responseData);
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

export async function postAzureMLSuggestionsData(question, my_chat_history) {
    const chat_history = transformChatHistory(my_chat_history);
    question = 'Please provide me three possible question suggestions I can ask the AI to develop the conversation, make the suggestions short and concise.';
    try {
        let response = await fetch(import.meta.env.PUBLIC_AZURE_SUGGESTION_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({"question": question, "chat_history": chat_history, "endpoint": "Recommendation"}),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const responseData = await response.json(); // Parse the response as JSON
        if (responseData.answer == "out of my scope") {
            return ["N/A", "N/A", "N/A"]
        }
        console.log('Response from server:', responseData);
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
export async function postAzureMLAnimationsData(my_chat_history, question) {
    const chat_history = transformChatHistory(my_chat_history);
   try {
        let response = await fetch(import.meta.env.PUBLIC_AZURE_ANIMATION_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({"question": question, "chat_history": chat_history, "endpoint" :"AI"})
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const responseData = await response.json(); // Parse the response as JSON
        console.log('Response from server:', responseData);

        const arrayOfCommands = ["router",  "house", "light", "cord"];
        // Randomly select a new command but not the previous command
        const filteredCommands = arrayOfCommands.filter(command => command !== previousAnimationState.get());
        const newCommand = filteredCommands[Math.floor(Math.random() * filteredCommands.length)];
        response = {
            answer: newCommand
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

function convertToListItems(str) {
    const matches = str.match(/"([^"]+)"/g);
    
    return matches ? matches.map(item => item.replace(/"/g, '')) : [];
}