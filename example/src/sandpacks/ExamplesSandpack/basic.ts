import type { SandpackFile } from '@codesandbox/sandpack-react'

const AppCode = `import * as THREE from 'three';
import * as React from 'react';
import { Canvas, useFrame } from "@react-three/fiber";
import { R3FPointsFX } from 'r3f-points-fx';
import { OrbitControls } from "@react-three/drei";
import { useGLTF } from '@react-three/drei';
import type { GLTF } from 'three-stdlib';
import type { R3FPointsFXRefType } from 'r3f-points-fx';
import "./scene.css";

const TRANSITION_DURATION = 2
const WAIT_DURATION = 2

const SPHERE = new THREE.Mesh(
  new THREE.SphereGeometry(1.1, 32, 16),
  new THREE.MeshBasicMaterial(),
)

const COLORS = {
  base: new THREE.Color('#9333ea'),
}

const Particles = () => {
  const { nodes } = useGLTF('${import.meta.env.VITE_FRONTEND_URL}/suzanne.glb') as unknown as SuzanneGLTFResult
  const { nodes: threejsNodes } = useGLTF('${import.meta.env.VITE_FRONTEND_URL}/threejs.glb') as unknown as ThreejsGLTFResult
  const fxRef = React.useRef<R3FPointsFXRefType>(null)
  const start = React.useRef(0)
  const modelA = React.useRef(0)
  const modelB = React.useRef(1)

  const meshes = React.useMemo(() => {
    return [nodes.Suzanne, threejsNodes.threejs, SPHERE];
  }, [nodes, threejsNodes]);

  // Ensure the update progress is called exactly once per frame
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
      modelA={modelA.current} // set value initally, later control using ref
      modelB={modelB.current}
      pointsCount={15000}
      pointSize={0.2}
      organizedParticleIndexes={[0]} // particles will arrange at exact vertex positions for suzanne mesh
      models={meshes}
      baseColor={COLORS.base}
      sizeAttenutation={true}
      alpha={0.5}
    />
  )
};

const Scene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <Particles />
      <OrbitControls />
    </Canvas>
  );
};

type SuzanneGLTFResult = GLTF & {
  nodes: {
    Suzanne: THREE.Mesh
  }
  materials: object
}


type ThreejsGLTFResult = GLTF & {
  nodes: {
    threejs: THREE.Mesh
  }
  materials: object
}


export default Scene;

`

const BasicParticlesFiles: Record<string, SandpackFile> = {
  '/App.tsx': {
    code: AppCode,
    active: true,
  },
}

export default BasicParticlesFiles
