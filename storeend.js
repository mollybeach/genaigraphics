// webapp/src/stores/store.js
import { atom} from 'nanostores';
import { getSampleSuggestionsData } from '../data/sampleSuggestionsData.js';
import { postAzureMLMessagesData, postAzureMLSuggestionsData, postAzureMLAnimationsData } from '../api/azureML.js';
import { getSampleMessagesData } from '../data/sampleMessageData.js';
import { getBaseModel, getMappedAttributes } from '../data/modelData.js';
import { ThreeCanvas } from '../graphics/ThreeCanvas';

// Sample Data
const sampleMessagesData = getSampleMessagesData();
const sampleSuggestionsState = getSampleSuggestionsData();

// Stores
export const questionState = atom("");
export const botResponseState = atom("");
export const allMessagesState = atom(sampleMessagesData);
export const animationState = atom("");

export const suggestionsState = atom(sampleSuggestionsState);
export const textareaValueSuggestionState = atom("");

export const canvasTitleHeaderState = atom(getBaseModel().title);

export const $STATEVECTORS = atom({'x': 0.0,'y': 0.0,'z': 0.0}); 

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
      //response.answer = cleanResponse(response.answer);
      const cleanResponse = response.answer.replace(/'/g, '');
      console.log('cleanResponse', cleanResponse);
      animationState.set(cleanResponse);
        console.log('animationState', animationState.get());
     const mapData =  getMappedAttributes(cleanResponse);
      canvasTitleHeaderState.set(mapData.title)
     console.log('canvasTitleHeader', canvasTitleHeaderState.get());
     ThreeCanvas.instance?.executeCommand(mapData);
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

export const updateCanvasTitleHeaderStateEvent = (event) => {
    canvasTitleHeaderState.set(event);
    console.log('canvasTitleHeaderState', canvasTitleHeaderState.get());
};

export const updateTextareaValueSuggestionStateEvent = (event) => {
    textareaValueSuggestionState.set(event);
    //console.log('textareaValueSuggestionState', textareaValueSuggestionState.get());
};

// Create Message 
export const createMessage = (sender) => {
  return  {
    name: sender === "me" ? "Customer" : "Ai Agent",
    sender: sender,
    message: sender === "me" ? questionState.get() : botResponseState.get() ,
    image:  sender === "me" ?  'images/png/user.png' : 'images/svg/ai-logo.svg',
    timestamp: (new Date().getTime()).toString()
  }
}
// LOG RESPONSES
export const consoleLogResponses = () => {
  console.log('myQuestion:', questionState.get());
}  
// CLEAN RESPONSE
export const cleanResponse = (response) => {
  return response.replace(/"/g, ""); // Replace all occurrences of double quotes with an empty string
}
