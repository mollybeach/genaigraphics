// path: webapp/src/graphics/utils/OrbitControls.ts
import { OrbitControls as OC } from 'three/examples/jsm/controls/OrbitControls'
import { gl } from '../core/WebGL'

class OrbitControls {
  private orbitControls: OC

  constructor() {
    this.orbitControls = new OC(gl.camera, gl.renderer.domElement)
    this.orbitControls.enableDamping = true
    this.orbitControls.dampingFactor = 0.1
    this.orbitControls.zoomSpeed = 0.1
    this.orbitControls.rotateSpeed = 0.1
 
    this.orbitControls.enablePan = true
    this.orbitControls.enableZoom = true
    this.orbitControls.enableRotate = true


  }

  get primitive() {
    return this.orbitControls
  }

  disableDamping() {
    this.orbitControls.enableDamping = false
  }

  update() {
    this.orbitControls.update()
  }
}
export const controls = new OrbitControls()