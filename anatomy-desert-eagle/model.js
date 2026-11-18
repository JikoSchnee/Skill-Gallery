import * as THREE from 'three';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
// Exterior art study from the user's photograph. Arbitrary proportions, no internals.
export function createModel(){
 const root=new THREE.Group();root.name='Reference exterior revision';
 const frame=new THREE.Group(),slide=new THREE.Group(),barrel=new THREE.Group(),magazine=new THREE.Group(),hammer=new THREE.Group();
 for(const [g,n]of [[frame,'frame'],[slide,'slide'],[barrel,'barrel'],[magazine,'magazine'],[hammer,'hammer']]){g.name=n;root.add(g);}
 function grain(){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');let seed=41;ctx.fillStyle='#888';ctx.fillRect(0,0,256,256);for(let i=0;i<18000;i++){seed=(seed*1664525+1013904223)>>>0;let x=seed%256;seed=(seed*1664525+1013904223)>>>0;let y=seed%256;ctx.fillStyle=`rgb(${110+seed%37},${110+seed%37},${110+seed%37})`;ctx.fillRect(x,y,3,1);}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,4);return t;}
 const tex=grain(),metal=new THREE.MeshStandardMaterial({color:0xc7c8c6,metalness:.95,roughness:.22,bumpMap:tex,bumpScale:.0018}),edge=new THREE.MeshStandardMaterial({color:0xdbd7c8,metalness:.97,roughness:.19}),satin=new THREE.MeshStandardMaterial({color:0x85877f,metalness:.9,roughness:.36}),dark=new THREE.MeshStandardMaterial({color:0x393e3b,metalness:.8,roughness:.32}),rubber=new THREE.MeshStandardMaterial({color:0x1c201b,metalness:.08,roughness:.73,bumpMap:tex,bumpScale:.006}),black=new THREE.MeshStandardMaterial({color:0x070b0a,roughness:.97}),gold=new THREE.MeshStandardMaterial({color:0xb49a49,metalness:.85,roughness:.3});
 const meshes=[];
 function add(geo,mat,parent,name,pos){const m=new THREE.Mesh(geo,mat);m.name=name;if(pos)m.position.set(...pos);m.castShadow=m.receiveShadow=true;parent.add(m);meshes.push(m);return m;}
 function box(p,n,x,y,z,w,h,d,m=metal,r=.02){return add(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/3,h/3,d/3)),m,p,n,[x,y,z]);}
 function shape(pts){const s=new THREE.Shape();pts.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;}
 function extrude(p,n,s,d,m=metal,z=0,b=.02){const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:b>0,bevelSize:b,bevelThickness:b,bevelSegments:3,curveSegments:28,steps:1});g.translate(0,0,-d/2);return add(g,m,p,n,[0,0,z]);}
 const slab=(p,n,pts,d,m,z=0,b=.02)=>extrude(p,n,shape(pts),d,m,z,b);
 function pin(p,n,x,y,z,r=.05,d=.018,m=satin){let o=add(new THREE.CylinderGeometry(r,r,d,32),m,p,n,[x,y,z]);o.rotation.x=Math.PI/2;return o;}
 function screw(p,n,x,y,z,r=.04){pin(p,n,x,y,z,r,.018,edge);box(p,n+' slot',x,y,z+Math.sign(z)*.012,r*1.15,.009,.004,dark,.001);}
 // A low receiver seam; unlike v1 there is no deep slab below the entire slide.
 slab(frame,'lower frame',[[-2.91,.55],[1.89,.55],[2.12,.35],[1.86,.18],[1.03,.18],[.81,.02],[.59,.16],[-.09,.24],[-.39,.42],[-2.91,.42]],.66,metal,0,.025);
 slab(frame,'front lower rail',[[-2.90,.41],[-.53,.41],[-.34,.49],[-2.90,.49]],.58,satin,0,.008);
 for(let i=0;i<17;i++)box(frame,'underside rail notch '+i,-2.82+i*.13,.411,0,.038,.018,.60,dark,.003);
 // Single uninterrupted upper silhouette. Front barrel sides occupy the same height as rear slide.
 for(const sign of [-1,1]){
 slab(slide,'outer slide side '+sign,[[-3.01,.58],[2.12,.58],[2.20,.70],[2.20,1.29],[2.08,1.34],[-2.94,1.34],[-3.07,1.23],[-3.07,.78]],.075,metal,sign*.38,.022);
 box(slide,'lower side seam '+sign,-.45,.59,sign*.428,5.12,.025,.014,edge,.004);
 // Faint long inset below the forward top bevel.
 box(slide,'long flat inset '+sign,-1.35,.91,sign*.431,3.12,.35,.009,satin,.007);
 box(slide,'forward inset face '+sign,-1.35,.925,sign*.440,3.10,.32,.009,metal,.005);
 box(slide,'forward inset top '+sign,-1.35,1.11,sign*.446,3.13,.012,.009,edge,.002);
 for(let i=0;i<13;i++){const x=.65+i*.103;const g=box(slide,'rear serration '+sign+' '+i,x,.91,sign*.435,.035,.49,.012,dark,.004);g.rotation.z=.045;box(slide,'serration edge '+sign+' '+i,x-.026,.91,sign*.445,.012,.48,.008,edge,.002);}
 pin(slide,'safety pivot '+sign,1.58,1.23,sign*.465,.13,.042,satin);pin(slide,'safety cap '+sign,1.58,1.23,sign*.49,.092,.01,metal);
 const safety=slab(slide,'safety lever '+sign,[[1.51,1.29],[1.96,1.41],[2.06,1.40],[2.03,1.32],[1.63,1.18],[1.51,1.19]],.04,metal,sign*.505,.012);
 }
 // A flat bevelled upper cap, interrupted by one shallow dark exterior recess.
 function cap(x0,x1,name){const section=shape([[-.385,0],[.385,0],[.36,.10],[.25,.17],[-.25,.17],[-.36,.10]]);const g=new THREE.ExtrudeGeometry(section,{depth:x1-x0,bevelEnabled:false});g.rotateY(Math.PI/2);add(g,metal,barrel,name,[x0,1.32,0]);}
 cap(-3.01,-.34,'forward cap');cap(.52,2.13,'rear cap');
 box(slide,'top shallow recess',.09,1.345,0,.84,.022,.66,dark,.015);
 box(slide,'recess visible panel',.09,1.37,-.13,.77,.025,.32,satin,.015);
 // Photo reference has a closely spaced rail across the forward portion.
 box(barrel,'rail spine',-1.69,1.512,0,2.65,.066,.39,satin,.009);
 for(let i=0;i<14;i++){const x=-2.94+i*.189;box(barrel,'rail rib '+i,x,1.566,0,.096,.055,.46,edge,.005);box(barrel,'rail slot '+i,x+.073,1.534,0,.048,.012,.39,dark,.002);}
 // Muzzle is a short exterior face with a shallow dark aperture, no internal bore.
 const front=shape([[-.32,-.47],[.32,-.47],[.42,-.28],[.43,.20],[.28,.43],[-.28,.43],[-.43,.20],[-.42,-.28]]);
 const mg=new THREE.ExtrudeGeometry(front,{depth:.025,bevelEnabled:true,bevelSize:.018,bevelThickness:.012,bevelSegments:3});mg.rotateY(Math.PI/2);add(mg,satin,barrel,'muzzle exterior',[-3.10,1.02,0]);
 let aperture=add(new THREE.CylinderGeometry(.145,.145,.006,48),black,barrel,'shallow muzzle aperture',[-3.119,1.20,0]);aperture.rotation.z=Math.PI/2;
 let muzzleRim=add(new THREE.TorusGeometry(.166,.012,8,64),metal,barrel,'aperture lip',[-3.122,1.20,0]);muzzleRim.rotation.y=Math.PI/2;
 // Low sights matching the small silhouette of the photograph.
 box(barrel,'front sight foot',-2.85,1.602,0,.19,.07,.25,dark,.008);slab(barrel,'front blade',[[-2.91,1.62],[-2.78,1.62],[-2.82,1.78],[-2.87,1.78]],.073,metal,0,.005);
 box(slide,'rear sight foot',1.67,1.526,0,.36,.072,.52,dark,.009);for(const sign of [-1,1])slab(slide,'rear sight wing '+sign,[[1.49,1.55],[1.86,1.55],[1.79,1.73],[1.61,1.73]],.13,satin,sign*.19,.015);
 // Smooth curved grip rather than a large rectangular checkered insert.
 const gripFrame=new THREE.Shape();gripFrame.moveTo(1.02,.42);gripFrame.lineTo(2.07,.42);gripFrame.quadraticCurveTo(2.02,-.02,2.19,-.51);gripFrame.lineTo(2.52,-1.43);gripFrame.quadraticCurveTo(2.62,-1.76,2.41,-1.91);gripFrame.lineTo(1.22,-1.91);gripFrame.quadraticCurveTo(1.14,-1.80,1.20,-1.52);gripFrame.lineTo(1.05,-.15);gripFrame.closePath();extrude(frame,'grip core',gripFrame,.65,satin,0,.025);
 const grip=new THREE.Shape();grip.moveTo(1.10,.32);grip.lineTo(1.97,.32);grip.quadraticCurveTo(1.98,-.03,2.11,-.49);grip.lineTo(2.44,-1.43);grip.quadraticCurveTo(2.53,-1.73,2.35,-1.81);grip.lineTo(1.30,-1.81);grip.quadraticCurveTo(1.25,-1.70,1.29,-1.50);grip.lineTo(1.13,-.18);grip.closePath();
 for(const sign of [-1,1]){
 extrude(frame,'smooth grip '+sign,grip,.078,rubber,sign*.364,.04);
 pin(frame,'gold grip badge '+sign,1.82,-.82,sign*.456,.147,.014,gold);
 let emblem=add(new THREE.TorusGeometry(.123,.009,6,48),gold,frame,'badge rim '+sign,[1.82,-.82,sign*.468]);
 // A small relief motif, not a guessed manufacturer mark.
 slab(frame,'badge relief '+sign,[[1.75,-.88],[1.80,-.78],[1.85,-.74],[1.89,-.79],[1.83,-.84],[1.82,-.92]],.006,satin,sign*.470,.002);
 screw(frame,'grip lower screw '+sign,2.29,-1.22,sign*.455,.032);
 box(frame,'grip bottom seam '+sign,1.83,-1.80,sign*.431,1.04,.014,.012,satin,.003);
 }
 // Compact squared guard with a rounded rear corner and one open void.
 const guard=new THREE.Shape();guard.moveTo(.02,.40);guard.lineTo(1.08,.40);guard.lineTo(1.15,-.30);guard.quadraticCurveTo(1.13,-.51,.84,-.53);guard.lineTo(-.02,-.53);guard.lineTo(-.07,-.37);guard.lineTo(-.03,.20);guard.lineTo(.11,.25);guard.lineTo(.10,-.37);guard.lineTo(.79,-.37);guard.quadraticCurveTo(.96,-.37,.97,-.24);guard.lineTo(.96,.27);guard.lineTo(.02,.27);guard.closePath();extrude(frame,'trigger guard',guard,.34,metal,0,.025);
 const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(.79,.25,0),new THREE.Vector3(.84,.04,0),new THREE.Vector3(.79,-.18,0),new THREE.Vector3(.64,-.31,0)]);add(new THREE.TubeGeometry(curve,22,.052,10,false),dark,frame,'decorative trigger');
 slab(frame,'rear beavertail',[[1.91,.55],[2.31,.55],[2.68,.43],[2.73,.32],[2.28,.33],[2.09,.22],[1.99,.18]],.50,metal,0,.025);
 for(const sign of [-1,1]){pin(frame,'front frame pin '+sign,.19,.40,sign*.355,.057,.02,satin);pin(frame,'small frame pin '+sign,.64,.44,sign*.355,.037,.02,dark);box(frame,'side lever '+sign,1.31,.39,sign*.399,.65,.07,.033,satin,.008);for(let i=0;i<4;i++)box(frame,'lever rib '+sign+' '+i,1.12+i*.13,.39,sign*.42,.018,.055,.007,dark,.002);}
 box(magazine,'baseplate',1.86,-1.95,0,1.35,.075,.81,satin,.035);box(magazine,'baseplate lower',1.86,-2.003,0,1.27,.035,.74,dark,.014);
 hammer.position.set(2.12,1.05,0);slab(hammer,'exposed hammer',[[0,0],[.20,.13],[.28,.36],[.18,.41],[.05,.25],[-.06,.14]],.19,satin,0,.012);
 function lettering(sign){const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#75796e';ctx.font='36px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('DESERT EAGLE',512,64);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const mat=new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false});const m=new THREE.Mesh(new THREE.PlaneGeometry(1.3,.12),mat);m.position.set(-.86,.79,sign*.454);if(sign<0)m.rotation.y=Math.PI;slide.add(m);}
 lettering(1);lettering(-1);
 root.rotation.z=.115;
 root.userData={kind:'photograph-guided exterior',units:'artistic',meshCount:meshes.length};return{root,frame,slide,barrel,magazine,hammer,meshes};
}
