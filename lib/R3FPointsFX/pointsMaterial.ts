import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

type uniforms = {
  [name: string]:
    | Array<any>
    | Float32Array
    | Int32Array
    | THREE.Color
    | THREE.CubeTexture
    | THREE.Matrix3
    | THREE.Matrix4
    | THREE.Quaternion
    | THREE.Texture
    | THREE.Vector2
    | THREE.Vector3
    | THREE.Vector4
    | boolean
    | number
    | null
}

export const pointsShaderMaterial = (
  uniforms: uniforms,
  vertex: string,
  fragment: string,
) => {
  return shaderMaterial(uniforms, vertex, fragment)
}
