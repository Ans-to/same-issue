import * as THREE from 'three';

// 3-D simplex noise (Stefan Gustavson / Ashima Arts, MIT).
const simplex = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
 const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
 vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
 vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
 vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
 i=mod289(i); vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
 float n_=1.0/7.0; vec3 ns=n_*D.wyz-D.xzx; vec4 j=p-49.0*floor(p*ns.z*ns.z);
 vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_); vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy;
 vec4 h=1.0-abs(x)-abs(y); vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
 vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
 vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
 vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
 vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
 p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
 vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
 return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

// Patch the physically lit standard shader rather than replacing lighting,
// shadowing and fog. World-space noise makes instance variation continuous.
export function weatheredMaterial({ color, moss = 0, metalness = 0, roughness = 0.8, side = THREE.FrontSide, water = false }) {
  const material = new THREE.MeshStandardMaterial({ color, metalness, roughness, side });
  const time = { value: 0 };
  material.userData.time = time;
  material.onBeforeCompile = shader => {
    if (water) shader.uniforms.waterTime = time;
    shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>\nvarying vec3 vWeatherWorld;\nvarying float vWeatherNoise;\n${simplex}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n vWeatherNoise = snoise(position * 3.1); transformed += objectNormal * vWeatherNoise * 0.003;`)
      .replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
        vec4 weatherPosition = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          weatherPosition = instanceMatrix * weatherPosition;
        #endif
        vWeatherWorld = (modelMatrix * weatherPosition).xyz;`);
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vWeatherWorld;\nvarying float vWeatherNoise;\n${water ? 'uniform float waterTime;' : ''}\n${simplex}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float broad = vWeatherNoise;
        float fine = snoise(vWeatherWorld * 8.0);
        float grain = clamp(0.90 + broad * 0.13 + fine * 0.08, 0.55, 1.2);
        diffuseColor.rgb *= grain;
        float mossMask = smoothstep(0.12, 0.65, broad * 0.5 + 0.55 * fine);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.12, 0.22, 0.075), mossMask * ${Number(moss).toFixed(3)});
        ${water ? "float ripples = sin(vWeatherWorld.x * 10.0 + fine * 3.0 + waterTime * 1.1) * sin(vWeatherWorld.z * 8.0 - waterTime * 0.8); diffuseColor.rgb *= 1.0 + 0.1 * ripples;" : ""}`);
  };
  material.customProgramCacheKey = () => `weather-v2-${moss}-${water}`;
  return material;
}
