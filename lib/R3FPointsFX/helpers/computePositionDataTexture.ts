import * as THREE from 'three'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'

const surfaceSampler = (count: number, mesh: THREE.Mesh) => {
  const length = count * 4
  const data = new Float32Array(length)
  const sampler = new MeshSurfaceSampler(mesh).build()

  const width = Math.sqrt(count)
  const height = width

  for (let i = 0; i < count; i++) {
    const i4 = i * 4

    const newPosition = new THREE.Vector3()
    sampler.sample(newPosition)

    data[i4] = newPosition.x
    data[i4 + 1] = newPosition.y
    data[i4 + 2] = newPosition.z
    data[i4 + 3] = 1.0
  }

  const positionsTexture = new THREE.DataTexture(
    data,
    width,
    height,
    THREE.RGBAFormat,
    THREE.FloatType,
  )
  positionsTexture.needsUpdate = true

  return positionsTexture
}

const orderedSampler = (count: number, mesh: THREE.Mesh) => {
  const positionAttribute = mesh.geometry.attributes.position
  const data = new Float32Array(count * 4)

  const width = Math.sqrt(count)
  const height = width

  let j = 0

  for (let i = 0; i < count; i++) {
    const i4 = i * 4

    if (j < positionAttribute.count) {
      const j3 = j * 3
      data[i4] = positionAttribute.array[j3]
      data[i4 + 1] = positionAttribute.array[j3 + 1]
      data[i4 + 2] = positionAttribute.array[j3 + 2]
      data[i4 + 3] = 1.0

      j++
    } else {
      const randomIndex = Math.floor(Math.random() * positionAttribute.count)
      data[i4] = positionAttribute.array[randomIndex * 3]
      data[i4 + 1] = positionAttribute.array[randomIndex * 3 + 1]
      data[i4 + 2] = positionAttribute.array[randomIndex * 3 + 2]
      data[i4 + 3] = 1.0
    }
  }

  const positionsTexture = new THREE.DataTexture(
    data,
    width,
    height,
    THREE.RGBAFormat,
    THREE.FloatType,
  )
  positionsTexture.needsUpdate = true

  return positionsTexture
}

const computePositionDataTexture = (
  count: number,
  mesh: THREE.Mesh,
  isOrdered: boolean = false,
) => {
  if (isOrdered) {
    return orderedSampler(count, mesh)
  }

  return surfaceSampler(count, mesh)
}

export { computePositionDataTexture }
