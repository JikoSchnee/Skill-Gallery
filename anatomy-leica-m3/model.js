import * as THREE from 'three';
import { buildInternals } from './internals.js';
import { sectionCaps } from './section.js';
import { buildMotionRig } from './rig.js';

// Millimetre-scale exterior study. See PLAN.md for the distinction between
// published envelope dimensions and photograph-derived/local approximations.
const TAU = Math.PI * 2;
const PAPER = 0xffffff, INK = 0x292929;
const surface = new THREE.MeshBasicMaterial({ color: PAPER, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
const ink = new THREE.LineBasicMaterial({ color: INK });
const fine = new THREE.LineBasicMaterial({ color: 0x656565 });
const outline = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  depthWrite: false,
  clipping: true,
  uniforms: { resolution: { value: new THREE.Vector2(1200, 800) }, width: { value: 0.85 } },
  vertexShader: `#include <clipping_planes_pars_vertex>
    uniform vec2 resolution; uniform float width;
    void main() {
      vec4 p = modelViewMatrix * vec4(position, 1.0);
      vec4 mvPosition = p;
      #include <clipping_planes_vertex>
      vec4 clip = projectionMatrix * p;
      vec3 n = normalize(normalMatrix * normal);
      vec2 dir = (projectionMatrix * vec4(n,0.0)).xy;
      float len = length(dir);
      if (len > 0.0001) clip.xy += dir / len * width * 2.0 / resolution * clip.w;
      gl_Position = clip;
    }`,
  fragmentShader: '#include <clipping_planes_pars_fragment>\nvoid main(){\n#include <clipping_planes_fragment>\ngl_FragColor=vec4(vec3(0.16),1.0);}',
});

