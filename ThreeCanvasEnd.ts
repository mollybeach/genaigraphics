import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { controls } from './utils/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { activeModels, getMappedAttributes } from '../data/modelData';

export class ThreeCanvas {
   
  public getWidth = () => this.canvasElement.clientWidth;
  public getHeight = () => this.canvasElement.clientHeight;
  public FOV = 50;
  public ASPECT = this.getWidth() / this.getHeight();
  public NEAR_PLANE = 0.1;
  public FAR_PLANE = 1000;
  public scene = new THREE.Scene();
  public camera = new THREE.PerspectiveCamera(
    this.FOV,
    this.ASPECT,
    this.NEAR_PLANE,
    this.FAR_PLANE
  );
  public clock = new THREE.Clock();
  public stats?: Stats;
  public renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  public time = { delta: 0, elapsed: 0 };
  public background = new THREE.Color('#fff');
  public mixers: THREE.AnimationMixer[] = [];
  public currentAsset = activeModels[0];
  public currentModel = activeModels[0].data.scene;

  static instance : ThreeCanvas | null = null;

  constructor(private canvasElement : HTMLElement) {
    ThreeCanvas.instance = this;
    this.init();
    activeModels.forEach((asset : any) => {
        
        this.loadModel(asset).then(() => {

            if(asset.type!= 'multipleMp4s'){
                this.addAsset(asset);
            }
        });
    });
    this.animate();
  }

  private init() {
    this.renderer.setSize(this.getWidth(), this.getHeight());
    this.renderer.setClearColor(this.background);
    //@ts-ignore
    this.renderer.setPixelRatio(this.canvasElement.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
   // this.renderer.domElement.width = this.canvasElement.clientWidth;
   // this.renderer.domElement.height = this.canvasElement.clientHeight;
    this.canvasElement.appendChild(this.renderer.domElement);
    this.camera.fov = this.FOV;
  }
  
  // UPDATE RENDER SIZE
  updateRendererSize(width: number, height: number) {
    console.log('updateRendererSize', width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    }

   //EXECUTE COMMAND 
   async executeCommand(data: any) {
   // REMOVE ALL PREVIOUS MODELS FROM SCENE

   console.log('switching models ...');

   const removeAllPreviousModels = new Promise<void>((resolve) => {
    const promises = activeModels.map((model) => this.removeAsset(model));
    Promise.all(promises).then(() => resolve());
    });
    await removeAllPreviousModels;

    
   this.init();
    // LOAD NEW MODEL
    const asset = await this.loadModel(data);
    
    if(asset.type!= 'multipleMp4s'){
        this.addAsset(asset);
    }
    this.animate();
  }

  private async loadModel(asset: any) {
    switch (asset.type) {
      case 'glb':
        return this.loadGLB(asset);
      case 'fbx':
        return this.loadFBX(asset);
      case 'mp4':
        return this.loadMP4(asset);
      case 'multipleMp4s':
        return this.loadMultipleMp4s(asset.assets);
      default:
        console.log('command', asset.type, 'not found');
        return this.loadGLB(asset);
    }
  }

  private async loadGLB(asset: any) {
    const gltfLoader = new GLTFLoader();
    const gltf = await gltfLoader.loadAsync(asset.path);
    asset.data = gltf;

    const scaleMultiplier = 1;
    gltf.scene.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(3, 2, 1);
    this.scene.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    this.scene.add(ambientLight);

    const newColor = new THREE.Color(0.7, 0.7, 0.7);
    gltf.scene.traverse(child => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshStandardMaterial;
        const blackThreshold = 0.1;
        if (
          material.color.r < blackThreshold &&
          material.color.g < blackThreshold &&
          material.color.b < blackThreshold
        ) {
          material.color = newColor;
        }
      }
    });

    //PLAY ANIMATION
    const mixer = new THREE.AnimationMixer(gltf.scene);

    this.mixers.push(mixer);
    gltf.animations.forEach(clip => {
      mixer.clipAction(clip).play();
    });

    console.log('loading glb ...');
    return asset;
  }

  private async loadFBX(asset: any) {
    const fbxLoader = new FBXLoader();
    const fbx = await fbxLoader.loadAsync(asset.path);
    asset.data = fbx;
    return asset;
  }

