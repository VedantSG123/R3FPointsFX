import type { LineSegmentsProps } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import * as React from 'react'
import * as THREE from 'three'

// Vertex Shader: Remains unchanged
const LIGHTTRAILS_VERTEX_SHADER = `
  attribute float instanceIndex; // The index of the line instance
  varying float vIndex;          // Pass instance index to fragment shader
  varying vec3 vPosition;        // Pass vertex position to fragment shader

  void main() {
    vIndex = instanceIndex;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Fragment Shader: Updated for more dynamic and appealing trails
const LIGHTTRAILS_FRAGMENT_SHADER = (
  trailCount: number,
  // fieldLength is now passed as a uniform u_fieldLength for calculations
) => `
  uniform vec3 u_color;         // Base color of the trails
  uniform float u_time;         // Current time for animation
  uniform float u_opacity;      // Overall opacity of the trails
  uniform float u_speeds[${trailCount}];      // Array of speeds for each trail
  uniform float u_trailLengths[${trailCount}]; // Array of base lengths for each trail
  uniform float u_minSpeed;     // Minimum speed in the velocityRange
  uniform float u_maxSpeed;     // Maximum speed in the velocityRange
  uniform float u_fieldLength;  // Length of the field the trails travel in

  varying float vIndex;    // Interpolated instance index from vertex shader
  varying vec3 vPosition;  // Interpolated vertex position

  // Function to create a vibrant glow effect
  vec3 createVisualGlow(vec3 baseColor, float intensity, float coreSharpness) {
    // glowColor is brighter and slightly desaturated version of baseColor
    vec3 glowColor = baseColor * 1.5 + vec3(0.1, 0.1, 0.1); 
    // Mix baseColor and glowColor based on coreSharpness for a defined core
    return mix(glowColor, baseColor, coreSharpness) * intensity;
  }

  void main() {
    int index = int(vIndex); // Convert float index to integer
    float speed = u_speeds[index];
    float baseTrailLength = u_trailLengths[index];

    // Normalize speed to a 0.0-1.0 range
    float normalizedSpeed = (speed - u_minSpeed) / (u_maxSpeed - u_minSpeed);
    normalizedSpeed = clamp(normalizedSpeed, 0.0, 1.0);

    // Calculate dynamic trail length: faster trails are significantly longer
    // Multiplier (e.g., 3.0) determines how much speed affects length
    float dynamicTrailLength = baseTrailLength * (1.0 + normalizedSpeed * 3.0);

    // Calculate the speed at which the trail head progresses through the normalized field (0 to 1)
    // A 'speed' value equal to 'u_fieldLength' means it crosses the field in 1 second.
    float progressSpeed = speed / u_fieldLength;

    // Calculate the current head position of the trail (loops from -dynamicTrailLength to 1.0)
    // 'mod' creates the looping animation
    float trailHeadPos = mod(u_time * progressSpeed, 1.0 + dynamicTrailLength) - dynamicTrailLength;

    // Normalize the vertex's Z position within the field (0.0 at back, 1.0 at front)
    float vertexZNorm = (vPosition.z + u_fieldLength / 2.0) / u_fieldLength;
    
    // Calculate distance of the current fragment from the trail's head
    // Positive values are "behind" the head (part of the visible tail)
    float distFromHead = vertexZNorm - trailHeadPos;

    float intensity = 0.0;
    float coreSharpness = 0.0; // Determines how sharp the core of the trail is

    // Check if the fragment is within the visible part of the trail
    if (distFromHead > 0.0 && distFromHead < dynamicTrailLength) {
        float positionInTrail = distFromHead / dynamicTrailLength; // 0.0 at head, 1.0 at tail tip

        // Intensity falloff: Stronger at the head, fading towards the tail
        // pow(1.0 - positionInTrail, 2.0) creates a quadratic falloff (sharper head)
        intensity = pow(1.0 - positionInTrail, 2.0); 
        // Boost intensity for faster trails
        intensity *= (1.0 + normalizedSpeed * 1.2);

        // Core sharpness: make the head appear even sharper/more defined
        // Higher power (e.g., 3.5) for a more concentrated core
        coreSharpness = pow(1.0 - positionInTrail, 3.5);
    }

    // Discard fragment if too dim to save performance
    if (intensity < 0.001) discard;

    // Calculate the final color using the glow function
    vec3 finalColor = createVisualGlow(u_color, intensity, coreSharpness);
    
    // Subtle perspective fade: trails further away (closer to camera in this setup) are slightly dimmer
    float perspectiveFade = 1.0 - (vertexZNorm * 0.4); // Fade up to 40% at the very front

    // Set the final fragment color and opacity
    gl_FragColor = vec4(finalColor, u_opacity * intensity * perspectiveFade);
  }
