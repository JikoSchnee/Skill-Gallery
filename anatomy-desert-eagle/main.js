import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {createModel} from './model.js';
import {attachInteractions} from './interactions.js';
const stage=document.getElementById('stage');
document.getElementById('referenceToggle').onclick=()=>{const el=document.getElementById('reference');el.style.display=el.style.display==='none'?'block':'none';};
try{
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0xdfe1e4);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','沙漠之鹰三维外观，拖动或方向键旋转，滚轮缩放');stage.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0xdfe1e4);
const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();const stripMaterial=new THREE.MeshBasicMaterial({color:new THREE.Color(3,3,3)});
for(const [y,h] of [[2.5,1.1],[-1.8,.45]]){const strip=new THREE.Mesh(new THREE.BoxGeometry(12,h,.05),stripMaterial);strip.position.set(0,y,5);room.add(strip);}
scene.environment=pmrem.fromScene(room,.04).texture;scene.environmentIntensity=1.0;room.dispose();pmrem.dispose();
const camera=new THREE.PerspectiveCamera(33,1,.1,100);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.10;controls.enablePan=false;controls.minDistance=4;controls.maxDistance=25;controls.target.set(-.15,-.10,0);controls.maxPolarAngle=Math.PI*.94;controls.minPolarAngle=.06;
const hemi=new THREE.HemisphereLight(0xffffff,0x77766e,.65);scene.add(hemi);
const key=new THREE.DirectionalLight(0xfffaed,2.1);key.position.set(-3,8,7);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.bias=-.0002;key.shadow.normalBias=.025;key.shadow.radius=5;scene.add(key);
const fill=new THREE.DirectionalLight(0xdce7f3,1.3);fill.position.set(5,2,-6);scene.add(fill);
const rim=new THREE.DirectionalLight(0xffffff,1.1);rim.position.set(-4,3,-2);scene.add(rim);
const model=createModel();scene.add(model.root);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.04}));ground.rotation.x=-Math.PI/2;ground.position.y=new THREE.Box3().setFromObject(model.root).min.y-.015;ground.receiveShadow=true;scene.add(ground);
let distance=12,frame=0,visible=true,fitFor=0,lastTime=0;
const motion=attachInteractions({model,camera,controls,renderer,ground,fit:()=>{fitFor=3;}});
controls.addEventListener('start',()=>{fitFor=0;});
function view(direction){
const dir=new THREE.Vector3(...direction).normalize(),right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),dir).normalize(),up=new THREE.Vector3().crossVectors(dir,right).normalize();
const bounds=new THREE.Box3().setFromObject(model.root),tan=Math.tan(camera.fov*Math.PI/360);let fit=0;
for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){const v=new THREE.Vector3(x,y,z).sub(controls.target);fit=Math.max(fit,v.dot(dir)+1.18*Math.max(Math.abs(v.dot(right))/(tan*camera.aspect),Math.abs(v.dot(up))/tan));}
distance=fit;camera.position.copy(controls.target).add(dir.multiplyScalar(distance));controls.update();wake();}
function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();const tan=Math.tan(camera.fov*Math.PI/360);distance=Math.max(6.7/(2*tan*camera.aspect),4.7/(2*tan))*1.1;controls.maxDistance=Math.max(25,distance*2);controls.minDistance=Math.min(5,distance*.45);view([-3.2,2.1,12]);}
function render(now){frame=0;if(!visible||document.hidden){lastTime=0;return;}const dt=lastTime?Math.min((now-lastTime)/1000,.05):1/60;lastTime=now;motion.update(dt);
if(fitFor>0){fitFor-=dt;const dir=camera.position.clone().sub(controls.target).normalize(),right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),dir).normalize(),up=new THREE.Vector3().crossVectors(dir,right).normalize(),tan=Math.tan(camera.fov*Math.PI/360),bounds=new THREE.Box3().setFromObject(model.root);let needed=0;
for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){const v=new THREE.Vector3(x,y,z).sub(controls.target);needed=Math.max(needed,v.dot(dir)+1.2*Math.max(Math.abs(v.dot(right))/(tan*camera.aspect),Math.abs(v.dot(up))/tan));}
const current=camera.position.distanceTo(controls.target);camera.position.copy(controls.target).add(dir.multiplyScalar(current+(needed-current)*(1-Math.exp(-dt*4))));controls.maxDistance=Math.max(25,needed*2);}
controls.update();renderer.render(scene,camera);frame=requestAnimationFrame(render);}
function wake(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render);}
document.getElementById('reset').onclick=()=>view([-3.2,2.1,12]);document.getElementById('left').onclick=()=>view([0,.05,1]);document.getElementById('right').onclick=()=>view([0,.05,-1]);document.getElementById('top').onclick=()=>view([0,1,.065]);document.getElementById('front').onclick=()=>view([-1,.025,.001]);
renderer.domElement.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','+','-'].includes(e.key))return;e.preventDefault();if(e.key==='Home'){view([-3.2,2.1,12]);return;}const s=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));if(e.key==='ArrowLeft')s.theta-=.12;if(e.key==='ArrowRight')s.theta+=.12;if(e.key==='ArrowUp')s.phi=Math.max(.06,s.phi-.12);if(e.key==='ArrowDown')s.phi=Math.min(Math.PI*.94,s.phi+.12);if(e.key==='+')s.radius=Math.max(controls.minDistance,s.radius*.9);if(e.key==='-')s.radius=Math.min(controls.maxDistance,s.radius*1.1);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));controls.update();wake();});
new ResizeObserver(resize).observe(stage);document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;lastTime=0;}else wake();});new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(!visible&&frame){cancelAnimationFrame(frame);frame=0;lastTime=0;}else wake();}).observe(stage);
resize();renderer.render(scene,camera);document.getElementById('loading').remove();
window.__modelReview={ready:true,meshCount:model.meshes.length,renderer,camera,controls,model,view,scene,motion,inspect:()=>({meshCount:model.meshes.length,triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls,camera:camera.position.toArray(),width:stage.clientWidth,height:stage.clientHeight})};
wake();
}catch(error){console.error(error);document.getElementById('loading').remove();const el=document.getElementById('error');el.style.display='block';el.textContent='三维预览加载失败：'+error.message;}
