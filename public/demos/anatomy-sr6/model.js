import * as THREE from 'three';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
// Stage 1: exterior study from public multi-view prop renders. No internal design yet.
export function createModel(){
const root=new THREE.Group(),meshes=[];root.name='SR-6 shell blockout';
const teal=new THREE.MeshStandardMaterial({color:0x28858e,metalness:.48,roughness:.3}),trim=new THREE.MeshStandardMaterial({color:0x43a0a6,metalness:.55,roughness:.25}),dark=new THREE.MeshStandardMaterial({color:0x272c30,metalness:.12,roughness:.65}),green=new THREE.MeshPhysicalMaterial({color:0x22b849,metalness:0,roughness:.07,transparent:true,opacity:.55,transmission:.65,thickness:.12,ior:1.45,specularIntensity:.12,depthWrite:false,emissive:0x000000,emissiveIntensity:0,toneMapped:false}),black=new THREE.MeshStandardMaterial({color:0x11191c,roughness:.8}),shadowTeal=new THREE.MeshStandardMaterial({color:0x1d636b,metalness:.38,roughness:.42});
const groups={};for(const n of ['frontShell','rearCollar','endCap','sideCovers','rearTail','handles','surfaceDetails']){groups[n]=new THREE.Group();groups[n].name=n;root.add(groups[n]);}
function mesh(geo,mat,group,name,pos){const m=new THREE.Mesh(geo,mat);m.name=name;if(pos)m.position.set(...pos);m.castShadow=m.receiveShadow=true;group.add(m);meshes.push(m);return m;}
function lathe(group,name,profile,mat=teal,segments=96,start=0,length=Math.PI*2){const geo=new THREE.LatheGeometry(profile.map(([x,r])=>new THREE.Vector2(r,x)),segments,start,length);geo.rotateZ(-Math.PI/2);return mesh(geo,mat,group,name);}
function cylinder(group,name,c,r,len,mat=teal,axis=[1,0,0],r2=r){const o=mesh(new THREE.CylinderGeometry(r2,r,len,64),mat,group,name,c);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(...axis).normalize());return o;}
function torus(group,name,c,r,t,mat=trim,axis=[1,0,0]){const o=mesh(new THREE.TorusGeometry(r,t,12,96),mat,group,name,c);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(...axis));return o;}
function box(group,name,c,size,mat=teal,r=.035){return mesh(new RoundedBoxGeometry(...size,3,r),mat,group,name,c);}
function tube(group,name,points,r,mat=teal){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),36,r,12,false),mat,group,name);}
// A gently flared front chamber and rounded rear shoulder, kept as separate shells.
lathe(groups.frontShell,'main cylindrical housing',[[-.25,1.19],[-.19,1.27],[.05,1.31],[1.85,1.39],[2.02,1.39],[2.06,1.33],[2.00,1.27],[.05,1.19],[-.25,1.10],[-.25,1.19]]);
// Glass sectors replace the shoulder skin rather than overlaying opaque metal.
lathe(groups.rearCollar,'rear shoulder rim',[[-1,.74],[-.94,.96],[-.8,1.12],[-.79,1.137],[-.79,1.04],[-.89,.72],[-1,.74]]);
lathe(groups.rearCollar,'front shoulder rim',[[-.48,1.228],[-.34,1.22],[-.28,1.18],[-.3,1.09],[-.48,1.12],[-.48,1.228]]);
for(const start of [1.12,Math.PI+1.12])lathe(groups.rearCollar,'shoulder bridge '+start,[[-.79,1.137],[-.63,1.206],[-.48,1.228],[-.48,1.12],[-.63,1.10],[-.79,1.04],[-.79,1.137]],teal,32,start,Math.PI-2.24);
lathe(groups.rearCollar,'dark joining seam',[[-.3,1.205],[-.18,1.26]],dark);
for(let i=0;i<40;i++){const a=i*Math.PI*2/40;const o=box(groups.surfaceDetails,'collar segment '+i,[-.245,Math.cos(a)*1.23,Math.sin(a)*1.23],[.07,.065,.12],black,.006);o.rotation.x=a;}
// Green band on both sides of the rear collar, following the cylinder surface.
lathe(groups.rearCollar,'green collar band',[[-.79,1.137],[-.63,1.206],[-.48,1.228]],green,36,-1.12,2.24);
lathe(groups.rearCollar,'green collar band opposite',[[-.79,1.137],[-.63,1.206],[-.48,1.228]],green,36,Math.PI-1.12,2.24);
torus(groups.frontShell,'front rim',[2.01,0,0],1.365,.052);
lathe(groups.endCap,'dark domed end',[[2.05,.70],[2.05,1.31],[2.17,1.30],[2.33,1.22],[2.46,1.08],[2.55,.88],[2.59,.71],[2.05,.70]],dark);
lathe(groups.endCap,'green end lens',[[2.595,.72],[2.635,.70],[2.70,.58],[2.735,.38],[2.75,0]],green);
// Radial shallow seams on the dark exterior end cap.
for(let i=0;i<20;i++){const a=i*Math.PI/10;const ps=[[2.10,1.305],[2.30,1.235],[2.46,1.075],[2.55,.89]].map(([x,r])=>[x,Math.cos(a)*r,Math.sin(a)*r]);tube(groups.surfaceDetails,'cap groove '+i,ps,.008,black);}
// Five mirrored ribs above and below; each central rib is slightly larger.
for(const [row,base]of [['top',0],['bottom',Math.PI]])for(let i=-2;i<=2;i++){
 const a=base+i*.34,center=i===0,thickness=center?.080:.057;
 const pts=[[.98,1.365],[1.25,1.42],[1.8,1.465],[2.00,1.43]].map(([x,r])=>[x,Math.cos(a)*(r+(center?.018:0)),Math.sin(a)*(r+(center?.018:0))]);
 const rib=tube(groups.surfaceDetails,'raised barrel rib '+row+' '+i,pts,thickness,trim);rib.userData={row,index:i,angle:a,thickness};
}
// Rear connecting waist and two externally visible turbine-like covers.
// The transverse fan drum now supplies the connecting waist.
// Continuous drum skin, parameterised as an unwrapped cylinder with real openings.
const drumShape=new THREE.Shape();drumShape.moveTo(-Math.PI,-.64);drumShape.lineTo(Math.PI,-.64);drumShape.lineTo(Math.PI,.64);drumShape.lineTo(-Math.PI,.64);drumShape.closePath();
const outletHole=new THREE.Path();outletHole.absellipse(0,0,.34,.27,0,Math.PI*2,true);drumShape.holes.push(outletHole);
// Rear service opening sits inside the tail connection and clears the hinged lid/cartridge.
const serviceHole=new THREE.Path();serviceHole.moveTo(-2.55,-.56);serviceHole.lineTo(-2.55,.56);serviceHole.lineTo(-.38,.56);serviceHole.lineTo(-.38,-.56);serviceHole.closePath();drumShape.holes.push(serviceHole);
function drumSkin(r,shape=drumShape){const flat=new THREE.ShapeGeometry(shape,64);const source=flat.toNonIndexed(),positions=[];
 // Subdivide the planar triangulation before wrapping, preserving smooth circular walls.
 const p=source.attributes.position;function tri(a,b,c,depth){if(depth){const ab=a.clone().add(b).multiplyScalar(.5),bc=b.clone().add(c).multiplyScalar(.5),ca=c.clone().add(a).multiplyScalar(.5);tri(a,ab,ca,depth-1);tri(ab,b,bc,depth-1);tri(ca,bc,c,depth-1);tri(ab,bc,ca,depth-1);return;}for(const v of [a,c,b])positions.push(-1.53+r*Math.sin(v.x),.03+r*Math.cos(v.x),v.y);}
 for(let i=0;i<p.count;i+=3)tri(new THREE.Vector2(p.getX(i),p.getY(i)),new THREE.Vector2(p.getX(i+1),p.getY(i+1)),new THREE.Vector2(p.getX(i+2),p.getY(i+2)),3);
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));const normals=[];for(let i=0;i<positions.length;i+=3){const dx=positions[i]+1.53,dy=positions[i+1]-.03,d=Math.hypot(dx,dy);normals.push(dx/d,dy/d,0);}geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));return geo;}
mesh(drumSkin(.79),teal,groups.sideCovers,'continuous fan drum outer');mesh(drumSkin(.745),shadowTeal,groups.sideCovers,'continuous fan drum inner');
// Curved bell-mouth joins the exact opening boundary to the exhaust tube, without a cap.
for(const inner of [false,true]){const positions=[],indices=[],R=64,L=12;for(let i=0;i<=L;i++){const t=i/L,s=t*t*(3-2*t);for(let j=0;j<=R;j++){const a=j/R*Math.PI*2,u=.34*Math.cos(a),r=inner?.745:.79,base=new THREE.Vector3(-1.53+r*Math.sin(u),.03+r*Math.cos(u),.27*Math.sin(a)),end=new THREE.Vector3(-1.53+(inner?.155:.20)*Math.cos(a),.94,(inner?.155:.20)*Math.sin(a));base.lerp(end,s);positions.push(base.x,base.y,base.z);if(i<L&&j<R){const k=i*(R+1)+j;indices.push(k,k+1,k+R+1,k+1,k+R+2,k+R+1);}}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();mesh(geo,inner?shadowTeal:teal,groups.sideCovers,inner?'exhaust root inner':'exhaust root fillet');}
for(const sign of [-1,1]){
const g=groups.sideCovers,z=sign*.64; cylinder(g,'turbine backing '+sign,[-1.53,.03,z],.79,.16,teal,[0,0,1]);
cylinder(g,'dark external grille '+sign,[-1.53,.03,z+sign*.115],.64,.045,black,[0,0,1]);
torus(g,'rounded turbine bezel '+sign,[-1.53,.03,z+sign*.15],.704,.12,teal,[0,0,1]);
for(let i=0;i<20;i++){const a=i*Math.PI/10;const sh=new THREE.Shape();[[.27,0],[.59,-.037],[.62,.065],[.31,.11]].forEach(([x,y],j)=>j?sh.lineTo(x,y):sh.moveTo(x,y));sh.closePath();const geo=new THREE.ExtrudeGeometry(sh,{depth:.025,bevelEnabled:false});const m=mesh(geo,dark,g,'grille vane '+sign+' '+i,[-1.53,.03,z+sign*.155]);m.rotation.z=a;if(sign<0)m.rotation.y=Math.PI;}
cylinder(g,'green grille hub '+sign,[-1.53,.03,z+sign*.205],.255,.045,green,[0,0,1]);torus(g,'hub rim '+sign,[-1.53,.03,z+sign*.23],.235,.018,green,[0,0,1]);}
// Upper hinged lid and fixed lower cradle, split along the horizontal seam.
const tailProfile=[[-3.37,.055],[-3.15,.24],[-2.83,.42],[-2.40,.56],[-2.13,.57],[-2.15,.50],[-2.41,.49],[-2.83,.35],[-3.15,.17],[-3.37,.055]];
const lowerLid=new THREE.Group();lowerLid.name='lower tail hinge';lowerLid.position.set(-2.13,-.08,0);groups.rearTail.add(lowerLid);
const lowerShell=lathe(lowerLid,'lower tail shell',tailProfile,teal,48,.025,Math.PI-.05);lowerShell.position.set(2.13,.08,0);
const lid=new THREE.Group();lid.name='tail lid hinge';lid.position.set(-2.13,.08,0);groups.rearTail.add(lid);
const lidShell=lathe(lid,'upper tail lid',tailProfile,teal,48,Math.PI+.025,Math.PI-.05);lidShell.position.set(2.13,-.08,0);
// Close the service opening with matching opaque skins; only its upper panel rides the lid.
for(const [name,lo,hi,moving]of [['lower drum closure',-2.55,-Math.PI/2,false],['upper drum access lid',-Math.PI/2,-.38,true]]){
 const panel=new THREE.Shape();panel.moveTo(lo,-.56);panel.lineTo(hi,-.56);panel.lineTo(hi,.56);panel.lineTo(lo,.56);panel.closePath();
 for(const [r,material,suffix]of [[.79,teal,' outer'],[.745,shadowTeal,' inner']]){const cover=mesh(drumSkin(r,panel),material,moving?lid:lowerLid,name+suffix);cover.position.set(2.13,moving?-.08:.08,0);}
}

for(const sign of [-1,1])cylinder(groups.rearTail,'tail hinge pin '+sign,[-2.13,.08,sign*.53],.075,.10,dark,[0,0,1]);
for(const sign of [-1,1])cylinder(groups.rearTail,'tail hinge end '+sign,[-2.13,.08,sign*.56],.09,.055,trim,[0,0,1]);
// Single short hollow exhaust on the central plane above the fan assembly.
for(const sign of [0]){
 const z=0,g=groups.sideCovers;
 const curve=new THREE.CatmullRomCurve3([[-1.53,.94,z],[-1.53,1.02,z],[-1.70,1.15,z],[-1.96,1.18,z]].map(p=>new THREE.Vector3(...p)));
 const N=56,R=48,frames=curve.computeFrenetFrames(N,false);
 const radius=t=>.20+.055*t;
 function wall(inner){const pos=[],idx=[];for(let i=0;i<=N;i++){const t=i/N,p=curve.getPointAt(t),r=radius(t)-(inner?.045:0);for(let j=0;j<=R;j++){const a=j/R*Math.PI*2,v=p.clone().addScaledVector(frames.normals[i],r*Math.cos(a)).addScaledVector(frames.binormals[i],r*Math.sin(a));pos.push(v.x,v.y,v.z);if(i<N&&j<R){const k=i*(R+1)+j;idx.push(k,k+R+1,k+1,k+1,k+R+1,k+R+2);}}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();return geo;}
 mesh(wall(false),teal,g,'exhaust outer wall '+sign);mesh(wall(true),shadowTeal,g,'exhaust inner wall '+sign);
 const end=curve.getPointAt(1),tangent=curve.getTangentAt(1),rim=mesh(new THREE.RingGeometry(.210,.255,64),trim,g,'open exhaust lip '+sign,end.toArray());rim.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),tangent);
 for(let i=0;i<3;i++){const t=.26+i*.27;torus(g,'exhaust rib '+sign+' '+i,curve.getPointAt(t).toArray(),radius(t)+.004,.018,trim,curve.getTangentAt(t).toArray());}
}
// The two handles have different positions and profiles, as in the reference.
function grip(name,points){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),N=64,R=18,frames=curve.computeFrenetFrames(N,false),pos=[],idx=[];for(let i=0;i<=N;i++){const t=i/N,p=curve.getPointAt(t),radius=.17*(.76+.24*Math.sin(Math.PI*t))*(1+.10*Math.cos(t*8*Math.PI));for(let j=0;j<R;j++){const a=j*2*Math.PI/R,v=p.clone().addScaledVector(frames.normals[i],Math.cos(a)*radius).addScaledVector(frames.binormals[i],Math.sin(a)*radius);pos.push(v.x,v.y,v.z);if(i<N){const a0=i*R+j,b=i*R+(j+1)%R;idx.push(a0,b,b+R,a0,b+R,a0+R);}}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();mesh(geo,dark,groups.handles,name);const end=curve.getPointAt(1);cylinder(groups.handles,name+' end',end.toArray(),.13,.03,teal,curve.getTangentAt(1).toArray());}
box(groups.handles,'rear lower bracket',[-1.13,-.77,0],[.43,.28,.35],dark);
cylinder(groups.handles,'rear pivot',[-1.11,-.91,.16],.19,.15,dark,[0,0,1]);cylinder(groups.handles,'rear pivot cap',[-1.11,-.91,.25],.10,.025,teal,[0,0,1]);
tube(groups.handles,'rear grip support',[[-1.12,-.91,0],[-1.42,-1.13,0],[-1.95,-1.18,0]],.15,teal);
cylinder(groups.handles,'rear handle collar',[-2.02,-1.18,0],.23,.17,trim);
grip('rear rubber grip',[[-2.10,-1.18,0],[-2.47,-1.18,0],[-2.90,-1.15,0],[-3.22,-1.12,0]]);cylinder(groups.handles,'rear small button',[-3.26,-1.12,0],.064,.04,new THREE.MeshStandardMaterial({color:0xbb303f,roughness:.6}));
box(groups.handles,'front lower bracket',[.36,-1.32,0],[.46,.23,.32],dark);
tube(groups.handles,'front handle arm',[[.36,-1.37,0],[.48,-1.58,0],[.76,-1.59,0]],.072,dark);
cylinder(groups.handles,'front pivot',[.78,-1.64,0],.145,.30,dark,[0,0,1]);cylinder(groups.handles,'front pivot face',[.78,-1.64,.16],.095,.025,trim,[0,0,1]);
grip('front curved rubber grip',[[.80,-1.75,0],[.94,-1.94,0],[1.23,-2.10,0],[1.56,-2.20,0]]);
// Lettering follows a cylindrical patch, so it stays attached under rotation.
for(const sign of [-1,1]){const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#20292b';ctx.font='bold 150px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('SR-6',256,130);const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;const geo=new THREE.PlaneGeometry(1.47,.55,1,16),p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i)+.85,y=p.getY(i)+.02,r=1.31+(x-.05)/1.8*.08;p.setXYZ(i,x,y,sign*(Math.sqrt(r*r-y*y)+.006));}geo.computeVertexNormals();const label=mesh(geo,new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,side:THREE.DoubleSide}),groups.surfaceDetails,'SR-6 marking '+sign);if(sign<0){const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,1-uv.getX(i));}}
root.userData={stage:'exterior blockout',reference:'https://www.wf3d.shop/products/despicable-me-shrink-ray-3d-file',internalComponents:false};return{root,meshes,groups,chargeGlass:green};
}
