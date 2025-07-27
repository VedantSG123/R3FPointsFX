import type { SandpackFile } from '@codesandbox/sandpack-react'

const starTextureCode = `// Star shaped texture, I have created using canvas, but you free to load
// you alpha maps png/jpeg as three texture
import * as THREE from "three";

// AI Generated code :)
// Star texture generator with specified parameters
const POINTS = 12;
const INNER_RADIUS = 0.3;
const OUTER_RADIUS = 0.8;
const SOFTNESS = 11;
const SIZE = 128; // Texture size in pixels

function createStarPath(
  centerX: number,
  centerY: number,
  points: number,
  innerRadius: number,
  outerRadius: number
): Path2D {
  const path = new Path2D();
  const angleStep = (Math.PI * 2) / (points * 2);

  for (let i = 0; i < points * 2; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    if (i === 0) {
      path.moveTo(x, y);
    } else {
      path.lineTo(x, y);
    }
  }

  path.closePath();
  return path;
}

function generateStarTexture(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2D context from canvas");
  }

  const size = SIZE;
  const centerX = size / 2;
  const centerY = size / 2;
  const innerRadius = INNER_RADIUS * size * 0.5;
  const outerRadius = OUTER_RADIUS * size * 0.5;

  // Set canvas size
  canvas.width = canvas.height = size;

  // Clear canvas (transparent background)
  ctx.clearRect(0, 0, size, size);

  // Create radial gradient for soft edges
  const maxRadius = Math.max(outerRadius + SOFTNESS, size * 0.5);
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    maxRadius
  );
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.7, "rgba(255, 255, 255, 0.8)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  // Create star path
  const starPath = createStarPath(
    centerX,
    centerY,
    POINTS,
    innerRadius,
    outerRadius
  );

  // Apply soft glow effect
  if (SOFTNESS > 0) {
    ctx.save();
    ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
    ctx.shadowBlur = SOFTNESS;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fill(starPath);
    ctx.restore();
  }

  // Fill the star with gradient
  ctx.save();
  ctx.clip(starPath);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();

  // Add crisp star outline
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fill(starPath);

  return canvas;
}

export function createStarTextureAsThreeTexture(): THREE.Texture {
  if (typeof document === "undefined") {
    throw new Error(
      "This function can only be called in a browser environment"
    );
  }
  // Create a canvas element
  const canvas = document.createElement("canvas");

  // Generate the star texture on the canvas
  generateStarTexture(canvas);

  // Create a Three.js texture from the canvas
  const texture = new THREE.CanvasTexture(canvas);

  // Configure texture properties
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBAFormat;
  texture.premultiplyAlpha = true;

  return texture;
}
`

const vertexModifierCode = `export const vertexModifier = \`
attribute vec3 aPositionOffset;

VertexProperties modifier(vec3 pos, float progress){
    pos.x += sin(aPositionOffset.x * uTime) * 0.015;
    pos.y += cos(aPositionOffset.y * uTime) * 0.015;
    pos.z += sin(aPositionOffset.z * uTime) * 0.015;

    VertexProperties result;
    result.position = pos;
    result.pointSize = uPointSize;
    result.progress = progress;

    return result; 
}
\`;
`

