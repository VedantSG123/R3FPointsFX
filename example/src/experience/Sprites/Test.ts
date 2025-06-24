import * as THREE from 'three'

export function createBlobAlphaTexture({
  size = 64,
  complexity = 0.3,
  softness = 0.8,
} = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')

  if (!ctx) return null

  const center = size / 2
  const baseRadius = size * 0.35

  // Create organic blob shape
  ctx.beginPath()
  const points = 12
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2
    const radiusVariation = 1 + (Math.random() - 0.5) * complexity
    const radius = baseRadius * radiusVariation

    const x = center + Math.cos(angle) * radius
    const y = center + Math.sin(angle) * radius

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.closePath()

  // Gradient from white (opaque) to black (transparent)
  const gradient = ctx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    baseRadius * (1 + softness),
  )
  gradient.addColorStop(0, 'white')
  gradient.addColorStop(0.6, 'white')
  gradient.addColorStop(1, 'black')

  ctx.fillStyle = gradient
  ctx.fill()

  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  return texture
}

export function createNucleusAlphaTexture({
  size = 64,
  coreSize = 0.3,
  falloff = 0.7,
} = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')

  if (!ctx) return null

  const center = size / 2
  const maxRadius = size * 0.45

  // Create radial gradient for nucleus shape
  const gradient = ctx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    maxRadius,
  )

  gradient.addColorStop(0, 'white')
  gradient.addColorStop(coreSize, 'white')
  gradient.addColorStop(coreSize + falloff * (1 - coreSize), '#808080')
  gradient.addColorStop(1, 'black')

  ctx.beginPath()
  ctx.arc(center, center, maxRadius, 0, Math.PI * 2)
  ctx.fillStyle = gradient
  ctx.fill()

  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  return texture
}
