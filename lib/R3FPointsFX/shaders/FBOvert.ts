import { DEFAULT_PROGRESS_MODIFIER } from './progressModifier'

export const FBOvert = (progressModifier?: string) => `
uniform float uTransitionProgress;

varying vec2 vUv;
varying float vTransitionProgress;

${progressModifier ? progressModifier : DEFAULT_PROGRESS_MODIFIER}

void main() {
  vUv = uv;
  vTransitionProgress = progressModifier(uTransitionProgress);

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}
`
