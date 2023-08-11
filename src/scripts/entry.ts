// entry.ts
import { qs } from './utils'
import { TCanvas } from './webgl/TCanvas'

const canvas = new TCanvas(qs<HTMLDivElement>('.canvas-scene'))

window.addEventListener('beforeunload', () => {
  canvas.dispose()
})

