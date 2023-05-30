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
   float sunLightFactor = max((dot(vNormalW, lightInvDirW) + 0.5) / 1.5, 0.0);
   sunLightFactor *= 0.6 + 0.4;

   float lightFactor = round(sunLightFactor * 8.) / 8.;

   //vec3 color = vColor.rgb;

   outColor = vec4(diffuseColor * lightFactor, 1.);
}