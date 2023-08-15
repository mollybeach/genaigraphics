// path: webapp/src/api/azureML.js
export async function postAzureMLData(question, my_chat_history) {
    const chat_history = transformChatHistory(my_chat_history);
    try {
        const response = await fetch(import.meta.env.PUBLIC_AZURE_API_ENDPOINT, {
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
