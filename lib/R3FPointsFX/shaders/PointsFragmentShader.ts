const DEFAULT_MODIFIER_CODE = `
vec4 modifier(int index){
// index is the current active model's index in model array passed
// use gl_PointCoord and alpha to control the shape

  vec2 uv = gl_PointCoord;
  float distanceFromCenter = length(uv - 0.5);
  float alpha = ceil(max(0.5 - distanceFromCenter, 0.0));

  vec3 color = uColor;
  vec4 result = vec4(color, uAlpha * alpha);
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

  varying vec3 vPosition;
  varying float vTransitionProgress;
 
  ${modifierCode ? modifierCode : DEFAULT_MODIFIER_CODE}


  void main() {
    vec4 color1 = modifier(uModel1);
    vec4 color2 = modifier(uModel2);

    gl_FragColor = mix(color1, color2, vTransitionProgress);
  }
  `
}
