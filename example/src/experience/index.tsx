import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import { Camera } from './Camera'
import { MainScene } from './MainScene'

export const Experience = () => {
  return (
    <Canvas id='main-canvas'>
      <OrbitControls />
      <Camera />
      <MainScene />
    </Canvas>
  )
}
