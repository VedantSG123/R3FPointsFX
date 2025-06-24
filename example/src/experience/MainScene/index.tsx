import type { ShakeController } from '@react-three/drei'
import { CameraShake, useGLTF, useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import GSAP from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import type { R3FPointsFXRefType } from 'r3f-points-fx'
import { R3FPointsFX } from 'r3f-points-fx'
import * as React from 'react'
import * as THREE from 'three'
import type { GLTF } from 'three-stdlib'

import { useNormalizedMousePosition } from '../hooks/useNormalizedMousePosition'
import { createCircleSpriteTexture } from '../Sprites/Circle'
import type { LightTrailsRef } from './LightTrails'
import { LightTrails } from './LightTrails'

const VertexModifier = `
  uniform vec3 uCursor;
  attribute vec3 aColor;
  varying vec3 vColor;

  VertexProperties modifier(vec3 pos, float progress){
    vec4 wPos = modelMatrix * vec4(vec3(0), 1.0);
    vec3 cursor = vec3(uCursor.xy, wPos.z);

    vec2 diff = pos.xy - cursor.xy;
    float distance = length(diff);
    float distTpc = (1. - smoothstep(0.0, 0.75, distance));

    pos.xyz += normalize(vec3(diff, 1.0)) * distTpc * 0.2;

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
  uniform sampler2D uBlobMap;
  varying vec3 vColor;

  vec4 modifier(int index){
    float alpha = texture2D(uCircleMap, gl_PointCoord).a;

    if(index == 2){
      alpha = texture2D(uBlobMap, gl_PointCoord).a * 2.0;
    }

    vec4 result = vec4(vColor, uAlpha * alpha);
    return result;
  }
`

const POINTS_COUNT = 15000

const SPHERE = new THREE.Mesh(
  new THREE.SphereGeometry(1.5, 32, 16),
  new THREE.MeshBasicMaterial(),
)

const ParticleColors = {
  particleColor1: new THREE.Color('#51a2ff'),
  particleColor2: new THREE.Color('#9810fa'),
}

GSAP.registerPlugin(ScrollTrigger)

export const MainScene = () => {
  const circleTexture = createCircleSpriteTexture({
    size: 64,
    color: '#ffffff',
  })

  const starTexture = useTexture('jellyfish_glow.png')
  starTexture.rotation = Math.PI / 2

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

  const plane = React.useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const cursor3D = React.useRef(new THREE.Vector3())

  const colors = React.useMemo(() => {
    const colors = new Float32Array(POINTS_COUNT * 3)
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

  useFrame(() => {
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
    }
  })

  //transition 1
  React.useEffect(() => {
    const section3 = document.getElementById('home-section-3')
    if (!section3 || !fxRef.current) return

    const ctx = GSAP.context(() => {
      GSAP.timeline({
        scrollTrigger: {
          trigger: section3,
          start: 'top bottom',
          end: 'top top',
          scrub: 1,
          onUpdate: (self) => {
            fxRef.current?.updateProgress(self.progress)
            lightTrailsRef.current?.updateOpacity(
              (Math.max(0, self.progress - 0.7) / 0.3) * 0.5,
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

    const ctx = GSAP.context(() => {
      GSAP.timeline({
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

    const ctx = GSAP.context(() => {
      GSAP.timeline({
        scrollTrigger: {
          trigger: section4,
          start: 'top bottom',
          end: 'top top',
          scrub: 1,
          onUpdate: (self) => {
            fxRef.current?.updateProgress(self.progress)
            lightTrailsRef.current?.updateOpacity(
              Math.max(0, 1 - self.progress / 0.3) * 0.5,
            )
            if (shakeRef.current) {
              shakeRef.current.setIntensity(self.progress >= 0.3 ? 0 : 1)
            }
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

  // movement animations
  React.useEffect(() => {
    const pointsMesh = fxRef.current?.getPointsMesh()
    const section2 = document.getElementById('home-section-2')
    const section3 = document.getElementById('home-section-3')
    const section4 = document.getElementById('home-section-4')

    if (!section2 || !section3 || !section4 || !pointsMesh) return

    const ctx = GSAP.context(() => {
      const timeline1 = GSAP.timeline({
        scrollTrigger: {
          trigger: section2,
          start: 'top bottom',
          end: 'top top',
          scrub: true,
        },
      })

      const timeline2 = GSAP.timeline({
        scrollTrigger: {
          trigger: section3,
          start: 'top bottom',
          end: 'top top',
          scrub: true,
        },
      })

      const timeline3 = GSAP.timeline({
        scrollTrigger: {
          trigger: section4,
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
          },
          1,
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

      <R3FPointsFX
        position={[0, 0, 6]}
        ref={fxRef}
        uniforms={{
          uCircleMap: circleTexture,
          uBlobMap: starTexture,
          uCursor: new THREE.Vector3(),
        }}
        attributes={[
          {
            array: colors,
            itemSize: 3,
            attach: 'attributes-aColor',
          },
        ]}
        modelA={0}
        modelB={0}
        models={[SPHERE, Rocket, Jellyfish, Dna]}
        pointsCount={POINTS_COUNT}
        pointSize={0.2}
        alpha={0.3}
        sizeAttenutation={true}
        fragmentModifier={FragmentModifier}
        vertexModifier={VertexModifier}
        organizedParticleIndexes={[1]}
      />

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
