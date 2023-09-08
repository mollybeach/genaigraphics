import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { controls } from "./utils/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { activeAssets } from "../data/baseCommand";
import { $activeAssetsState, $animationState } from "../stores/store";
import {createSculptureWithGeometry, glslToThreeJSMesh,} from "shader-park-core";
import { Color, TorusKnotGeometry, SphereGeometry, BoxGeometry } from "three";
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
   // this.renderer.setClearColor(this.background);
    //@ts-ignore
    this.renderer.setPixelRatio(this.canvasElement.devicePixelRatio);
   // this.renderer.shadowMap.enabled = true;
    this.renderer.setClearColor( new Color(1, 1, 1), 1 );
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
      case "spjs":
        return this.loadSPJS(asset);
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
    for (const asset of assets) {
      //console.log("loading one mp4 of multipleMp4s : #", assets.indexOf(asset)+1);
      const mp4 = await this.loadMP4(asset);
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

  //LOAD MULTIPLE GLBs
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
  //LOAD GLSL TO THE SCENE
  async loadGLSL(asset: any) {
    const response = await fetch(asset.path); 
    const glsl = await response.text();
    const mesh = glslToThreeJSMesh(glsl, () => ( {
      time: this.params.time,
    }));
    asset.data.scene = mesh;
    return asset;
  }
  //LOAD SPJS TO THE SCENE
  async loadSPJS(asset: any) {
    const response = await fetch(asset.path); 
    const spjs = await response.text();
    // let geometry = new BoxGeometry( 10, 10, 10);
    //let geometry = new TorusKnotGeometry( 10, 3, 192, 96);
    let geometry = new SphereGeometry( 12, 100, 100);
    geometry.computeBoundingSphere();
    geometry.center();

    let mesh = createSculptureWithGeometry(geometry, spjs, () => ( {
      time: this.params.time,
    } ));
    console.log("mesh : ", mesh);
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
