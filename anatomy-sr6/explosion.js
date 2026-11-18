import * as THREE from 'three';
// Assembly presentation: one reversible scalar controls every stage and its reverse.
export function createExplosion(model,interior){
 const G=model.groups,M=Object.fromEntries(interior.modules.map(m=>[m.id,m.group]));
 // Surface details belong to their supporting assemblies, never float on their own.
 for(const o of [...G.surfaceDetails.children]){const host=o.name.startsWith('cap groove')?G.endCap:o.name.startsWith('collar segment')?G.rearCollar:G.frontShell;host.attach(o);}
 const assemblies=[
 ...interior.modules.map(m=>({id:m.id,title:m.title,group:m.group})),
 {id:'housing',title:'07 主筒外壳',group:G.frontShell},
 {id:'nose',title:'08 前端罩与玻璃',group:G.endCap},
 {id:'collar',title:'09 后肩与观察窗',group:G.rearCollar},
 {id:'fanShell',title:'10 风扇罩与排气管',group:G.sideCovers},
 {id:'tail',title:'11 双片尾壳',group:G.rearTail},
 {id:'grips',title:'12 双握柄',group:G.handles}
 ];
 const e=(p,a,b)=>{const t=THREE.MathUtils.clamp((p-a)/(b-a),0,1);return t*t*(3-2*t);};
 let selected='all',amount=0;
 function apply(p){amount=p;
 G.endCap.position.set(7.0*e(p,0,.30),0,0);
 G.handles.position.set(0,-3.4*e(p,0,.30),0);
 G.frontShell.position.set(4.4*e(p,.12,.48),0,0);
 G.rearCollar.position.set(3.2*e(p,.25,.55),4.2*e(p,.55,.75),0);
 G.sideCovers.position.set(0,0,-3.3*e(p,.90,1));
 G.rearTail.position.set(-3.8*e(p,.60,.90),0,-1.8*e(p,.60,.90));
 M.frame.position.set(0,0,0);
 M.cell.position.set(-2.2*e(p,.12,.38),0,2.4*e(p,.38,.55));
 M.core.position.set(0,2.15*e(p,.76,.90),0);
 M.optics.position.set(2.25*e(p,.15,.40),0,0);
 M.cool.position.copy(G.sideCovers.position);
 M.control.position.set(0,-1.55*e(p,.48,.85),0);
 if(p>0)for(const a of assemblies)a.group.visible=selected==='all'||selected===a.id;
 }
 function select(id){selected=id;apply(amount);}
 return {apply,select,assemblies,get amount(){return amount;}};
}
