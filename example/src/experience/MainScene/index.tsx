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

import { useTheme } from '@/providers/ThemeProvider'

import { useNormalizedMousePosition } from '../hooks/useNormalizedMousePosition'
import type { LightTrailsRef } from './LightTrails'
import { LightTrails } from './LightTrails'

const VertexModifier = `
  uniform vec3 uCursor;

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

    return result;
  }
`

const FragmentModifier = `
  uniform sampler2D uCircleMap;

  vec4 modifier(int index){
    float alpha = texture2D(uCircleMap, gl_PointCoord).r * 3.0;

    vec4 result = vec4(uColor, uAlpha * alpha);
    return result;
  }
`

const SPHERE = new THREE.Mesh(
  new THREE.SphereGeometry(1.5, 32, 16),
  new THREE.MeshBasicMaterial(),
)

const COLORS = {
  base: {
    light: new THREE.Color('#000000'),
    dark: new THREE.Color('#00ff00'),
  },
}

GSAP.registerPlugin(ScrollTrigger)

export const MainScene = () => {
  const circleTexture = useTexture('circle_05.png')
  const { nodes } = useGLTF('rocket.glb') as RocketGLTFResult
  const { raycaster, camera } = useThree()
  const { themeValue } = useTheme()
  const pointer = useNormalizedMousePosition()

  const fxRef = React.useRef<R3FPointsFXRefType>(null)
  const lightTrailsRef = React.useRef<LightTrailsRef>(null)
  const shakeRef = React.useRef<ShakeController>(null)

  const plane = React.useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const cursor3D = React.useRef(new THREE.Vector3())

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

  // movement animations
  React.useEffect(() => {
    const pointsMesh = fxRef.current?.getPointsMesh()
    const section2 = document.getElementById('home-section-2')
    const section3 = document.getElementById('home-section-3')
    if (!section2 || !section3 || !pointsMesh) return

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
    })

    return () => ctx.revert()
  }, [])

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
          uCursor: new THREE.Vector3(),
        }}
        modelA={0}
        modelB={0}
        models={[SPHERE, nodes.Rocket]}
        pointsCount={15000}
        baseColor={themeValue === 'dark' ? COLORS.base.dark : COLORS.base.light}
        pointSize={0.1}
        alpha={0.6}
        sizeAttenutation={true}
        fragmentModifier={FragmentModifier}
        vertexModifier={VertexModifier}
        organizedParticleIndexes={[1]}
      />
      <LightTrails
        ref={lightTrailsRef}
        trailCount={500}
        fieldLength={10}
        spread={10}
        velocityRange={[100, 160]}
        color={themeValue === 'dark' ? COLORS.base.dark : COLORS.base.light}
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
