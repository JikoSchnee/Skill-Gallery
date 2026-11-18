import * as THREE from 'three';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
// Visual prop built in arbitrary artistic units. Exterior only, no functional internals.
export function createModel(){
 const root=new THREE.Group();root.name='Desert Eagle — exterior study';
 const frame=new THREE.Group(),slide=new THREE.Group(),barrel=new THREE.Group(),magazine=new THREE.Group(),hammer=new THREE.Group();
 for(const [g,n]of [[frame,'frame'],[slide,'slide'],[barrel,'barrel'],[magazine,'magazine'],[hammer,'hammer']]){g.name=n;root.add(g);}
 function texture(){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),im=ctx.createImageData(256,256);let seed=23;for(let i=0;i<im.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const v=115+(seed%37);im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255;}ctx.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(7,7);return t;}
 const grain=texture();
 const metal=new THREE.MeshStandardMaterial({color:0xc1c6c8,metalness:.86,roughness:.29});
 const edge=new THREE.MeshStandardMaterial({color:0xd9dddd,metalness:.85,roughness:.23});
 const satin=new THREE.MeshStandardMaterial({color:0x899496,metalness:.78,roughness:.38});
 const dark=new THREE.MeshStandardMaterial({color:0x20282b,metalness:.6,roughness:.42});
 const rubber=new THREE.MeshStandardMaterial({color:0x202525,metalness:.04,roughness:.86,bumpMap:grain,bumpScale:.015});
 const check=new THREE.MeshStandardMaterial({color:0x303838,metalness:.03,roughness:.9});
 const black=new THREE.MeshStandardMaterial({color:0x050808,metalness:.1,roughness:1});
 const meshes=[];
 function add(geometry,material,parent,name,pos){const m=new THREE.Mesh(geometry,material);m.name=name;if(pos)m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);meshes.push(m);return m;}
 function box(parent,name,x,y,z,w,h,d,mat=metal,r=.025){return add(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/3,h/3,d/3)),mat,parent,name,[x,y,z]);}
 function shape(points){const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;}
 function slab(parent,name,pts,depth,mat=metal,z=0,bevel=.025){const geo=new THREE.ExtrudeGeometry(shape(pts),{depth,bevelEnabled:bevel>0,bevelSegments:3,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:24});geo.translate(0,0,-depth/2);return add(geo,mat,parent,name,[0,0,z]);}
 function pin(parent,name,x,y,z,r=.055,d=.022,mat=satin){const m=add(new THREE.CylinderGeometry(r,r,d,24),mat,parent,name,[x,y,z]);m.rotation.x=Math.PI/2;return m;}
 function screw(parent,name,x,y,z){pin(parent,name,x,y,z,.066,.022,edge);box(parent,name+' slot',x,y,z+(z>0?.014:-.014),.072,.012,.004,dark,.001);}
 // Receiver silhouette, full-width exterior and an independently modelled grip.
 slab(frame,'receiver',[[-2.13,.65],[2.92,.65],[2.92,.35],[.74,.27],[.45,.10],[-.65,.08],[-.91,-.12],[-1.98,.13],[-2.24,.34]],.78,metal);
 slab(frame,'grip frame',[[-1.97,.38],[-.85,.23],[-.90,-.18],[-1.38,-1.78],[-2.47,-1.78],[-2.31,-1.53],[-2.02,-.06]],.69,satin);
 slab(frame,'rear frame spur',[[-2.18,.63],[-2.45,.48],[-2.42,.33],[-1.91,.28],[-1.88,.61]],.65,metal);
 // Smooth black grip panels, inset checkering and screws on both sides.
 const grip=[[-1.94,.16],[-1.03,.08],[-1.03,-.22],[-1.44,-1.65],[-2.32,-1.65],[-2.16,-1.12],[-1.96,-.18]];
 for(const sign of [-1,1]){
 slab(frame,'grip panel '+sign,grip,.095,rubber,sign*.394,.045);
 slab(frame,'checkered insert '+sign,[[-1.88,-.17],[-1.16,-.17],[-1.52,-1.45],[-2.18,-1.45]],.014,check,sign*.494,.009);
 // Individual diamonds are instances, each sits on the panel surface.
 const geo=new THREE.ConeGeometry(.021,.011,4),inst=new THREE.InstancedMesh(geo,rubber,540);let count=0;const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(sign*Math.PI/2,0,Math.PI/4));const mat4=new THREE.Matrix4(),scale=new THREE.Vector3(1,1,1);
 for(let row=0;row<27;row++){const y=-.24-row*.044;const xLeft=-1.92-(Math.abs(y)-.24)*.23,xRight=-1.20-(Math.abs(y)-.24)*.27;for(let x=xLeft;x<xRight;x+=.043){mat4.compose(new THREE.Vector3(x+(row%2)*.02,y,sign*.519),q,scale);inst.setMatrixAt(count++,mat4);}}
 inst.count=count;inst.name='grip diamond texture '+sign;frame.add(inst);inst.castShadow=true;
 screw(frame,'upper grip screw '+sign,-1.53,-.04,sign*.528);screw(frame,'lower grip screw '+sign,-1.86,-1.51,sign*.528);
 pin(frame,'grip medallion '+sign,-1.73,-.86,sign*.535,.135,.015,dark);
 const ring=add(new THREE.TorusGeometry(.109,.007,6,48),satin,frame,'medallion rim '+sign,[-1.73,-.86,sign*.548]);
 }
 // Front strap grooves and grip back seams.
 for(let i=0;i<9;i++)box(frame,'front strap ridge '+i,-1.06-i*.034,-.3-i*.14,0,.035,.025,.58,satin,.008);
 // Trigger guard: an actual open silhouette, not a painted hole.
 const guard=new THREE.Shape();guard.moveTo(-.97,.26);guard.lineTo(.77,.26);guard.quadraticCurveTo(.95,.07,.85,-.35);guard.quadraticCurveTo(.72,-.70,.32,-.71);guard.lineTo(-1.03,-.71);guard.lineTo(-.98,-.54);guard.lineTo(.26,-.54);guard.quadraticCurveTo(.63,-.54,.67,-.27);guard.lineTo(.68,.09);guard.lineTo(-.97,.09);guard.closePath();
 const gg=new THREE.ExtrudeGeometry(guard,{depth:.42,bevelEnabled:true,bevelSize:.028,bevelThickness:.025,bevelSegments:3,curveSegments:32});gg.translate(0,0,-.21);add(gg,metal,frame,'open trigger guard');
 const trig=new THREE.CatmullRomCurve3([new THREE.Vector3(-.69,.14,0),new THREE.Vector3(-.52,-.10,0),new THREE.Vector3(-.51,-.31,0),new THREE.Vector3(-.65,-.46,0)]);add(new THREE.TubeGeometry(trig,24,.065,12,false),satin,frame,'decorative trigger');
 for(let i=0;i<5;i++)box(frame,'guard face rib '+i,.838,-.02-i*.073,0,.015,.018,.34,satin,.003);
 // Slide sides are separated from the fixed upper barrel shroud.
 for(const sign of [-1,1]){
 slab(slide,'slide side '+sign,[[-2.20,.69],[2.98,.69],[3.08,.83],[3.08,1.08],[.40,1.08],[.13,1.32],[-2.05,1.32],[-2.23,1.14]],.105,metal,sign*.438,.025);
 box(slide,'lower polished seam '+sign,.38,.69,sign*.49,5.16,.025,.018,edge,.006);
 for(let i=0;i<10;i++){const x=-2.02+i*.111;const rib=box(slide,'rear serration '+sign+' '+i,x,1.01,sign*.526,.033,.40,.012,dark,.006);rib.rotation.z=-.12;box(slide,'serration highlight '+sign+' '+i,x+.028,1.01,sign*.538,.012,.39,.006,edge,.003);}
 pin(slide,'safety pivot '+sign,-1.96,1.2,sign*.535,.081,.046,satin);const safety=box(slide,'safety lever '+sign,-1.80,1.205,sign*.58,.28,.065,.066,dark,.022);safety.rotation.z=.16;
 }
 box(slide,'rear slide roof',-1.18,1.32,0,1.98,.11,.84,metal,.055);
 box(slide,'rear slide end',-2.18,1.00,0,.12,.57,.81,metal,.035);
 // Flat dark recess visible from above, kept shallow as an exterior detail.
 box(slide,'upper recessed panel',-.015,1.25,0,.39,.055,.61,dark,.025);
 // Angular fixed upper shroud gives the characteristic broad long silhouette.
 const cross=shape([[-.39,-.22],[.39,-.22],[.45,.04],[.27,.32],[-.27,.32],[-.45,.04]]);
 const bg=new THREE.ExtrudeGeometry(cross,{depth:3.02,bevelEnabled:true,bevelSize:.025,bevelThickness:.02,bevelSegments:2});
 // Local x/y are cross-section z/y, extrusion z becomes world x.
 bg.rotateY(Math.PI/2);add(bg,metal,barrel,'angular barrel exterior',[.12,1.23,0]);
 box(barrel,'top rail',1.54,1.595,0,3.08,.095,.48,satin,.025);
 for(const x of [.51,1.35,2.19,2.72])box(barrel,'top rail groove '+x,x,1.65,0,.08,.012,.48,dark,.004);
 // Muzzle face with shallow dark aperture, no internal bore model.
 const mouth=add(new THREE.CylinderGeometry(.166,.166,.008,48),black,barrel,'muzzle recess',[3.17,1.24,0]);mouth.rotation.z=Math.PI/2;
 const lip=add(new THREE.TorusGeometry(.184,.021,10,64),satin,barrel,'muzzle rim',[3.177,1.24,0]);lip.rotation.y=Math.PI/2;
 // Front and rear sights, each with a supported base.
 box(barrel,'front sight base',2.86,1.70,0,.27,.075,.34,dark,.012);slab(barrel,'front sight blade',[[2.80,1.72],[2.93,1.72],[2.92,1.92],[2.84,1.92]],.075,dark,0,.008);
 box(slide,'rear sight base',-1.99,1.44,0,.30,.12,.66,dark,.015);for(const sign of [-1,1])box(slide,'rear sight ear '+sign,-1.99,1.55,sign*.208,.18,.17,.19,dark,.008);
 // Visible side controls and their pin seats.
 for(const sign of [-1,1]){
 pin(frame,'frame pin '+sign,-.69,.45,sign*.415,.064,.018,dark);
 pin(frame,'forward frame pin '+sign,.37,.46,sign*.415,.067,.02,satin);
 screw(frame,'receiver screw '+sign,1.10,.47,sign*.413);
 }
 box(frame,'side lever',-.70,.48,.45,.62,.075,.06,satin,.02);pin(frame,'magazine button',-1.02,-.04,.455,.086,.07,dark);
 // Empty magazine: only the exterior base is visible in this first stage.
 slab(magazine,'magazine exterior',[[-1.9,-.29],[-1.18,-.29],[-1.57,-1.79],[-2.25,-1.79]],.49,satin);
 box(magazine,'magazine floorplate',-1.90,-1.84,0,1.13,.15,.85,dark,.04);
 box(magazine,'floorplate lip',-1.90,-1.78,0,1.14,.045,.84,satin,.01);
 // Decorative exposed hammer spur, separate for later animation.
 hammer.position.set(-2.22,1.10,0);
 slab(hammer,'hammer',[[0,-.12],[-.26,-.07],[-.39,.22],[-.25,.29],[-.09,.05],[.04,.03]],.21,satin,0,.022);
 for(let i=0;i<4;i++)box(hammer,'hammer spur rib '+i,-.34+i*.035,.22+i*.014,0,.02,.018,.20,dark,.004);
 // Discreet lettering sits on the side surface and follows its perspective.
 function label(text,x,y,z,width,height,sign){const c=document.createElement('canvas');c.width=1024;c.height=128;let ctx=c.getContext('2d');ctx.clearRect(0,0,1024,128);ctx.fillStyle='#535e61';ctx.font='500 50px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,64);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));m.position.set(x,y,z);if(sign<0)m.rotation.y=Math.PI;slide.add(m);m.name='exterior engraving';}
 label('DESERT EAGLE',.35,.88,.520,1.53,.16,1);label('DESERT EAGLE',.35,.88,-.520,1.53,.16,-1);
 root.userData={kind:'visual exterior',units:'arbitrary',meshCount:meshes.length};
 return{root,frame,slide,barrel,magazine,hammer,meshes};
}
