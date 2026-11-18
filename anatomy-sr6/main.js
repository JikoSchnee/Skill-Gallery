import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {createModel} from './model.js';
import {createInterior} from './interior.js';
import {installMotion} from './motion.js';
import {createExplosion} from './explosion.js';
import {createViewGizmo} from './view-gizmo.js';
import {installFloatingControls} from './floating-controls.js';
const stage=document.getElementById('stage');
installFloatingControls();
try{
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.localClippingEnabled=true;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;stage.appendChild(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','SR-6 内部布局，可拖动或用方向键旋转');
const scene=new THREE.Scene();scene.background=new THREE.Color(0xe7e9e8);const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(room,.04).texture;scene.environmentIntensity=.8;room.dispose();pmrem.dispose();
const hemisphere=new THREE.HemisphereLight(0xffffff,0x737d79,1.3);scene.add(hemisphere);const key=new THREE.DirectionalLight(0xfffaf0,3);key.position.set(1,7,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-6,right:6,top:5,bottom:-5});key.shadow.normalBias=.025;scene.add(key);const fill=new THREE.DirectionalLight(0xd8edff,1.7);fill.position.set(-5,2,-4);scene.add(fill);
const camera=new THREE.PerspectiveCamera(33,1,.1,100),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.12;controls.enablePan=false;controls.target.set(-.2,-.35,0);controls.minPolarAngle=.07;controls.maxPolarAngle=Math.PI-.07;
const model=createModel();const interior=createInterior();model.root.add(interior.root);scene.add(model.root);const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.055}));ground.rotation.x=-Math.PI/2;ground.position.y=new THREE.Box3().setFromObject(model.root).min.y-.03;ground.receiveShadow=true;scene.add(ground);
const explosion=createExplosion(model,interior);
let theme='light';
function setTheme(value){theme=value==='dark'?'dark':'light';const darkTheme=theme==='dark';document.body.dataset.theme=theme;document.getElementById('theme').setAttribute('aria-pressed',String(darkTheme));
scene.background.setHex(darkTheme?0x151e23:0xe7e9e8);scene.environmentIntensity=darkTheme?.18:.8;hemisphere.intensity=darkTheme?.28:1.3;hemisphere.groundColor.setHex(darkTheme?0x18292b:0x737d79);key.intensity=darkTheme?.65:3;key.color.setHex(darkTheme?0xb8cdd8:0xfffaf0);fill.intensity=darkTheme?.4:1.7;ground.material.opacity=darkTheme?.16:.055;
try{localStorage.setItem('sr6-theme',theme);}catch{} }
document.getElementById('theme').onclick=()=>setTheme(theme==='dark'?'light':'dark');
let savedTheme='light';try{savedTheme=localStorage.getItem('sr6-theme')||'light';}catch{}setTheme(savedTheme);
let frame=0,visible=true,clay=false;const clayMat=new THREE.MeshStandardMaterial({color:0xb6bcb8,metalness:0,roughness:.75}),original=new Map();model.root.traverse(o=>{if(o.isMesh)original.set(o,o.material);});
const shellMaterials=new Set();Object.values(model.groups).forEach(g=>g.traverse(o=>{if(o.isMesh)shellMaterials.add(o.material);}));
const cutPlane=new THREE.Plane(new THREE.Vector3(0,0,-1),0);
let layoutMode='cut',selected='all';
function refreshMaterials(){const live=new Set();interior.root.traverse(o=>{if(o.isMesh){live.add(o);if(!original.has(o))original.set(o,o.material);}});for(const o of original.keys())if(!live.has(o)&&!shellMaterials.has(original.get(o)))original.delete(o);}
function layout(mode){refreshMaterials();layoutMode=mode;for(const g of Object.values(model.groups))g.visible=mode!=='internal';for(const m of shellMaterials){m.clippingPlanes=mode==='cut'?[cutPlane]:[];m.clipShadows=true;m.side=THREE.DoubleSide;m.needsUpdate=true;}
clayMat.clippingPlanes=[];for(const [o,m]of original){o.material=clay?(shellMaterials.has(m)&&mode==='cut'?cutClay:clayMat):m;}
for(const id of ['closed','cut','internal'])document.getElementById(id).setAttribute('aria-pressed',id===mode);
document.getElementById('shellGear').value=['closed','cut','internal'].indexOf(mode);document.getElementById('shellGear').setAttribute('aria-valuetext',({closed:'完整外壳',cut:'半剖外壳',internal:'移除外壳'})[mode]);
if(mode==='closed')selectModule('all');wake();}
const cutClay=clayMat.clone();cutClay.clippingPlanes=[cutPlane];cutClay.side=THREE.DoubleSide;
function selectModule(id){selected=id;explosion.select(id);for(const m of interior.modules){m.group.visible=id==='all'||m.id===id;document.getElementById('module-'+m.id)?.setAttribute('aria-pressed',id===m.id);}document.getElementById('module-all').setAttribute('aria-pressed',id==='all');const m=interior.modules.find(m=>m.id===id);document.getElementById('description').textContent=m?m.title+' · '+m.description:'布局总览：尾部能量匣 → 中央缩小芯舱 → 前端光学组件；双侧散热，控制板位于底部。';wake();}
const moduleNav=document.getElementById('modules');for(const m of interior.modules){const b=document.createElement('button');b.id='module-'+m.id;b.textContent=m.title;b.style.borderBottomColor=m.color;b.onclick=()=>{if(layoutMode==='closed'&&explosion.amount===0)layout('internal');selectModule(m.id);};moduleNav.appendChild(b);}
for(const a of explosion.assemblies.slice(6)){const b=document.createElement('button');b.id='module-'+a.id;b.textContent=a.title;b.onclick=()=>{if(explosion.amount>0){selectModule(a.id);document.getElementById('description').textContent=a.title+' · 独立查看；点击全部组件返回整机。';}};moduleNav.appendChild(b);}
document.getElementById('module-all').onclick=()=>selectModule('all');for(const mode of ['closed','cut','internal'])document.getElementById(mode).onclick=()=>layout(mode);
function view(direction){const dir=new THREE.Vector3(...direction).normalize(),right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),dir).normalize(),up=new THREE.Vector3().crossVectors(dir,right).normalize(),bounds=new THREE.Box3().setFromObject(model.root),tan=Math.tan(camera.fov*Math.PI/360);controls.target.copy(bounds.getCenter(new THREE.Vector3()));let fit=0;for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){const v=new THREE.Vector3(x,y,z).sub(controls.target);fit=Math.max(fit,v.dot(dir)+1.20*Math.max(Math.abs(v.dot(right))/(tan*camera.aspect),Math.abs(v.dot(up))/tan));}camera.position.copy(controls.target).addScaledVector(dir,fit);controls.minDistance=Math.min(4,fit*.45);controls.maxDistance=Math.max(25,fit*2);controls.update();wake();}
// UI changes never write to the animation state or camera pose.
const panel=document.getElementById('advancedPanel'),panelToggle=document.getElementById('advancedToggle');
function togglePanel(open){panel.hidden=!open;panelToggle.setAttribute('aria-expanded',String(open));if(!open&&panel.contains(document.activeElement))panelToggle.focus();}
panelToggle.onclick=()=>togglePanel(panel.hidden);
document.getElementById('advancedClose').onclick=()=>togglePanel(false);
panel.addEventListener('keydown',e=>{if(e.key==='Escape')togglePanel(false);});
const gear=document.getElementById('shellGear'),gearModes=['closed','cut','internal'];
gear.oninput=()=>{const mode=gearModes[Number(gear.value)];if(!document.getElementById(mode).disabled)layout(mode);else gear.value=gearModes.indexOf(layoutMode);};
const gizmo=createViewGizmo(document.getElementById('viewCompass'),camera,view);
let initialFit=false;
function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(!initialFit){initialFit=true;view([6,3.1,12]);}}
let motion;
function render(now){frame=0;if(!visible||document.hidden)return;motion?.update(now);gear.disabled=gearModes.every(id=>document.getElementById(id).disabled);for(const a of explosion.assemblies.slice(6)){const b=document.getElementById('module-'+a.id);b.hidden=explosion.amount<.001;b.setAttribute('aria-pressed',selected===a.id);}if(clay){refreshMaterials();interior.root.traverse(o=>{if(o.isMesh)o.material=clayMat;});}controls.update();gizmo.update();renderer.render(scene,camera);frame=requestAnimationFrame(render);}
function wake(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render);}
for(const [id,dir] of [['reset',[6,3.1,12]],['side',[0,0,1]],['other',[0,0,-1]],['front',[1,.01,0]],['rear',[-1,.01,0]],['top',[0,1,.08]]])document.getElementById(id).onclick=()=>view(dir);
document.getElementById('clay').onclick=()=>{refreshMaterials();clay=!clay;for(const [o,mat]of original){o.material=clay?(shellMaterials.has(mat)&&layoutMode==='cut'?cutClay:clayMat):mat;o.visible=!(clay&&o.name.startsWith('SR-6 marking'));}document.getElementById('clay').setAttribute('aria-pressed',clay);document.getElementById('clay').textContent=clay?'恢复配色':'灰模检查';};
renderer.domElement.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home'){view([6,3.1,12]);return;}const s=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));if(e.key==='ArrowLeft')s.theta-=.12;if(e.key==='ArrowRight')s.theta+=.12;if(e.key==='ArrowUp')s.phi=Math.max(.07,s.phi-.12);if(e.key==='ArrowDown')s.phi=Math.min(Math.PI-.07,s.phi+.12);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));controls.update();});
new ResizeObserver(resize).observe(stage);new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(!visible&&frame){cancelAnimationFrame(frame);frame=0;}else wake();}).observe(stage);document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}else wake();});
motion=installMotion({model,interior,layout,selectModule,view,materialFor:o=>original.get(o)||o.material,explosion});layout('cut');selectModule('all');resize();renderer.render(scene,camera);document.getElementById('loading').remove();window.__shellReview={ready:true,setTheme,explosion,motion,model,interior,camera,controls,view,renderer,inspect:()=>({meshes:original.size,theme,lighting:{environment:scene.environmentIntensity,hemisphere:hemisphere.intensity,key:key.intensity,fill:fill.intensity},clay,internalComponents:true,layoutMode,selected,modules:interior.modules.length,visibleModules:interior.modules.filter(m=>m.group.visible).map(m=>m.id),camera:camera.position.toArray(),triangles:renderer.info.render.triangles})};wake();
}catch(e){console.error(e);document.getElementById('loading')?.remove();const out=document.getElementById('error');out.style.display='block';out.textContent='三维预览加载失败：'+e.message;}
