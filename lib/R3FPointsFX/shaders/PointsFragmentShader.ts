const DEFAULT_MODIOFIER_CODE = `
vec4 modifier(int index){
// index is the current active model's index in model array passed
  vec3 color = uColor;
  vec4 result = vec4(color, uAlpha);
  return result;
}
`

export const PointsFragmentShader = (modifierCode?: string) => {
  return `
  uniform vec3 uColor;
  uniform float uTime;
  uniform int uModel1;
  uniform int uModel2;
  uniform float uAlpha;
  uniform float uTransitionProgress;
  varying vec3 vPosition;

  
  ${modifierCode ? modifierCode : DEFAULT_MODIOFIER_CODE}


  void main() {
    vec4 color1 = modifier(uModel1);
    vec4 color2 = modifier(uModel2);

    gl_FragColor = mix(color1, color2, uTransitionProgress);
  }
  `
}
