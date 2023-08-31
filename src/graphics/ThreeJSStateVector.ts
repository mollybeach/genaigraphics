// path: webapp/src/graphics/ThreeCanvas.ts
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { getMappedAttributes,activeModels} from '../data/modelData.js';
import { gl} from './core/WebGL';
import { controls } from './utils/OrbitControls';
import { $STATEVECTORS } from '../stores/store.js';


export class ThreeCanvas {

    static instance: ThreeCanvas | null = null;
    
    public renderedModel : any;
    private prevCameraPosition = new THREE.Vector3();
    private prevCameraRotation = new THREE.Euler();
    /*
    private moveModel(deltaX: number, deltaY: number, deltaZ: number) {
        // Adjust the position of the loaded model
        const model = activeModels[0].data;
        if (model) {
            model.position.x += deltaX;
            model.position.y += deltaY;
            model.position.z += deltaZ;
        }
    }

    private rotateModel(deltaX: number, deltaY: number, deltaZ: number) {
        // Adjust the rotation of the loaded model
        const model = activeModels[0].data;
        if (model) {
            model.rotation.x += deltaX;
            model.rotation.y += deltaY;
            model.rotation.z += deltaZ;
        }
    }*/
    constructor(private container: HTMLElement) {
        ThreeCanvas.instance = this;  
       

        activeModels.forEach((asset : any) => {
            this.loadModel(asset.type, asset).then(() => {
                this.init();
                
    
               
                gl.requestAnimationFrame(this.anime);
            });
        });
        
    }

    private init() {
 
        gl.setup(this.container);
        this.handleCameraPositionChange();
        console.log(this.container.clientHeight, this.container.clientWidth)
      
        gl.scene.background = new THREE.Color('#fff');
    }
    
    private anime = () => {
        controls.update();

        // Calculate changes in camera position and rotation
        const deltaCameraPosition = gl.camera.position.clone().sub(this.prevCameraPosition);
        const deltaCameraRotation = new THREE.Vector3(
            gl.camera.rotation.x - this.prevCameraRotation.x,
            gl.camera.rotation.y - this.prevCameraRotation.y,
            gl.camera.rotation.z - this.prevCameraRotation.z
        );
/*
        // Update model's position and rotation based on changes
        this.moveModel(deltaCameraPosition.x, deltaCameraPosition.y, deltaCameraPosition.z);
        this.rotateModel(deltaCameraRotation.x, deltaCameraRotation.y, deltaCameraRotation.z);

        // Update previous camera position and rotation
        this.prevCameraPosition.copy(gl.camera.position);
        this.prevCameraRotation.copy(gl.camera.rotation);*/

        gl.render();
        gl.requestAnimationFrame(this.anime);
    }

    

     private handleCameraPositionChange = () => {
        // Get the updated camera position
        const cameraPosition = gl.camera.position;
        // Update the store with the new camera position
        $STATEVECTORS.set({ x: parseFloat(cameraPosition.x.toFixed(2)), y: parseFloat(cameraPosition.y.toFixed(2)), z: parseFloat(cameraPosition.z.toFixed(2)) });
    }

//SELECT MODEL TYPE AND LOAD MODEL
    async loadModel(modelType: string, model: any) {
        switch(modelType) {
            case 'glb':
                this.loadGLB(model);
                break;
            case 'fbx':
                this.loadFBX(model);
                break;
            case 'mp4':
                this.loadMP4(model);
                break;
            case 'multipleMp4s':
                this.loadingMultipleMp4s(model.assets);
                break;
            default:
                console.log('Model type not recognized:', modelType);
                break;
        }
    }
    async loadGLB(asset: any) {
        // LOAD GLB ASSET
        const gltfLoader = new GLTFLoader();
        const gltf = await gltfLoader.loadAsync(asset.path);
        asset.data = gltf;
        activeModels.push(asset);

        const model = gltf.scene;
    
        // CALCULATE BOUNDING BOX
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
    
        // ADJUST THE POSITION TO CENTER THE MODEL
        model.position.sub(center); 
   
        // SCALE MODEL UP
        const scaleMultiplier = 1; // Adjust the value as needed
        model.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier);

