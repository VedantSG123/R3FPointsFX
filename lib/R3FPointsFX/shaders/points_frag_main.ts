export default `
void main() {
  vec3 color1 = model_color(uModel1, vPosition, uTime);
  vec3 color2 = model_color(uModel2, vPosition, uTime);
  float alpha = alpha_shape(gl_PointCoord, 1.0);

  vec3 colorMix = mix(color1, color2, uTransitionProgress);
  gl_FragColor = vec4(colorMix, alpha * uAlpha1);
}
`
