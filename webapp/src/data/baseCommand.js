// path: webapp/src/data/baseCommand.js
import { mapAssetAttributesByCommand } from './mapAttributes.js';

// CHANGE THIS TO CHANGE THE DEFAULT MODEL
export const baseCommand = "router";

// REPRESENTS LIST OF MAPPED ATTRIBUTES OF MODELS CURRENTLY PRESENTED ON THE SCENE
export const currentAsset = mapAssetAttributesByCommand(baseCommand);


/*
commands:
default: default ( This is the default model that is first will be displayed on the scene if there is no response from Azure ML)
glb: 
  cable, cord, light, reset, routerstatic,
  boombox, creditcard, desktoppc, emojiheart, filmclapperboard,
  foldericon, laptop, lowpolyphone, moviereel, musicicons,
  phonecallicon, phoneringicon, plane, remotecontrol,
  rollingbag, savetocloud, securitycamera, sports, television,
  videogamecontroller, videogamecontroller2, wifiextender, wifiicon,
  mobileplans, latestphones,
  default, router,
mp4: 
  house, loadingcircle, outage
multipleMp4s:
  upsell, salestrack
multipleGlbs:
  allglbs
spjs:
  torus, dna, bunny, windowscreensaver
glsl:
  earth, map
*/





