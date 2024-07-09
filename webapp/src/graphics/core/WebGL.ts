// path: webapp/src/graphics/core/WebGL.ts
interface Mixer {
  update(delta: number): void;
}

// WebGL.ts
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';


class WebGL {
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public time = { delta: 0, elapsed: 0 };
  public ambientLight = new THREE.AmbientLight;
  public directionalLight = new THREE.DirectionalLight;
  public container : HTMLElement;
  public mixers: Mixer[] = [];
  public models: any[] = [];

 // public size: { width: 0, height: 0, aspect: 0 };

  private clock = new THREE.Clock();


  private stats: Stats;

  constructor() {
    const { width, height, aspect } = this.size;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); //alpha for 
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.stats = new Stats();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.01, 100);
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  }


    // UPDATE RENDER SIZE
    updateRendererSize() {
      const { width, height, aspect } = this.size;
      console.log("updating renderer size .........")
      console.log("width: " + width + " height: " + height + " aspect: " + aspect);
      this.camera.aspect = aspect;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }

  setSize(width: number, height: number) {
    console.log("width: " + width + " height: " + height);
    this.size.width = width;
    this.size.height = height;
    this.size.aspect = width / height;
    this.camera.fov = 40;
    this.camera.aspect = this.size.aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  setup(container: HTMLElement) {
    this.container = container;
   console.log("width: " + this.container.clientWidth + " height: " + this.container.clientHeight + " aspect: " + this.container.clientWidth / this.container.clientHeight);
   this.setSize(this.container.clientWidth, this.container.clientHeight);
    console.log("width: " + this.renderer.domElement.width + " height: " + this.renderer.domElement.height);
   console.log(window.devicePixelRatio)
    this.renderer.setPixelRatio(window.devicePixelRatio);
  
 //   this.handleResize(); // Update size when setting up

    this.renderer.domElement.width = this.container.clientWidth
    this.renderer.domElement.height = this.container.clientHeight;
    
    this.container.appendChild(this.renderer.domElement);
  
  }
    get size() {
    const width = this.container? this.container.clientWidth : 0;
    const height = this.container? this.container.clientHeight : 0;
    return { width, height, aspect: width / height }; 
  }

  get position() {
    return this.camera.position;
  }

  set position(position: THREE.Vector3) {
    this.camera.position.copy(position);
  }

/*
  getModelPosition(name: string) {
    return this.scene.getObjectByName(name).position;
  }*/
  get getRotation() {
    return this.camera.rotation;
  }

  set setRotation(rotation: THREE.Euler) {
    this.camera.rotation.copy(rotation);
  }

  get near() {
    return this.camera.near;
  }

  get fov() {
    return this.camera.fov;
  }

  set fov(fov: number) {
    this.camera.fov = fov;
  }

  get aspect() {
    return this.camera.aspect;
  }

  set aspect(aspect: number) {
    this.camera.aspect = aspect; 
  }

  setStats(container: HTMLElement) {
   
    container.appendChild(this.stats.dom);
  }

  //MODIFY SPECIFIC MODEL WITHOUT AFFECTING OTHER MODELS
  getMesh<T extends THREE.Material>(name: string) {
    return this.scene.getObjectByName(name) as THREE.Mesh<THREE.BufferGeometry, T>;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  requestAnimationFrame(callback: () => void) {
    gl.renderer.setAnimationLoop(() => {
      this.time.delta = this.clock.getDelta();
      this.time.elapsed = this.clock.getElapsedTime();
      this.mixers.forEach(mixer => mixer.update(this.time.delta));
      this.render();
      this.stats?.update();
      callback();
    });
  }

  cancelAnimationFrame() {
    gl.renderer.setAnimationLoop(null);
  }

  dispose() {
    this.cancelAnimationFrame();
    gl.scene?.clear();
  }
  
}

export const gl = new WebGL();