const fragmentModifierCode = `export const fragmentModifier = \`
// the uniforms which I have passed as props I can declare and use
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform sampler2D uStarTexture;

// my custom function I want to use for computation
vec3 angleMix(vec3 position) {
    float pi = asin(1.0) * 2.0;
    float angle = atan(position.z, position.x) + pi;
    float segment = angle / (2.0 * pi) * 3.0; // 3 color segments
    float t = fract(segment);
    
    if (segment < 1.0) return mix(uColor1, uColor2, t);
    if (segment < 2.0) return mix(uColor2, uColor3, t);
    return mix(uColor3, uColor1, t);
}

vec3 linearMix(vec3 position) {
    // Normalize x from [-1.5, 1.5] to [0, 1]
    float t = (position.x + 1.5) / 3.0;
    t = clamp(t, 0.0, 1.0);
    
    // Scale to [0, 2] for three-color blending
    float scaled = t * 2.0;
    
    if (scaled <= 1.0) {
        // First half: blend from uColor1 to uColor2
        return mix(uColor1, uColor2, scaled);
    } else {
        // Second half: blend from uColor2 to uColor3
        return mix(uColor2, uColor3, scaled - 1.0);
    }
}

// vPosition is already available in fragment modifier code
vec3 colorCalc(int index){
    // three js logo mesh
    if(index == 1) return linearMix(vPosition);
    // sphere mesh
    if(index == 2) return angleMix(vPosition);
    return uColor;
}

float aplhaCalc(int index){
    vec2 uv = gl_PointCoord;
    
    // for sphere and suzanne mesh star shaped particles
    if(index == 2 || index == 0){
        return texture(uStarTexture, uv).a;
    }
    
    // default to circle shape
    float distanceFromCenter = length(uv - 0.5);
    float alpha = ceil(max(0.5 - distanceFromCenter, 0.0));

    return alpha;
}

vec4 modifier(int index){
    float alpha = aplhaCalc(index);
    vec3 color = colorCalc(index);
    vec4 result = vec4(color, uAlpha * alpha);
    return result;
}
\`;
`
const generateRandomnessArrayCode = `export const generateRandomnessArray = (size: number, max: number = 1) => {
  const length = size * 3;
  const data = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const stride = i * 3;

    data[stride] = Math.random() * max;
    data[stride + 1] = Math.random() * max;
    data[stride + 2] = Math.random() * max;
  }
  return data;
};
`

const simplexNoiseCode = `export const simplexNoise = \`
//
// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
  }
\`;
`

