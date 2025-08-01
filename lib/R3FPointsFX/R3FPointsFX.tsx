import { useFBO } from '@react-three/drei'
import {
  createPortal,
  type ThreeElements,
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
  [name: string]:
    | THREE.Color
    | THREE.CubeTexture
    | THREE.DataTexture
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

export type attribute = {
  attach: string
  array: THREE.TypedArray
  itemSize: number
}

export type R3FPointsPropsType = ThreeElements['points'] & {
  /**
   * An array of THREE.Mesh objects to be used as models for the particle system.
   */
  models: THREE.Mesh[]
  /**
   * The number of points (particles) to be rendered.
   * @default 1000
   */
  pointsCount?: number
  /**
   * The index of the model in the `models` array to be used as the starting model (modelA).
   * @default null
   */
  modelA?: number | null
  /**
   * The index of the model in the `models` array to be used as the ending model (modelB).
   * @default null
   */
  modelB?: number | null
  /**
   * An object of uniforms to be passed to the shaders.
   * @default {}
   */
  uniforms?: uniforms
  /**
   * The base color of the particles.
   * @default new THREE.Color(0, 0, 0)
   */
  baseColor?: THREE.Color
  /**
   * The size of the particles.
   * @default 0.1
   */
  pointSize?: number
  /**
   * The alpha (transparency) of the particles.
   * @default 1
   */
  alpha?: number
  /**
   * An array of custom attributes to be passed to the shaders.
   */
  attributes?: attribute[]
  /**
   * The blending mode to be used for the particles.
   * @default THREE.AdditiveBlending
   */
  blending?: THREE.Blending
  /**
   * A string of GLSL code to be injected into the vertex shader.
   */
  vertexModifier?: string
  /**
   * A string of GLSL code to be injected into the fragment shader.
   */
  fragmentModifier?: string
  /**
   * A string of GLSL code to be injected into the FBO fragment shader to modify the transition progress.
   */
  progressModifier?: string
  /**
   * Whether the particle size should be attenuated by the distance from the camera.
   * @default true
   */
  sizeAttenutation?: boolean
  /**
   * An array of indexes of models that should have their particles arranged in an organized manner.
   */
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
      sizeAttenutation = true,
      organizedParticleIndexes = [],
      ...rest
    }: R3FPointsPropsType,
    outerRef,
  ) => {
    const fboRef = React.useRef<THREE.Mesh>(null)
    const pointsRef = React.useRef<THREE.Points>(null)
    const modelARef = React.useRef<number | null>(modelA)
    const modelBRef = React.useRef<number | null>(modelB)

    const fboScene = React.useRef(new THREE.Scene())
    const fboCamera = React.useRef(
      new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1),
    )

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [models, count])

    const fboShaderUniforms = React.useMemo(
      () =>
        convertToNativeUniforms({
          uTransitionProgress: 0,
          uTime: 0,
          positionsA:
            modelARef.current !== null ? dataTextures[modelARef.current] : null,
          positionsB:
            modelBRef.current !== null ? dataTextures[modelBRef.current] : null,
          uModel1: modelARef.current,
          uModel2: modelBRef.current,
        }),
      [dataTextures],
    )

    const particleUniforms = React.useMemo(() => {
      return convertToNativeUniforms({
        uPosition: null,
        uColor: baseColor,
        uTime: 0,
        uModel1: modelARef.current,
        uModel2: modelBRef.current,
        uPointSize: pointSize / 10,
        uAlpha: alpha,
        uViewPort: new THREE.Vector2(width, height),
        uDpr: gl.getPixelRatio(),
        ...uniforms,
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const updateProgress = React.useCallback((progress: number) => {
      if (fboRef.current?.material instanceof THREE.ShaderMaterial) {
        fboRef.current.material.uniforms.uTransitionProgress.value = Math.min(
          progress,
          1,
        )
      }
    }, [])

    const setModelA = React.useCallback(
      (index: number) => {
        let current: number | null = null
        if (index >= 0 && index < dataTextures.length) {
          current = index
          modelARef.current = current
        }

        if (fboRef.current?.material instanceof THREE.ShaderMaterial) {
          fboRef.current.material.uniforms.positionsA.value =
            current !== null ? dataTextures[current] : null

          fboRef.current.material.uniforms.uModel1.value = current
        }
      },
      [dataTextures],
    )

    const setModelB = React.useCallback(
      (index: number) => {
        let current: number | null = null
        if (index >= 0 && index < dataTextures.length) {
          current = index
          modelBRef.current = current
        }

        if (fboRef.current?.material instanceof THREE.ShaderMaterial) {
          fboRef.current.material.uniforms.positionsB.value =
            current !== null ? dataTextures[current] : null

          fboRef.current.material.uniforms.uModel2.value = current
        }
      },
      [dataTextures],
    )

    // effect for handling uniforms
    React.useEffect(() => {
      if (pointsRef.current?.material instanceof THREE.ShaderMaterial) {
        pointsRef.current.material.uniforms.uColor.value = baseColor
        pointsRef.current.material.uniforms.uPointSize.value = pointSize / 10
        pointsRef.current.material.uniforms.uAlpha.value = alpha
      }

      Object.entries(uniforms).forEach(([key, value]) => {
        if (pointsRef.current?.material instanceof THREE.ShaderMaterial) {
          if (pointsRef.current.material.uniforms[key]) {
            pointsRef.current.material.uniforms[key].value = value
          }
        }
      })
    }, [baseColor, pointSize, alpha, uniforms])

    //width, height change in separate effet
    React.useEffect(() => {
      if (pointsRef.current?.material instanceof THREE.ShaderMaterial) {
        ;(
          pointsRef.current.material.uniforms
            .uViewPort as THREE.IUniform<THREE.Vector2>
        ).value.set(width, height)
        pointsRef.current.material.uniforms.uDpr.value = gl.getPixelRatio()
      }
    }, [width, height, gl])

    const fboGeometryProperties = React.useMemo(() => {
      const positions = new Float32Array([
        -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
      ])
      const uvs = new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0])
      return { positions, uvs }
    }, [])

    const renderTarget = useFBO(Math.sqrt(count), Math.sqrt(count), {
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

          if (pointsRef.current) {
            if (pointsRef.current.material instanceof THREE.ShaderMaterial) {
              pointsRef.current.material.uniforms.uTime.value = time
            }
          }
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
      gl.render(fboScene.current, fboCamera.current)
      gl.setRenderTarget(null)

      if (pointsRef.current?.material instanceof THREE.ShaderMaterial) {
        pointsRef.current.material.uniforms.uPosition.value =
          renderTarget.texture
      }

      if (
        fboRef.current?.material instanceof THREE.ShaderMaterial &&
        pointsRef.current?.material instanceof THREE.ShaderMaterial
      ) {
        const model1 = fboRef.current.material.uniforms.uModel1.value as
          | number
          | null
        const model2 = fboRef.current.material.uniforms.uModel2.value as
          | number
          | null

        if (pointsRef.current.material.uniforms.uModel1.value !== model1) {
          pointsRef.current.material.uniforms.uModel1.value = model1
        }
        if (pointsRef.current.material.uniforms.uModel2.value !== model2) {
          pointsRef.current.material.uniforms.uModel2.value = model2
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
                args={[fboGeometryProperties.positions, 3]}
              />
              <bufferAttribute
                attach='attributes-uv'
                args={[fboGeometryProperties.uvs, 2]}
              />
            </bufferGeometry>
            <shaderMaterial
              uniforms={fboShaderUniforms}
              vertexShader={FBOvert}
              fragmentShader={FBOfrag(progressModifier)}
            />
          </mesh>,
          fboScene.current,
        )}
        <points {...rest} ref={pointsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach='attributes-position'
              args={[particlesPosition, 3]}
            />
            {attributes.map((attribute, index) => (
              <bufferAttribute
                key={index}
                attach={attribute.attach}
                args={[attribute.array, attribute.itemSize]}
              />
            ))}
          </bufferGeometry>
          <shaderMaterial
            uniforms={particleUniforms}
            vertexShader={PointsVertexShader(vertexModifier, sizeAttenutation)}
            fragmentShader={PointsFragmentShader(fragmentModifier)}
            depthWrite={false}
            blending={blending}
            transparent
            vertexColors
          />
        </points>
      </>
    )
  },
)
