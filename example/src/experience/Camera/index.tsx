import { PerspectiveCamera } from '@react-three/drei'
import * as React from 'react'
import type { PerspectiveCamera as PerspectiveCameraType } from 'three'

export const Camera = () => {
  const cameraRef = React.useRef<PerspectiveCameraType | null>(null)

  React.useEffect(() => {
    const adjustCamera = () => {
      const camera = cameraRef.current
      if (camera) {
        if (window.innerWidth > 768) {
          camera.zoom = 1
        } else if (window.innerWidth > 448) {
          camera.zoom = 0.8
        } else {
          camera.zoom = 0.6
        }
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
      }
    }

    adjustCamera()

    window.addEventListener('resize', adjustCamera)

    return () => window.removeEventListener('resize', adjustCamera)
  }, [])

  return (
    <PerspectiveCamera
      ref={cameraRef}
      fov={75}
      position={[0, 0, 5]}
      near={0.0000001}
      makeDefault
    />
  )
}
