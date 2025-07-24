import type { SandpackFile } from '@codesandbox/sandpack-react'

const AppCode = `
import * as THREE from 'three'
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import './scene.css'

type GLTFResult = GLTF & {
  nodes: {
    Suzanne: THREE.Mesh
  }
  materials: {}
}

function Model(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('${import.meta.env.VITE_FRONTEND_URL}/suzanne.glb') as GLTFResult
  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.Suzanne.geometry}
        rotation={[0, Math.PI / 2, 0]}
      />
    </group>
  )
}

const Scene = () => {
  return (
    <Canvas camera={{ position: [1.5, 1.5, 1.5] }}>
      <Model />
      <OrbitControls autoRotate />
    </Canvas>
  );
};


export default Scene;
`

const BasicParticlesFiles: Record<string, SandpackFile> = {
  '/App.tsx': {
    code: AppCode,
    active: true,
  },
}

export default BasicParticlesFiles
