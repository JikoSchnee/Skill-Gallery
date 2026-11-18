import * as THREE from 'three';
// Exterior-only visual choreography. No firing or internal operating mechanism.
export function attachInteractions({model,camera,controls,renderer,ground,fit}){
 const $=id=>document.getElementById(id),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const state={slide:0,magazine:0,hammer:0,explode:0},target={...state};
 let tour=false,tourTime=0,armed=false,drag=null,lastPhase='',slideMode=false;
 const gripGroups=[-1,1].map(sign=>{const group=new THREE.Group();group.name='grip assembly '+sign;model.root.add(group);for(const c of [...model.frame.children])if(['smooth grip','gold grip badge','badge rim','badge relief','grip lower screw','grip bottom seam'].some(n=>c.name.startsWith(n))&&c.name.includes(' '+sign)){model.frame.remove(c);group.add(c);}return group;});
 // Opaque visual insert; its hidden top has no functional details.
 const insert=new THREE.Mesh(new THREE.BoxGeometry(.65,1.38,.43),new THREE.MeshStandardMaterial({color:0x6c726c,metalness:.78,roughness:.34}));
 insert.name='plain magazine visual insert';insert.position.set(1.70,-1.23,0);insert.rotation.z=.14;insert.castShadow=true;model.magazine.add(insert);
 const hammerOrigin=model.hammer.position.clone();
 const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
 const phases={grips:x=>smooth(x/.34),slide:x=>smooth((x-.2)/.45),barrel:x=>smooth((x-.5)/.5)};
 function pose(){const e=state.explode,g=phases.grips(e),s=phases.slide(e),b=phases.barrel(e);model.slide.position.set(state.slide*.52,s*1.2,0);model.barrel.position.set(-b*.15,b*2.45,0);model.magazine.position.set(state.magazine*.26,-state.magazine*1.8,0);model.hammer.position.copy(hammerOrigin).add(new THREE.Vector3(s*.6,s*.6,0));model.hammer.rotation.z=-.48*Math.max(state.hammer,state.slide);gripGroups.forEach((o,i)=>o.position.set(0,0,(i===0?-1:1)*g*1.25));ground.visible=e<.02&&state.magazine<.02;}
 function ui(){const expanded=target.explode>.01||state.explode>.01;const msg=expanded?'外观组件展开 · '+Math.round(state.explode*100)+'%':tour?'自动展示 · '+lastPhase:state.magazine>.95?'弹匣已移出':state.slide>.95?'套筒保持后移':state.hammer>.95?'击锤已转动':'已归位';$('motionStatus').textContent=msg;$('slideAction').textContent=target.slide>.5?'套筒归位':'拉动套筒';$('magazineAction').textContent=target.magazine>.5?'弹匣归位':'移出弹匣';$('hammerAction').textContent=target.hammer>.5?'击锤归位':'转动击锤';$('explodeAction').textContent=target.explode>.01?'全部复原':'全部展开';$('tourAction').textContent=tour?'停止演示':'自动演示';$('tourAction').setAttribute('aria-pressed',tour);$('dragAction').setAttribute('aria-pressed',slideMode);$('dragAction').textContent=slideMode?'退出套筒拖动':'拖动套筒模式';for(const id of ['slideAction','hammerAction','dragAction'])$(id).disabled=expanded;$('stepIn').disabled=target.explode<=0;$('stepOut').disabled=target.explode>=1;$('explodeRange').value=String(Math.round(target.explode*100));$('slideRange').value=String(Math.round(target.slide*100));$('slideRange').disabled=expanded;}
 function stopTour(){tour=false;armed=false;lastPhase='';}
 function steer(key,value){stopTour();if(key==='explode'){target.slide=0;target.hammer=0;slideMode=false;controls.enabled=true;if(value>0)target.magazine=1;else target.magazine=0;}target[key]=clamp(value);if(key==='magazine'||key==='explode')fit();pose();ui();}
 $('slideAction').onclick=()=>steer('slide',target.slide>.5?0:1);
 $('hammerAction').onclick=()=>steer('hammer',target.hammer>.5?0:1);
 $('magazineAction').onclick=()=>steer('magazine',target.magazine>.5?0:1);
 $('explodeAction').onclick=()=>steer('explode',target.explode>.01?0:1);
 $('stepOut').onclick=()=>steer('explode',Math.min(1,(Math.floor(target.explode*3+.01)+1)/3));
 $('stepIn').onclick=()=>steer('explode',Math.max(0,(Math.ceil(target.explode*3-.01)-1)/3));
 $('explodeRange').oninput=e=>steer('explode',Number(e.target.value)/100);
 $('slideRange').oninput=e=>steer('slide',Number(e.target.value)/100);
 $('restoreAction').onclick=()=>{stopTour();Object.assign(target,{slide:0,magazine:0,hammer:0,explode:0});slideMode=false;controls.enabled=true;fit();ui();};
 $('dragAction').onclick=()=>{stopTour();slideMode=!slideMode;ui();};
 $('tourAction').onclick=()=>{if(tour){stopTour();Object.assign(target,state);}else{tour=true;armed=true;tourTime=0;Object.assign(target,{slide:0,magazine:0,hammer:0,explode:0});slideMode=false;fit();}ui();};
 const canvas=renderer.domElement;
 const endDrag=e=>{if(!drag)return;try{canvas.releasePointerCapture(drag.id);}catch{}drag=null;controls.enabled=true;};
 canvas.addEventListener('pointerdown',e=>{if(!slideMode||state.explode>.01||e.button!==0)return;stopTour();controls.enabled=false;e.stopImmediatePropagation();const a=model.root.localToWorld(new THREE.Vector3(0,1,0)).project(camera),b=model.root.localToWorld(new THREE.Vector3(.52,1,0)).project(camera),rect=canvas.getBoundingClientRect();const vx=(b.x-a.x)*rect.width/2,vy=-(b.y-a.y)*rect.height/2;if(Math.hypot(vx,vy)<8){$('motionStatus').textContent='请转到侧面，或使用套筒滑杆';controls.enabled=true;return;}drag={id:e.pointerId,x:e.clientX,y:e.clientY,start:state.slide,vx,vy};canvas.setPointerCapture(e.pointerId);},true);
 canvas.addEventListener('pointermove',e=>{if(!drag)return;e.stopImmediatePropagation();const dx=e.clientX-drag.x,dy=e.clientY-drag.y;target.slide=clamp(drag.start+(dx*drag.vx+dy*drag.vy)/(drag.vx**2+drag.vy**2));ui();},true);
 canvas.addEventListener('pointerup',endDrag,true);canvas.addEventListener('pointercancel',endDrag,true);canvas.addEventListener('lostpointercapture',endDrag,true);
 function update(dt){
  if(tour){if(armed){if(Object.keys(state).every(k=>Math.abs(state[k]-target[k])<.006)){armed=false;tourTime=0;}lastPhase='复原准备';}else{tourTime+=dt;const t=tourTime%14;if(t<2){lastPhase='套筒后移';target.slide=1;target.hammer=0;}else if(t<4){lastPhase='套筒归位';target.slide=0;target.hammer=1;}else if(t<6){lastPhase='击锤归位';target.hammer=0;}else if(t<9){lastPhase='弹匣移出';if(target.magazine===0)fit();target.magazine=1;}else if(t<12){lastPhase='弹匣归位';if(target.magazine===1)fit();target.magazine=0;}else lastPhase='停顿';}}
  for(const k of Object.keys(state)){const rate=k==='explode'?4.5:8;state[k]=reduced.matches?target[k]:state[k]+(target[k]-state[k])*(1-Math.exp(-dt*rate));if(Math.abs(state[k]-target[k])<.0001)state[k]=target[k];}
  pose();ui();
 }
 pose();ui();
 return{update,state,target,gripGroups,steer,stop:()=>{stopTour();ui();},inspect:()=>({state:{...state},target:{...target},tour,armed,tourTime,slideMode,dragging:!!drag,slidePosition:model.slide.position.toArray(),barrelPosition:model.barrel.position.toArray(),magazinePosition:model.magazine.position.toArray(),hammerRotation:model.hammer.rotation.z})};
}
