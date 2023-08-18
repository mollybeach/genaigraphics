// src/stores/store.js
import { atom } from 'nanostores';
import { getSampleSuggestionsData } from '../data/sampleSuggestionsData.js';
import { postAzureMLMessagesData, postAzureMLSuggestionsData, postAzureMLAnimationsData } from '../api/azureML.js';
import { getSampleMessagesData } from '../data/sampleMessageData.js';
import { ThreeCanvas } from '../graphics/ThreeCanvas';

// Sample Data
const sampleMessagesData = getSampleMessagesData();
const sampleSuggestionsState = getSampleSuggestionsData();

// Stores
export const questionState = atom("");
export const botResponseState = atom("");
export const allMessagesState = atom(sampleMessagesData);
export const animationState = atom("");
export const previousAnimationState = atom("light");
export const suggestionsState = atom(sampleSuggestionsState);
export const inputValueSuggestionState = atom("");

// Events
export const updateMessagesStateEvent = (question) => {

    questionState.set(question);
    allMessagesState.set( [...allMessagesState.get(), createMessage("me") ]);
    
  postAzureMLMessagesData(question, allMessagesState.get())
   .then(response => {
      botResponseState.set(response.answer);
      allMessagesState.set( [...allMessagesState.get(), createMessage("you") ]);
      updateAnimationsStateEvent();
      updateSuggestionsStateEvent();
    })
   };

export const updateAnimationsStateEvent = () =>{

  postAzureMLAnimationsData((questionState.get(), allMessagesState.get()))
    .then(response => {
      previousAnimationState.set(animationState.get());
      animationState.set(response.answer);
      console.log(response.answer)
      ThreeCanvas.instance?.executeCommand(response.answer);
  })
};

export const updateSuggestionsStateEvent = () => {
  
  postAzureMLSuggestionsData(questionState.get(), allMessagesState.get())
  .then(response => {
    suggestionsState.set(response.answer);
    consoleLogResponses();
  }).catch(error => {
    catchErrorEvent("suggestions", error)
  });
};

export const updateInputValueSuggestionStateEvent = (event) => {
    inputValueSuggestionState.set(event);
    console.log('inputValueSuggestionState', inputValueSuggestionState.get());
};

// Create Message 
export const createMessage = (sender) => {
  return  {
    name: sender === "me" ? "Customer" : "Ai Agent",
    sender: sender,
    message: sender === "me" ? questionState.get() : botResponseState.get() ,
    image:  sender === "me" ?  'images/png/user.png' : 'images/png/bot.png',
    timestamp: (new Date().getTime()).toString()
  }
}
// Logging Responses
export const consoleLogResponses = () => {
  console.log('myQuestion:', questionState.get());
  console.log('bot response from azureML:', botResponseState.get());
  console.log('All messages:', allMessagesState.get());
  console.log('Animation AzureML Response:', animationState.get());
  console.log('suggestionsState response from azureML:', suggestionsState.get());
}

