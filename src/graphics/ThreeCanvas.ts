import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { controls } from "./utils/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { activeAssets } from "../data/baseCommand";
import { $activeAssetsState, $animationState } from "../stores/store";
import {createSculptureWithGeometry} from "shader-park-core";
import { TorusKnotGeometry, SphereGeometry } from "three";
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
  public params = { time: 0 };
  public background = new THREE.Color("#fff");
  public mixers: THREE.AnimationMixer[] = [];
  public activeAssets = $activeAssetsState.get();
  public currentAsset = $animationState.get();
  public currentModel = this.currentAsset.data.scene;

  static instance: ThreeCanvas | null = null;

  constructor(private canvasElement: HTMLElement) {
    ThreeCanvas.instance = this;
    this.execute();
  }

  private init() {
    this.renderer.setSize(this.getWidth(), this.getHeight());
    this.renderer.setClearColor(this.background);
    //@ts-ignore
    this.renderer.setPixelRatio(this.canvasElement.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.canvasElement.appendChild(this.renderer.domElement);
    this.camera.fov = this.FOV;
  }

  async initialize() {
    // UPDATE CURRENT ASSET 
    $activeAssetsState.subscribe((activeAssets) => {
      //@ts-ignore
      this.activeAssets = activeAssets;
    });
    $animationState.subscribe((animationState) => {
      this.currentAsset = animationState;
    });
  }

  // UPDATE RENDER SIZE
  updateRendererSize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  //EXECUTE ANIMATION
  async execute() {
    this.initialize();
    // REMOVE ALL PREVIOUS MODELS FROM SCENE
    const removeAllPreviousModels = new Promise<void>((resolve) => {
      const promises = this.activeAssets.map((asset: any) =>
        this.removeAsset(asset)
      );
      Promise.all(promises).then(() => resolve());
    });
    await removeAllPreviousModels;

    console.log("RENDERING NEW ANIMATION ...");
    this.init();
    
    // LOAD NEW MODEL
    this.loadModel(this.currentAsset).then(() => {
      if (!this.currentAsset.assets) {
        this.addAsset(this.currentAsset);
      } 
    });
    this.animate();
  }

  private async loadModel(asset: any) {
    switch (asset.type) {
      case "glb":
        return this.loadGLB(asset);
      case "glsl":
        return this.loadGLSL(asset);
      case "fbx":
        return this.loadFBX(asset);
      case "mp4":
        return this.loadMP4(asset);
      case "multipleMp4s":
        return this.loadMultipleMp4s(asset.assets);
      case "multipleGlbs":
        return this.loadMultipleGlbs(asset.assets);
      default:
        return this.loadGLB(asset);
    }
  }
  // ADD LIGHTING TO SCENE
  private addLighting(model: any) {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(3, 2, 1);
    this.scene.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);
    
    if(model.scene) {
      const newColor = new THREE.Color(0.7, 0.7, 0.7);
      model.scene.traverse((child) => {
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
    }
  }
  // REMOVE LIGHTS FROM SCENE
  private removeLights() {
    this.scene.children.forEach((child) => {
      if (child instanceof THREE.Light) {
        this.scene.remove(child);
      }
    });
  }

  private async loadGLB(asset: any) {
    const gltfLoader = new GLTFLoader();
    const gltf = await gltfLoader.loadAsync(asset.path);
    asset.data = gltf;

    const scaleMultiplier = 1;
    gltf.scene.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier);

    //ADD LIGHTING
    this.addLighting(gltf);
    //PLAY ANIMATION
    const mixer = new THREE.AnimationMixer(gltf.scene);

    this.mixers.push(mixer);
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });

    //console.log("loading glb ...");
    return asset;
  }

  // LOAD FBX TO THE SCENE
  private async loadFBX(asset: any) {
    const fbxLoader = new FBXLoader();
    const fbx = await fbxLoader.loadAsync(asset.path);
    asset.data = fbx;
    return asset;
  }

  // LOAD MP4 TO THE SCENE
  private async loadMP4(asset: any) {
    //CREATE VIDEO ELEMENT ADD PROPERTIES APPEND TO DOM
    const video = document.createElement("video");
    video.src = asset.path;
    video.playsInline = true;
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.preload = "metadata";
    video.play();

    // WAIT FOR VIDEO METADATA TO LOAD
    await new Promise<void>((resolve) => {
      video.addEventListener("loadedmetadata", () => resolve());
    });

    // GET VIDEO DURATION
    const videoDuration = video.duration;
    asset.data.duration = videoDuration;

    //GET VIDEO ASPECT RATIO
    const mp4Width = video.videoWidth;
    const mp4Height = video.videoHeight;

    // CALCULATE ASPECT RATIO BASED ON VIDEO WIDTH AND HEIGHT
    function reduceFraction(numerator: number, denominator: number) {
      let gcd = function gcd(a: number, b: number) {
        return b ? gcd(b, a % b) : a;
      };
      const greatestCommonDenominator = gcd(numerator, denominator);
      const result = {
        width: numerator / greatestCommonDenominator,
        height: denominator / greatestCommonDenominator,
      };
      return result;
    }

    const aspect = reduceFraction(mp4Width, mp4Height);

    // CREATE VIDEO TEXTURE
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;

    // CREATE VIDEO MODEL FROM MESH
    const videoGeometry = new THREE.PlaneGeometry(
      aspect.width,
      aspect.height,
      32
    );
    const videoMaterial = new THREE.MeshBasicMaterial({
      map: videoTexture,
      side: THREE.DoubleSide,
    });
    const mp4 = new THREE.Mesh(videoGeometry, videoMaterial);
    asset.data.scene = mp4;
    this.addLighting(mp4);
    //console.log("loading mp4 ...");
    return asset;
  }

  // LOAD MULTIPLE MP4s
  async loadMultipleMp4s(assets: any[]) {
   // console.log("loading multiple mp4s ...");
    // LOOP THROUGH EACH MP4 ASSET
    for (const asset of assets) {
      //console.log("loading one mp4 of multipleMp4s : #", assets.indexOf(asset)+1);
      const mp4 = await this.loadMP4(asset);
      // get the index of the mp4: 
    
      this.addAsset(mp4);

      // WAIT FOR VIDEO TO FINISH PLAYING BEFORE LOADING NEXT VIDEO
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, mp4.data.duration * 1000);
      });

      // REMOVE VIDEO FROM SCENE TO MAKE ROOM FOR NEXT VIDEO
      if (asset !== assets[assets.length - 1]) {
        this.removeAsset(mp4);
      }
    }
    // remove the mp4s from the activeAssets array
    activeAssets.splice(0, activeAssets.length); 
  }

  //\loads multiple glbs and puts them 5 seconds apart
  async loadMultipleGlbs(assets: any[]) {
    // LOOP THROUGH EACH GLB ASSET
    for (const asset of assets) {
     // console.log("loading one glb of multipleGlbs : #", assets.indexOf(asset)+1);
      const glb = await this.loadGLB(asset);
      
      this.addAsset(glb);
      // WAIT FOR 5 seconds BEFORE LOADING NEXT GLB
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 3000);
      });
      // REMOVE GLB FROM SCENE TO MAKE ROOM FOR NEXT GLB
      if (asset !== assets[assets.length - 1]) {
        this.removeAsset(glb);
      }
    }
  }

  async loadGLSL(asset: any) {
    
    const spCode =  `
    rotateY(PI/2*(time))
    let thickness = 0.02;
    let zed = 0.0;
    let change;
    /*************COLORING FUNCTION*******************/
        let colorBook = (varient) => {
          let colorX = 0.9 * Math.random();
          let colorY = colorX - Math.random();
          let colorZ = colorY - 0.2;
          let rainbow = color(colorX, colorY, colorZ);
          return rainbow;
        };
    /*****************SPHERE VARIABLES**********/
    let positiveTopSphere = 0.1;
    let negativeTopSphere = 0.1;
    let positiveBottomSphere = -0.1;
    let negativeBottomSphere = -0.1;
    /**************SNP VARIABLES***********/
    let positiveTopSNP1 = 0.1;
    let negativeTopSNP1 = 0.021;//0.0
    let positiveBottomSNP2 = -0.1;
    let negativeBottomSNP2 = -0.02; //0.0
    /****************OUTER SPHERES**************/
    let pos1 = vec3(positiveTopSphere, positiveTopSphere, zed); //x,y
    let pos2 = vec3(negativeTopSphere, negativeTopSphere, zed); //-x, -y
    let pos3 = vec3(positiveBottomSphere, positiveBottomSphere, zed); //x,y
    let pos4 = vec3(negativeBottomSphere, negativeBottomSphere, zed); //-x, -y
    /*******************SNPS**********************/
    let pos5 = vec3(positiveTopSNP1, positiveTopSNP1, zed); //x,y
    let pos6 = vec3(negativeTopSNP1, negativeTopSNP1, zed); //-x, -y
    let pos7 = vec3(positiveBottomSNP2, positiveBottomSNP2, zed); //x,y
    let pos8 = vec3(negativeBottomSNP2, negativeBottomSNP2, zed); //-x, -y
    /*****************STRAND****************/
    let strand = function () {
      rotateX(PI / 2);
      let j = 0;
      for (j = 0; j < 50; j++) {
      
        let pairSpheres = function () {
          color(1.0, 1.0, 1.0);
          line(pos1, pos2, thickness * 2);
          line(pos3, pos4, thickness * 2);
        };
        let pairSNPs = function () {
        //  mirrorX();
          colorBook(Math.random());
          rotateZ(3);
          displace(0.0, 0.0, 0.0);
        line(pos5, pos6, thickness);
          
          line(pos7, pos8, thickness);
        }
        pairSNPs();
        pairSpheres();
        displace(-0.30, 0.061, -0.0345); //space between SNPS
      }
    };
    
    displace(0.0, -0.8, 0.0); //position of entire strand
    strand(); 
`
   let geometry = new SphereGeometry( 12, 100, 100);
 //  let geometry = new TorusKnotGeometry( 10, 3, 192, 96);
    geometry.computeBoundingSphere();
    geometry.center();

    let mesh = createSculptureWithGeometry(geometry, spCode, () => ( {
      time: this.params.time,
    } ));
  
    asset.data.scene = mesh;
    return asset;
  }

  // GET MODEL
  getModel(asset: any) {
    const model = asset.data.scene;
    return model;
  }
  // ADD ASSET TO SCENE
  addAsset(asset: any) {
    activeAssets.push(asset);
    this.currentAsset = asset;
   // console.log("adding asset..... : ", asset);

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
    activeAssets.splice(0, activeAssets.length);
    this.currentAsset = asset;
    //console.log("removing asset..... : ", asset);

    // GET MODEL
    const model = this.getModel(asset);
    this.currentModel = null;
    this.scene.remove(model);
    // REMOVE LIGHTS
    this.removeLights();
    this.dispose();
    //this.scene.clear();
  }

  // ZOOM CAMERA BUTTONS
  zoomIn(delta = 5) {
    this.camera.fov = this.camera.fov - delta;
    this.camera.updateProjectionMatrix();
  }

  zoomOut(delta = 5) {
    this.camera.fov = this.camera.fov + delta;
    this.camera.updateProjectionMatrix();
  }

  // ROTATE MODEL BUTTONS
  rotateY(delta = 0.1) {
    this.currentModel.rotation.y += delta;
  }

  rotateX(delta = 0.1) {
    this.currentModel.rotation.x += delta;
  }

  // SPIN MODEL
  spin = () => {
    //this.currentModel.rotation.x += 0.01;
    this.currentModel.rotation.y += 0.01;
  };
  // CANCEL ANIMATION FRAME
  cancelAnimationFrame() {
    this.renderer.setAnimationLoop(null);
  }

  // DISPOSE
  dispose() {
    this.cancelAnimationFrame();
    this.scene?.clear();
  }

  // ANIMATE
  animate() {
    this.stats?.begin();
    this.params.time += 0.01;
    controls?.update();

    if (this.currentAsset.animate && this.currentAsset.animate === "spin") {
      //console.log("spinning model ...");
      //console.log("this.currentAsset.animate : ", this.currentAsset.animate);
      this.cancelAnimationFrame();
      this.spin();
    }
    //UPDATE ANIMATION
    this.mixers.forEach((mixer) => mixer.update(0.01)); // Use an appropriate delta time
    this.renderer.render(this.scene, this.camera);
    this.stats?.end();

    //RECURSIVE CALL TO ANIMATE
    requestAnimationFrame(() => this.animate());
  }
}
