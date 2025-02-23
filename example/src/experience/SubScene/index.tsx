import { Canvas } from '@react-three/fiber'

import { useSubsceneModels } from '../hooks/useSubsceneModels'
import type { ParticlesType } from './Particles'
import { Particles } from './Particles'

export const Subscene = () => {
  const { meshes, nextModel } = useSubsceneModels()

  return (
    <div className='flex items-center w-full'>
      <div className='w-[40%] max-w-[400px] h-[600px] transparent-box'></div>
      <div className='flex-grow h-1 bg-slate-500'></div>
      <div className='w-[40%] max-w-[400px] h-[600px] transparent-box'>
        <ParticlesScene meshes={meshes} nextIndex={nextModel} />
      </div>
    </div>
  )
}

const ParticlesScene: React.FC<ParticlesSceneType> = ({
  meshes,
  nextIndex,
}) => {
  return (
    <Canvas>
      <Particles meshes={meshes} nextIndex={nextIndex} />
    </Canvas>
  )
}

type ParticlesSceneType = ParticlesType
