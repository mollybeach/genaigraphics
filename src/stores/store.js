// /src/stores/store.js
import { atom} from 'nanostores';
import { sampleSuggestionsData } from '../data/sampleSuggestionsData.js';
import { postAzureMLMessagesData, postAzureMLSuggestionsData, postAzureMLAnimationsData } from '../api/azureML.js';
import { sampleMessagesData } from '../data/sampleMessageData.js';
import { activeAssets } from '../data/baseCommand.js';
import { mapAssetAttributesByCommand } from '../data/mapAttributes.js';
import { ThreeCanvas } from '../graphics/ThreeCanvas';

// Stores
export const $question = atom("");
export const $botResponse = atom("");
export const $allMessages = atom(sampleMessagesData);
export const $suggestions = atom(sampleSuggestionsData);
export const $textAreaValue = atom("");
export const $canvasTitle = atom(activeAssets[0].title);

// Events
export const updateMessagesStateEvent = (question) => {

    $question.set(question);
    $allMessages.set( [...$allMessages.get(), createMessage("me") ]);
    
  postAzureMLMessagesData(question, $allMessages.get())
   .then(response => {
      $botResponse.set(response.answer);
      $allMessages.set( [...$allMessages.get(), createMessage("you") ]);
      updateAnimationsStateEvent();
      updateSuggestionsStateEvent();
    })
   };

export const updateAnimationsStateEvent = () =>{

  postAzureMLAnimationsData(($question.get(), $allMessages.get()))
    .then(response => {
      const cleanResponse = response.answer.replace(/'/g, '');
      console.log('cleanResponse', cleanResponse);
      const asset =  mapAssetAttributesByCommand(cleanResponse);
      $canvasTitle.set(asset.title)
     console.log('canvasTitleHeader', $canvasTitle.get());
     ThreeCanvas.instance?.execute(asset);
  })
};

export const updateSuggestionsStateEvent = () => {

  postAzureMLSuggestionsData($question.get(), $allMessages.get())
  .then(response => {
    $suggestions.set(response.answer);
  }).catch(error => {
    catchErrorEvent("suggestions", error)
  });
};

// Create Message 
export const createMessage = (sender) => {
  return  {
    name: sender === "me" ? "Customer" : "Ai Agent",
    sender: sender,
    message: sender === "me" ? $question.get() : $botResponse.get() ,
    image:  sender === "me" ?  'images/png/user.png' : 'images/svg/ai-logo.svg',
    timestamp: (new Date().getTime()).toString()
  }
}
// CLEAN RESPONSE
export const cleanResponse = (response) => {
  return response.answer.replace(/'/g, ''); // Replace all occurrences of double quotes with an empty string
}