export default `
vec3 model_color(int model_index, vec3 position, float time){
  vec3 color = uColor;
  return color;
}

float alpha_shape(vec2 point_cord, float alpha){
  //particle center at (0.5, 0.5)
  float dist = distance(point_cord, vec2(0.5));
  float final = dist > 0.5 ? 0.0 : alpha;
  return final;
}
`
