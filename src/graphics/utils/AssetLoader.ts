// path: src/graphics/utils/assetLoader.ts
import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

export type Assets = {
  modelOriginal?: { data?: THREE.Group, path: string },
  modelNoTexture?:{ data?: GLTF, path: string },
  modelCableTexture?: { data?: GLTF, path: string },
  modelLightTexture?: { data?: GLTF, path: string },
  modelResetButtonTexture?: { data?: GLTF, path: string },
};

export async function loadAssets(assets: Assets) {
  const gltfLoader = new GLTFLoader();
  const fbxLoader = new FBXLoader();

  for (const assetKey in assets) {
    const asset = assets[assetKey as keyof Assets]!;
    const ext = asset.path.split('.').pop();

    if (ext === 'gltf') {
      const object = await gltfLoader.loadAsync(asset.path);
      asset.data = object;
    } else if (ext === 'glb') {
      const object = await gltfLoader.loadAsync(asset.path);
      asset.data = object;
    } else if (ext === 'fbx') {
      const object = await fbxLoader.loadAsync(asset.path);
      asset.data = object;
    }
  }
}
