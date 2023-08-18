// path: src/graphics/ThreeCanvas.ts
import * as THREE from 'three';
import { gl } from './core/WebGL';
import { Assets, loadAssets } from './utils/assetLoader';
import { controls } from './utils/OrbitControls'

type AssetKey = keyof Assets;

export class ThreeCanvas {
    private assets: Assets = {
        modelOriginal: { path: 'models/fbx/routerModel.fbx'},
       // modelNoTexture:{path:'models/glb/routerModel_noTexture.glb'},
        modelCableTexture: { path: 'models/glb/routerModel_cableTexture.glb'},
        modelLightTexture: { path: 'models/glb/routerModel_lightBlinkTexture.glb'},
        modelResetButtonTexture: { path: 'models/glb/routerModel_resetButtonTexture.glb'}
    };

    private currentModel: THREE.Object3D | null = null;

    static instance: ThreeCanvas | null = null;

    constructor(private container: HTMLElement) {
        ThreeCanvas.instance = this;
        loadAssets(this.assets).then(() => {
            this.init();
            this.addAssetToScene('modelCableTexture');
            gl.requestAnimationFrame(this.anime);
        });
    }

    private init() {
        gl.setup(this.container);
        gl.scene.background = new THREE.Color('#fff');
        gl.camera.position.z = -0.75;
        gl.camera.position.y = -1.0;
        gl.camera.position.x = 0.85;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        gl.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(2, 2, -1);
        gl.scene.add(directionalLight);
    }

    addAssetToScene(assetName: AssetKey) {
        const asset = this.assets[assetName];
        if (asset && asset.data) {
            if (this.currentModel) {
                gl.scene.remove(this.currentModel);
            }
            // @ts-ignore
            this.currentModel = asset.data.scene;
             // @ts-ignore
            gl.scene.add(this.currentModel);
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
    zoomIn(delta = 0.2) {
      gl.camera.position.y += delta; // Move the camera closer
    }

    zoomOut(delta = 0.2) {
      gl.camera.position.y -= delta; // Move the camera farther away
    }

    // Rotation methods
    rotateLeft(delta = 0.3) {
      gl.camera.position.x += delta; 
    }

    rotateRight(delta = 0.3) {
      gl.camera.position.x -= delta; 
    }

    public executeCommand(command: string) {
        switch(command) {
          /*  case 'router':
                this.addAssetToScene('modelNoTexture');
                this.rotateRight();
                break;*/
            case 'light':
                this.addAssetToScene('modelLightTexture');
                this.rotateLeft();
                break;
            case 'reset':
                this.addAssetToScene('modelResetButtonTexture');
                this.zoomIn();
                break;
            case 'cord':
                this.addAssetToScene('modelCableTexture');
                this.zoomOut();
                break;
            case 'house':
              this.addAssetToScene('modelNoTexture');
              this.rotateLeft();
                break;
            default:
                console.log('Command not recognized:', command);
                break;
        }
    }
}
