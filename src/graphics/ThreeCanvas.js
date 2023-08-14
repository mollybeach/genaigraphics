// ThreeCanvas.ts
import * as THREE from 'three';
import { gl } from './core/WebGL';
import { Assets, loadAssets } from './utils/assetLoader';
import { controls } from './utils/OrbitControls';

export class ThreeCanvas {
  private assets: Assets = {
    model: { path: 'models/fbx/router_v01.fbx'},
    texture: { path: 'models/glb/router_texture_cabletest4.glb'},
    noTexture: { path: 'models/glb/router_notexture.glb'},
    lightTexture: { path: 'models/glb/router_texture_lightblinktest.glb'},
    buttonTexture: { path: 'models/glb/router_texture_restbuttontest.glb'}
  }

  constructor(private container: HTMLElement) {
    loadAssets(this.assets).then(() => {
      this.init();
      this.createObjects();
      gl.requestAnimationFrame(this.anime);
    });
  }

  private init() {
    gl.setup(this.container)
    
    // Background Color
    gl.scene.background = new THREE.Color('#fff');

    // Camera Position
    gl.camera.position.z = -0.75;
    gl.camera.position.y = 0.65;
    gl.camera.position.x = 0.5;

    // Add Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    gl.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 2, -1);
    gl.scene.add(directionalLight);

  }

  private createObjects() {
    /*
    if (this.assets.model && this.assets.model.data) {
      gl.scene.add(this.assets.model.data);
    }*/
    if (this.assets.texture && this.assets.texture.data) { 
      gl.scene.add(this.assets.texture.data.scene);
    }
    if (this.assets.lightTexture && this.assets.lightTexture.data) {
      gl.scene.add(this.assets.lightTexture.data.scene);
    }
    if (this.assets.buttonTexture && this.assets.buttonTexture.data) {
      gl.scene.add(this.assets.buttonTexture.data.scene);
    }
  }

  private anime = () => {
    controls.update();
    gl.render();
    gl.requestAnimationFrame(this.anime);
  }

  dispose() {
    gl.dispose();
  }

  // Zoom methods
  zoomIn(delta = 0.1) {
    gl.camera.position.z += delta; // Move the camera closer
  }

  zoomOut(delta = 0.1) {
    gl.camera.position.z -= delta; // Move the camera farther away
  }
}
