import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { R3FPointsFXRefType } from 'r3f-points-fx'
import { R3FPointsFX } from 'r3f-points-fx'
import * as React from 'react'
import * as THREE from 'three'
import type { GLTF } from 'three-stdlib'

const TRANSITION_DURATION = 2
const WAIT_DURATION = 2

const FragmentModifier = `
uniform vec3 uColorBlue;

vec4 modifier(int index){
  vec2 uv = gl_PointCoord;
  float distanceFromCenter = length(uv - 0.5);
  float alpha = 0.05 / distanceFromCenter - (0.05 / 0.5);
  float clampedAlpha = clamp(alpha, 0.0, 1.0);

  vec3 color = uColor;
  if(index == 0){
    if(vPosition.x > 1.0){
      color = uColorBlue;
    }
  }

  vec4 result = vec4(color, uAlpha * clampedAlpha);
  return result;
}
`

export const Particles = () => {
  const { nodes } = useGLTF('pointsFXsub.glb') as GLTFResult

  const fxRef = React.useRef<R3FPointsFXRefType>(null)
  const start = React.useRef(0)

  const [modelA, setModelA] = React.useState(0)
  const [modelB, setModelB] = React.useState(1)

  const meshes = [nodes.PointsFX, nodes.Suzanne, nodes.ThreeJS]

  useFrame(({ clock }) => {
    if (start.current === 0) {
      start.current = clock.elapsedTime
    }

    const elapsed = clock.elapsedTime - start.current

    const progress = Math.min(
      Math.max(0, (elapsed - WAIT_DURATION) / TRANSITION_DURATION),
      1,
    )

    if (progress >= 1) {
      setModelA(modelB)
      fxRef.current?.updateProgress(0)
      start.current = 0
      setModelB((prev) => (prev + 1) % meshes.length)
    }

    fxRef.current?.updateProgress(progress)
  })

  return (
    <R3FPointsFX
      ref={fxRef}
      scale={[2, 2, 2]}
      modelA={modelA}
      modelB={modelB}
      pointsCount={15000}
      pointSize={0.5}
      organizedParticleIndexes={[0, 1]}
      models={meshes}
      baseColor={new THREE.Color('#fff')}
      sizeAttenutation={true}
      fragmentModifier={FragmentModifier}
      uniforms={{
        uColorBlue: new THREE.Color('#7c3aed'),
      }}
    />
  )
}

type GLTFResult = GLTF & {
  nodes: {
    Suzanne: THREE.Mesh
    PointsFX: THREE.Mesh
    ThreeJS: THREE.Mesh
  }
  materials: object
}
