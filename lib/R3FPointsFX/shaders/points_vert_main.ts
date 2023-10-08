export default `
void main(){
  vec3 texture_data = texture2D(uPositions, position.xy).xyz;
  vec3 particle_positions = position_calc(texture_data, uTime);

  vPosition = particle_positions;

  vec4 mvPosition = modelViewMatrix * vec4( particle_positions, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
  float distance_to_camera = length(mvPosition.xyz);
  float adjustedSize = point_size(distance_to_camera, uTime);
  gl_PointSize = adjustedSize;
}
`
