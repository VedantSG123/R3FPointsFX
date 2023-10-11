export default `
//Uniforms which you have passed must be declared here
//For example:
//uniform float uColor1;

//-----------------My uniforms--------------------------
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

//----------------------My functions--------------------
vec3 angleMix(vec3 position){
  float pi = asin(1.0) * 2.0;
  float angle = atan(position.z, position.x) + pi;
  float total = pi * 2.0;
  float scale = angle/total;
  float division = fract((scale + 1.0/6.0) * 3.0);
  division *= 6.0;
  division = clamp(division, 0.0, 1.0);
  vec3 color;
  if(angle <= total/6.0){
    color = mix(uColor3, uColor1, division);
  }else if(angle <= total/2.0){
    color = mix(uColor1, uColor2, division);
  }else if(angle <= (5.0*total)/6.0){
    color = mix(uColor2, uColor3, division);
  }else{
    color = mix(uColor3, uColor1, division);
  }
  return color;
}


//--------------------Template functions--------------------
vec3 model_color(int model_index, vec3 position, float time){
  //model index is provided to color a specific mesh in the described way
  //color the model with index 0 with uColor1
  

  if(model_index == 0 || model_index == 2){
    return angleMix(position);
  }
  vec3 color = uColor;
  return color;
}

float alpha_shape(vec2 point_cord, float alpha){
  //particle center at (0.5, 0.5)
  //by default circular particles
  //for square particles remove the below code and just return alpha
  float dist = distance(point_cord, vec2(0.5));
  float final = dist > 0.5 ? 0.0 : alpha;
  return final;
}
`
