import { useFBO } from '@react-three/drei'
import { createPortal, type PointsProps, useFrame } from '@react-three/fiber'
import * as React from 'react'
import * as THREE from 'three'

import { convertToNativeUniforms } from './helpers/convert'
import surfaceSampler from './sampler/surfaceSampler'
import fbo_frag from './shaders/FBOfrag'
import fbo_vert from './shaders/FBOvert'
import { PointsFragmentShader } from './shaders/PointsFragmentShader'
import { PointsVertexShader } from './shaders/PointsVertexShader'

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

type attribute = {
  attach: string
  array: THREE.TypedArray
  itemSize: number
}

export type R3FPointsPropsType = PointsProps & {
  models: THREE.Mesh[]
  pointsCount?: number
  modelA?: number | null
  modelB?: number | null
  uniforms?: uniforms
  baseColor?: THREE.Color
  pointSize?: number
  alpha?: number
  attributes?: attribute[]
  blending?: THREE.Blending
  vertexModifier?: string
  fragmentModifier?: string
}

export type R3FPointsFXRefType = {
  getSimulationMesh: () => THREE.Mesh | null
  getPointsMesh: () => THREE.Points | null
  updateProgress: (progress: number) => void
  updateTime: (time: number) => void
  setModelA: (index: number) => void
  setModelB: (index: number) => void
}

export const R3FPointsFX = React.forwardRef<
  R3FPointsFXRefType,
  R3FPointsPropsType
