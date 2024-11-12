// path: webapp/src/stores/store.js
import { atom} from 'nanostores';
import { sampleRecommendationsData } from '../data/text/sampleRecommendationsData.js';
import { postAzureMLMessagesData, postAzureMLRecommendationsData, postAzureMLAnimationsData } from '../api/azureML.js';
import { sampleMessagesData } from '../data/text/sampleMessageData.js';
import { currentAsset } from '../data/baseCommand.js';
import { mapAssetAttributesByCommand } from '../data/mapAttributes.js';
import { ThreeCanvas } from '../graphics/ThreeCanvas';
import {BASE_URL} from '../config/config.js';
import { commandMap } from '../data/commandMap.js';

// Stores
export const $question = atom("");
export const $botResponse = atom("");
export const $historyMessages = atom(sampleMessagesData);
export const $recommendations = atom(sampleRecommendationsData);
export const $textAreaValue = atom("");
export const $canvasTitle = atom(currentAsset.title);
export const $animationAsset = atom(currentAsset);

// Events
export const threejsCanvasEvent = (command) => {
  const asset =  mapAssetAttributesByCommand(command);
  $animationAsset.set(asset);
  $canvasTitle.set(asset.title)
  ThreeCanvas.instance?.initialize();
}

export const updateMessagesStateEvent = (question) => {
  $question.set(question);
  $historyMessages.set( [...$historyMessages.get(), createMessage("me") ]);
  threejsCanvasEvent("loadingCircle");
postAzureMLMessagesData(question, $historyMessages.get())
 .then(response => {
    $botResponse.set(response.answer);
    $historyMessages.set( [...$historyMessages.get(), createMessage("you") ]);
    updateAnimationsStateEvent($historyMessages.get().slice(-1)[0].message, $historyMessages.get());
    updateRecommendationsStateEvent(question, $historyMessages.get());
  }).catch(error => {
    console.log("Chat Messages Error ML", error);
    $botResponse.set("Sorry, I am not able to answer that question. Please try again.");
    threejsCanvasEvent("default");
  });
 };

export const updateAnimationsStateEvent = (question, chat_history) => {
postAzureMLAnimationsData(question, chat_history)
  .then(response => {
    const cleanResponse = response.answer.replace(/'/g, '');
    console.log('Cleaned Response From AzureML:', cleanResponse);
    threejsCanvasEvent(cleanResponse);
  }).catch(error => {
    console.log("Animations Error ML", error);
    // pick a random command from the commandMap for demo purposes
    const randomCommand = Object.keys(commandMap)[Math.floor(Math.random() * Object.keys(commandMap).length)];
    threejsCanvasEvent(randomCommand);
   // threejsCanvasEvent("default");
  });
};

export const updateRecommendationsStateEvent = (question, chat_history) => {

postAzureMLRecommendationsData(question, chat_history)
.then(response => {
  $recommendations.set(response.answer);
}).catch(error => {
   console.log("Recommendations Error ML", error);
});
};

// Create Message 
export const createMessage = (sender) => {
  return  {
    name: sender === "me" ? "Customer" : "Ai Agent",
    sender: sender,
    message: sender === "me" ? $question.get() : $botResponse.get() ,
    image:  sender === "me" ?  `${BASE_URL}/images/png/user.png` : `${BASE_URL}/images/svg/ai-logo.svg`,
    timestamp: (new Date().getTime()).toString()
  }
}
// CLEAN RESPONSE
export const cleanResponse = (response) => {
  const cleanResponse = response.answer.replace(/'/g, '');
  console.log('Cleaned Response From AzureML:', cleanResponse);
  return cleanResponse; // Replace all occurrences of double quotes with an empty string
}