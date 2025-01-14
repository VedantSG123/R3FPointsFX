export default `
uniform sampler2D positionsA;
uniform sampler2D positionsB;
uniform float uTransitionProgress;
uniform float uFrequency;

varying vec2 vUv;

void main() {
  
  vec3 model1 = texture2D(positionsA, vUv).rgb;
  vec3 model2 = texture2D(positionsB, vUv).rgb;

  vec3 pos = mix(model1, model2, uTransitionProgress);

  gl_FragColor = vec4(pos, 1.0);
}
`
