import * as React from 'react'
import { useInView } from 'react-intersection-observer'

import { BaseSandpack } from '@/components/custom/sandpack/BaseSandpack'
import { Skeleton } from '@/components/ui/skeleton'
import { useGPUTier } from '@/hooks/useGPUTier'

import BasicFiles from './basic'
import ColorMixFiles from './colorMix'
import NoisyProgressFiles from './noisyProgress'
import ProgressModifierFiles from './progressModifier'
import PropControlFiles from './propControl'
import ScrollMorphFiles from './scrollMorph'
import VertexModifierFiles from './vertexModifier'

const commonCSS = `
  html {
    background: #000000;
  }

  canvas {
    width: 100vw;
    height: 100vh;
  }
`

const SCENES = {
  scene1: BasicFiles,
  scene2: ColorMixFiles,
  scene3: PropControlFiles,
  scene4: VertexModifierFiles,
  scene5: ProgressModifierFiles,
  scene6: NoisyProgressFiles,
  scene7: ScrollMorphFiles,
}

const ExamplesSandpack: React.FC<ExamplesSandpackProps> = ({
  scene,
  height,
}) => {
  const [ref, inView] = useInView()
  const { tier, loading: tierLoading } = useGPUTier()

  const autorun = tier > 2

  return (
    <div ref={ref}>
      {inView && !tierLoading ? (
        <BaseSandpack
          template={'react-ts'}
          autorun={autorun}
          dependencies={{
            react: '^18.2.0',
            'react-dom': '^18.2.0',
            three: '^0.171.0',
            '@react-three/drei': '^9.120.4',
            '@react-three/fiber': '^8.17.10',
            'r3f-points-fx': '1.0.5-beta.3',
            gsap: '^3.13.0',
          }}
          files={{
            ...SCENES[scene],
            '/scene.css': {
              code: commonCSS,
              hidden: true,
            },
          }}
          sandboxHeight={height}
        />
      ) : (
        <Skeleton
          style={{
            height: height || 500,
          }}
          className='w-full'
        />
      )}
    </div>
  )
}

type ExamplesSandpackProps = {
  scene: keyof typeof SCENES
  height?: number
}

export default ExamplesSandpack
