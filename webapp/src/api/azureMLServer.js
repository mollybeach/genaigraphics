export async function postAzureMLData(question, my_chat_history) {
    console.log('postAzureMLData my_chat_history:', my_chat_history);
    const chat_history = [];
    try {
        const response = await fetch('http://localhost:3001/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({question, chat_history}),
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
