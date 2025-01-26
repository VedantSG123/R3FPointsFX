import * as THREE from 'three'
type uniforms = {
  [name: string]: // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const convertToNativeUniforms = (uniforms: uniforms) => {
  const entries = Object.entries(uniforms)
  const updated = entries.reduce((acc, [name, value]) => {
    const uniform = THREE.UniformsUtils.clone({
      [name]: {
        value,
      },
    })
    return {
      ...acc,
      ...uniform,
    }
  }, {})
  return updated
}

export { convertToNativeUniforms }
