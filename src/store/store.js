//store.js
import { atom } from 'nanostores';
import { getSampleSuggestionOptions } from '../data/sampleSuggestionsData.js';
import { postAzureMLData } from '../api/azureML.js';
import { getSampleMessagesData } from '../data/sampleMessageData.js';

// Sample Data
const sampleMessagesData = getSampleMessagesData();
const sampleSuggestionOptions = getSampleSuggestionOptions();

// Stores
export const allMessages = atom(sampleMessagesData);
export const suggestionOptions = atom(sampleSuggestionOptions);
export const suggestionPlaceholder = atom('Enter your message here');

// Events
export const postMessageEvent = (event) => {
  const newDate = new Date().getTime();
  const timestamp = newDate.toString();
  const myNewMessage = {
     name: "Customer",
     sender: "me",
     message: event,
     image: "https://cdn-icons-png.flaticon.com/512/6596/6596121.png",
     timestamp: timestamp,
   };
    console.log('event:', event);
    // Adds the new message to the allMessages store
    allMessages.set([...allMessages.get(), myNewMessage]);
    // post to Azure ML
    postAzureMLData(event, allMessages.get())
    .then(response => {
        // Retreives a response from AzureML and also adds it to the allMessages store
        const botNewMessage = {
          "name": "AI Agent",
          "sender": "you",
          "message": response.answer,
          "image": "https://cdn-icons-png.flaticon.com/512/2432/2432846.png",
          "timestamp": timestamp,
        }
        allMessages.set([...allMessages.get(), botNewMessage]);
        console.log('bot response from azureML:', response);
        console.log('All messages:', allMessages.get());
    });
    return allMessages.get();
};

export const updateSuggestionPlaceholderEvent = (event) => {
    suggestionPlaceholder.set(event);
    console.log('suggestionPlaceholder', suggestionPlaceholder.get());
};
