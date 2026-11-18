import * as THREE from 'three';
export function installMotion({model,interior,layout,selectModule,view,materialFor=o=>o.material,explosion}){
 interior.root.userData.animated=true;
 const $=id=>document.getElementById(id),modules=Object.fromEntries(interior.modules.map(m=>[m.id,m.group]));
 const state={charge:0,focus:0,energy:0,aperture:0,spread:0,spreadTarget:0,cell:0,cellTarget:0,auto:false,paused:false,time:0,pulse:0,action:'idle',actionTime:0,rpm:0,phase:'待机'};
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const crystal=modules.core.children.find(o=>o.geometry?.type==='IcosahedronGeometry');const coreMaterial=crystal.material;
 const rotating=modules.core.children.filter(o=>o.geometry?.type==='BoxGeometry'&&Math.abs(o.position.x-.03)<.7&&o.geometry.parameters.width===.18).map(o=>({o,p:o.position.clone(),r:o.rotation.clone()}));
 const blades=modules.cool.children.filter(o=>o.geometry?.type==='BoxGeometry'&&o.geometry.parameters.width===.29).map(o=>({o,p:o.position.clone(),r:o.rotation.z}));
 const outerBlades=model.groups.sideCovers.children.filter(o=>o.name.startsWith('grille vane ')).map(o=>({o,r:o.rotation.z}));
 const tailLid=model.groups.rearTail.getObjectByName('tail lid hinge'),lowerLid=model.groups.rearTail.getObjectByName('lower tail hinge');
 // Keep the rear socket stationary; only the removable cartridge travels.
 let activeCell=new THREE.Group();activeCell.name='installed cartridge 1';modules.cell.add(activeCell);
 for(const o of [...modules.cell.children])if(o!==activeCell&&o.position.x<=-1.7)activeCell.attach(o);
 let spare=null,serial=1;
 function makeSpare(){const sources=[];activeCell.traverse(o=>{if(o.isMesh)sources.push(materialFor(o));});let sourceIndex=0;const g=activeCell.clone(true);g.name='replacement cartridge '+(++serial);g.userData.ownedMaterials=true;g.position.set(-2.2,1.3,0);g.traverse(o=>{if(o.isMesh){o.material=sources[sourceIndex++].clone();if(o.material.color.getHex()===0x927caf)o.material.color.setHex(0x56c9a6);}});const prior=g.getObjectByName('charge band');if(prior)g.remove(prior);const band=new THREE.Mesh(new THREE.TorusGeometry(.335,.035,10,48),new THREE.MeshStandardMaterial({color:0x69e9bb,emissive:0x247d5c,emissiveIntensity:.4,roughness:.35}));band.name='charge band';band.rotation.y=Math.PI/2;band.position.x=-2.18;g.add(band);const oldBand=activeCell.getObjectByName('charge band');if(oldBand){oldBand.material=oldBand.material.clone();oldBand.material.color.setHex(0xa17a4d);oldBand.material.emissiveIntensity=0;}modules.cell.add(g);return g;}
 const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
 function disposeCell(g){modules.cell.remove(g);if(g.userData.ownedMaterials)g.traverse(o=>{if(o.isMesh)o.material.dispose();});}
 function finishReload(){if(spare){disposeCell(activeCell);activeCell=spare;activeCell.position.set(0,0,0);spare=null;}state.cell=0;state.cellTarget=0;}
 const iris=modules.optics.children.filter(o=>o.geometry?.type==='BoxGeometry'&&o.geometry.parameters.width===.04).map(o=>({o,p:o.position.clone(),r:o.rotation.x}));
 const lens=modules.optics.children.filter(o=>Math.abs(o.position.x-1.12)<.001).map(o=>({o,x:o.position.x}));
 let explodeMode=false;
 const halo=new THREE.Mesh(new THREE.TorusGeometry(.69,.026,10,80),new THREE.MeshBasicMaterial({color:0x8cffe1,transparent:true,opacity:0,depthWrite:false}));halo.rotation.y=Math.PI/2;halo.position.x=2.79;model.root.add(halo);
 const jet=new THREE.Group();jet.position.x=2.78;model.root.add(jet);
 const jetLayers=[];for(const [radius,length,color,opacity]of [[.29,2.5,0x24bfa8,.42],[.15,2.6,0x8cffe1,.68],[.055,2.7,0xf2fff9,.95]]){const material=new THREE.MeshBasicMaterial({color,transparent:true,opacity:0,depthWrite:false});const m=new THREE.Mesh(new THREE.CylinderGeometry(radius*.3,radius,length,48,1,true),material);m.rotation.z=-Math.PI/2;m.position.x=length/2;jet.add(m);jetLayers.push({m,opacity});}
 const rings=[];for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.TorusGeometry(.30,.028,8,48),new THREE.MeshBasicMaterial({color:0x52e4b9,transparent:true,opacity:0,depthWrite:false}));m.rotation.y=Math.PI/2;jet.add(m);rings.push(m);}
 const glow=new THREE.PointLight(0x12ee42,0,5);glow.position.set(.1,.1,.3);modules.core.add(glow);
 // Light carried through the optical train; the outer glass remains non-emissive.
 const lensLight=new THREE.PointLight(0x05ff24,0,1.8,2);lensLight.position.set(2.38,0,0);modules.optics.add(lensLight);
 const shotTiming={peak:3.6,fire:4.2,cool:1.4,end:6.4};
 let shotStartEnergy=0;
 let last=0,angle=0,lastText='';
 function stopAuto(){state.auto=false;$('auto').setAttribute('aria-pressed','false');}
 function reset(){stopAuto();const wasExploded=explodeMode;explodeMode=false;explosion.apply(0);if(wasExploded)layout('closed');document.getElementById('explode').setAttribute('aria-pressed','false');if(spare){disposeCell(spare);spare=null;}activeCell.visible=true;activeCell.position.set(0,0,0);Object.assign(state,{charge:0,focus:0,energy:0,aperture:0,spread:0,spreadTarget:0,cell:0,cellTarget:0,paused:false,time:0,pulse:0,action:'idle',actionTime:0,rpm:0});angle=0;$('charge').value=0;$('focus').value=0;$('spread').value=0;$('pause').textContent='暂停';$('pause').setAttribute('aria-pressed','false');$('cell').textContent='抽出能量匣';selectModule('all');update(performance.now());}
 function release(){if(state.action!=='idle'||state.cell>.01||state.cellTarget>0||state.spread>.01||state.spreadTarget>0||state.paused)return;shotStartEnergy=state.energy;state.action='shoot';state.actionTime=0;selectModule('all');}
 function reload(){if(state.action!=='idle'||state.spread>.01||state.spreadTarget>0||state.cell>.01||state.cellTarget>0||state.paused)return;state.action='reload';state.actionTime=0;state.charge=0;state.focus=0;state.pulse=0;state.cell=0;state.cellTarget=0;spare=makeSpare();selectModule('all');}
 $('reload').onclick=()=>{stopAuto();reload();};
 $('charge').oninput=e=>{stopAuto();state.charge=+e.target.value/100;};$('focus').oninput=e=>{stopAuto();state.focus=+e.target.value/100;};
 $('release').onclick=()=>{stopAuto();release();};
 function setSpread(value){stopAuto();if(state.paused||state.action!=='idle')return;if(!explodeMode){state.cell=0;state.cellTarget=0;layout('closed');explodeMode=true;}state.spreadTarget=value;state.charge=0;state.energy=0;state.focus=0;state.aperture=0;state.pulse=0;$('charge').value=0;$('focus').value=0;$('spread').value=value*100;selectModule('all');$('explode').setAttribute('aria-pressed',String(value>0));}
 $('spread').oninput=e=>setSpread(+e.target.value/100);
 $('explode').onclick=()=>setSpread(state.spreadTarget>.01?0:1);
 $('cell').onclick=()=>{stopAuto();state.cellTarget=1-state.cellTarget;state.charge=0;state.pulse=0;$('charge').value=0;$('cell').textContent=state.cellTarget?'装回能量匣':'抽出能量匣';layout('internal');selectModule('all');};
 $('auto').onclick=()=>{if(state.auto){stopAuto();return;}reset();state.auto=true;$('auto').setAttribute('aria-pressed','true');};
 $('pause').onclick=()=>{state.paused=!state.paused;$('pause').textContent=state.paused?'继续':'暂停';$('pause').setAttribute('aria-pressed',state.paused);};$('motionReset').onclick=reset;
 function update(now){const dt=last?Math.max(0,Math.min((now-last)/1000,.05)):0;last=now;const step=state.paused?0:dt;
 if(state.auto&&!state.paused&&state.action==='idle'){if(state.time===0){release();state.time=1;}else{reload();state.time=0;}}
 if(!state.paused&&state.action!=='idle'){const old=state.actionTime;state.actionTime+=step;const t=state.actionTime;
 if(state.action==='shoot'){state.charge=t<shotTiming.fire?shotStartEnergy+(1-shotStartEnergy)*ease(t/shotTiming.peak):1-ease((t-shotTiming.fire)/shotTiming.cool);state.focus=t<5.3?ease((t-.8)/2.4):0;if(old<shotTiming.fire&&t>=shotTiming.fire)state.pulse=1;if(t>=shotTiming.end){state.action='idle';state.charge=0;state.focus=0;}}
 else{if(t>=5.8){finishReload();state.action='idle';}}
 $('charge').value=Math.round(state.charge*100);$('focus').value=Math.round(state.focus*100);$('cell').textContent=state.cellTarget?'装回能量匣':'抽出能量匣';
 }
 const k=state.paused?0:reduced.matches?1:1-Math.exp(-step*5);state.cell+=(state.cellTarget-state.cell)*k;state.spread+=(state.spreadTarget-state.spread)*(state.paused?0:reduced.matches?1:1-Math.exp(-step*2.5));
 const opened=state.cell>.01||state.cellTarget>0||state.spread>.01||state.spreadTarget>0;
 if(state.action==='shoot'&&!state.paused&&!opened)state.energy=state.charge;else state.energy+=((opened?0:state.charge)-state.energy)*k;state.aperture+=(state.focus-state.aperture)*k;state.pulse=Math.max(0,state.pulse-step*.65);
 model.chargeGlass.emissiveIntensity=0;
 state.rpm=Math.round(state.energy*172);
 if(!reduced.matches)angle+=step*state.energy*18;
 crystal.rotation.x=angle*.5;coreMaterial.color.setHex(0x12963c);coreMaterial.toneMapped=false;coreMaterial.emissive.setHex(0x00d52a);coreMaterial.emissiveIntensity=state.energy*3.5;glow.intensity=state.energy*12;lensLight.intensity=state.energy*6;
 for(const {o,p,r}of rotating){o.position.copy(p).applyAxisAngle(new THREE.Vector3(1,0,0),angle);o.rotation.x=r.x+angle;}
 for(const {o,p,r}of blades){const a=angle*3,c=Math.cos(a),s=Math.sin(a),x=p.x+1.53,y=p.y-.03;o.position.set(-1.53+x*c-y*s,.03+x*s+y*c,p.z);o.rotation.z=r+a;}
 for(const {o,r}of outerBlades)o.rotation.z=r+angle*3;
 for(const {o,p,r}of iris){const f=1-state.aperture*.35;o.position.set(p.x,p.y*f,p.z*f);o.rotation.x=r+state.aperture*.5;}
 for(const {o,x}of lens)o.position.x=x+state.aperture*.25;
 if(Math.abs(state.spread-state.spreadTarget)<.001)state.spread=state.spreadTarget;explosion.apply(state.spread);if(explodeMode&&state.spread===0&&state.spreadTarget===0){explodeMode=false;layout('closed');selectModule('all');}activeCell.position.set(-2.2*ease((state.cell-.2)/.8),0,0);
 const loading=state.action==='reload',t=state.actionTime;
 const hatch=state.spread>0?ease(state.spread/.12):loading?ease(t/.6)*(1-ease((t-5)/.8)):ease(state.cell/.2);
 tailLid.rotation.z=-hatch*.55;tailLid.position.y=.08+hatch*.40;lowerLid.rotation.z=hatch*.32;lowerLid.position.y=-.08-hatch*.42;
 if(loading&&spare){
 activeCell.position.set(-2.2*ease((t-.65)/.9),-1.3*ease((t-1.65)/.75),0);
 activeCell.visible=t<2.6;
 spare.visible=t>=2.45;spare.position.set(-2.2*(1-ease((t-3.65)/1.15)),1.3*(1-ease((t-2.5)/1)),0);
 }else activeCell.visible=true;
 jet.visible=state.pulse>0&&!opened;const envelope=Math.min(1,(1-state.pulse)*12)*Math.min(1,state.pulse*4);jet.scale.x=reduced.matches?1:Math.min(1,(1-state.pulse)*9+.05);for(const {m,opacity}of jetLayers)m.material.opacity=envelope*opacity;
 for(let i=0;i<rings.length;i++){const progress=((1-state.pulse)*2+i/rings.length)%1;rings[i].position.x=.08+progress*2.6;rings[i].scale.setScalar(.7+progress*.8);rings[i].material.opacity=envelope*(1-progress)*.7;}
 halo.visible=state.pulse>0&&!opened;halo.material.opacity=envelope*.65;halo.scale.setScalar(1+(1-state.pulse)*.3);
 $('closed').disabled=opened;$('cut').disabled=opened;$('internal').disabled=state.spread>0;
 const busy=state.action!=='idle';const disabled=opened||state.paused||busy;$('charge').disabled=disabled;$('focus').disabled=disabled;$('release').disabled=disabled;$('reload').disabled=state.paused||busy||opened;$('spread').disabled=state.paused||busy;$('cell').disabled=state.paused||busy||state.spread>0;$('explode').disabled=state.paused||busy;
 state.phase=state.paused?'已暂停':state.action==='reload'?(t<.6?'换弹 · 尾舱打开':t<2.45?'换弹 · 旧匣退出并移走':t<3.6?'换弹 · 新匣对准接口':t<4.8?'换弹 · 新匣装入':'换弹 · 尾舱闭合锁定'):state.action==='shoot'?(state.actionTime<shotTiming.peak?'射击 · 渐进充能 / 聚焦':state.actionTime<shotTiming.fire?'射击 · 满充待发':state.pulse>0?'射击 · 能量喷射':'射击 · 冷却回落'):state.spread>0?'爆炸视图 · '+Math.round(state.spread*100)+'% · 运行已锁定':opened?'检修 · 运行已锁定':state.pulse>0?'释放 · 端面光环':state.energy>.75&&state.aperture>.8?'就绪 · 可释放':state.aperture>.05?'聚焦 · 透镜前移 / 光阑收拢':state.energy>.05?'充能 · 定场环 / 风轮转动':'待机';
 $('chargeValue').textContent=Math.round(state.energy*100)+'%';$('focusValue').textContent=Math.round(state.aperture*100)+'%';$('speedValue').textContent=state.rpm+' rpm';const txt=state.phase+(reduced.matches?' · 减少动态效果':'');if(txt!==lastText){$('motionStatus').textContent=txt;lastText=txt;}
 }
 return {update,state,reset,release,reload,inspect:()=>({activeId:activeCell.uuid,spareId:spare?.uuid,activePosition:activeCell.position.toArray(),sparePosition:spare?.position.toArray(),outerAngle:outerBlades[0].o.rotation.z-outerBlades[0].r,innerAngle:blades[0].o.rotation.z-blades[0].r,glassEmission:model.chargeGlass.emissiveIntensity,coreEmission:coreMaterial.emissiveIntensity,coreLight:glow.intensity,lensLight:lensLight.intensity,jetOpacity:jetLayers[0].m.material.opacity,haloOpacity:halo.material.opacity,lidAngle:tailLid.rotation.z,lowerLidAngle:lowerLid.rotation.z,shellVisible:model.groups.frontShell.visible})};
}
