import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { R3FPointsFXRefType } from 'r3f-points-fx'
import { R3FPointsFX } from 'r3f-points-fx'
import * as React from 'react'
import * as THREE from 'three'
import type { GLTF } from 'three-stdlib'

import { simplexNoise } from '../shaders/simplexNosie'

const TRANSITION_DURATION = 2
const WAIT_DURATION = 2

const FragmentModifier = `
uniform vec3 uColorBlue;

vec4 modifier(int index){
  vec2 uv = gl_PointCoord;
  float distanceFromCenter = length(uv - 0.5);
  float alpha = 0.05 / distanceFromCenter - (0.05 / 0.5);
  float clampedAlpha = clamp(alpha, 0.0, 1.0);

  vec3 color;
  if(index == 0){
    if(vPosition.x > 1.0){
      color = uColorBlue;
    }else{
      color = vec3(0.0, 1.0, 0.0);
    }
  } else {
    color = uColor;
  }

  vec4 result = vec4(color, uAlpha * clampedAlpha);
  return result;
}
`

const ProgressModifier = `
  ${simplexNoise}

  float progressModifier(vec3 origin, vec3 target, float progress){
    if(uModel1 == 0 && uModel2 == 1){
      float particleDuration = 0.4;
      float maxDelay = 1.0 - particleDuration;
    
      float normalizedX = (origin.x + 2.0) / 4.0;
      normalizedX = clamp(normalizedX, 0.0, 1.0);
      
      float delay = normalizedX * maxDelay;
      float end = delay + particleDuration;
      
      float newProgress = smoothstep(delay, end, progress);
      
      return newProgress;
    }

    float noiseOrigin = snoise(origin);
    float noiseTarget = snoise(target);
    float noise = mix(noiseOrigin, noiseTarget, progress);
    noise = smoothstep(-1.0, 1.0, noise);

    float duration = 0.4;
    float delay = (1.0 - duration) * noise;
    float end = delay + duration;
    float newProgress = smoothstep(delay, end, progress);

    return newProgress;
  }
`

export const Particles = () => {
  const { nodes } = useGLTF('pointsFXsub.glb') as GLTFResult

  const fxRef = React.useRef<R3FPointsFXRefType>(null)
  const start = React.useRef(0)
  const modelA = React.useRef(0)
  const modelB = React.useRef(1)

  const meshes = [nodes.PointsFX, nodes.Suzanne, nodes.ThreeJS]

  // Ensure the update progress is called exactly once per frame or transition
  // or transition will glitch.
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
      modelA.current = modelB.current
      modelB.current = (modelB.current + 1) % meshes.length

      fxRef.current?.setModelA(modelA.current)
      fxRef.current?.updateProgress(0)
      fxRef.current?.setModelB(modelB.current)
      start.current = 0
    } else {
      fxRef.current?.updateProgress(progress)
    }
  })

  return (
    <R3FPointsFX
      ref={fxRef}
      scale={[2.5, 2.5, 2.5]}
      position={[0, 0, 0]}
      modelA={modelA.current}
      modelB={modelB.current}
      pointsCount={15000}
      pointSize={0.4}
      organizedParticleIndexes={[0, 1]}
      models={meshes}
      baseColor={new THREE.Color('#fff')}
      sizeAttenutation={true}
      fragmentModifier={FragmentModifier}
      progressModifier={ProgressModifier}
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
