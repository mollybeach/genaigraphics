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
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor( new Color(1, 1, 1), 1 );
    this.canvasElement.appendChild(this.renderer.domElement);
    this.camera.fov = this.FOV;
  }

  async initialize() {
    $activeAssetsState.subscribe((activeAssets) => {
      //@ts-ignore
      this.activeAssets = activeAssets;
    });
    $animationState.subscribe((animationState) => {
      this.currentAsset = animationState;
    });
  }

  updateRendererSize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  async execute() {
    this.initialize();
    const removeAllPreviousModels = new Promise<void>((resolve) => {
      const promises = this.activeAssets.map((asset: any) =>
        this.removeAsset(asset)
      );
      Promise.all(promises).then(() => resolve());
    });
    await removeAllPreviousModels;

    console.log("RENDERING NEW ANIMATION ...");
    this.init();
    
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

  private addLighting(model: any) {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(3, 2, 1);
    this.scene.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);
    
    if(model.scene) {
      const newColor = new THREE.Color(0.7, 0.7, 0.7);
      model.scene.traverse((child : any ) => {
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
    const mixer = new THREE.AnimationMixer(gltf.scene);

    this.mixers.push(mixer);
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });

    return asset;
  }

  private async loadFBX(asset: any) {
    const fbxLoader = new FBXLoader();
    const fbx = await fbxLoader.loadAsync(asset.path);
    asset.data = fbx;
    return asset;
  }

  private async loadMP4(asset: any) {
    const video = document.createElement("video");
    video.src = asset.path;
    video.playsInline = true;
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.preload = "metadata";
    video.play();

    await new Promise<void>((resolve) => {
      video.addEventListener("loadedmetadata", () => resolve());
    });

    const videoDuration = video.duration;
    asset.data.duration = videoDuration;

    const mp4Width = video.videoWidth;
    const mp4Height = video.videoHeight;

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

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;

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

    return asset;
  }

  async loadMultipleGlbs(assets: any[]) {
    for (const asset of assets) {
      const glb = await this.loadGLB(asset);
      
      this.addAsset(glb);

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 3000);
      });

      if (asset !== assets[assets.length - 1]) {
        this.removeAsset(glb);
      }
    }
  }
  
  async loadMultipleMp4s(assets: any[]) {
    for (const asset of assets) {
      const mp4 = await this.loadMP4(asset);
      this.addAsset(mp4);

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, mp4.data.duration * 1000);
      });

      if (asset !== assets[assets.length - 1]) {
        this.removeAsset(mp4);
      }
    }
    activeAssets.splice(0, activeAssets.length); 
  }

  async loadGLSL(asset: any) {
    const response = await fetch(asset.path); 
    const glsl = await response.text();
    const mesh = glslToThreeJSMesh(glsl, () => ( {
      time: this.params.time,
    }));
    asset.data.scene = mesh;
    return asset;
  }

  async loadSPJS(asset: any) {
    const response = await fetch(asset.path); 
    const spjs = await response.text();
    let geometry = new SphereGeometry( 12, 100, 100);
    geometry.computeBoundingSphere();
    geometry.center();

    let mesh = createSculptureWithGeometry(geometry, spjs, () => ( {
      time: this.params.time,
    } ));
    asset.data.scene = mesh;
    return asset;
  }

  getModel(asset: any) {
    const model = asset.data.scene;
    return model;
  }

  addAsset(asset: any) {
    activeAssets.push(asset);
    this.currentAsset = asset;
    this.updateRendererSize(this.getWidth(), this.getHeight());
    this.camera.position.z = asset.cameraPosition.z;
    this.camera.position.y = asset.cameraPosition.y;
    this.camera.fov = asset.cameraPosition.fov;
    const model = this.getModel(asset);
    this.currentModel = model;
    this.scene.add(model);
    this.addLighting(model);
  }

  removeAsset(asset: any) {
    activeAssets.splice(0, activeAssets.length);
    this.currentAsset = asset;
    const model = this.getModel(asset);
    this.currentModel = null;
    this.scene.remove(model);
    this.removeLights();
    this.dispose();
  }

  zoomIn(delta = 5) {
    this.camera.fov = this.camera.fov - delta;
    this.camera.updateProjectionMatrix();
  }

  zoomOut(delta = 5) {
    this.camera.fov = this.camera.fov + delta;
    this.camera.updateProjectionMatrix();
  }

  rotateY(delta = 0.1) {
    this.currentModel.rotation.y += delta;
  }

  rotateX(delta = 0.1) {
    this.currentModel.rotation.x += delta;
  }

  spin = () => {
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
    this.params.time += 0.01;
    controls?.update();

    if (this.currentAsset.animate && this.currentAsset.animate === "spin") {
      this.cancelAnimationFrame();
      this.spin();
    }

    this.mixers.forEach((mixer) => mixer.update(0.01));
    this.renderer.render(this.scene, this.camera);
    this.stats?.end();

    requestAnimationFrame(() => this.animate());
  }
}
