import * as THREE from "three"
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js"

const surfaceSampler = (size: number, mesh: THREE.Mesh) => {
  const length = size * size * 4
  const data = new Float32Array(length)
  const sampler = new MeshSurfaceSampler(mesh).build()

  for (let i = 0; i < length; i++) {
    const stride = i * 4

    const newPosition = new THREE.Vector3()
    sampler.sample(newPosition)

    data[stride] = newPosition.x
    data[stride + 1] = newPosition.y
    data[stride + 2] = newPosition.z
    data[stride + 3] = 1.0
  }

  const positionsTexture = new THREE.DataTexture(
    data,
    size,
    size,
    THREE.RGBAFormat,
    THREE.FloatType
  )
  positionsTexture.needsUpdate = true

  return positionsTexture
}

export default surfaceSampler