  // LOAD MP4 TO THE SCENE
  private async loadMP4(asset: any) {

    //CREATE VIDEO ELEMENT ADD PROPERTIES APPEND TO DOM
    const video = document.createElement('video');
    video.src = asset.path;
    video.playsInline = true;
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.preload = 'metadata';
    video.play();
    
     // WAIT FOR VIDEO METADATA TO LOAD
     await new Promise<void>((resolve) => {
        video.addEventListener('loadedmetadata', () => resolve());
     });
 
    // GET VIDEO DURATION
    const videoDuration = video.duration;
    asset.data.duration = videoDuration;
 
    //GET VIDEO ASPECT RATIO
    const mp4Width = video.videoWidth;
    const mp4Height = video.videoHeight;

    // CALCULATE ASPECT RATIO BASED ON VIDEO WIDTH AND HEIGHT
    function reduceFraction(numerator: number,denominator: number){
      let gcd = function gcd(a: number,b: number){
        return b ? gcd(b, a%b) : a;
      };
      const greatestCommonDenominator = gcd(numerator,denominator);
      const result = {
        width: numerator/greatestCommonDenominator,
        height: denominator/greatestCommonDenominator
      }
      return result;
    }
 
    const aspect = reduceFraction(mp4Width, mp4Height);
 
    // CREATE VIDEO TEXTURE
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
 
    // CREATE VIDEO MODEL FROM MESH
    const videoGeometry = new THREE.PlaneGeometry(aspect.width, aspect.height, 32); 
    const videoMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, side: THREE.DoubleSide } );
    const mp4 = new THREE.Mesh( videoGeometry, videoMaterial );
    asset.data.scene = mp4;
   
    console.log('loading mp4 ...');
    return asset
  }

// LOAD MULTIPLE MP4s
 async loadMultipleMp4s(assets: any[]) {

    // LOOP THROUGH EACH MP4 ASSET
    for (const asset of assets) {
     const mp4 = await this.loadMP4(asset);
     console.log('mp4: multipleMp4s : ', mp4)

      this.addAsset(mp4);
   
     // WAIT FOR VIDEO TO FINISH PLAYING BEFORE LOADING NEXT VIDEO
     await new Promise<void>((resolve) => {
       setTimeout(() => {
         resolve();
       }, mp4.data.duration * 1000);
     });

     // REMOVE VIDEO FROM SCENE TO MAKE ROOM FOR NEXT VIDEO
    this.removeAsset(mp4);
   }
 };
 

// GET MODEL
  getModel(asset:any) {
    const model = asset.data.scene;
    return model;
  }
  // ADD ASSET TO SCENE
  addAsset(asset: any) {
    
    activeModels.push(asset);
    this.currentAsset = asset;
    console.log('adding asset..... : ', asset);
    

    // UPDATE RENDERER SIZE
    this.updateRendererSize(this.getWidth(), this.getHeight());
    // MODIFY POSITION OF CAMERA
    this.camera.position.z = asset.cameraPosition.z;
    this.camera.position.y = asset.cameraPosition.y;
    this.camera.fov = asset.cameraPosition.fov;

    // GET MODEL
    const model = this.getModel(asset);
    this.currentModel = model;
    this.scene.add(model);

    }


  // REMOVE ASSET FROM SCENE
  removeAsset(asset: any) {  
    
    activeModels.splice(0, activeModels.length);
    this.currentAsset = asset;
    console.log('removing asset..... : ', asset);
   
    // GET MODEL
    const model = this.getModel(asset);
    this.currentModel = null;
    this.scene.remove(model);
    //this.scene.clear();
  }

   // ZOOM CAMERA BUTTONS
    zoomIn(delta = 5) {
        this.camera.fov = this.camera.fov - delta
        this.camera.updateProjectionMatrix();
        console.log(this.camera.fov)
    }
    
    zoomOut(delta = 5) {
       this.camera.fov = this.camera.fov + delta;
       this.camera.updateProjectionMatrix();
         console.log(this.camera.fov)
    }

     // ROTATE MODEL BUTTONS
    rotateY(delta = 0.1) {
        this.currentModel.rotation.y += delta;
    }

    rotateX(delta = 0.1) {
        this.currentModel.rotation.x += delta;
    };

  spin = () => {
  //  console.log('spin');
    this.currentModel.rotation.x += 0.01;
    this.currentModel.rotation.y += 0.01;
  };

  cancelAnimationFrame() {
    this.renderer.setAnimationLoop(null);
  }

  dispose() {
    this.cancelAnimationFrame();
    this.scene?.clear();
  }

  animate() {
    this.stats?.begin();
    controls?.update();

    if(this.currentAsset.animate === "spin") {
        this.spin();
    }
    //UPDATE ANIMATION MIXERS
    this.mixers.forEach(mixer => mixer.update(0.01)); // Use an appropriate delta time
    
    //RENDER SCENE
    this.renderer.render(this.scene, this.camera);

    this.stats?.end();

    //RECURSIVE CALL TO ANIMATE
    requestAnimationFrame(() => this.animate());
  }
  
}