`

// Type for the ref, allowing imperative updates
export type LightTrailsRef = THREE.LineSegments & {
  updateOpacity: (opacity: number) => void
  updateColor: (color: THREE.ColorRepresentation) => void
}

// Props for the LightTrails component
export type LightTrailsProps = Omit<LineSegmentsProps, 'color'> & {
  // Omit R3F's 'color' to avoid conflict
  trailCount?: number
  fieldLength?: number
  trailLength?: number // Max random addition to base length, speed elongates it
  spread?: number
  velocityRange?: [number, number] // Min and max speeds for trails
  color?: THREE.ColorRepresentation // Trail color
  opacity?: number // Overall trail opacity
}

export const LightTrails = React.forwardRef<LightTrailsRef, LightTrailsProps>(
  (
    {
      trailCount = 150,
      trailLength = 0.15, // Base length factor, speed makes them much longer
      fieldLength = 25,
      spread = 15,
      velocityRange = [25, 50], // Correlates to fieldLength for perceived speed
      color = '#00FFFF', // Vibrant cyan
      opacity = 0.85,
      ...lineSegmentsProps
    },
    ref,
  ) => {
    const materialRef = React.useRef<THREE.ShaderMaterial>(null)
    const lineSegmentsRef = React.useRef<THREE.LineSegments>(null)

    // Expose methods to update opacity and color via ref
    React.useImperativeHandle(ref, () => {
      if (!lineSegmentsRef.current) {
        throw new Error('LineSegments ref is not initialized')
      }

      const lineSegments = lineSegmentsRef.current
      const material = materialRef.current
      return Object.assign(lineSegments, {
        updateOpacity: (newOpacity: number) => {
          if (!material) return
          material.uniforms.u_opacity.value = newOpacity
        },
        updateColor: (newColor: THREE.ColorRepresentation) => {
          if (!material) return
          ;(material.uniforms.u_color.value as THREE.Color).set(newColor)
        },
      })
    }, []) // Empty dependency array as refs are stable once assigned

    // Memoize line positions and speeds to avoid recalculation on every render
    const { linePositions, lineSpeeds } = React.useMemo(() => {
      const positions = new Float32Array(trailCount * 3 * 2) // Each line has 2 vertices, each vertex has 3 coords
      const speeds = new Float32Array(trailCount)

      for (let i = 0; i < trailCount; i++) {
        const x = (Math.random() - 0.5) * spread
        const y = (Math.random() - 0.5) * spread

        // Start position of the line segment
        positions[i * 6 + 0] = x
        positions[i * 6 + 1] = y
        positions[i * 6 + 2] = -fieldLength / 2 // Back of the field

        // End position of the line segment
        positions[i * 6 + 3] = x
        positions[i * 6 + 4] = y
        positions[i * 6 + 5] = fieldLength / 2 // Front of the field

        // Assign a random speed within the specified range
        const minSpeed = velocityRange[0]
        const maxSpeed = velocityRange[1]
        speeds[i] = minSpeed + Math.random() * (maxSpeed - minSpeed)
      }
      return { linePositions: positions, lineSpeeds: speeds }
    }, [trailCount, spread, fieldLength, velocityRange])

    // Memoize base trail lengths (randomized for variety)
    const baseTrailLengthsArray = React.useMemo(() => {
      const lengths = new Float32Array(trailCount)
      for (let i = 0; i < trailCount; i++) {
        // 'trailLength' prop influences the randomness of base lengths
        lengths[i] = 0.02 + Math.random() * trailLength // Short base, speed will elongate
      }
      return lengths
    }, [trailCount, trailLength])

    // Update shader time uniform on each frame
    useFrame((state) => {
      // 'state' provides clock, camera, etc.
      if (materialRef.current) {
        materialRef.current.uniforms.u_time.value = state.clock.elapsedTime
      }
    })

    // Memoize the shader uniforms
    const uniforms = React.useMemo(() => {
      return {
        u_color: { value: new THREE.Color(color) },
        u_time: { value: 0 }, // Initial time
        u_opacity: { value: opacity },
        u_speeds: { value: lineSpeeds },
        u_trailLengths: { value: baseTrailLengthsArray },
        u_minSpeed: { value: velocityRange[0] },
        u_maxSpeed: { value: velocityRange[1] },
        u_fieldLength: { value: fieldLength },
      }
    }, [
      color,
      opacity,
      fieldLength,
      lineSpeeds,
      baseTrailLengthsArray,
      velocityRange,
    ])

    // Memoize instance indices (identifies each line for the shader)
    const instanceIndices = React.useMemo(() => {
      const indices = new Float32Array(trailCount * 2) // Each line segment vertex needs an index
      for (let i = 0; i < trailCount; i++) {
        indices[i * 2] = i // Index for the start vertex of the line
        indices[i * 2 + 1] = i // Index for the end vertex of the line
      }
      return indices
    }, [trailCount])

    return (
      <lineSegments ref={lineSegmentsRef} {...lineSegmentsProps}>
        <bufferGeometry>
          {/* Position attribute for line vertices */}
          <bufferAttribute
            attach='attributes-position'
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
            usage={THREE.StaticDrawUsage} // Optimization: geometry doesn't change
          />
          {/* Custom attribute for instance index */}
          <bufferAttribute
            attach='attributes-instanceIndex'
            count={instanceIndices.length}
            array={instanceIndices}
            itemSize={1}
            usage={THREE.StaticDrawUsage} // Optimization
          />
        </bufferGeometry>
        {/* Use the R3F shaderMaterial component instead of primitive */}
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={LIGHTTRAILS_VERTEX_SHADER}
          fragmentShader={LIGHTTRAILS_FRAGMENT_SHADER(trailCount)}
          transparent={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={true}
        />
      </lineSegments>
    )
  },
)

LightTrails.displayName = 'LightTrails'
