import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { controls } from "./utils/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { $animationAsset } from "../stores/store";
import {createSculptureWithGeometry, glslToThreeJSMesh} from "shader-park-core";
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
  public raycaster = new THREE.Raycaster();
  public stats?: Stats;
  public renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  public time = { delta: 0, elapsed: 0 };
  public params = { time: 0 };
  public background = new THREE.Color("#fff");
 public mixer = new THREE.AnimationMixer(this.scene);
  public currentAsset = $animationAsset.get();
  static instance: ThreeCanvas | null = null;

  constructor(private canvasElement: HTMLElement) {
    ThreeCanvas.instance = this;
    this.initialize();
  }

  async initialize() {
    console.log('initialized', $animationAsset.get());
    $animationAsset.subscribe((_newState) => {
      this.removeAsset(this.currentAsset);
      this.currentAsset = _newState;
    });
    this.execute();
    this.animate();
  }

  private init() {
    this.renderer.setSize(this.getWidth(), this.getHeight());
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.canvasElement.appendChild(this.renderer.domElement);
    this.camera.fov = this.currentAsset.cameraPosition.fov;
  }

  async execute() {
    this.init();
    this.loadModel(this.currentAsset).then(() => {
      if (!this.currentAsset.assets) {
        this.addAsset(this.currentAsset);
      } 
      console.log('execute', this.currentAsset);
    })
    return this.currentAsset;
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
      case "png":
        return this.loadImage(asset);
      default:
        return this.loadGLB(asset);
    }
  }

  updateRendererSize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
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

  private removeLighting() {
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
    
    this.mixer = new THREE.AnimationMixer(gltf.scene);

    gltf.animations = gltf.animations.slice(0, 1);
    console.log(gltf.animations);
    gltf.animations.forEach((clip) => {
      this.mixer.clipAction(clip).play();
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
    video.style.height = "100%";
    video.style.objectFit = "cover";
    video.style.position = "absolute";
    video.style.filter = "brightness(100)";
    console.log(video)
    this.canvasElement.style.position = "relative";
    this.canvasElement["background-color"]= "black";

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

  private async loadImage(asset: any) {
    const imageLoader = new THREE.TextureLoader();
    const image = await imageLoader.loadAsync(asset.path);
    const imageWidth = image.image.width;
    const imageHeight = image.image.height;

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
    const aspect = reduceFraction(imageWidth, imageHeight);
    const imageGeometry = new THREE.PlaneGeometry(
      aspect.width,
      aspect.height,
      32
    );
    const imageMaterial = new THREE.MeshBasicMaterial({
      map: image,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(imageGeometry, imageMaterial);
    asset.data.scene = mesh;
    return asset;
  }

  async loadMultipleGlbs(assets: any[]) {
    for (const asset of assets) {
      
       $animationAsset.set(asset);

       this.execute();
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 3000);
      });

      if (asset !== assets[assets.length - 1]) {
        this.removeAsset(asset);
      }
    }
  }
  
  async loadMultipleMp4s(assets: any[]) {
    for (const asset of assets) {
      
      $animationAsset.set(asset);

      this.execute();
     await new Promise<void>((resolve) => {
       setTimeout(() => {
         resolve();
       }, 3000); //asset.data.duration * 1000
     });
   
     if (asset !== assets[assets.length - 1]) {
       this.removeAsset(asset);
     }
   }
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
    let state = {
      mouseDown: 0.0, 
    }
    
    this.canvasElement.addEventListener('pointerdown', () => {
      state.mouseDown = 1.0;
    } );
    
    this.canvasElement.addEventListener('pointerup', () => {
      state.mouseDown = 0.0;
    } );

    let mesh = createSculptureWithGeometry(geometry, spjs, () => ( {
      time: this.params.time,
      mouseDown: state.mouseDown,
    }));
    asset.data.scene = mesh;
    return asset;
  }

  addAsset(asset: any) {
    this.currentAsset = asset;
    this.updateRendererSize(this.getWidth(), this.getHeight());
    this.camera.position.z = asset.cameraPosition.z;
    this.camera.position.y = asset.cameraPosition.y;
    this.camera.fov = asset.cameraPosition.fov;
    const model = this.currentAsset.data.scene;
    this.scene.add(model);
    this.addLighting(model);

  }

  removeAsset(asset: any) {
    this.currentAsset = asset;
    const model = asset.data.scene;
    this.scene.remove(model);
    this.removeLighting();
    this.params.time = 0;
    this.dispose();
  }

  zoomIn(delta = 5) {
    this.camera.fov = this.camera.fov - delta;
    this.camera.updateProjectionMatrix();
  }

  zoomOut(delta = 5) {
    this.camera.fov = this.camera.fov + delta;
    this.camera.updateProjectionMatrix();
    console.log(this.camera.fov);
  }

  rotateY(delta = 0.1) {
    this.currentAsset.data.scene.rotation.y += delta;
  }

  rotateX(delta = 0.1) {
    this.currentAsset.data.scene.rotation.x += delta;
  }

  spin = () => {
    this.currentAsset.data.scene.rotation.y += 0.01;
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
      this.spin()
    }

    this.mixer.update(0.01); 
    this.renderer.render(this.scene, this.camera);
    this.stats?.end();

    requestAnimationFrame(() => this.animate());
  }

}