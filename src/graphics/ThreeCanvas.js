import * as THREE from 'three';
import { gl } from './core/WebGL';
import { Assets, loadAssets } from './utils/assetLoader';
import { controls } from './utils/OrbitControls';

export class ThreeCanvas {
  private assets: Assets = {
    model: { path: 'models/fbx/router_v01.fbx'},
    texture: { path: 'models/gltf/router_texture_cabletest4.gltf'},
    lightTexture: { path: 'models/gltf/router_texture_lightblinktest.gltf'},
    buttonTexture: { path: 'models/gltf/router_texture_restbuttontest.gltf'}
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
    gl.scene.background = new THREE.Color('#fff'); // make it white 
    gl.camera.position.z = -0.75;
    gl.camera.position.y = 0.5;
    gl.camera.position.x = 0.5;
  }

  private createObjects() {
    if (this.assets.model && this.assets.model.data) {
      gl.scene.add(this.assets.model.data);
    }
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
}
