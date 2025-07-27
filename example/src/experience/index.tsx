import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import { useLocation } from 'react-router'

import { Camera } from './Camera'
import { MainScene } from './MainScene'

export const Experience = () => {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  if (!isHomePage) {
    return null
  }

  return (
    <Canvas id='main-canvas'>
      <OrbitControls />
      <Camera />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.1}
          radius={0.8}
          luminanceSmoothing={0.9}
          mipmapBlur
          intensity={1.5}
          blendFunction={BlendFunction.ADD}
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
      <group visible={isHomePage}>
        <MainScene />
      </group>
    </Canvas>
  )
}
