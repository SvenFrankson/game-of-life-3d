#version 300 es
precision highp float;
 
uniform vec3 lightInvDirW;
uniform vec3 diffuseColor;

in vec3 vPositionW;
in vec3 vNormalW;
in vec2 vUv;
in vec4 vColor;

out vec4 outColor;
 
void main() {
   float sunLightFactor = (dot(vNormalW, lightInvDirW) + 1.) / 2.;

   float lightFactor = round(sunLightFactor) * 0.5 + 0.5;

   //vec3 color = vColor.rgb;

   outColor = vec4(diffuseColor * lightFactor, 1.);
}