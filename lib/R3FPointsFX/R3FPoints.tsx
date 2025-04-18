import { useFrame, createPortal, PointsProps } from "@react-three/fiber"
import {
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react"
import { useFBO } from "@react-three/drei"
import * as THREE from "three"
import surfaceSampler from "./sampler/surfaceSampler"
import { convertToNativeUniforms } from "./helpers/convert"
//shaders---------------------------------------------------------
import FBOMeshvert from "./shaders/FBOMeshvert"
import FBOMeshfrag from "./shaders/FBOMeshfrag"
import points_vert_header from "./shaders/points_vert_header"
import points_vert_defaults from "./shaders/points_vert_defaults"
import points_vert_main from "./shaders/points_vert_main"
import points_frag_header from "./shaders/points_frag_header"
import points_frag_defaults from "./shaders/points_frag_defaults"
import points_frag_main from "./shaders/points_frag_main"

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

type attribute = {
  name: string
  array: THREE.TypedArray
  itemSize: number
}

type properties = PointsProps & {
  modelsArray: THREE.Mesh[]
  pointsCount?: number
  pointsVertFunctions?: string
  pointsFragFunctions?: string
  modelA?: number | null
  modelB?: number | null
  progress?: number
  uniforms?: uniforms
  baseColor?: string
  pointSize?: number
  alpha?: number
  attributes?: attribute[]
  blending?: THREE.Blending
}

type R3FPointsFXRefType = {
  getSimulationMesh: () => THREE.Mesh
  getPointsMesh: () => THREE.Points
  updateProgress: (progress: number) => void
  updateTime: (time: number) => void
  setModelA: (index: number) => void
  setModelB: (index: number) => void
}

const scene = new THREE.Scene()
const camera = new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    1 / Math.pow(2, 53),
    1
)
const positions = new Float32Array([
  -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
])
const uvs = new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0])