>(
  (
    {
      models,
      pointsCount = 120,
      modelA = null,
      modelB = null,
      uniforms = {},
      baseColor = new THREE.Color(0, 0, 0),
      pointSize = 1,
      alpha = 1,
      attributes = [],
      blending = THREE.AdditiveBlending,
      vertexModifier,
      fragmentModifier,
      ...rest
    }: R3FPointsPropsType,
    outerRef,
  ) => {
    const fboRef = React.useRef<THREE.Mesh>(null)
    const pointsRef = React.useRef<THREE.Points>(null)

    const dataTextures = React.useMemo(() => {
      const result: THREE.DataTexture[] = []

      models.forEach((model) => {
        result.push(surfaceSampler(pointsCount, model))
      })

      return result
    }, [models, pointsCount])

    const fboShaderUniforms = React.useMemo(
      () =>
        convertToNativeUniforms({
          uTransitionProgress: 0,
          uTime: 0,
          positionsA: modelA !== null ? dataTextures[modelA] : null,
          positionsB: modelB !== null ? dataTextures[modelB] : null,
        }),
      [modelA, modelB, dataTextures],
    )

    const particleShaderMaterial = React.useRef<THREE.ShaderMaterial>(
      new THREE.ShaderMaterial({
        uniforms: convertToNativeUniforms({
          uPosition: null,
          uColor: baseColor,
          uTime: 0,
          uTransitionProgress: 0,
          uModel1: modelA,
          uModel2: modelB,
          uPointSize: pointSize,
          uAlpha: alpha,
          ...uniforms,
        }),
        vertexShader: PointsVertexShader(vertexModifier),
        fragmentShader: PointsFragmentShader(fragmentModifier),
        depthWrite: false,
        blending,
      }),
    )

    React.useEffect(() => {
      if (!particleShaderMaterial) return

      particleShaderMaterial.current.uniforms.uColor.value = baseColor
      particleShaderMaterial.current.uniforms.uPointSize.value = pointSize
      particleShaderMaterial.current.uniforms.uAlpha.value = alpha
      particleShaderMaterial.current.uniforms.uModel1.value = modelA
      particleShaderMaterial.current.uniforms.uModel2.value = modelB

      Object.entries(uniforms).forEach(([key, value]) => {
        if (particleShaderMaterial.current.uniforms[key]) {
          particleShaderMaterial.current.uniforms[key].value = value
        }
      })
    }, [
      particleShaderMaterial,
      baseColor,
      pointSize,
      alpha,
      modelA,
      modelB,
      uniforms,
    ])

    /**
     * ---------------- Simulation Pass --------------
     */
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(
      -1,
      1,
      1,
      -1,
      1 / Math.pow(2, 53),
      1,
    )
    const positions = new Float32Array([
      -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
    ])
    const uvs = new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0])

    const renderTarget = useFBO({
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      type: THREE.FloatType,
    })

    const particlesPosition = React.useMemo(() => {
      const length = pointsCount * pointsCount
      const particles = new Float32Array(length * 3)
      for (let i = 0; i < length; i++) {
        const i3 = i * 3
        particles[i3 + 0] = (i % pointsCount) / pointsCount
        particles[i3 + 1] = i / pointsCount / pointsCount
      }

      return particles
    }, [pointsCount])

    React.useImperativeHandle(
      outerRef,
      () => ({
        getSimulationMesh: () => fboRef.current,
        getPointsMesh: () => pointsRef.current,
        updateProgress: (progress: number) => {
          if (fboRef.current) {
            if (fboRef.current.material instanceof THREE.ShaderMaterial) {
              fboRef.current.material.uniforms.uTransitionProgress.value =
                progress
            }
          }

          particleShaderMaterial.current.uniforms.uTransitionProgress.value =
            progress
        },
        updateTime: (time: number) => {
          if (fboRef.current) {
            if (fboRef.current.material instanceof THREE.ShaderMaterial) {
              fboRef.current.material.uniforms.uTime.value = time
            }
          }

          particleShaderMaterial.current.uniforms.uTime.value = time
        },
        setModelA: (index: number) => {
          if (fboRef.current) {
            if (fboRef.current.material instanceof THREE.ShaderMaterial) {
              let current: number | null = null
              if (index >= 0 && index < dataTextures.length) {
                current = index
              }
              fboRef.current.material.uniforms.positionsA.value =
                current !== null ? dataTextures[current] : null

              particleShaderMaterial.current.uniforms.uModel1.value =
                current !== null ? current : null
            }
          }
        },
        setModelB: (index: number) => {
          if (fboRef.current) {
            if (fboRef.current.material instanceof THREE.ShaderMaterial) {
              let current: number | null = null
              if (index >= 0 && index < dataTextures.length) {
                current = index
              }
              fboRef.current.material.uniforms.positionsB.value =
                current !== null ? dataTextures[current] : null

              particleShaderMaterial.current.uniforms.uModel2.value =
                current !== null ? current : null
            }
          }
        },
      }),
      [dataTextures],
    )

    useFrame((state) => {
      const { gl } = state
      gl.setRenderTarget(renderTarget)
      gl.clear()
      gl.render(scene, camera)
      gl.setRenderTarget(null)
      particleShaderMaterial.current.uniforms.uPosition.value =
        renderTarget.texture
    })

    return (
      <>
        {createPortal(
          <mesh ref={fboRef}>
            <bufferGeometry>
              <bufferAttribute
                attach='attributes-position'
                count={positions.length / 3}
                array={positions}
                itemSize={3}
              />
              <bufferAttribute
                attach='attributes-uv'
                count={uvs.length / 2}
                array={uvs}
                itemSize={2}
              />
            </bufferGeometry>
            <shaderMaterial
              uniforms={fboShaderUniforms}
              vertexShader={fbo_vert}
              fragmentShader={fbo_frag}
            />
          </mesh>,
          scene,
        )}
        <points
          {...rest}
          ref={pointsRef}
          material={particleShaderMaterial.current}
        >
          <bufferGeometry>
            <bufferAttribute
              attach='attributes-position'
              count={particlesPosition.length / 3}
              array={particlesPosition}
              itemSize={3}
            />
            {attributes.map((attribute, index) => (
              <bufferAttribute
                key={index}
                attach={attribute.attach}
                count={attribute.array.length / attribute.itemSize}
                array={attribute.array}
                itemSize={attribute.itemSize}
              />
            ))}
          </bufferGeometry>
        </points>
      </>
    )
  },
)