const progressModifierCode = `import { simplexNoise } from "./simplexNoise";

export const progressModifier = \`
  \${simplexNoise}

  float progressModifier(vec3 origin, vec3 target, float progress){
    float noiseOrigin = snoise(origin);
    float noiseTarget = snoise(target);
    float noise = mix(noiseOrigin, noiseTarget, progress);
    noise = smoothstep(-1.0, 1.0, noise);

    float duration = 0.6;

    float delay = (1.0 - duration) * noise;
    float end = delay + duration;
    float newProgress = smoothstep(delay, end, progress);

    return newProgress;
  }
\`;
`
const AppCode = `import * as THREE from "three";
import * as React from "react";
import GSAP from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Canvas, useFrame } from "@react-three/fiber";
import { R3FPointsFX } from "r3f-points-fx";
import { OrbitControls } from "@react-three/drei";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import type { R3FPointsFXRefType } from "r3f-points-fx";
import { fragmentModifier } from "./fragmentModifier";
import { vertexModifier } from "./vertexModifier";
import { progressModifier } from "./progressModifier";
import { createStarTextureAsThreeTexture } from "./starTexture";
import { generateRandomnessArray } from "./generateRandomnessArray";
import "./scene.css";
import "./scrollMorph.css";

GSAP.registerPlugin(ScrollTrigger);

const SPHERE = new THREE.Mesh(
  new THREE.SphereGeometry(1.1, 32, 16),
  new THREE.MeshBasicMaterial()
);

const COLORS = {
  base: new THREE.Color("#9333ea"),
  color1: new THREE.Color("#60a5fa"),
  color2: new THREE.Color("#FF4B91"),
  color3: new THREE.Color("#FFCD4B"),
};

const STAR_TEXTURE = createStarTextureAsThreeTexture();

const POINTS_COUNT = 15000;

const Particles = () => {
  const { nodes } = useGLTF("${import.meta.env.VITE_FRONTEND_URL}/suzanne.glb") as unknown as SuzanneGLTFResult;
  const { nodes: threejsNodes } = useGLTF(
    "${import.meta.env.VITE_FRONTEND_URL}/threejs.glb"
  ) as unknown as ThreejsGLTFResult;
  const fxRef = React.useRef<R3FPointsFXRefType>(null);

  const models = React.useMemo(() => {
    return [nodes.Suzanne, threejsNodes.threejs, SPHERE];
  }, [nodes, threejsNodes]);

  const randomPositionOffset = React.useMemo(() => {
    return generateRandomnessArray(POINTS_COUNT, 2);
  }, []);

  // transitions
  React.useEffect(() => {
    const section2 = document.getElementById("section-2");
    const section3 = document.getElementById("section-3");
    if (!section2 || !section3 || !fxRef.current) {
      return;
    }

    const ctx = GSAP.context(() => {
      // transition 1
      GSAP.timeline({
        scrollTrigger: {
          trigger: section2,
          start: "top bottom",
          end: "top top",
          scrub: 1,
          onUpdate: (self) => {
            fxRef.current?.updateProgress(self.progress);
          },
          onEnter: () => {
            fxRef.current?.setModelB(1);
          },
          onLeave: () => {
            fxRef.current?.setModelA(1);
          },
          onEnterBack: () => {
            fxRef.current?.setModelA(0);
          },
          onLeaveBack: () => {
            fxRef.current?.setModelB(0);
          },
        },
      });

      // transition 2
      GSAP.timeline({
        scrollTrigger: {
          trigger: section3,
          start: "top bottom",
          end: "top top",
          scrub: 1,
          onUpdate: (self) => {
            fxRef.current?.updateProgress(self.progress);
          },
          onEnter: () => {
            fxRef.current?.setModelB(2);
          },
          onLeave: () => {
            fxRef.current?.setModelA(2);
          },
          onEnterBack: () => {
            fxRef.current?.setModelA(1);
          },
          onLeaveBack: () => {
            fxRef.current?.setModelB(1);
          },
        },
      });
    });

    return () => {
      ctx.revert();
    };
  }, []);

  useFrame(({ clock }) => {
    fxRef.current?.updateTime(clock.elapsedTime);
  });

  return (
    <R3FPointsFX
      ref={fxRef}
      scale={[2.5, 2.5, 2.5]}
      position={[0, 0, 0]}
      pointsCount={POINTS_COUNT}
      pointSize={0.2}
      organizedParticleIndexes={[0]} // particles will arrange at exact vertex positions for suzanne mesh
      models={models}
      modelA={0}
      modelB={0}
      baseColor={COLORS.base}
      sizeAttenutation={true}
      alpha={0.5}
      uniforms={{
        uColor1: COLORS.color1,
        uColor2: COLORS.color2,
        uColor3: COLORS.color3,
        uStarTexture: STAR_TEXTURE,
      }}
      fragmentModifier={fragmentModifier}
      vertexModifier={vertexModifier}
      progressModifier={progressModifier}
      attributes={[
        {
          array: randomPositionOffset,
          itemSize: 3,
          attach: "attributes-aPositionOffset",
        },
      ]}
    />
  );
};

const SceneContent = () => {
  return (
    <>
      <Particles />
      <OrbitControls />
    </>
  );
};

const PageContent = () => {
  return (
    <>
      <div className="content-div" id="section-1">
        Section 1
      </div>
      <div className="content-div" id="section-2">
        Section 2
      </div>
      <div className="content-div" id="section-3">
        Section 3
      </div>
    </>
  );
};

const Scene = () => {
  return (
    <>
      <div className="canvas-wrapper">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <SceneContent />
        </Canvas>
      </div>
      <PageContent />
    </>
  );
};

type SuzanneGLTFResult = GLTF & {
  nodes: {
    Suzanne: THREE.Mesh;
  };
  materials: object;
};

type ThreejsGLTFResult = GLTF & {
  nodes: {
    threejs: THREE.Mesh;
  };
  materials: object;
};

export default Scene;

`

const scrollMorphCss = `
* {
  margin: 0;
  padding: 0;
}

.canvas-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -5;
}

.content-div {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  font-size: 2rem;
  font-weight: 600;
  color: #ffffff;
}
`

const scrollMorphFiles: Record<string, SandpackFile> = {
  '/App.tsx': { code: AppCode, active: true },
  '/progressModifier.ts': { code: progressModifierCode, active: true },
  '/vertexModifier.ts': { code: vertexModifierCode, active: true },
  '/fragmentModifier.ts': { code: fragmentModifierCode, active: true },
  '/simplexNoise.ts': { code: simplexNoiseCode, active: true },
  '/scrollMorph.css': { code: scrollMorphCss, active: true },
  '/generateRandomnessArray.ts': {
    code: generateRandomnessArrayCode,
    active: true,
  },
  '/starTexture.ts': { code: starTextureCode, active: true },
}

export default scrollMorphFiles
