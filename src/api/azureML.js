// azureML.js
export async function postAzureMLData(question, my_chat_history) {
    console.log('postAzureMLData my_chat_history:', my_chat_history);
    const chat_history = transformChatHistory(my_chat_history);
    try {
        const response = await fetch('https://verison-promptflow-endpoint.azurewebsites.net/api/dells-curry-endpoint?code=5eaDHmy7JLPoSTvN1Cjb12BUTcIR5u-e_74uwsTMc1w2AzFuC-ZGng==', {
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