        // ROTATE MODEL
        const degree1 = Math.PI/180;
        const degree5 = Math.PI/36;
        const degree10 = Math.PI/18;
        const degree15 = Math.PI/12;
        const degree30 = Math.PI/6;
        const degree45 = Math.PI/4;
        const degree60 = Math.PI/3;
        const degree90 = Math.PI/2;
        const degree120 = (2*Math.PI)/3;
        const degree135 = (3*Math.PI)/4;
        const degree150 = (5*Math.PI)/6;
        const degree165 = (11*Math.PI)/12;
        const degree180 = Math.PI;
        const degree210 = (7*Math.PI)/6;
        const degree225 = (5*Math.PI)/4;
        const degree240 = (4*Math.PI)/3;
        const degree270 = (3*Math.PI)/2;
        const degree360 = 2*Math.PI;

        // ROTATE MODEL BY
         model.rotation.setFromVector3(new THREE.Vector3(asset.vectorRotation.x, asset.vectorRotation.y, asset.vectorRotation.z));
    
        // MOVE THE MODEL TO MAKE IT VISIBLE
        const distance = new THREE.Vector3(asset.vectorPosition.x, asset.vectorPosition.y, asset.vectorPosition.z); // Adjust the y-coordinate as needed
        model.position.set(distance.x, distance.y, distance.z);
        controls.update();

        console.log('controls.primitive', controls.primitive);
    
        // ADD MODEL TO SCENE
        gl.scene.add(model);
  
        // SET CAMERA POSITION TO LOOK AT THE MODEL
        gl.camera.position.set(0, 0, 0); // Adjust the position as needed
        controls.update();
        gl.camera.lookAt(model.position);
        controls.update();

        // ADD LIGHTS TO SCENE
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Color: white, Intensity: 1
        directionalLight.position.set(3, 2, 1); // Adjust position as needed
        gl.scene.add(directionalLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Color: white, Intensity: 3
        gl.scene.add(ambientLight);

        // CHANGE SPECIFIC MATERIAL COLORS 
       // const newColor = new THREE.Color(0.9, 0.9, 0.9); // Light grey color
        const newColor = new THREE.Color(0.7, 0.7, 0.7); // Grey color
        model.traverse(child => {
            if (child instanceof THREE.Mesh) {
                const material = child.material as THREE.MeshStandardMaterial;

                // Check if the material's color is close to black (adjust the threshold as needed)
                const blackThreshold = 0.1;
                if (material.color.r < blackThreshold && material.color.g < blackThreshold && material.color.b < blackThreshold) {
                    material.color = newColor; // Change the material color to grey
                }
            }
        });

        console.log('GLB MODEL:', asset);
    
        // PLAY ANIMATION
        const mixer = new THREE.AnimationMixer(model);
        gl.mixers.push(mixer);
        gltf.animations.forEach((clip) => {
            console.log('clip', clip);
            mixer.clipAction(clip).play();
        });

        this.renderedModel  = model;
        console.log('this.renderedModel', this.renderedModel);
    }
    
//LOAD FBX ASSET TO SCENE
    async loadFBX(asset : any) {
        console.log('method loadFBX is running','asset', asset, 'asset.path', asset.path);
        const fbxLoader = new FBXLoader();
        const fbx = await fbxLoader.loadAsync(asset.path);
        asset.data = fbx;
        activeModels.push(asset);
    }

