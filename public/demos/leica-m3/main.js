import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildM3 } from './model.js';
import { createMechanism } from './motion.js';

const viewport=document.querySelector('#viewport');
const loading=document.querySelector('#loading');
try {
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setClearColor(0xffffff,1);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.localClippingEnabled=true;
  viewport.appendChild(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-100,100,80,-80,.1,2000);
  const model=buildM3();scene.add(model.root);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=false;controls.minZoom=.5;controls.maxZoom=6;
  controls.target.set(0,2,10);controls.zoomSpeed=.85;controls.rotateSpeed=.65;
  const views={perspective:[155,93,210],front:[0,2,300],rear:[0,2,-300],top:[0,310,10],bottom:[0,-310,10],left:[-310,2,10],right:[310,2,10]};
  const names={perspective:'立体视图',front:'正面',rear:'背面',top:'顶部',bottom:'底部',left:'左侧',right:'右侧'};
  let current='perspective',width=1,height=1,frame=0;
  const layout={shell:'cut',assembly:'all',spread:0,film:true};
  const mechanism=createMechanism();
  let lastTime=0;
  function render(time){
    frame=0;const dt=lastTime?Math.min(.05,(time-lastTime)/1000):0;lastTime=time;
    if(!document.hidden)mechanism.tick(dt);
    model.rig.apply(mechanism.pose());updateMechanismUI();renderer.render(scene,camera);
    const state=mechanism.pose();
    if(state.action&&!state.paused&&!document.hidden)requestRender();else lastTime=0;
  }
  function requestRender(){if(!frame)frame=requestAnimationFrame(render);}
  function spreadOpen(){return layout.assembly==='all'&&layout.shell!=='full'&&layout.spread>.001;}
  function updateMechanismUI(){
    const s=mechanism.pose(),busy=!!s.action;
    document.querySelector('#advance').disabled=busy||!s.loaded||s.cocked||s.frames>=36||spreadOpen();
    document.querySelector('#shutter').disabled=busy||!s.loaded||!s.cocked||spreadOpen();
    document.querySelector('#rewind').disabled=busy||!s.loaded||spreadOpen();
    document.querySelector('#pause').disabled=!busy;
    document.querySelector('#pause').textContent=s.paused?'继续':'暂停';
    const status=spreadOpen()?'收拢组件后可操作':(s.paused?'已暂停 · ':'')+s.phase;
    const statusEl=document.querySelector('#motionStatus');if(statusEl.textContent!==status)statusEl.textContent=status;
    document.querySelector('#frameCount').textContent='第 '+s.frames+' 格';
    document.querySelector('#motionProgress').value=s.progress;
    document.querySelector('#spread').disabled=busy||layout.assembly!=='all'||layout.shell==='full';
    // A retained, hidden spread must not reappear during a coupled action.
    document.querySelector('#assembly').disabled=busy&&layout.spread>.001;
    document.querySelectorAll('[data-shell]').forEach(el=>el.disabled=busy&&layout.spread>.001);
    document.querySelector('#stage').dataset.action=s.action??'idle';
    document.querySelector('#stage').dataset.paused=String(s.paused);
  }
  for(const kind of ['advance','shutter','rewind'])document.querySelector('#'+kind).addEventListener('click',()=>{
    if(spreadOpen())return;
    if(mechanism.start(kind)){
      // Reduced motion keeps the same state transitions but skips movement.
      if(matchMedia('(prefers-reduced-motion: reduce)').matches)mechanism.tick(20);
      lastTime=0;requestRender();
    }
  });
  document.querySelector('#pause').addEventListener('click',()=>{mechanism.togglePause();lastTime=0;requestRender();});
  document.querySelector('#resetMechanism').addEventListener('click',()=>{mechanism.reset();lastTime=0;requestRender();});
  document.addEventListener('visibilitychange',()=>{lastTime=0;if(!document.hidden)requestRender();});
  function markView(name){document.querySelectorAll('[data-view]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.view===name)));document.querySelector('#viewName').textContent=names[name]??'自由视角';}
  function setView(name,resetZoom=false){
    current=name;camera.up.set(0,1,0);
    if(name==='top')camera.up.set(0,0,-1);
    if(name==='bottom')camera.up.set(0,0,1);
    controls.target.set(0,2,10);camera.position.set(...views[name]);
    if(resetZoom)camera.zoom=1;
    camera.lookAt(controls.target);camera.updateProjectionMatrix();controls.update();markView(name);requestRender();
  }
  function resize(){
    width=viewport.clientWidth;height=viewport.clientHeight;
    renderer.setSize(width,height);model.outline.uniforms.resolution.value.set(width,height);
    for(const m of model.clippedMaterials.values())if(m.uniforms?.resolution)m.uniforms.resolution.value.set(width,height);
    // Preserve a comfortable margin and the full camera across portrait views.
    const halfH=Math.max(69,99/(width/height));
    camera.left=-halfH*width/height;camera.right=halfH*width/height;camera.top=halfH;camera.bottom=-halfH;
    camera.updateProjectionMatrix();requestRender();
  }
  controls.addEventListener('change',requestRender);
  controls.addEventListener('start',()=>{current='free';markView('free');});
  document.querySelectorAll('[data-view]').forEach(el=>el.addEventListener('click',()=>setView(el.dataset.view)));
  document.querySelector('#reset').addEventListener('click',()=>setView('perspective',true));
  function updateLayout(){
    const [title,note]=model.setLayout(layout);
    document.querySelectorAll('[data-shell]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.shell===layout.shell)));
    document.querySelector('#assemblyNote').textContent=note;
    document.querySelector('#spreadValue').textContent=layout.shell==='full'&&layout.assembly==='all'?'已收拢':layout.assembly!=='all'?'局部':Math.round(layout.spread*100)+'%';
    document.querySelector('#spread').disabled=layout.assembly!=='all'||layout.shell==='full';
    document.querySelector('#filmToggle').setAttribute('aria-pressed',String(layout.film));
    document.querySelector('#filmToggle span').textContent=layout.film?'显示':'隐藏';
    document.querySelector('#stage').dataset.shell=layout.shell;
    document.querySelector('#stage').dataset.assembly=layout.assembly;
    document.querySelector('#stage').dataset.spread=String(layout.spread);
    document.querySelector('#stage').dataset.film=String(layout.film);
    viewport.setAttribute('aria-label',title+'三维线条模型；拖动旋转，滚轮缩放');
    requestRender();
  }
  document.querySelectorAll('[data-shell]').forEach(el=>el.addEventListener('click',()=>{
    layout.shell=el.dataset.shell;layout.assembly='all';document.querySelector('#assembly').value='all';updateLayout();
  }));
  document.querySelector('#assembly').addEventListener('change',e=>{layout.assembly=e.target.value;updateLayout();});
  document.querySelector('#spread').addEventListener('input',e=>{layout.spread=Number(e.target.value)/100;updateLayout();});
  document.querySelector('#filmToggle').addEventListener('click',()=>{layout.film=!layout.film;updateLayout();});
  // Fit is explicit. Inspection switches do not modify camera, zoom or target.
  document.querySelector('#fit').addEventListener('click',()=>{
    model.root.updateMatrixWorld(true);
    const box=new THREE.Box3();
    model.root.traverseVisible(obj=>{if(obj.isMesh){obj.geometry.computeBoundingBox();box.union(obj.geometry.boundingBox.clone().applyMatrix4(obj.matrixWorld));}});
    if(box.isEmpty())return;
    const center=box.getCenter(new THREE.Vector3()),delta=center.clone().sub(controls.target);
    camera.position.add(delta);controls.target.copy(center);camera.lookAt(center);camera.updateMatrixWorld(true);
    const transformed=box.clone().applyMatrix4(camera.matrixWorldInverse),size=transformed.getSize(new THREE.Vector3());
    camera.zoom=THREE.MathUtils.clamp(Math.min((camera.right-camera.left)/size.x,(camera.top-camera.bottom)/size.y)*.78,.5,6);
    camera.updateProjectionMatrix();controls.update();requestRender();
  });
  viewport.addEventListener('keydown',e=>{
    if(e.key==='0'){e.preventDefault();setView('perspective',true);return;}
    if(e.key==='+'||e.key==='='||e.key==='-'){
      e.preventDefault();camera.zoom=THREE.MathUtils.clamp(camera.zoom*(e.key==='-'?.9:1.1),.5,6);camera.updateProjectionMatrix();requestRender();return;
    }
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
    e.preventDefault();camera.up.set(0,1,0);
    const v=camera.position.clone().sub(controls.target),s=new THREE.Spherical().setFromVector3(v);
    s.theta+=(e.key==='ArrowLeft'?.12:e.key==='ArrowRight'?-.12:0);
    s.phi=THREE.MathUtils.clamp(s.phi+(e.key==='ArrowUp'?-.12:e.key==='ArrowDown'?.12:0),.02,Math.PI-.02);
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));controls.update();current='free';markView('free');requestRender();
  });
  new ResizeObserver(resize).observe(viewport);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();loading.hidden=false;loading.textContent='三维视图已中断，请刷新页面恢复。';});
  setView('perspective',true);resize();updateLayout();loading.hidden=true;
  // Read-only inspection hook used by the small browser smoke check.
  window.__m3={setView,inspect:()=>({ready:true,mechanism:mechanism.pose(),parts:model.parts.length,assemblies:[...new Set(model.parts.map(p=>p.assembly))],layout:{...layout},view:current,zoom:camera.zoom,position:camera.position.toArray(),target:controls.target.toArray(),bounds:{min:model.bounds.min.toArray(),max:model.bounds.max.toArray()},drawCalls:renderer.info.render.calls,canvas:[width,height]}),parts:model.parts};
} catch(error){loading.hidden=false;loading.textContent='模型加载失败：'+error.message;console.error(error);}
