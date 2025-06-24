import { Canvas } from '@react-three/fiber'

import { Camera } from '../Camera'
import { Particles } from './Particles'

export const Subscene = () => {
  return (
    <div className='w-full flex justify-center'>
      <div className='w-full max-w-[800px] '>
        <div className='w-full pb-[100%] md:pb-[56.25%] relative'>
          <div className='absolute top-0 left-0 w-full h-full rounded-xl bg-black'>
            <ParticlesScene />
          </div>
        </div>
      </div>
    </div>
  )
}

const ParticlesScene = () => {
  return (
    <Canvas>
      <Camera />
      <Particles />
    </Canvas>
  )
}
