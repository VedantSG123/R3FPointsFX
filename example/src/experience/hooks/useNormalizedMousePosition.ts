import * as React from 'react'
import * as THREE from 'three'

export function useNormalizedMousePosition() {
  const mouse = React.useRef(new THREE.Vector2())

  React.useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return mouse
}
