import { useGLTF } from '@react-three/drei'
import React from 'react'
import type * as THREE from 'three'
import type { GLTF } from 'three-stdlib'

type threejsGLTFResult = GLTF & {
  nodes: {
    threejs: THREE.Mesh
  }
}

type suzanneGLTFResult = GLTF & {
  nodes: {
    Suzanne: THREE.Mesh
  }
}

// type dnaGLTFResult = GLTF & {
//   nodes: {
//     dna: THREE.Mesh
//   }
// }

type mobiusGLTFResult = GLTF & {
  nodes: {
    Cube002: THREE.Mesh
  }
}

export const useSubsceneModels = () => {
  const suzanne = useGLTF('suzanne.glb') as unknown as suzanneGLTFResult
  const threejs = useGLTF('threejs.glb') as unknown as threejsGLTFResult
  const mobius = useGLTF('mobius_strip.glb') as unknown as mobiusGLTFResult

  const [nextModel, setNextModel] = React.useState(0)

  const meshes = React.useMemo(
    () => [suzanne.nodes.Suzanne, threejs.nodes.threejs, mobius.nodes.Cube002],
    [suzanne, threejs, mobius],
  )

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNextModel((prev) => (prev + 1) % meshes.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [meshes])

  return {
    meshes,
    nextModel,
  }
}