    async loadMP4(asset: any) {
        console.log('method loadMP4 is running.....');
    
        // CREATE VIDEO ELEMENT AND ADD PROPERTIES
        const video = document.createElement('video');
        video.src = asset.path;
        video.playsInline = true;
        video.loop = true;
        video.muted = true;
        video.autoplay = true;
        video.preload = 'metadata';
    
        // EVENT LISTENER FOR VIDEO METADATA LOADED
        video.addEventListener('loadedmetadata', () => {
            // CALCULATE VIDEO ASPECT RATIO AND DIMENSIONS
            const videoAspect = video.videoWidth / video.videoHeight;
            console.log('videoWidth', video.videoWidth);
            console.log('videoHeight', video.videoHeight);
            console.log('videoAspect', videoAspect);
            console.log('gl.size.width', gl.size.width);
            console.log('gl.size.height', gl.size.height);
            console.log('gl.size.aspect', gl.size.aspect);

            const greaterAspect = videoAspect > gl.size.aspect ? videoAspect : gl.size.aspect;
            const lesserAspect = greaterAspect === videoAspect ? gl.size.aspect : videoAspect;

            const videoWidth = greaterAspect/lesserAspect;
       //    const videoWidth = 6;
            const videoHeight = videoWidth / gl.size.aspect; // this returns: 
    
            // CREATE VIDEO TEXTURE
            const videoTexture = new THREE.VideoTexture(video);
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;
    
            // CREATE VIDEO PLANE GEOMETRY
            const videoPlaneGeometry = new THREE.PlaneGeometry(videoWidth, videoHeight);
    
            // CREATE MATERIAL FOR VIDEO PLANE
            const videoMaterial = new THREE.MeshBasicMaterial({
                map: videoTexture,
                side: THREE.DoubleSide,
                toneMapped: false,
            });
    
            // CREATE MESH FOR VIDEO PLANE AND ADD TO SCENE
            const model= new THREE.Mesh(videoPlaneGeometry, videoMaterial);
            asset.data.scene = model;
            gl.scene.add(model);
            activeModels.push(asset);
    
            // CENTER VIDEO MESH
            model.position.set(0, -1, -4); // Adjust the position as needed
    
            // SET CAMERA POSITION TO LOOK AT THE VIDEO
            gl.camera.position.set(0, 0, 0); // Adjust the position as needed
            gl.camera.lookAt(model.position);
    
            // START VIDEO PLAYBACK
            video.play();
            console.log('MP4 MODEL:', asset);
        });

      
    }
       
    
    async loadingMultipleMp4s(assets: any[]) {
    
        for (const asset of assets) {
            // CREATE VIDEO ELEMENT AND ADD PROPERTIES
            const video = document.createElement('video');
            video.src = asset.path;
            video.playsInline = true;
            video.loop = false;
            video.muted = true;
            video.autoplay = true;
            video.preload = 'metadata';
    
            // Wait for video metadata to load
            await new Promise<void>((resolve) => {
                video.addEventListener('loadedmetadata', () => resolve());
            });
            const videoDuration = video.duration;
            // CALCULATE VIDEO ASPECT RATIO AND DIMENSIONS
               // Calculate video dimensions and aspect ratio
               const videoAspect = video.videoWidth / video.videoHeight;
               const canvasAspect = gl.size.aspect;
       
               let videoWidth : number, videoHeight : number;
               if (canvasAspect > videoAspect) {
                   // Canvas is wider, adjust video width
                   videoWidth = gl.size.width;
                   videoHeight = gl.size.width / videoAspect;
               } else {
                   // Canvas is taller, adjust video height
                   videoHeight = gl.size.height;
                   videoWidth = gl.size.height * videoAspect;
               }

            //CALCULATE FIELD OF VIEW AND DISTANCE BASED ON CANVAS ASPECT RATIO
            const canvasFOV = gl.camera.fov * (Math.PI / 180); // CONVERT FOV TO RADIANS
            const canvasDistance = (videoHeight / 2) / Math.tan(canvasFOV / 2); // DISTANCE FROM CAMERA TO PLANE

            // CALCULATE INITIAL Z-POSITION BASED ON DISTANCE
            const initialZ = -canvasDistance;
            
            // CREATE VIDEO TEXTURE
            const videoTexture = new THREE.VideoTexture(video);
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;
    
            // CREATE VIDEO PLANE GEOMETRY
            const videoPlaneGeometry = new THREE.PlaneGeometry(videoWidth, videoHeight);

            // CALCULATE INITIAL POSITION OF THE VIDEO PLANE
            const initialX = 0;
            const initialY = 0;

            // CREATE MATERIAL FOR VIDEO PLANE
            const videoMaterial = new THREE.MeshBasicMaterial({
                map: videoTexture,
                side: THREE.DoubleSide,
                toneMapped: false,
            });
    
            // CREATE MESH FOR VIDEO PLANE AND ADD TO SCENE
            const model = new THREE.Mesh(videoPlaneGeometry, videoMaterial);
            model.position.set(initialX, initialY, initialZ);
  
            gl.scene.add(model);
            asset.data.scene = model;
            activeModels.push(asset);
    
            // SET CAMERA POSITION TO LOOK AT THE VIDEO
            gl.camera.position.set(0, 0, 0); // Adjust the position as needed
            gl.camera.lookAt(model.position);
    
            // PLAY VIDEO
            video.play();
    
            console.log('MP4 MODEL:', asset);
            this.renderedModel = model;
            console.log('this.renderedModel', this.renderedModel);
            console.log(video);


            // WAIT FOR VIDEO TO FINISH PLAYING BEFORE LOADING NEXT VIDEO
            await new Promise<void>((resolve) => {
                setTimeout(() => {
                    resolve();
                }, videoDuration * 1000);
            }
            );
            // REMOVE VIDEO FROM SCENE TO MAKE ROOM FOR NEXT VIDEO
            this.removeMP4(asset)
        }
    }
    
//REMOVE MP4 ASSET FROM SCENE
   async removeMP4(asset : any) {
        console.log('method removeMP4 is running','asset', asset, 'asset.path', asset.path);
        console.log('Removing previous asset from the scene...', asset);

        gl.scene.remove(asset.data.scene);
    
 //       console.log('asset.data.scene.videoMesh.videoTexture', asset.data.scene.videoMesh.videoTexture);
      //  asset.data.scene.videoMesh.videoTexture.dispose();
        asset = undefined
        console.log('if successful, asset should be undefined:', asset);
    }
    
