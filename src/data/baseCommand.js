// path: /src/data/baseCommand.js
import { mapAssetAttributesByCommand } from './mapAttributes.js';

// CHANGE THIS TO CHANGE THE DEFAULT MODEL
export const baseCommand = "default";

// REPRESENTS LIST OF MAPPED ATTRIBUTES OF MODELS CURRENTLY PRESENTED ON THE SCENE
export const activeAssets = [mapAssetAttributesByCommand(baseCommand)];







