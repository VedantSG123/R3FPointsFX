import { CameraControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import type { R3FPointsFXRefType } from 'r3f-points-fx'
import { R3FPointsFX } from 'r3f-points-fx'
import * as React from 'react'
import * as THREE from 'three'

export const Experience = () => {
  return (
    <Canvas>
      <CameraControls />
      <Custom />
    </Canvas>
  )
}

export const Custom = () => {
  const { viewport } = useThree()
  const { baseColor, progress, size } = useControls({
    baseColor: '#000000',
    progress: {
      value: 0,
      min: 0,
      max: 1,
    },
    size: {
      value: 1,
      min: 1,
      max: 5,
    },
  })
  const fxRef = React.useRef<R3FPointsFXRefType>(null)

  const box = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.5, 1.5),
    new THREE.MeshBasicMaterial(),
  )
  const meshes = [box]

  React.useEffect(() => {
    if (!fxRef.current) return
    fxRef.current.updateProgress(progress)
  }, [progress])

  return (
    <R3FPointsFX
      ref={fxRef}
      uniforms={{ uHeight: viewport.height }}
      modelA={null}
      modelB={0}
      models={meshes}
      baseColor={new THREE.Color(baseColor)}
      pointSize={size}
    />
  )
}