export function buildM3() {
  const root = new THREE.Group(); root.name = 'Leica M3 · exterior';
  const parts = [];
  function group(name, parent = root) { const g = new THREE.Group(); g.name = name; parent.add(g); return g; }
  const body = group('body'), top = group('top-controls'), front = group('front-controls');
  const rear = group('back'), bottom = group('bottom'), lens = group('summicron-50-rigid');

  function solid(name, geometry, parent = root, pos = [0,0,0], rotation = [0,0,0], edge = true) {
    const part = group(name, parent); part.position.set(...pos); part.rotation.set(...rotation);
    part.add(new THREE.Mesh(geometry, surface));
    const hull = new THREE.Mesh(geometry, outline); hull.renderOrder = -1; part.add(hull);
    if (edge) part.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 28), ink));
    parts.push({name, assembly:parent.name});
    return part;
  }
  function line(points, parent = root, light = false, closed = false) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p)));
    const l = closed ? new THREE.LineLoop(geometry, light ? fine : ink) : new THREE.Line(geometry, light ? fine : ink);
    parent.add(l); return l;
  }
  function rounded(w,h,r) {
    const s = new THREE.Shape(), x=-w/2, y=-h/2;
    s.moveTo(x+r,y); s.lineTo(x+w-r,y); s.quadraticCurveTo(x+w,y,x+w,y+r);
    s.lineTo(x+w,y+h-r); s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    s.lineTo(x+r,y+h); s.quadraticCurveTo(x,y+h,x,y+h-r);
    s.lineTo(x,y+r); s.quadraticCurveTo(x,y,x+r,y); return s;
  }
  function extrude(shape, d, bevel = .25) {
    return new THREE.ExtrudeGeometry(shape, {depth:d, bevelEnabled:bevel>0, bevelThickness:bevel, bevelSize:bevel, bevelSegments:1, steps:1, curveSegments:20});
  }
  function plate(name,w,h,d,r,pos,parent=body,rot=[0,0,0],bevel=.2) {
    return solid(name,extrude(rounded(w,h,r),d,bevel),parent,pos,rot);
  }
  function caseBand(name,w,depth,y,h,r=15.7) {
    return plate(name,w,depth,h,r,[0,y,0],body,[-Math.PI/2,0,0],.35);
  }
  function ring(name,ro,ri,len,pos,parent=lens,axis='z') {
    const p=[[ri,0],[ro,0],[ro,len],[ri,len],[ri,0]].map(p=>new THREE.Vector2(...p));
    const geo=new THREE.LatheGeometry(p,96);
    return solid(name,geo,parent,pos,axis==='y'?[0,0,0]:axis==='x'?[0,0,-Math.PI/2]:[Math.PI/2,0,0]);
  }
  function disc(name,r,h,pos,parent=top,axis='y') { return ring(name,r,.001,h,pos,parent,axis); }
  function circle(r, center, parent, axis='z', light=false) {
    return line(Array.from({length:96},(_,i)=>{const a=TAU*i/96; return axis==='y'?[center[0]+r*Math.cos(a),center[1],center[2]+r*Math.sin(a)]:axis==='x'?[center[0],center[1]+r*Math.cos(a),center[2]+r*Math.sin(a)]:[center[0]+r*Math.cos(a),center[1]+r*Math.sin(a),center[2]];}),parent,light,true);
  }
  function knurl(radius,lo,hi,count,parent,axis='y',center=[0,0,0]) {
    const p=[];
    for(let i=0;i<count;i++){const a=i*TAU/count;for(const t of [lo,hi]) p.push(axis==='y' ? center[0]+radius*Math.cos(a):center[0]+radius*Math.cos(a), axis==='y'?center[1]+t:center[1]+radius*Math.sin(a), axis==='y'?center[2]+radius*Math.sin(a):center[2]+t);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));parent.add(new THREE.LineSegments(g,fine));
  }
  function screw(name,pos,parent,axis='z',r=1.05) {
    disc(name,r,.22,pos,parent,axis);
    if(axis==='y')line([[pos[0]-r*.7,pos[1]+.24,pos[2]],[pos[0]+r*.7,pos[1]+.24,pos[2]]],parent,true);
    else line([[pos[0]-r*.7,pos[1],pos[2]+.24],[pos[0]+r*.7,pos[1],pos[2]+.24]],parent,true);
  }
  function text(value,w,h,pos,parent,rotation=[0,0,0],script=false) {
    const c=document.createElement('canvas');c.width=Math.max(256,Math.ceil(w*30));c.height=Math.max(80,Math.ceil(h*30));
    const ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
    ctx.fillStyle='#393939';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font=`${script?'italic ':''}${Math.floor(c.height*.72)}px ${script?'Georgia':'Arial'}`;
    ctx.fillText(value,c.width/2,c.height/2,c.width*.96);
    const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:THREE.FrontSide}));
    m.position.set(...pos);m.rotation.set(...rotation);parent.add(m);return m;
  }
  function faceWindow(name,x,y,w,h) {
    plate(name+' · bezel',w,h,.65,1.9,[x,y,16.9],front);
    plate(name+' · lip',w-1.4,h-1.4,.35,1.45,[x,y,17.6],front);
    plate(name+' · pane',w-3.3,h-3.3,.06,1,[x,y,18],front,[0,0,0],0);
  }
  // Rounded ends are a continuous shell; no sharp cuboid substitute.
  // Replace the stage-one solid envelope with real walls. Preserve its outer
  // silhouette while leaving a connected interior and a clear lens throat.
  const frontWall=rounded(105.9,49.1,.4);
  const throat=new THREE.Path();throat.absarc(5,0.25,23.6,0,TAU,true);frontWall.holes.push(throat);
  solid('front chassis wall',extrude(frontWall,1.15,0),body,[0,-9.25,15.2]);
  const backWall=rounded(105.9,49.1,.4);
  const doorHole=rounded(93,42,1.4);
  const holePath=new THREE.Path(doorHole.getPoints(40).reverse());backWall.holes.push(holePath);
  solid('rear chassis wall',extrude(backWall,1.15,0),body,[0,-9.25,-16.35]);
  for(const side of [-1,1]){
    const profile=[[15.2,-33.8],[16.35,-33.8],[16.35,15.3],[15.2,15.3],[15.2,-33.8]].map(p=>new THREE.Vector2(...p));
    solid('rounded end wall '+side,new THREE.LatheGeometry(profile,64,side===1?0:Math.PI,Math.PI),body,[side*52.2,0,0]);
  }
  caseBand('base plate',138,33.5,-37.3,3.1,16.1);
  caseBand('base rim',137.4,33.1,-34.1,.5,15.9);
  const topWall=rounded(138,33.5,16.1);
  topWall.holes.push(new THREE.Path(rounded(135.6,31.1,14.9).getPoints(48).reverse()));
  solid('top cover',extrude(topWall,18.2,.15),body,[0,15.5,0],[-Math.PI/2,0,0]);
  caseBand('top shoulder edge',137.6,33.1,33.7,.6,15.8);

  // Vulcanite boundaries, retained as contour seams rather than coloured fill.
  for(const y of [-31.8,14.3]){
    const s=rounded(135.7,33.0,15.5);
    line(s.getPoints(45).map(p=>[p.x,y,-p.y]),body,true,true);
  }
  for(const x of [-50,50])line([[x,-31.8,16.57],[x,14.3,16.57]],body,true);

  faceWindow('rangefinder window',-27,24,18.7,13.9);
  faceWindow('frameline illuminator',1.8,24,23.1,14.1);
  faceWindow('viewfinder window',42.25,23.8,26.6,19.2);
  for(let i=0;i<21;i++){let x=-8.2+i;line([[x,18.7,18.12],[x,29.3,18.12]],front,true);}

  // Front-facing controls are placed independently of the lens assembly.
  disc('rewind release pivot',2.5,.8,[-52,23.7,17.05],front,'z');
  const release=plate('rewind release arm',2.1,10.5,.8,.8,[-51,27.5,17.8],front); release.rotation.z=-.45;
  text('R',3.2,3.4,[-57.5,25.5,17.2],front);
  disc('self timer plinth',4.4,1.1,[-37,-4,16.8],front,'z');
  disc('self timer pivot',2.9,1.15,[-37,-4,18],front,'z');
  const timer=plate('self timer lever',4.1,19.5,1.2,1.7,[-39.2,-12.5,18.3],front);timer.rotation.z=-.24;
  plate('self timer finger pad',5.1,5.2,.9,1.6,[-41.1,-21.1,19],front);
  screw('self timer screw',[-37,-4,19.25],front,'z',1.2);
  disc('frame selector plinth',3.2,1,[35.7,7.2,17],front,'z');
  const selector=plate('frame selector lever',2.8,13,1.2,1,[37.2,2,18.2],front);selector.rotation.z=.28;
  disc('frame selector end',2.25,1.1,[38.7,-3.6,18.5],front,'z');
  disc('lens release collar',3.3,1.9,[-24.1,2,17],front,'z');
  disc('lens release button',2.3,1.7,[-24.1,2,19],front,'z');
  ring('bayonet mounting flange',25.4,20.8,2,[5,-9,16.8],front);
  ring('bayonet face',24.9,20.7,1,[5,-9,18.8],front);
  for(let i=0;i<5;i++){const a=Math.PI/2+i*TAU/5;screw('bayonet screw '+(i+1),[5+23.5*Math.cos(a),-9+23.5*Math.sin(a),19.82],front,'z',.8);}

  // Strap eyes with real central holes.
  for(const side of [-1,1]){
    const g=group(side<0?'left strap eye':'right strap eye',body);g.position.set(side*67.7,8,2);
    const tor=new THREE.TorusGeometry(2.1,.9,10,40);tor.rotateY(Math.PI/2);
    solid('strap lug eye',tor,g,[side*1.9,0,0],[0,0,0],false);
    plate('strap lug base',4.5,8,1.7,1.7,[side*.2,0,0],g,[0,side*Math.PI/2,0]);
  }

  // Top plate: M3 uses a knob rewind, a cold accessory shoe and a single
  // non-rotating speed dial; no modern hot-shoe contact or rewind crank.
  disc('rewind plinth',9.3,1,[51,34.65,0]);
  const knobStart=top.children.length;
  disc('rewind shaft',6.9,1.4,[51,35.65,0]);
  disc('rewind knob',8.5,5.3,[51,37.05,0]);
  knurl(8.54,37.2,42.2,68,top,'y',[51,0,0]);
  disc('rewind cap',8.1,.4,[51,42.35,0]);
  disc('rewind axis',3.0,.2,[51,42.8,0]);
  for(const x of [49.7,52.3])circle(.4,[x,43.03,0],top,'y');
  const knob=group('rewind knob motion',top);
  knob.position.set(51,0,0);
  for(const part of top.children.slice(knobStart,-1)){knob.add(part);part.position.x-=51;}
  disc('speed dial foot',9.4,1.15,[-22,34.65,0]);
  disc('speed dial drum',8.65,4.8,[-22,35.8,0]);
  knurl(8.7,36,40.45,80,top,'y',[-22,0,0]);
  disc('speed dial face',8.3,.45,[-22,40.65,0]);
  const speeds=['1000','500','250','125','60','30','15','8','4','2','1','B'];
  speeds.forEach((s,i)=>{const a=-Math.PI/2+i*TAU/12; const x=-22+6.15*Math.cos(a),z=6.15*Math.sin(a);text(s,s.length>2?3.3:2.6,1.8,[x,41.15,z],top,[-Math.PI/2,0,0]);line([[-22+7.5*Math.cos(a),41.15,7.5*Math.sin(a)],[-22+8.2*Math.cos(a),41.15,8.2*Math.sin(a)]],top,true);});
  screw('speed dial centre',[-22,41.13,0],top,'y',.9);
  line([[-22,34.71,10.3],[-22,34.71,13.5]],top);

  disc('advance pivot plinth',10.5,1.4,[-51,34.65,0]);
  const leverShape=new THREE.Shape();
  leverShape.moveTo(-8,-2);leverShape.quadraticCurveTo(-11,4,-5,7);leverShape.quadraticCurveTo(0,10,6,7);
  leverShape.lineTo(23,16);leverShape.quadraticCurveTo(28,18,29,13);leverShape.quadraticCurveTo(26,10,23,11);leverShape.lineTo(7,3);leverShape.quadraticCurveTo(-2,-9,-8,-2);
  solid('single stroke advance arm',extrude(leverShape,1.6,.35),top,[-51,36.1,0],[-Math.PI/2,0,0]);
  disc('shutter release collar',6.2,2.1,[-51,37.9,0]);
  ring('shutter release cup',4.1,1.7,1.2,[-51,40,0],top,'y');
  circle(2.2,[-51,41.23,0],top,'y',true);
  ring('frame counter rim',5.5,4.7,.7,[-59,35.1,-10.1],top,'y');
  disc('frame counter window',4.65,.05,[-59,35.3,-10.1]);
  text('0',2.8,2.6,[-59,35.43,-10.1],top,[-Math.PI/2,0,0]).name='frame counter digits';
  for(let i=0;i<16;i++){const a=i*TAU/16;line([[-59+3.8*Math.cos(a),35.43,-10.1+3.8*Math.sin(a)],[-59+4.5*Math.cos(a),35.43,-10.1+4.5*Math.sin(a)]],top,true);}

  plate('cold shoe base',18.8,19,1.1,.6,[1,34.7,-4.5],top,[-Math.PI/2,0,0]);
  for(const x of [-7.5,9.5]){
    plate('shoe rail riser '+x,1.3,18,2.1,.25,[x,35.9,-4.5],top,[-Math.PI/2,0,0]);
    plate('shoe rail lip '+x,2.6,18,.65,.2,[x+(x<0?.55:-.55),38,-4.5],top,[-Math.PI/2,0,0]);
  }
  plate('shoe forward stop',16,1.1,1.7,.2,[1,35.9,4.1],top,[-Math.PI/2,0,0]);
  for(const x of [-3.8,5.8])screw('shoe screw '+x,[x,35.85,-5],top,'y',.75);
  text('Leica',21,7,[25,34.73,3.3],top,[-Math.PI/2,0,0],true);
  text('ERNST LEITZ GMBH',23,2.1,[25,34.74,9],top,[-Math.PI/2,0,0]);
  text('WETZLAR · GERMANY',23,1.9,[25,34.74,12],top,[-Math.PI/2,0,0]);
  text('M3',6,2.9,[-5,34.73,10.9],top,[-Math.PI/2,0,0]);

  // Rear door and film reminder. Rear sub-assembly is modelled in its own
  // outward-facing frame so its fasteners and lettering face the rear.
  rear.rotation.y=Math.PI;
  plate('film door',94,43,1.15,2,[0,-9.8,16.45],rear);
  plate('door inset seam',90,39,.15,1.1,[0,-9.8,17.7],rear);
  plate('door upper lip',93,1.1,.8,.4,[0,12.2,17.4],rear);
  plate('door lower lip',93,1,.55,.35,[0,-31.6,17.4],rear);
  const hinge=group('rear door hinge',rear);
  for(let i=0;i<7;i++)ring('hinge knuckle '+i,1.35,.5,12.8,[-45+i*13.1,13.3,17.1],hinge,'x');
  ring('reminder outer surround',13,11.8,.9,[0,-7.8,17.9],rear);
  disc('film reminder disc',11.6,.45,[0,-7.8,18],rear,'z');
  circle(8.6,[0,-7.8,18.5],rear,'z',true);
  ['ASA','DIN','25','50','100','200','400','800'].forEach((s,i)=>{const a=Math.PI/2-i*TAU/8;text(s,4,2,[9.6*Math.cos(a),-7.8+9.6*Math.sin(a),18.53],rear);});
  text('FILM',8,2.8,[0,-7,18.55],rear);
  screw('film reminder retainer',[0,-11,18.55],rear,'z',.75);
  ring('rear eyepiece collar',7.2,5.3,2,[-42.25,24,16.85],rear);
  ring('eyepiece rim',6.9,5.7,.9,[-42.25,24,18.9],rear);
  disc('eyepiece glass outline',5.25,.06,[-42.25,24,17],rear,'z');
  for(const [name,x] of [['X flash',16],['bulb flash',31]]){
    ring(name+' surround',4,2.8,1.4,[x,24,16.8],rear);
    ring(name+' inner socket',2.7,1.1,.4,[x,24,17.4],rear);
    circle(.9,[x,24,17.85],rear);
  }

  // Base fittings, facing downward rather than pasted onto a front face.
  bottom.rotation.x=Math.PI;
  disc('tripod thread surround',5.3,.45,[43,37.8,0],bottom,'y');
  ring('tripod socket rim',3.2,2.55,.8,[43,38.25,0],bottom,'y');
  circle(2.45,[43,38.31,0],bottom,'y',true);
  disc('bottom lock base',9.7,.65,[-48,37.8,0],bottom,'y');
  ring('bottom locking dial',8.6,7.7,.5,[-48,38.45,0],bottom,'y');
  plate('bottom lock handle',13,2.9,.7,1,[-48,38.6,0],bottom,[-Math.PI/2,0,0]);
  for(const x of [-58,58])for(const z of [-8,8])screw('base screw '+x+','+z,[x,37.85,z],bottom,'y',.8);
  text('AUF   ZU',17,2.4,[-48,37.85,12],bottom,[-Math.PI/2,0,0]);
  text('GERMANY',14,2.3,[0,37.85,0],bottom,[-Math.PI/2,0,0]);

  // Rigid Summicron: separate concentric assemblies, not a single cylinder.
  lens.position.set(5,-9,0);
  ring('lens seating collar',23.1,19.4,2,[0,0,19.9]);
  ring('distance scale barrel',25.4,18.4,8.2,[0,0,21.9]);
  ring('rear focus rim',25.9,18.4,1.1,[0,0,29.6]);
  ring('focusing grip',25.4,18.4,6.5,[0,0,30.7]);
  ring('forward focus rim',25.9,18.4,.9,[0,0,37.2]);
  for(let i=0;i<30;i++){
    const a=i*TAU/30;
    line([[25.5*Math.cos(a),25.5*Math.sin(a),30.85],[25.5*Math.cos(a),25.5*Math.sin(a),37.05]],lens,true);
  }
  ring('depth of field collar',23.7,18.2,3.6,[0,0,38.1]);
  ring('fixed central barrel',22.3,18.2,9.5,[0,0,41.7]);
  ring('aperture scale collar',22.9,18.2,4,[0,0,51.2]);
  ring('aperture grip',23.5,18.2,3.7,[0,0,55.2]);
  knurl(23.54,55.3,58.8,100,lens,'z');
  ring('front retaining collar',22.6,19.6,2.1,[0,0,58.9]);
  ring('front lip',22.7,19.65,.7,[0,0,61]);
  ring('front engraved ring',19.55,15.3,.65,[0,0,59.45]);
  ring('front element retaining ring',15.3,14.7,.35,[0,0,59.25]);
  disc('front optical element',14.65,.03,[0,0,58.9],lens,'z');
  circle(14.35,[0,0,58.96],lens,'z',true);
  // Subtle inner concentric contours describe the recessed optical surface.
  circle(12.9,[0,0,58.96],lens,'z',true);
  const legend='ERNST LEITZ GMBH WETZLAR  SUMMICRON 1:2/50';
  [...legend].forEach((ch,i)=>{
    const a=Math.PI*.92-i*TAU/legend.length;
    const m=text(ch,1.75,2.0,[17.45*Math.cos(a),17.45*Math.sin(a),60.15],lens);
    m.rotation.z=a-Math.PI/2;
  });
  function barrelText(value,a,r,z,w=3,h=2.5){
    const g=group('engraving '+value,lens);g.position.set(r*Math.cos(a),r*Math.sin(a),z);
    // Local text X is circumferential; local text Y follows the optical axis.
    const basis=new THREE.Matrix4().makeBasis(new THREE.Vector3(Math.sin(a),-Math.cos(a),0),new THREE.Vector3(0,0,-1),new THREE.Vector3(Math.cos(a),Math.sin(a),0));
    g.quaternion.setFromRotationMatrix(basis);text(value,w,h,[0,0,0],g);
  }
  ['∞','30','15','10','7','5','4','3.5'].forEach((s,i)=>barrelText(s,Math.PI*.83-i*.24,25.48,26.7,s.length*1.7+1,2.5));
  ['2','2.8','4','5.6','8','11','16'].forEach((s,i)=>barrelText(s,Math.PI*.81-i*.28,22.97,53.3,4.2,2.3));
  for(let i=-5;i<=5;i++){
    const a=Math.PI/2+i*.12;
    line([[23.78*Math.cos(a),23.78*Math.sin(a),38.2],[23.78*Math.cos(a),23.78*Math.sin(a),40.1+(i===0?1.5:0)]],lens,true);
  }
  disc('focus lock stem',1.7,1.1,[-26,-5,25],lens,'x');
  disc('focus lock button',3.1,1.2,[-27.2,-5,25],lens,'x');

  const exterior=group('exterior');
  for(const g of [body,top,front,rear,bottom,lens])exterior.add(g);
  const cutFaces=sectionCaps(exterior,surface,ink);root.add(cutFaces);
  const internal=buildInternals({root,group,solid,plate,ring,disc,line,circle,screw,extrude,rounded,text});
  const rig=buildMotionRig(root,{group,plate,line,solid,extrude,rounded},internal);
  const cut=new THREE.Plane(new THREE.Vector3(0,-1,0),-9);
  const clippedMaterials=new Map();
  exterior.traverse(obj=>{
    if(!obj.material)return;
    const original=obj.material;
    if(!clippedMaterials.has(original))clippedMaterials.set(original,original.clone());
    obj.material=clippedMaterials.get(original);
  });
  function setLayout({shell='cut',assembly='all',spread=0,film=true}){
    const isolated=assembly!=='all';exterior.visible=!isolated&&shell!=='removed';
    cutFaces.visible=!isolated&&shell==='cut';
    for(const material of clippedMaterials.values()){
      material.clippingPlanes=shell==='cut'?[cut]:[];material.needsUpdate=true;
    }
    // A complete shell always shows the assembled camera, but the inspector's
    // spread setting is retained so returning to cutaway restores their layout.
    internal.setLayout({assembly,spread:shell==='full'&&!isolated?0:spread,film});
    return internal.describe(assembly);
  }
  root.updateMatrixWorld(true);
  return {root, parts, outline,clippedMaterials,setLayout,internal,rig,bounds:new THREE.Box3().setFromObject(root)};
}