    dispose() {
        gl.dispose();
    }



// CAMERA CONTROLS
    zoomIn(delta = 0.3) {
        gl.camera.position.x += delta;
      //  gl.camera.position.y += delta;
        gl.camera.position.z += delta;
        this.handleCameraPositionChange();
    }

    zoomOut(delta = 0.3) {
        gl.camera.position.x -= delta;
       // gl.camera.position.y -= delta;
        gl.camera.position.z -= delta;
        this.handleCameraPositionChange();
    }

    zoomInY(delta = 0.01) {
        gl.camera.position.y += delta;
        this.handleCameraPositionChange();
    }

    zoomOutY(delta = 0.01) {
        gl.camera.position.y -= delta;
        this.handleCameraPositionChange();
    }

    zoomInZ(delta = 0.01) {
        gl.camera.position.z += delta;
        this.handleCameraPositionChange();
    }

    zoomOutZ(delta = 0.01) {
        gl.camera.position.z -= delta;
        this.handleCameraPositionChange();
    }
    degree15 = Math.PI/12;
    rotateLeft(delta = 0.3) {
        // rotate on y-axis
       
 
        gl.camera.position.z += Math.sin(delta);
 
         this.handleCameraPositionChange();
     }

     rotateRight(delta = this.degree15) {
       console.log('gl.rotation', gl.getRotation);

      gl.setRotation = new THREE.Euler(gl.getRotation.x, gl.getRotation.y + delta, gl.getRotation.z);
         this.handleCameraPositionChange();
     }

//EXECUTE COMMAND FROM INPUT
    public executeCommand(command: string) {
        console.log("EXECUTE ANIMATION COMMAND FROM AZURE ANIMATION SML : ", command);
        // REMOVE PREVIOUS ASSET FROM SCENE
        if (activeModels.length > 0 && activeModels[0].data) { 
            activeModels.forEach((asset : any) => {
                        console.log('Removing previous asset from the scene...', asset);
                        gl.scene.remove(asset.data.scene);
            });
            activeModels.splice(0, activeModels.length);
        }
   

        // LOADING NEW ASSET TO SCENE
        const model = getMappedAttributes(command);
        this.loadModel(model.type, model);
    }
}
