// path: /src/data/mapAttributes.js
import { assetMap } from './assetMap.js';
import {commandMap} from './commandMap.js';

// RETRIEVES MAPPED CANVAS ATTRIBUTES BASED ON RESPONSE FROM AZURE ML
export function mapAssetAttributesByCommand(command) {

  !commandMap[command].id ? command = "default" : command = command;
  const keyName = commandMap[command].id;
  const keyType = commandMap[command].type;
  const asset = {
    command: commandMap[command].command,
    title: commandMap[command].title,
    animate: assetMap[keyType][keyName].animate,
    assets: assetMap[keyType][keyName].assets,
    path: assetMap[keyType][keyName].path,
    data: assetMap[keyType][keyName].data,
    type: assetMap[keyType][keyName].type,
    cameraPosition: assetMap[keyType][keyName].cameraPosition,
  };
  return asset;
}