import * as THREE from 'three';
// Original fictional prop layout, in arbitrary scene units; no functional weapon mechanism.
export function createInterior(){
 const root=new THREE.Group();root.name='Original fictional interior';const modules=[];
 const mat=(color,metalness=.55)=>new THREE.MeshStandardMaterial({color,metalness,roughness:.34});
 const silver=mat(0x9caeb2),dark=mat(0x283a43),gold=mat(0xb99152),cyan=mat(0x65d9c3,.15),violet=mat(0x927caf,.25),pcb=mat(0x225b58,.1);
 function group(id,title,description,color){const g=new THREE.Group();g.name=title;root.add(g);modules.push({id,title,description,color,group:g});return g;}
 function mesh(g,geo,m,p){const o=new THREE.Mesh(geo,m);if(p)o.position.set(...p);o.castShadow=o.receiveShadow=true;g.add(o);return o;}
 function box(g,p,s,m){return mesh(g,new THREE.BoxGeometry(...s),m,p);}
 function cyl(g,p,r,l,m,axis=[1,0,0]){const o=mesh(g,new THREE.CylinderGeometry(r,r,l,48),m,p);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(...axis));return o;}
 function ring(g,x,r,t,m){const o=mesh(g,new THREE.TorusGeometry(r,t,12,64),m,[x,0,0]);o.rotation.y=Math.PI/2;return o;}
 function wire(g,ps,m,r=.025){return mesh(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ps.map(p=>new THREE.Vector3(...p))),32,r,8,false),m);}
 const frame=group('frame','01 承载骨架','下方双导轨与环形隔框，为芯舱、前端透镜和底部控制板提供安装位置。','#9caeb2');
 for(const z of [-.55,.55]){box(frame,[.53,-.78,z],[2.95,.10,.10],silver);for(const x of [-.75,.38,1.8]){box(frame,[x,-.69,z],[.14,.20,.18],dark);cyl(frame,[x,-.565,z],.045,.045,gold,[0,1,0]);}}
 for(const x of [-.8,1.9]){ring(frame,x,.94,.055,silver);for(let i=0;i<8;i++){const a=i*Math.PI/4;cyl(frame,[x+.045,Math.cos(a)*.94,Math.sin(a)*.94],.038,.07,gold);}}
 const cell=group('cell','02 尾部能量匣','尾部锥壳中的虚构能量匣；前端接入后部接口座，轴向空间与主芯舱分开。','#927caf');
 cyl(cell,[-2.19,0,0],.32,.92,dark);cyl(cell,[-2.19,0,0],.276,.82,violet);
 for(const x of [-2.65,-2.48,-1.9,-1.73])ring(cell,x,.32,.035,silver);
 for(let i=0;i<6;i++){const a=i*Math.PI/3;box(cell,[-2.18,Math.cos(a)*.285,Math.sin(a)*.285],[.65,.065,.065],violet);}
 cyl(cell,[-1.60,0,0],.24,.18,gold);cyl(cell,[-1.42,0,0],.39,.18,dark);
 const core=group('core','03 中央缩小芯舱','原创虚构晶体与三道定场环，置于主筒中央。晶体、环架和连接梁均为独立几何体。','#65d9c3');
 const crystal=mesh(core,new THREE.IcosahedronGeometry(.42,0),cyan,[.02,0,0]);crystal.material=crystal.material.clone();crystal.scale.x=1.6;
 for(const x of [-.62,.03,.68]){ring(core,x,.62,.065,gold);ring(core,x,.72,.024,dark);for(let i=0;i<4;i++){const a=i*Math.PI/2;box(core,[x,Math.cos(a)*.68,Math.sin(a)*.68],[.18,.12,.12],silver);}}
 for(const a of [Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4]){box(core,[.03,Math.cos(a)*.73,Math.sin(a)*.73],[1.44,.055,.055],silver);}
 cyl(core,[-.96,0,0],.28,.17,dark);cyl(core,[-1.16,0,0],.14,.23,gold);
 const optics=group('optics','04 前端光学组件','两道透镜座和一组固定光阑，布置在芯舱与绿色端面之间；聚焦时前透镜沿轴向前移，光阑收拢。','#b99152');
 for(const x of [1.12,1.67]){ring(optics,x,.71,.075,silver);ring(optics,x,.58,.025,gold);cyl(optics,[x,0,0],.57,.045,new THREE.MeshPhysicalMaterial({color:0x8edcd2,metalness:.12,roughness:.16,transparent:true,opacity:.26,depthWrite:false}));}
 for(const a of [0,2.094,4.189])box(optics,[1.41,Math.cos(a)*.75,Math.sin(a)*.75],[.82,.065,.065],dark);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;const o=box(optics,[1.94,Math.cos(a)*.46,Math.sin(a)*.46],[.04,.24,.20],gold);o.rotation.x=a+.35;}
 ring(optics,1.94,.65,.045,dark);
 const cool=group('cool','05 双侧散热组件','位于原有侧罩内的成对风轮与翅片座；风轮随充能强度转动，暂停可检查姿态。','#68869c');
 for(const s of [-1,1]){cyl(cool,[-1.53,.03,s*.45],.49,.10,dark,[0,0,1]);cyl(cool,[-1.53,.03,s*.54],.12,.07,gold,[0,0,1]);for(let i=0;i<10;i++){const a=i*Math.PI/5;const o=box(cool,[-1.53+Math.cos(a)*.29,.03+Math.sin(a)*.29,s*.51],[.29,.065,.045],silver);o.rotation.z=a+.5;}for(let i=0;i<7;i++)box(cool,[-1.5+i*.085-.255,-.43,s*.32],[.035,.22,.25],silver);}
 const control=group('control','06 控制板与线束','主筒底部托盘上的控制板、插座和沿边线束。握柄接口接入下方，线束避开中央晶体。','#397e6b');
 box(control,[.45,-.99,0],[1.85,.06,.65],dark);box(control,[.45,-.94,0],[1.72,.025,.57],pcb);
 for(const x of [-.14,.3,.74]){box(control,[x,-.89,0],[.23,.075,.22],dark);for(const s of [-1,1])for(let i=0;i<5;i++)box(control,[x-.09+i*.045,-.91,s*.14],[.018,.025,.07],gold);}
 for(const x of [-.31,1.21])for(const z of [-.22,.22])cyl(control,[x,-.9,z],.035,.08,silver,[0,1,0]);
 for(const [z,m]of [[.38,gold],[-.38,cyan]]){const ps=[[-1.32,-.35,z],[-.98,-.62,z],[-.65,-.87,z],[.1,-.87,z],[.95,-.87,z],[1.22,-.89,z*.6]];wire(control,ps,m);for(const p of [ps[0],ps.at(-1)])box(control,p,[.12,.10,.10],dark);}
 box(control,[.36,-1.15,0],[.23,.25,.23],silver);
 root.userData={fictional:true,animated:false};return {root,modules};
}
