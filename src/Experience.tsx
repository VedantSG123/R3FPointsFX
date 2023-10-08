import { Canvas } from "@react-three/fiber"
import * as THREE from "three"
import { OrbitControls } from "@react-three/drei"
import Scene from "./Scene"

type properties = {
  current: number
}

function Experience({ current }: properties) {
  return (
    <>
      <Canvas
        className="main-canvas"
        gl={{
          powerPreference: "high-performance",
          toneMapping: THREE.NoToneMapping,
        }}
        dpr={[1, 2]}
      >
        <OrbitControls />
        <Scene current={current} />
      </Canvas>
    </>
  )
}

export default Experience
