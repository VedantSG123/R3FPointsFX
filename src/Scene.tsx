import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { GLTF } from "three-stdlib"
import { useControls } from "leva"
import { bezier } from "@leva-ui/plugin-bezier"
import { useRef, useState, useEffect } from "react"
import { R3FPointsFXRefType, R3FPointsFX } from "../"
import * as THREE from "three"

type earthGLTFResult = GLTF & {
  nodes: {
    uploads_files_220341_Earth_Longi_Alti002: THREE.Mesh
    uploads_files_220341_Earth_Longi_Alti002_1: THREE.Mesh
  }
  materials: {
    Default: THREE.MeshStandardMaterial
  }
}

type rocketGLTFResult = GLTF & {
  nodes: {
    RING: THREE.Mesh
  }
  materials: {}
}

type properties = {
  current: number
}

function Scene({ current }: properties) {
  const earth = useGLTF("earth.glb") as earthGLTFResult
  const rocket = useGLTF("rocket-v2.glb") as rocketGLTFResult

  const meshes = [
    earth.nodes.uploads_files_220341_Earth_Longi_Alti002_1,
    rocket.nodes.RING,
  ]

  const startTime = useRef(0)
  const progress = useRef(0)
  const FBORef = useRef<R3FPointsFXRefType>(null)
  const [modelA, setModelA] = useState<number | null>(null)
  const [modelB, setModelB] = useState<number | null>(null)
  const [modelAFlag, setModelAFlag] = useState(false)

  const { duration, curve } = useControls({
    duration: {
      value: 2,
      min: 0,
      max: 5,
      step: 0.1,
    },
    curve: bezier([0.16, 1, 0.3, 1]),
  })

  const changeModel = () => {
    startTime.current = 0
    setModelB(current)
  }

  useEffect(() => {
    changeModel()
  }, [current])

  useFrame((state) => {
    if (startTime.current === 0) {
      startTime.current = state.clock.elapsedTime
      setModelAFlag(false)
    }

    const elapsed = state.clock.elapsedTime - startTime.current

    progress.current = curve.evaluate(Math.min(elapsed / duration, 1))
    if (progress.current >= 1 && !modelAFlag) {
      setModelA(modelB)
      setModelAFlag(true)
    }

    FBORef.current?.updateProgress(progress.current)
  })

  return (
    <>
      <R3FPointsFX
        modelsArray={meshes}
        pointSize={3.0}
        baseColor="#ff0000"
        modelA={modelA}
        modelB={modelB}
        ref={FBORef}
      />
    </>
  )
}

export default Scene
