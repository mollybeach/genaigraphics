// path: webapp/src/data/baseCommand.js
import { mapAssetAttributesByCommand } from './mapAttributes.js';

// CHANGE THIS TO CHANGE THE DEFAULT MODEL
export const baseCommand = "default";

// REPRESENTS LIST OF MAPPED ATTRIBUTES OF MODELS CURRENTLY PRESENTED ON THE SCENE
export const currentAsset = mapAssetAttributesByCommand(baseCommand);


/*
commands:
glb: 
  cable, cord, light, reset, routerstatic,
  boombox, Credit Card, Desktop PC, emoji heart, Film Clapper Board,
  Folder Icon, Laptop, low poly phone, Movie Reel, Music Icons,
  phone call icon, phone ring icon, Plane, remote control
  rolling bag, save to cloud, security camera, Sports, television,
  video game controller, video game controller 2, wifi extender, wifi icon
  mobile plans, latest phones
  default, router, 
mp4: 
  house, upsell, sales track
spjs:
 torus, dna, bunny, windowScreenSaver
*/






