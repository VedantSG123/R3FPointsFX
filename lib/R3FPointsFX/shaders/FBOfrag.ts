const DEFAULT_PROGRESS_MODIFIER = `
  float progressModifier(vec3 origin, vec3 target, float progress){
    return progress;
  }
`

export const FBOfrag = (progressModifier?: string) => `
  uniform float uTransitionProgress;
  uniform sampler2D positionsA;
  uniform sampler2D positionsB;
  uniform int uModel1;
  uniform int uModel2;

  varying vec2 vUv;

  ${progressModifier ? progressModifier : DEFAULT_PROGRESS_MODIFIER}

  void main() {
    vec3 model1 = texture2D(positionsA, vUv).rgb;
    vec3 model2 = texture2D(positionsB, vUv).rgb;

    float progress = progressModifier(model1, model2, uTransitionProgress);
    vec3 pos = mix(model1, model2, progress);

    gl_FragColor = vec4(pos, progress);
  }
`
