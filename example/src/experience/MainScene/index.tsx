import type { ShakeController } from '@react-three/drei'
import { CameraShake, useGLTF, useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import type { R3FPointsFXRefType } from 'r3f-points-fx'
import { R3FPointsFX } from 'r3f-points-fx'
import { nextPerfectSquare } from 'r3f-points-fx'
import * as React from 'react'
import * as THREE from 'three'
import type { GLTF } from 'three-stdlib'

import { useCustomEventListener } from '@/hooks/useCustomEvents'
import type { ArrangeMode } from '@/types'

import { useNormalizedMousePosition } from '../hooks/useNormalizedMousePosition'
import { simplexNoise } from '../shaders/simplexNosie'
import { createCircleSpriteTexture } from '../Sprites/Circle'
import { generateRandomnessArray } from '../utils/generateRandomnessArray'
import type { LightTrailsRef } from './LightTrails'
import { LightTrails } from './LightTrails'

const VertexModifier = `
  uniform vec3 uCursor;
  uniform float uBulgeIntensity;
  uniform float uRandomMovementIntensity;
  attribute vec3 aColor;
  attribute vec3 aPositionOffset;
  varying vec3 vColor;

  VertexProperties modifier(vec3 pos, float progress){
    vec4 wPos = modelMatrix * vec4(vec3(0), 1.0);
    vec3 cursor = vec3(uCursor.xy, wPos.z);

    vec2 diff = pos.xy - cursor.xy;
    float distance = length(diff);
    float distTpc = (1. - smoothstep(0.0, 0.75, distance));

    pos.xyz += normalize(vec3(diff, 1.0)) * distTpc * uBulgeIntensity;

    pos.x += sin(aPositionOffset.x * uTime) * uRandomMovementIntensity;
    pos.y += cos(aPositionOffset.y * uTime) * uRandomMovementIntensity;
    pos.z += sin(aPositionOffset.z * uTime) * uRandomMovementIntensity;

    VertexProperties result;
    result.position = pos;
    result.pointSize = uPointSize;
    result.progress = progress;

    vColor = aColor;

    return result;
  }
`

const FragmentModifier = `
  uniform sampler2D uCircleMap;
  uniform sampler2D uJellyfishMap;
  uniform sampler2D uHeartMap;
  varying vec3 vColor;

  vec4 modifier(int index){
    float alpha = texture2D(uCircleMap, gl_PointCoord).a;

    if(index == 2){
      alpha = texture2D(uJellyfishMap, gl_PointCoord).a * 2.0;
    }

    if(index == 3 || index == 4){
      alpha = texture2D(uHeartMap, gl_PointCoord).a * 2.0;
    }

    vec4 result = vec4(vColor, uAlpha * alpha);
    return result;
  }
`

const ProgressModifier = `
  ${simplexNoise}

  float progressModifier(vec3 origin, vec3 target, float progress){
    float noiseOrigin = snoise(origin);
    float noiseTarget = snoise(target);
    float noise = mix(noiseOrigin, noiseTarget, progress);
    noise = smoothstep(-1.0, 1.0, noise);

    float duration = 0.1;

    if((uModel1 == 1 && uModel2 == 2) || (uModel1 == 2 && uModel2 == 1)){
      duration = 0.6;
    }

    float delay = (1.0 - duration) * noise;
    float end = delay + duration;
    float newProgress = smoothstep(delay, end, progress);

    return newProgress;
  }
`

const POINTS_COUNT = 15000

const MOUSE_BULGE_INTENSITY = 0.2
const RANDOM_MOVEMENT_INTENSITY = 0.015

const ARRANGE_MODES: Record<ArrangeMode, number> = {
  vertex: 3,
  random: 4,
} as const

const SPHERE = new THREE.Mesh(
  new THREE.SphereGeometry(1.5, 32, 16),
  new THREE.MeshBasicMaterial(),
)

const ParticleColors = {
  particleColor1: new THREE.Color('#51a2ff'),
  particleColor2: new THREE.Color('#9810fa'),
}

export const MainScene = () => {
  const circleTexture = createCircleSpriteTexture({
    size: 64,
    color: '#ffffff',
  })

  const jellyfishTexture = useTexture('jellyfish_glow.png')
  const heartTexture = useTexture('heart.png')

  const {
    nodes: { Rocket },
  } = useGLTF('rocket.glb') as RocketGLTFResult
  const {
    nodes: { Dna },
  } = useGLTF('dna.glb') as DnaGLTFResult
  const {
    nodes: { Jellyfish },
  } = useGLTF('jellyfish.glb') as JellyfishGLTFResult

  const { raycaster, camera } = useThree()
  const pointer = useNormalizedMousePosition()

  const fxRef = React.useRef<R3FPointsFXRefType>(null)
  const lightTrailsRef = React.useRef<LightTrailsRef>(null)
  const shakeRef = React.useRef<ShakeController>(null)
  const lastGeometryIndexRef = React.useRef<number>(3)
  const modeChangeModelA = React.useRef<number>(3)
  const modeChangeModelB = React.useRef<number>(3)
  const modeChangeProgressRef = React.useRef<number>(1)
  const animationRef = React.useRef<gsap.core.Tween | null>(null)
  const pointsGroupRef = React.useRef<THREE.Group | null>(null)

  const plane = React.useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const cursor3D = React.useRef(new THREE.Vector3())

  const colors = React.useMemo(() => {
    const colors = new Float32Array(nextPerfectSquare(POINTS_COUNT) * 3)
    for (let i = 0; i < POINTS_COUNT; i++) {
      const mixFactor = Math.random()
      const color = new THREE.Color().lerpColors(
        ParticleColors.particleColor1,
        ParticleColors.particleColor2,
        mixFactor,
      )
      color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.3)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    return colors
  }, [])

  const randomPositionOffset = React.useMemo(() => {
    return generateRandomnessArray(nextPerfectSquare(POINTS_COUNT), 2)
  }, [])

  useFrame(({ clock }) => {
    raycaster.setFromCamera(pointer.current, camera)

    const pointsMesh = fxRef.current?.getPointsMesh()
    if (pointsMesh) {
      const normal = new THREE.Vector3(0, 0, 1)
      normal.applyQuaternion(pointsMesh.quaternion)
      plane.current.setFromNormalAndCoplanarPoint(normal, pointsMesh.position)
    }

    raycaster.ray.intersectPlane(plane.current, cursor3D.current)

    if (fxRef.current) {
      const pointsMesh = fxRef.current.getPointsMesh()

      if (pointsMesh && pointsMesh.material instanceof THREE.ShaderMaterial) {
        ;(
          pointsMesh.material.uniforms.uCursor as THREE.IUniform<THREE.Vector3>
        ).value.set(cursor3D.current.x, cursor3D.current.y, cursor3D.current.z)
      }

      fxRef.current.updateTime(clock.elapsedTime)
    }
  })

  useCustomEventListener<ArrangeMode>('mode-change', (mode) => {
    if (ARRANGE_MODES[mode] === lastGeometryIndexRef.current) return

    if (fxRef.current) {
      lastGeometryIndexRef.current = ARRANGE_MODES[mode]

      if (animationRef.current) {
        animationRef.current.kill()
      }

      // previous animation in completed
      if (modeChangeProgressRef.current === 1) {
        modeChangeModelB.current = lastGeometryIndexRef.current

        fxRef.current.setModelB(modeChangeModelB.current)
        modeChangeProgressRef.current = 0

        animationRef.current = gsap.to(modeChangeProgressRef, {
          current: 1,
          duration: 4,
          ease: 'none',
          onUpdate: () => {
            fxRef.current?.updateProgress(modeChangeProgressRef.current)
          },
          onComplete: () => {
            modeChangeModelA.current = modeChangeModelB.current
            fxRef.current?.setModelA(modeChangeModelA.current)
          },
        })
      } else {
        // we are in the middle of the transition
        if (modeChangeModelB.current !== lastGeometryIndexRef.current) {
          modeChangeModelA.current = modeChangeModelB.current
          modeChangeModelB.current = lastGeometryIndexRef.current
          modeChangeProgressRef.current = 1 - modeChangeProgressRef.current

          fxRef.current?.setModelA(modeChangeModelA.current)
          fxRef.current?.setModelB(modeChangeModelB.current)
          fxRef.current?.updateProgress(modeChangeProgressRef.current)

          animationRef.current = gsap.to(modeChangeProgressRef, {
            current: 1,
            duration: 4,
            ease: 'none',
            onUpdate: () => {
              fxRef.current?.updateProgress(modeChangeProgressRef.current)
            },
            onComplete: () => {
              modeChangeModelA.current = modeChangeModelB.current
              fxRef.current?.setModelA(modeChangeModelA.current)
            },
            paused: true,
          })

          animationRef.current.progress(modeChangeProgressRef.current).play()
        }
      }
    }
  })

  //transition 1
  React.useEffect(() => {
    const section3 = document.getElementById('home-section-3')
    if (!section3 || !fxRef.current) return

    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: section3,
          start: 'top bottom',
          end: 'top top',
          scrub: 1,
          onUpdate: (self) => {
            fxRef.current?.updateProgress(self.progress)
            lightTrailsRef.current?.updateOpacity(
              Math.min(1, self.progress / 0.7) * 0.5,
            )
            // Update shake intensity using the controller
            if (shakeRef.current) {
              shakeRef.current.setIntensity(self.progress >= 0.7 ? 1 : 0)
            }
          },
          onEnter: () => {
            fxRef.current?.setModelB(1)
          },
          onLeave: () => {
            fxRef.current?.setModelA(1)
          },
          onEnterBack: () => {
            fxRef.current?.setModelA(0)
          },
          onLeaveBack: () => {
            fxRef.current?.setModelB(0)
          },
        },
      })
    })

    return () => ctx.revert()
  }, [])

  // buffer 1 stop trails animation
  React.useEffect(() => {
    const buffer1 = document.getElementById('buffer-1')
    if (!buffer1 || !lightTrailsRef.current) return

    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: buffer1,
          start: 'top bottom',
          end: 'top top',
          scrub: 1,
          onUpdate: (self) => {
            lightTrailsRef.current?.updateOpacity(
              Math.max(0, 1 - self.progress / 0.3) * 0.5,
            )
            if (shakeRef.current) {
              shakeRef.current.setIntensity(self.progress >= 0.3 ? 0 : 1)
            }
            if (fxRef.current) {
              const pointsMesh = fxRef.current.getPointsMesh()

              if (
                pointsMesh &&
                pointsMesh.material instanceof THREE.ShaderMaterial
              ) {
                ;(
                  pointsMesh.material.uniforms
                    .uBulgeIntensity as THREE.IUniform<number>
                ).value =
                  Math.max(0, 1 - self.progress / 0.3) * MOUSE_BULGE_INTENSITY
                ;(
                  pointsMesh.material.uniforms
                    .uRandomMovementIntensity as THREE.IUniform<number>
                ).value =
                  Math.min(1, Math.max(0, self.progress - 0.3) / 0.7) *
                  RANDOM_MOVEMENT_INTENSITY
              }
            }
          },
        },
      })
    })

    return () => ctx.revert()
  }, [])

  // transition 2
  React.useEffect(() => {
    const section4 = document.getElementById('home-section-4')
    if (!section4 || !fxRef.current) return

    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: section4,
          start: 'top bottom+=500px',
          end: 'top top+=500px',
          scrub: 1,
          onUpdate: (self) => {
            fxRef.current?.updateProgress(self.progress)
          },
          onEnter: () => {
            fxRef.current?.setModelB(2)
          },
          onLeave: () => {
            fxRef.current?.setModelA(2)
          },
          onEnterBack: () => {
            fxRef.current?.setModelA(1)
          },
          onLeaveBack: () => {
            fxRef.current?.setModelB(1)
          },
        },
      })
    })

    return () => ctx.revert()
  }, [])

  // buffer-2 stop random movement of particles
  React.useEffect(() => {
    const buffer2 = document.getElementById('buffer-2')
    if (!buffer2 || !fxRef.current) return

    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: buffer2,
          start: 'top bottom',
          end: 'top top',
          scrub: 1,
          onUpdate: (self) => {
            if (fxRef.current) {
              const pointsMesh = fxRef.current.getPointsMesh()
              if (
                pointsMesh &&
                pointsMesh.material instanceof THREE.ShaderMaterial
              ) {
                ;(
                  pointsMesh.material.uniforms
                    .uRandomMovementIntensity as THREE.IUniform<number>
                ).value =
                  Math.max(0, 1 - self.progress / 0.5) *
                  RANDOM_MOVEMENT_INTENSITY
              }
            }
          },
        },
      })
    })

    return () => ctx.revert()
  }, [])

  // transition 3 with buffer 3
  React.useEffect(() => {
    const buffer3 = document.getElementById('buffer-3')
    if (!buffer3 || !fxRef.current) return

    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: buffer3,
          start: 'top bottom',
          end: 'top top',
          scrub: 1,
          onUpdate: (self) => {
            fxRef.current?.updateProgress(self.progress)
          },
          onEnter: () => {
            fxRef.current?.setModelB(lastGeometryIndexRef.current)
          },
          onLeave: () => {
            fxRef.current?.setModelA(lastGeometryIndexRef.current)
          },
          onEnterBack: () => {
            fxRef.current?.setModelA(2)
            if (animationRef.current) {
              animationRef.current.kill()
            }
          },
          onLeaveBack: () => {
            fxRef.current?.setModelB(2)
          },
        },
      })
    })

    return () => ctx.revert()
  }, [])

  // movement animations
  React.useEffect(() => {
    const pointsMesh = fxRef.current?.getPointsMesh()
    const pointsGroup = pointsGroupRef.current
    const section2 = document.getElementById('home-section-2')
    const section3 = document.getElementById('home-section-3')
    const section4 = document.getElementById('home-section-4')
    const buffer3 = document.getElementById('buffer-3')
    const section5 = document.getElementById('home-section-5')

    if (
      !section2 ||
      !section3 ||
      !section4 ||
      !buffer3 ||
      !section5 ||
      !pointsMesh ||
      !pointsGroup
    )
      return

    const ctx = gsap.context(() => {
      const timeline1 = gsap.timeline({
        scrollTrigger: {
          trigger: section2,
          start: 'top bottom',
          end: 'top top',
          scrub: true,
        },
      })

      const timeline2 = gsap.timeline({
        scrollTrigger: {
          trigger: section3,
          start: 'top bottom',
          end: 'top top',
          scrub: true,
        },
      })

      const timeline3 = gsap.timeline({
        scrollTrigger: {
          trigger: section4,
          start: 'top bottom',
          end: 'top top',
          scrub: true,
        },
      })

      const timeline4 = gsap.timeline({
        scrollTrigger: {
          trigger: buffer3,
          start: 'top bottom',
          end: 'top top',
          scrub: true,
        },
      })

      const timeline5 = gsap.timeline({
        scrollTrigger: {
          trigger: section5,
          start: 'top bottom',
          end: 'top top',
          scrub: true,
        },
      })

      timeline1.to(pointsMesh.position, {
        z: 2,
      })

      timeline2
        .to(
          pointsMesh.position,
          {
            z: 1,
          },
          0,
        )
        .to(
          pointsMesh.rotation,
          {
            x: -0.5,
            y: -0.1,
            z: -0.5,
          },
          0,
        )

      timeline3
        .to(
          pointsMesh.position,
          {
            z: 4,
            y: -0.75,
          },
          0,
        )
        .to(pointsMesh.rotation, {
          x: 0,
          y: 0,
          z: 0,
        })
        .to(
          pointsMesh.rotation,
          {
            x: 0,
            y: Math.PI * 2,
            z: 0,
          },
          1,
        )
        .to(
          pointsMesh.position,
          {
            z: 1.5,
            y: -0.25,
          },
          1,
        )

      timeline4
        .to(
          pointsMesh.position,
          {
            z: 2,
          },
          0,
        )
        .to(
          pointsGroup.rotation,
          {
            z: Math.PI * 0.2,
          },
          0,
        )

      timeline5
        .to(
          pointsMesh.position,
          {
            z: 4,
          },
          0,
        )
        .to(
          pointsMesh.rotation,
          {
            y: Math.PI * 3.5,
          },
          0,
        )
    })

    return () => ctx.revert()
  }, [camera])

  return (
    <group>
      <CameraShake
        ref={shakeRef}
        intensity={0}
        maxYaw={0.001}
        maxPitch={0.002}
        maxRoll={0.001}
        yawFrequency={8}
        pitchFrequency={8}
        rollFrequency={8}
      />
      <group ref={pointsGroupRef}>
        <R3FPointsFX
          position={[0, 0, 6]}
          ref={fxRef}
          uniforms={{
            uCircleMap: circleTexture,
            uJellyfishMap: jellyfishTexture,
            uHeartMap: heartTexture,
            uCursor: new THREE.Vector3(),
            uBulgeIntensity: MOUSE_BULGE_INTENSITY,
            uRandomMovementIntensity: RANDOM_MOVEMENT_INTENSITY,
          }}
          attributes={[
            {
              array: colors,
              itemSize: 3,
              attach: 'attributes-aColor',
            },
            {
              array: randomPositionOffset,
              itemSize: 3,
              attach: 'attributes-aPositionOffset',
            },
          ]}
          modelA={0}
          modelB={0}
          models={[SPHERE, Rocket, Jellyfish, Dna, Dna]}
          pointsCount={POINTS_COUNT}
          pointSize={0.2}
          alpha={0.3}
          sizeAttenutation={true}
          progressModifier={ProgressModifier}
          fragmentModifier={FragmentModifier}
          vertexModifier={VertexModifier}
          organizedParticleIndexes={[1, 3]}
        />
      </group>
      <LightTrails
        ref={lightTrailsRef}
        trailCount={100}
        fieldLength={10}
        spread={10}
        velocityRange={[15, 20]}
        color={ParticleColors.particleColor2}
        opacity={0}
        rotation={[Math.PI / 2 - 0.1, -0.5, -0.5]}
        position={[0, 0, 1]}
        visible={true}
      />
    </group>
  )
}

type RocketGLTFResult = GLTF & {
  nodes: {
    Rocket: THREE.Mesh
  }
  materials: object
}

type DnaGLTFResult = GLTF & {
  nodes: {
    Dna: THREE.Mesh
  }
  materials: object
}

type JellyfishGLTFResult = GLTF & {
  nodes: {
    Jellyfish: THREE.Mesh
  }
  materials: object
}
