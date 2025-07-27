import * as THREE from 'three'

export function createCircleSpriteTexture({
  size = 64,
  color = '#ffffff',
  softEdge = false,
} = {}) {
  // Create an offscreen canvas
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size

  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  const center = size / 2
  const radius = size / 2

  ctx.beginPath()
  ctx.arc(center, center, radius, 0, Math.PI * 2)
  ctx.closePath()

  if (softEdge) {
    // Create gradient for soft edge
    const gradient = ctx.createRadialGradient(
      center,
      center,
      0,
      center,
      center,
      radius,
    )
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient
  } else {
    // Solid color
    ctx.fillStyle = color
  }

  ctx.fill()

  // Create texture from canvas
  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  return texture
}
