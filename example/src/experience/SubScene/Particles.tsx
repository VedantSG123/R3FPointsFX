import { useFrame, useThree } from '@react-three/fiber'
import type { R3FPointsFXRefType } from 'r3f-points-fx'
import { R3FPointsFX } from 'r3f-points-fx'
import * as React from 'react'
import * as THREE from 'three'

const vertexModifier = `
uniform float uHeight;

VertexProperties modifier(vec3 pos){
  VertexProperties result;
  result.position = pos;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  float scale = uHeight / 2.0;
  result.pointSize = uPointSize * ( scale / - mvPosition.z);

  return result;
}
`

const DURATION = 2

export const Particles: React.FC<ParticlesType> = ({ meshes, nextIndex }) => {
  const { viewport } = useThree()
  const fxRef = React.useRef<R3FPointsFXRefType>(null)
  const [modelA, setModelA] = React.useState(0)
  const [modelB, setModelB] = React.useState(0)

  const startTimeRef = React.useRef(0)

  React.useEffect(() => {
    startTimeRef.current = 0
    fxRef.current?.updateProgress(0)
    setModelB(nextIndex)
  }, [nextIndex])

  useFrame(({ clock }) => {
    if (startTimeRef.current === 0) {
      startTimeRef.current = clock.elapsedTime
    }

    const elapsed = clock.elapsedTime - startTimeRef.current

    const progress = Math.min(elapsed / DURATION, 1)

    if (progress >= 1 && modelA !== nextIndex) {
      setModelA(nextIndex)
    }

    fxRef.current?.updateProgress(progress)
  })

  return (
    <R3FPointsFX
      ref={fxRef}
      uniforms={{ uHeight: viewport.height }}
      modelA={modelA}
      modelB={modelB}
      models={meshes}
      vertexModifier={vertexModifier}
      baseColor={new THREE.Color('#000')}
      pointSize={4.0}
    />
  )
}

export type ParticlesType = {
  meshes: THREE.Mesh[]
  nextIndex: number
}
