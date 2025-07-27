const DEFAULT_MODIFIER_CODE = `
VertexProperties modifier(vec3 pos, float progress){
  VertexProperties result;
  result.position = pos;
  result.pointSize = uPointSize;
  result.progress = progress;

  return result;
}
`

export const PointsVertexShader = (
  modifierCode?: string,
  sizeAttenuation?: boolean,
) => {
  return `
uniform sampler2D uPosition;
uniform float uTime;
uniform vec2 uViewPort;
uniform float uDpr;
uniform float uPointSize;
uniform int uModel1;
uniform int uModel2;

varying vec3 vPosition;
varying float vTransitionProgress;


struct VertexProperties {
  vec3 position;
  float pointSize;
  float progress;
};


${modifierCode || DEFAULT_MODIFIER_CODE}


void main(){
  vec4 textureData = texture2D(uPosition, position.xy);
  vec3 pos = textureData.xyz;
  float progress = textureData.w;
  VertexProperties res = modifier(pos, progress);

  vec4 modelPosition = modelMatrix * vec4(res.position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  gl_PointSize = res.pointSize * uViewPort.y * uDpr;
  ${sizeAttenuation ? `gl_PointSize *= (1.0 / abs(viewPosition.z));` : ''}
  vPosition = res.position;
  vTransitionProgress = res.progress;
}
`
}
