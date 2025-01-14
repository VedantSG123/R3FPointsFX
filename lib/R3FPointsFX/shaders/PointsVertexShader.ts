const DEFAULT_MODIFIER_CODE = `
VertexProperties modifier(vec3 pos){
  VertexProperties result;
  result.position = pos;
  result.pointSize = uPointSize;

  return result;
}
`

export const PointsVertexShader = (modifierCode?: string) => {
  return `
uniform sampler2D uPosition;
uniform float uTime;
uniform float uPointSize;
uniform vec3 uColor;
uniform float uAlpha;
uniform float uTransitionProgress;
uniform int uModel1;
uniform int uModel2;

varying vec3 vPosition;


struct VertexProperties {
  vec3 position;
  float pointSize;
};


${modifierCode ? modifierCode : DEFAULT_MODIFIER_CODE}


void main(){
  vec3 pos = texture2D(uPosition, position.xy).xyz;
  VertexProperties res = modifier(pos);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(res.position,  1.0);
  gl_PointSize = res.pointSize;
  vPosition = res.position;
}
`
}
