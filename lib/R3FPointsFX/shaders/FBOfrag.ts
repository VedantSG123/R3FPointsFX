export const FBOfrag = `
  uniform sampler2D positionsA;
  uniform sampler2D positionsB;

  varying vec2 vUv;
  varying float vTransitionProgress;


  void main() {
    
    vec3 model1 = texture2D(positionsA, vUv).rgb;
    vec3 model2 = texture2D(positionsB, vUv).rgb;

    vec3 pos = mix(model1, model2, vTransitionProgress);

    gl_FragColor = vec4(pos, vTransitionProgress);
  }
`
