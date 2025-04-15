import { useFBO } from '@react-three/drei'
import {
  createPortal,
  type PointsProps,
  useFrame,
  useThree,
} from '@react-three/fiber'
import * as React from 'react'
import * as THREE from 'three'

import { computePositionDataTexture } from './helpers/computePositionDataTexture'
import { convertToNativeUniforms } from './helpers/convert'
import { nextPerfectSquare } from './helpers/nextPerfectSquare'
import { FBOfrag } from './shaders/FBOfrag'
import { FBOvert } from './shaders/FBOvert'
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
  progressModifier?: string
  progress?: number
  sizeAttenutation?: boolean
  organizedParticleIndexes?: number[]
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
      pointsCount = 1000,
      modelA = null,
      modelB = null,
      uniforms = {},
      baseColor = new THREE.Color(0, 0, 0),
      pointSize = 0.1,
      alpha = 1,
      attributes = [],
      blending = THREE.AdditiveBlending,
      vertexModifier,
      fragmentModifier,
      progressModifier,
      progress,
      sizeAttenutation = true,
      organizedParticleIndexes = [],
      ...rest
    }: R3FPointsPropsType,
    outerRef,
  ) => {
    const fboRef = React.useRef<THREE.Mesh>(null)
    const pointsRef = React.useRef<THREE.Points>(null)

    const {
      gl,
      size: { width, height },
    } = useThree()

    const count = React.useMemo(() => {
      return nextPerfectSquare(pointsCount)
    }, [pointsCount])

    const dataTextures = React.useMemo(() => {
      const result: THREE.DataTexture[] = []

      models.forEach((model, index) => {
        result.push(
          computePositionDataTexture(
            count,
            model,
            organizedParticleIndexes.includes(index),
          ),
        )
      })

      return result
    }, [models, count, organizedParticleIndexes])

    const fboShaderUniforms = React.useMemo(
      () =>
        convertToNativeUniforms({
          uTransitionProgress: 0,
          uTime: 0,
          positionsA: modelA !== null ? dataTextures[modelA] : null,
          positionsB: modelB !== null ? dataTextures[modelB] : null,
          uModel1: modelA,
          uModel2: modelB,
        }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [dataTextures],
    )

    const particleShaderMaterial = React.useRef<THREE.ShaderMaterial>(
      new THREE.ShaderMaterial({
        uniforms: convertToNativeUniforms({
          uPosition: null,
          uColor: baseColor,
          uTime: 0,
          uModel1: modelA,
          uModel2: modelB,
          uPointSize: pointSize / 10,
          uAlpha: alpha,
          uViewPort: new THREE.Vector2(width, height),
          uDpr: gl.getPixelRatio(),
          ...uniforms,
        }),
        vertexShader: PointsVertexShader(vertexModifier, sizeAttenutation),
        fragmentShader: PointsFragmentShader(fragmentModifier),
        depthWrite: false,
        blending,
      }),
    )

    const updateProgress = React.useCallback((progress: number) => {
      if (fboRef.current) {
        if (fboRef.current.material instanceof THREE.ShaderMaterial) {
          fboRef.current.material.uniforms.uTransitionProgress.value = Math.min(
            progress,
            1,
          )
        }
      }
    }, [])

    const setModelA = React.useCallback(
      (index: number) => {
        let current: number | null = null
        if (index >= 0 && index < dataTextures.length) {
          current = index
        }
        if (fboRef.current) {
          if (fboRef.current.material instanceof THREE.ShaderMaterial) {
            fboRef.current.material.uniforms.positionsA.value =
              current !== null ? dataTextures[current] : null

            fboRef.current.material.uniforms.uModel1.value = current
          }
        }
      },
      [dataTextures],
    )

    const setModelB = React.useCallback(
      (index: number) => {
        if (fboRef.current) {
          let current: number | null = null
          if (index >= 0 && index < dataTextures.length) {
            current = index
          }

          if (fboRef.current.material instanceof THREE.ShaderMaterial) {
            fboRef.current.material.uniforms.positionsB.value =
              current !== null ? dataTextures[current] : null

            fboRef.current.material.uniforms.uModel2.value = current
          }
        }
      },
      [dataTextures],
    )

    React.useEffect(() => {
      if (!particleShaderMaterial || !particleShaderMaterial.current) return

      particleShaderMaterial.current.uniforms.uColor.value = baseColor
      particleShaderMaterial.current.uniforms.uPointSize.value = pointSize / 10
      particleShaderMaterial.current.uniforms.uAlpha.value = alpha

      Object.entries(uniforms).forEach(([key, value]) => {
        if (particleShaderMaterial.current.uniforms[key]) {
          particleShaderMaterial.current.uniforms[key].value = value
        }
      })
    }, [baseColor, pointSize, alpha, uniforms])

    // effect for updating progress
    React.useEffect(() => {
      if (progress) {
        updateProgress(progress)
      }
    }, [progress, updateProgress])

    // effect for updating models
    React.useEffect(() => {
      if (modelA !== null) {
        setModelA(modelA)
      }
      if (modelB !== null) {
        setModelB(modelB)
      }
    }, [modelA, modelB, setModelA, setModelB])

    //width, height change in separate effet
    React.useEffect(() => {
      if (!particleShaderMaterial || !particleShaderMaterial.current) {
        return
      }

      ;(
        particleShaderMaterial.current.uniforms.uViewPort.value as THREE.Vector2
      ).set(width, height)
      particleShaderMaterial.current.uniforms.uDpr.value = gl.getPixelRatio()
    }, [width, height, gl])

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
      const textureHeight = Math.sqrt(count)
      const textureWidth = textureHeight

      const particles = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        particles[i3 + 0] = (i % textureWidth) / textureWidth
        particles[i3 + 1] = i / textureWidth / textureHeight
      }

      return particles
    }, [count])

    React.useImperativeHandle(
      outerRef,
      () => ({
        getSimulationMesh: () => fboRef.current,
        getPointsMesh: () => pointsRef.current,
        updateProgress,
        updateTime: (time: number) => {
          if (fboRef.current) {
            if (fboRef.current.material instanceof THREE.ShaderMaterial) {
              fboRef.current.material.uniforms.uTime.value = time
            }
          }

          particleShaderMaterial.current.uniforms.uTime.value = time
        },
        setModelA,
        setModelB,
      }),
      [updateProgress, setModelA, setModelB],
    )

    useFrame((state) => {
      const { gl } = state
      gl.setRenderTarget(renderTarget)
      gl.clear()
      gl.render(scene, camera)
      gl.setRenderTarget(null)
      particleShaderMaterial.current.uniforms.uPosition.value =
        renderTarget.texture
      if (
        fboRef.current &&
        fboRef.current.material instanceof THREE.ShaderMaterial
      ) {
        const model1 = fboRef.current.material.uniforms.uModel1.value as
          | number
          | null
        const model2 = fboRef.current.material.uniforms.uModel2.value as
          | number
          | null

        if (particleShaderMaterial.current.uniforms.uModel1.value !== model1) {
          particleShaderMaterial.current.uniforms.uModel1.value = model1
        }
        if (particleShaderMaterial.current.uniforms.uModel2.value !== model2) {
          particleShaderMaterial.current.uniforms.uModel2.value = model2
        }
      }
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
            <shaderMaterial
              uniforms={fboShaderUniforms}
              vertexShader={FBOvert}
              fragmentShader={FBOfrag(progressModifier)}
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