const R3FPointsFX = forwardRef<R3FPointsFXRefType, properties>(
  (
    {
      modelsArray,
      pointsCount = 128,
      pointsVertFunctions = points_vert_defaults,
      pointsFragFunctions = points_frag_defaults,
      modelA = null,
      modelB = null,
      progress = 0,
      uniforms = {},
      baseColor = "#FFF",
      pointSize = 1.0,
      alpha = 1.0,
      attributes = [],
      blending = THREE.AdditiveBlending,
      ...meshProps
    }: properties,
    outerRef
  ) => {
    const dataTextureArray = useMemo(() => {
      const arr: THREE.DataTexture[] = []
      for (let i = 0; i < modelsArray.length; ++i) {
        arr.push(surfaceSampler(pointsCount, modelsArray[i]))
      }
      return arr
    }, [modelsArray, pointsCount])

    const meshRef = useRef<THREE.Mesh>(null)
    const points = useRef<THREE.Points>(null)

    const pointsVert: string = useMemo(() => {
      return points_vert_header + pointsVertFunctions + points_vert_main
    }, [pointsVertFunctions])

    const pointsFrag: string = useMemo(() => {
      return points_frag_header + pointsFragFunctions + points_frag_main
    }, [pointsFragFunctions])

    const meshUniforms = useMemo(() => {
      return {
        uTransitionProgress: { value: 0 },
        uTime: { value: 0.0 },
        positionsA: {
          value: modelA !== null ? dataTextureArray[modelA] : null,
        },
        positionsB: {
          value: modelB !== null ? dataTextureArray[modelB] : null,
        },
      }
    }, [modelA, modelB])

    const pointsUniforms = useMemo(() => {
      return {
        uPositions: { value: null },
        uColor: { value: new THREE.Color(baseColor) },
        uTime: { value: 0.0 },
        uTransitionProgress: { value: 0 },
        uModel1: { value: modelA },
        uModel2: { value: modelB },
        uPointSize: { value: pointSize },
        uAlpha1: { value: alpha },
        ...convertToNativeUniforms(uniforms),
      }
    }, [])

    useEffect(() => {
      if (points.current) {
        if (points.current.material instanceof THREE.ShaderMaterial) {
          points.current.material.uniforms.uColor.value = new THREE.Color(
            baseColor
          )
          points.current.material.uniforms.uModel1.value = modelA
          points.current.material.uniforms.uModel2.value = modelB
          points.current.material.uniforms.uPointSize.value = pointSize
          points.current.material.uniforms.uAlpha1.value = alpha
        }
      }
    }, [baseColor, modelA, modelB, pointSize, alpha, uniforms])

    //Simulation Pass ---------------------------------------------------------------
    const renderTarget = useFBO({
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      type: THREE.FloatType,
    })

    const particlesPosition = useMemo(() => {
      const length = pointsCount * pointsCount
      const particles = new Float32Array(length * 3)
      for (let i = 0; i < length; i++) {
        let i3 = i * 3
        particles[i3 + 0] = (i % pointsCount) / pointsCount
        particles[i3 + 1] = i / pointsCount / pointsCount
      }

      return particles
    }, [pointsCount])
    //--------------------------------------------------------------------------------

    useImperativeHandle(
      outerRef,
      () => ({
        getSimulationMesh: () => meshRef.current!,
        getPointsMesh: () => points.current!,
        updateProgress: (progress: number) => {
          if (points.current) {
            if (points.current.material instanceof THREE.ShaderMaterial) {
              points.current.material.uniforms.uTransitionProgress.value =
                progress
            }
          }
          if (meshRef.current) {
            if (meshRef.current.material instanceof THREE.ShaderMaterial) {
              meshRef.current.material.uniforms.uTransitionProgress.value =
                progress
            }
          }
        },
        updateTime: (time: number) => {
          if (meshRef.current) {
            if (meshRef.current.material instanceof THREE.ShaderMaterial) {
              meshRef.current.material.uniforms.uTime.value = time
            }
          }
          if (points.current) {
            if (points.current.material instanceof THREE.ShaderMaterial) {
              points.current.material.uniforms.uTime.value = time
            }
          }
        },
        setModelA: (index: number) => {
          if (meshRef.current && points.current) {
            if (
              meshRef.current.material instanceof THREE.ShaderMaterial &&
              points.current.material instanceof THREE.ShaderMaterial
            ) {
              let current: null | number = null
              if (index >= 0 && index < dataTextureArray.length) {
                current = index
              }
              meshRef.current.material.uniforms.positionsA.value =
                current !== null ? dataTextureArray[current] : null

              points.current.material.uniforms.uModel1.value =
                current !== null ? current : null
            }
          }
        },
        setModelB: (index: number) => {
          if (meshRef.current && points.current) {
            if (
              meshRef.current.material instanceof THREE.ShaderMaterial &&
              points.current.material instanceof THREE.ShaderMaterial
            ) {
              let current: null | number = null
              if (index >= 0 && index < dataTextureArray.length) {
                current = index
              }
              meshRef.current.material.uniforms.positionsB.value =
                current !== null ? dataTextureArray[current] : null

              points.current.material.uniforms.uModel2.value =
                current !== null ? current : null
            }
          }
        },
      }),
      []
    )

    useFrame((state) => {
      const { gl } = state
      gl.setRenderTarget(renderTarget)
      gl.clear()
      gl.render(scene, camera)
      gl.setRenderTarget(null)

      if (points.current) {
        if (points.current.material instanceof THREE.ShaderMaterial) {
          points.current.material.uniforms.uPositions.value =
            renderTarget.texture
        }
      }
    })

    return (
      <>
        {createPortal(
          <mesh ref={meshRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={positions.length / 3}
                array={positions}
                itemSize={3}
              />
              <bufferAttribute
                attach="attributes-uv"
                count={uvs.length / 2}
                array={uvs}
                itemSize={2}
              />
            </bufferGeometry>
            <shaderMaterial
              uniforms={meshUniforms}
              vertexShader={FBOMeshvert}
              fragmentShader={FBOMeshfrag}
            />
          </mesh>,
          scene
        )}
        <points ref={points} {...meshProps}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particlesPosition.length / 3}
              array={particlesPosition}
              itemSize={3}
            />
            {attributes.map((attribute, index) => {
              return (
                <bufferAttribute
                  key={index}
                  attach={`attributes-${attribute.name}`}
                  count={attribute.array.length / attribute.itemSize}
                  array={attribute.array}
                  itemSize={attribute.itemSize}
                />
              )
            })}
          </bufferGeometry>
          <shaderMaterial
            uniforms={pointsUniforms}
            vertexShader={pointsVert}
            fragmentShader={pointsFrag}
            blending={blending}
            depthWrite={false}
          />
        </points>
      </>
    )
  }
)
export type { R3FPointsFXRefType }
export { R3FPointsFX }
