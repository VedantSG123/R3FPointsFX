import type { LineSegmentsProps } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import * as React from 'react'
import * as THREE from 'three'

const LIGHTTRAILS_VERTEX_SHADER = `
  attribute float instanceIndex;
  varying float vIndex;
  varying vec3 vPosition;

  void main() {
    vIndex = instanceIndex;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const LIGHTTRAILS_FRAGMENT_SHADER = (
  trailCount: number,
  fieldLength: number,
) => `
  uniform vec3 color;
  uniform float time;
  uniform float opacity;
  uniform float speeds[${trailCount}];
  uniform float trailLengths[${trailCount}];

  varying float vIndex;
  varying vec3 vPosition;

  vec3 createGlow(vec3 color, float intensity) {
    // Enhance the color for the glow effect
    return color * intensity * 1.5;
  }

  void main() {
    int index = int(vIndex);
    float speed = speeds[index];
    float trailLength = trailLengths[index];
    
    // Calculate position along the line (0 to 1)
    float zPos = (vPosition.z + ${(fieldLength / 2.0).toFixed(1)}) / ${fieldLength.toFixed(1)};
    
    // Calculate moving position of the trail
    float trailPos = mod(time * (speed / 100.0), 1.0 + trailLength) - trailLength;
    
    // Calculate distance from trail center
    float distFromTrail = abs(zPos - trailPos);
    
    // Apply trail effect with enhanced glow
    float intensity = 1.0 - smoothstep(0.0, trailLength * 1.2, distFromTrail);
    
    // Create a softer falloff for the glow
    float glowIntensity = pow(intensity, 1.5);
    
    if (glowIntensity < 0.01) discard;
    
    // Apply the glow effect
    vec3 glowColor = createGlow(color, glowIntensity);
    
    gl_FragColor = vec4(glowColor, opacity * glowIntensity);
  }
`

export type LightTrailsRef = THREE.LineSegments & {
  updateOpacity: (opacity: number) => void
}

export const LightTrails = React.forwardRef<LightTrailsRef, LightTrailsProps>(
  (
    {
      trailCount = 100,
      trailLength = 0.1,
      fieldLength = 5,
      spread = 5,
      velocityRange = [80, 140],
      color = '#7DF9FF',
      opacity = 0.7,
      ...lineSegmentsProps
    },
    ref,
  ) => {
    const materialRef = React.useRef<THREE.ShaderMaterial>(null)
    const lineSegmentsRef = React.useRef<THREE.LineSegments>(null)

    React.useImperativeHandle(ref, () => {
      if (!lineSegmentsRef.current) {
        throw new Error('LineSegments ref is not initialized')
      }

      const lineSegments = lineSegmentsRef.current
      return Object.assign(lineSegments, {
        updateOpacity: (newOpacity: number) => {
          if (materialRef.current) {
            materialRef.current.uniforms.opacity.value = newOpacity
          }
        },
      })
    }, [])

    const { linePositions, lineSpeeds } = React.useMemo(() => {
      const positions = new Float32Array(trailCount * 3 * 2)
      const speeds = new Float32Array(trailCount)

      for (let i = 0; i < trailCount; i++) {
        const x = (Math.random() - 0.5) * spread
        const y = (Math.random() - 0.5) * spread

        // Start position
        positions[i * 6 + 0] = x
        positions[i * 6 + 1] = y
        positions[i * 6 + 2] = -fieldLength / 2

        // End position
        positions[i * 6 + 3] = x
        positions[i * 6 + 4] = y
        positions[i * 6 + 5] = fieldLength / 2

        // Random speed for each trail
        const minSpeed = velocityRange[0]
        const maxSpeed = velocityRange[1]
        speeds[i] = minSpeed + Math.random() * (maxSpeed - minSpeed)
      }

      return { linePositions: positions, lineSpeeds: speeds }
    }, [trailCount, spread, fieldLength, velocityRange])

    const trailLengths = React.useMemo(() => {
      const lengths = new Float32Array(trailCount)
      for (let i = 0; i < trailCount; i++) {
        lengths[i] = 0.1 + Math.random() * trailLength
      }
      return lengths
    }, [trailCount, trailLength])

    useFrame((_, delta) => {
      if (materialRef.current) {
        materialRef.current.uniforms.time.value += delta
      }
    })

    const shaderMaterial = React.useMemo(() => {
      const colorObj = new THREE.Color(color)

      return new THREE.ShaderMaterial({
        uniforms: {
          color: {
            value: new THREE.Vector3(colorObj.r, colorObj.g, colorObj.b),
          },
          time: { value: 0 },
          opacity: { value: opacity },
          speeds: { value: lineSpeeds },
          trailLengths: { value: trailLengths },
        },
        vertexShader: LIGHTTRAILS_VERTEX_SHADER,
        fragmentShader: LIGHTTRAILS_FRAGMENT_SHADER(trailCount, fieldLength),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true,
      })
    }, [color, opacity, trailCount, fieldLength, lineSpeeds, trailLengths])

    const instanceIndices = React.useMemo(() => {
      const indices = new Float32Array(trailCount * 2)
      for (let i = 0; i < trailCount; i++) {
        indices[i * 2] = i
        indices[i * 2 + 1] = i
      }
      return indices
    }, [trailCount])

    return (
      <lineSegments ref={lineSegmentsRef} {...lineSegmentsProps}>
        <bufferGeometry>
          <bufferAttribute
            attach='attributes-position'
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach='attributes-instanceIndex'
            count={instanceIndices.length}
            array={instanceIndices}
            itemSize={1}
          />
        </bufferGeometry>
        <primitive object={shaderMaterial} ref={materialRef} />
      </lineSegments>
    )
  },
)

LightTrails.displayName = 'LightTrails'
type LightTrailsProps = LineSegmentsProps & {
  trailCount?: number
  fieldLength?: number
  trailLength?: number
  spread?: number
  velocityRange?: [number, number]
  color?: THREE.ColorRepresentation
  opacity?: number
}
