import * as THREE from "three"
type uniforms = {
  [name: string]:
    | THREE.CubeTexture
    | THREE.Texture
    | Int32Array
    | Float32Array
    | THREE.Matrix4
    | THREE.Matrix3
    | THREE.Quaternion
    | THREE.Vector4
    | THREE.Vector3
    | THREE.Vector2
    | THREE.Color
    | number
    | boolean
    | Array<any>
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
