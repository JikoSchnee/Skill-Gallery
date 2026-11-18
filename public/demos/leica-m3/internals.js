import * as THREE from 'three';

// Layout reconstruction informed by the Leitz service sheets recorded in
// PLAN.md. Gears/prisms/optical curves are simplified, not manufacturing CAD.
export function buildInternals(api){
  const {group,solid,plate,ring,disc,line,circle,screw,extrude,rounded,text}=api;
  const TAU=Math.PI*2;
  const descriptions={
    all:['内部总览','胶片通道、布帘快门、过片机构、测距组件与镜头。过片、释放与倒片共享一套机械状态。'],
    chassis:['承载骨架','开放式承载板、镜头喉口、画幅窗口与导片轨。'],
    film:['胶片与输片','供片暗盒、收片轴、齿孔驱动轴、胶片与压片板。隐藏胶片可检查后方帘幕。'],
    shutter:['布帘快门','双布帘、卷帘鼓、两根弹簧轴、帘带与边条。两片帘幕按顺序横向运行，动作以慢放显示。'],
    drive:['过片与释放','单次过片轴、离合棘轮、计数盘、快门速度凸轮与释放杆。齿形及局部机构简化。'],
    finder:['取景与测距','取景物镜、测距入口、合像组件、亮框片与联动滚轮。棱镜轮廓为布局示意。'],
    optics:['镜头与光圈','逐片半剖的镜片、隔圈、光圈与对焦套筒。曲率和间距未按光学处方标定。'],
  };
  const assemblies={};
  for(const key of Object.keys(descriptions).filter(k=>k!=='all'))assemblies[key]=group('internal-'+key);
  const {chassis,film,shutter,drive,finder,optics}=assemblies;
  const photographicFilm=group('photographic-film-and-pressure-plate',film);

  function hole(shape,x,y,r){const p=new THREE.Path();p.absarc(x,y,r,0,TAU,true);shape.holes.push(p);}
  function rectangularHole(shape,x,y,w,h,r=.3){
    const p=rounded(w,h,r).getPoints(20).reverse().map(p=>new THREE.Vector2(p.x+x,p.y+y));shape.holes.push(new THREE.Path(p));
  }
  function frame(name,w,h,iw,ih,pos,parent,depth=1){
    const s=rounded(w,h,1);rectangularHole(s,0,0,iw,ih,.3);return solid(name,extrude(s,depth,.1),parent,pos);
  }
  function board(name,w,d,y,parent,holes=[],x=0,z=0){
    const s=rounded(w,d,Math.min(d/3,4));
    holes.forEach(([hx,hz,r])=>hole(s,hx,hz,r));
    return solid(name,extrude(s,1.1,.12),parent,[x,y,z],[-Math.PI/2,0,0]);
  }
  function gear(name,r,teeth,h,pos,parent,axis='y'){
    const s=new THREE.Shape();
    for(let i=0;i<teeth*4;i++){
      const a=i*TAU/(teeth*4),rr=i%4<2?r:r-.7;
      const p=[rr*Math.cos(a),rr*Math.sin(a)];i?s.lineTo(...p):s.moveTo(...p);
    }s.closePath();hole(s,0,0,1.25);
    const g=solid(name,extrude(s,h,.03),parent,pos,axis==='y'?[-Math.PI/2,0,0]:[0,0,0]);
    return g;
  }
  function rod(name,r,start,end,parent){
    const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end),v=b.clone().sub(a);
    const g=solid(name,new THREE.CylinderGeometry(r,r,v.length(),20),parent,a.clone().add(b).multiplyScalar(.5).toArray());
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return g;
  }
  function spring(name,center,r,length,turns,parent){
    const points=Array.from({length:turns*24+1},(_,i)=>{const t=i/(turns*24),a=t*turns*TAU;return new THREE.Vector3(center[0]+r*Math.cos(a),center[1]+length*t,center[2]+r*Math.sin(a));});
    solid(name,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),turns*24,.22,6,false),parent,[0,0,0],[0,0,0],false);
  }
  function strip(name,points,width,parent){
    const vectors=points.map(p=>new THREE.Vector3(...p));const path=new THREE.CatmullRomCurve3(vectors,false,'centripetal');
    const ps=path.getPoints(80);const vertices=[],indices=[];
    ps.forEach(p=>vertices.push(p.x,p.y-width/2,p.z,p.x,p.y+width/2,p.z));
    for(let i=0;i<ps.length-1;i++){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
    const g=solid(name,geo,parent,[0,0,0],[0,0,0],false);
    g.children.filter(c=>c.isMesh).forEach(c=>{c.material=c.material.clone();c.material.side=THREE.DoubleSide;});
    line(ps.map(p=>[p.x,p.y-width/2,p.z]),g);line(ps.map(p=>[p.x,p.y+width/2,p.z]),g);return g;
  }

  // Open chassis based on the late shutter-frame sheet 42-253/17.4. It is
  // intentionally a load-bearing frame rather than opaque enclosing blocks.
  const bridge=rounded(126,24,9);
  for(const [x,z,r] of [[-51,0,6],[-31,0,4],[5,0,8],[31,0,3.7],[38,0,3.7],[51,0,6]])hole(bridge,x,z,r);
  solid('upper shutter chassis bridge',extrude(bridge,1.6,.15),chassis,[0,12,0],[-Math.PI/2,0,0]);
  board('lower shutter chassis bridge',124,23,-31.8,chassis,[[-51,0,4],[31,0,3.6],[38,0,3.6]],0,0);
  frame('36 by 24 film gate',43,31,36,24,[5,-9,-8.1],chassis,1.0);
  for(const y of [-26.5,8.5])plate('film guide rail '+y,77,1.2,1.3,.3,[2,y,-9.9],chassis);
  for(const x of [-31.4,41.4]){
    plate('vertical chassis brace '+x,2.2,41,5,.6,[x,-10,7],chassis);
    for(const y of [-28.6,10.4])screw('brace fastener '+x+','+y,[x,y,12.2],chassis,'z',.8);
  }
  const throat=ring('internal lens throat',23.3,21.7,4,[5,-9,11.2],chassis);
  for(const x of [-15,25])for(const y of [-27,9]){
    rod('throat mounting pillar',.85,[x,y,9],[x,y,14.5],chassis);
    screw('throat fixing screw',[x,y,14.55],chassis,'z',.7);
  }

  // Viewed from the lens: supply cartridge is right; take-up is left.
  // A removable 35mm cartridge is a loadable item, not an integral camera part.
  ring('film cartridge shell',11.1,10.5,37.5,[51,-28,0],film,'y');
  for(const y of [-28.5,9.5])disc('cartridge cap '+y,11.2,.65,[51,y,0],film);
  disc('cartridge spool core',2.8,43,[51,-30,0],film);
  plate('cartridge light trap',3,35,1.2,.4,[44,-9.25,-10.7],film);
  disc('rewind coupling shaft',2.5,20,[51,10.5,0],film);
  plate('rewind fork',6,5,1,.5,[51,10.5,0],film,[Math.PI/2,0,0]);
  disc('take-up spool core',4.1,37.5,[-51,-28,0],film);
  for(const y of [-28.6,9.5])disc('take-up spool flange '+y,9,.8,[-51,y,0],film);
  ring('take-up spool upper hub',4.7,2.5,4,[-51,10.3,0],film,'y');
  plate('take-up spring clamp',2.3,29,.6,.5,[-53,-8,-5],film);
  for(const y of [-23,6])screw('take-up clamp rivet '+y,[-53,y,-4.3],film,'z',.55);
  disc('sprocket spindle',3.2,37,[-36,-28,-6.3],film);
  // Two 8-tooth crowns engage the two rows of film perforations.
  for(const y of [-24.8,4.7])gear('film sprocket crown '+y,4.35,8,1.6,[-36,y,-6.3],film);
  for(const y of [-28.8,9.2])ring('sprocket bush '+y,4.5,3.2,.8,[-36,y,-6.3],film,'y');
  // Curved leaders terminate at the cartridge slit and spool clamp.
  strip('take-up film leader',[[-38,-9,-10.6],[-44,-9,-10.4],[-49,-9,-7],[-53,-9,-5]],35,photographicFilm);
  strip('supply film leader',[[44,-9,-10.6],[45,-9,-9.6],[45.4,-9,-8.8]],35,photographicFilm);
  plate('pressure plate',40,28,.65,.8,[5,-9,-13.0],photographicFilm);
  for(const x of [-10,20]){
    plate('pressure plate spring clip '+x,4,18,.3,1,[x,-9,-14.1],photographicFilm);
    for(const y of [-16,-2])screw('pressure plate spring rivet',[x,y,-13.7],photographicFilm,'z',.65);
  }

  // Cloth curtains and ribbons after late sheet 42-253/16.2. The slight edge
  // overlap is intentional; no slit, shutter cycle or timing is simulated.
  disc('curtain winding drum',4.5,32,[-24,-25,0],shutter);
  for(const [x,z] of [[30,0],[37,0]]){
    ring('curtain spring roller '+x,2.7,1.2,32,[x,-25,z],shutter,'y');
    disc('spring roller spindle '+x,.9,37,[x,-27.5,z],shutter);
    for(const y of [-26.3,7])ring('spring roller cap '+x+','+y,3.1,1,1.2,[x,y,z],shutter,'y');
    screw('roller tension adjuster '+x,[x,10.7,z],shutter,'y',1.1);
  }
  for(const y of [-26.4,7])ring('winding drum end '+y,4.9,1.2,1.3,[-24,y,0],shutter,'y');
  gear('curtain winding drum gear',5.6,24,1.3,[-24,-28.4,0],shutter);
  board('curtain bearing bridge',69,8,9.3,shutter,[[-28,0,1.2],[26,0,1],[33,0,1]],4,0);

  // Single-stroke advance and counter carrier, sheet 42-253/11.3.
  disc('advance drive shaft',2.1,57,[-51,-27,0],drive);
  ring('advance clutch sleeve',4.1,2.2,8,[-51,17,0],drive,'y');
  gear('advance clutch ratchet',8.3,28,1.5,[-51,25.2,0],drive);
  ring('advance clutch upper washer',5.8,2.2,1,[-51,27,0],drive,'y');
  board('counter and advance carrier',23,19,29.1,drive,[[-6,-4,2.0],[3,2,3.5]],-54,-2);
  disc('frame counter arbor',1.3,8,[-59,22,-10.1],drive);
  disc('frame counter wheel',4.4,.7,[-59,30.4,-10.1],drive);
  const counterMarks=group('counter index marks',drive);
  for(let i=0;i<40;i++){const a=i*TAU/40;line([[-59+3.6*Math.cos(a),31.15,-10.1+3.6*Math.sin(a)],[-59+4.3*Math.cos(a),31.15,-10.1+4.3*Math.sin(a)]],counterMarks,true);}
  const pawl=plate('advance ratchet pawl',9,2.2,.7,.6,[-43,26.6,5],drive,[-Math.PI/2,0,-.5]);
  spring('advance return spring',[-51,20,0],4.6,3.8,4,drive);
  screw('advance pawl pivot',[-39,27.4,3.1],drive,'y',.8);
  for(const [x,y,z] of [[-62,29,4],[-43,29,-8]])disc('advance carrier pillar',1.2,6,[x,y-6,z],drive);

  // Shutter-speed control and release column. Local small gears are a static
  // simplified wheel pack, deliberately not linked to guessed tooth ratios.
  board('speed cam support bridge',28,18,19.5,drive,[[-3,0,2.5],[7,4,1.1]],-22,0);
  disc('speed selector shaft',1.5,17,[-22,17,0],drive);
  const camShape=new THREE.Shape();
  for(let i=0;i<72;i++){const a=i*TAU/72,r=5.9+1.5*Math.sin(a)*Math.sin(a/2);i?camShape.lineTo(r*Math.cos(a),r*Math.sin(a)):camShape.moveTo(r*Math.cos(a),r*Math.sin(a));}
  camShape.closePath();hole(camShape,0,0,1.5);
  solid('shutter speed stepped cam',extrude(camShape,1,.08),drive,[-22,22,0],[-Math.PI/2,0,0]);
  ring('speed cam bearing',3.4,1.55,1.1,[-22,23.3,0],drive,'y');
  plate('speed cam follower',13,2,1,.5,[-19,24,-6],drive,[-Math.PI/2,0,-.25]);
  disc('release plunger',.9,32,[-44,-12,8],drive);
  spring('release return spring',[-44,12,8],1.5,6,6,drive);
  plate('release transfer lever',13,2,.7,.4,[-45,18.6,7],drive,[-Math.PI/2,0,.4]);
  board('slow speed module bed',18,10,-28.7,drive,[],17,8);
  for(const [x,z,r,n] of [[11,8,2.9,16],[16,8,2.1,12],[20,8,1.8,10],[23.7,8,1.8,10]]){
    gear('slow speed illustrative wheel '+x,r,n,.6,[x,-26.7,z],drive);
    disc('slow speed wheel pin '+x,.45,2,[x,-27.4,z],drive);
  }
  board('slow speed retaining bridge',16,2.5,-25,drive,[[0,0,.8]],17,8);
  // Self timer, referenced as an independent side-mounted mechanism.
  const timerCarrier=rounded(10,25,2);hole(timerCarrier,0,7,1.1);hole(timerCarrier,0,-8,1.1);
  solid('self timer carrier',extrude(timerCarrier,.8,.1),drive,[-38,-12,11.3]);
  for(const [x,y,r,n] of [[-38,-5,3,16],[-38,-11,2.7,14],[-38,-16.5,2.4,12]]){
    gear('self timer illustrative wheel '+y,r,n,.7,[x,y,12.5],drive,'z');
    screw('self timer axle '+y,[x,y,13.3],drive,'z',.5);
  }

  // Open rangefinder carrier, sheet 42-253/10.2. The masks sit in a plane
  // perpendicular to the optical axis. No moving optical simulation yet.
  const carrier=rounded(88,22,2);
  rectangularHole(carrier,0,0,54,13,1);
  solid('rangefinder open carrier',extrude(carrier,1,.12),finder,[8,16,0],[-Math.PI/2,0,0]);
  for(const x of [-31,45])for(const z of [-8,8]){
    disc('rangefinder standoff '+x+','+z,1.1,3,[x,13,z],finder);
    screw('rangefinder carrier screw '+x+','+z,[x,17.1,z],finder,'y',.8);
  }
  frame('finder objective cell',24,17,20.2,13.2,[42.25,24,11.3],finder,1.2);
  frame('finder rear cell',17,14,13,10,[42.25,24,-10.5],finder,.9);
  for(const x of [31.2,53.3])rod('finder longitudinal spacer',.7,[x,17.8,-10],[x,17.8,11.3],finder);
  // Transparent optics are drawn as boundary-only shapes, without fill or
  // fictitious light beams; structural mounts still occlude normally.
  function opticalBox(name,w,h,d,pos,rotation=[0,0,0]){
    const g=group(name,finder);g.position.set(...pos);g.rotation.set(...rotation);
    const geo=new THREE.BoxGeometry(w,h,d);
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0x505050}));g.add(edges);return g;
  }
  opticalBox('finder objective optical boundary',19.4,12.3,2,[42.25,24,11]);
  opticalBox('finder combining prism boundary',15,12,11,[42.25,24,-1]);
  line([[34.75,18,-6.5],[49.75,18,4.5],[49.75,30,4.5],[34.75,30,-6.5]],finder,true,true);
  ring('internal eyepiece retaining ring',5.2,4.5,3,[42.25,24,-14],finder);
  frame('rangefinder entrance cell',16,12,12.6,8.6,[-27,24,11.5],finder,.8);
  opticalBox('rangefinder entrance reflector',12,9,.5,[-27,24,5.5],[0,Math.PI/4,0]);
  for(const y of [19,29])rod('transverse finder carrier rail',.65,[-30,y,4],[34,y,4],finder);
  frame('frameline mask carrier',17,13,13,9,[3,24,-2],finder,1.0);
  frame('frameline 50 mask',12.2,8.2,10.6,6.7,[3,24,-.8],finder,.12);
  opticalBox('frameline condenser boundary',15,11,2,[3,24,7]);
  // Mask carrier is transverse: linkage goes down to the lens cam follower.
  rod('rangefinder coupling vertical shaft',.7,[12,5,6],[12,17,6],finder);
  plate('rangefinder follower arm',14,2.2,.8,.6,[7,5,8],finder,[-Math.PI/2,0,.25]);
  disc('rangefinder coupling roller',2.1,2,[0,4.1,8],finder);
  spring('finder follower return spring',[12,8,6],1.5,5.7,5,finder);
  for(const x of [-27,32]){
    plate('optics adjuster bracket '+x,4,4,1,.3,[x,30,1],finder,[-Math.PI/2,0,0]);
    screw('optics adjuster screw '+x,[x,31.2,1],finder,'y',.65);
  }

  // Half-section optical cells: seven distinct surfaces / six cells. Curves
  // describe their shapes only; neither ray tracing nor a prescription is claimed.
  optics.position.set(5,-9,0);
  function closeHalfSection(part,profile){
    // LatheGeometry leaves the two radial cuts open. Close both with paper
    // surfaces so back-face contour hulls cannot become solid black wedges.
    const shape=new THREE.Shape(profile.map(p=>new THREE.Vector2(p.x,p.y)));
    const geometry=new THREE.ShapeGeometry(shape,24);
    const material=part.children[0].material.clone();material.side=THREE.DoubleSide;
    for(const sign of [-1,1]){
      const cap=new THREE.Mesh(geometry,material);cap.scale.x=sign;part.add(cap);
      line(profile.map(p=>[sign*p.x,p.y,0]),part);
    }
    return part;
  }
  function halfRing(name,ro,ri,length,z){
    const profile=[[ri,0],[ro,0],[ro,length],[ri,length],[ri,0]].map(p=>new THREE.Vector2(...p));
    return closeHalfSection(solid(name,new THREE.LatheGeometry(profile,64,-Math.PI/2,Math.PI),optics,[0,0,z],[Math.PI/2,0,0]),profile);
  }
  halfRing('inner focusing sleeve',18,16.6,19,19.8);
  halfRing('optical cell front sleeve',17.7,15.2,19.5,39.2);
  for(let z=21;z<38;z+=2.4)halfRing('helicoid thread crest '+z,18.35,18.01,.5,z);
  const elements=[
    {z:55.5,r:14.4,t:2.2,front:1.0,back:.4},
    {z:49.5,r:13.8,t:1.6,front:-.6,back:.65},
    {z:44,r:12.6,t:1.8,front:.4,back:-.6},
    {z:32,r:11.4,t:1.6,front:-.55,back:.6},
    {z:25,r:11.2,t:2,front:.5,back:.6},
    {z:22.9,r:11.2,t:2.1,front:-.6,back:.4},
    {z:15.2,r:10.5,t:2.3,front:.4,back:1.1},
  ];
  elements.forEach((e,i)=>{
    const profile=[];
    for(let j=0;j<=24;j++){const r=e.r*j/24;profile.push(new THREE.Vector2(Math.max(.001,r),-e.back*(1-(r/e.r)**2)));}
    for(let j=24;j>=0;j--){const r=e.r*j/24;profile.push(new THREE.Vector2(Math.max(.001,r),e.t+e.front*(1-(r/e.r)**2)));}
    profile.push(profile[0].clone());
    const part=solid('optical element '+(i+1)+' illustrative section',new THREE.LatheGeometry(profile,64,-Math.PI/2,Math.PI),optics,[0,0,e.z],[Math.PI/2,0,0]);
    closeHalfSection(part,profile);
    // Closed contour on both exposed cut edges makes every thickness readable.
    for(const sign of [-1,1])line(profile.map(p=>[sign*p.x,0,e.z+p.y]),optics);
    if(i!==5)halfRing('lens cell retaining ring '+(i+1),e.r+.7,e.r+.15,.6,e.z-.7);
  });
  halfRing('diaphragm carrier half section',16.4,12.4,1.6,36.7);
  halfRing('diaphragm retaining ring',16.7,12.4,.5,38.5);
  // Show the individual stationary blade outlines; count/profile remain schematic.
  for(let i=0;i<10;i++){
    const a=i*TAU/10;
    const s=new THREE.Shape();
    const pts=[[13.7,0],[12.8,3.4],[7.8,5],[6.7,2.2],[9.7,-1.5]];
    pts.forEach(([x,y],j)=>{const p=[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)];j?s.lineTo(...p):s.moveTo(...p);});s.closePath();
    const blade=solid('stationary diaphragm blade '+(i+1),extrude(s,.035,0),optics,[0,0,37.5+i*.04]);
    const x=13.1*Math.cos(a),y=13.1*Math.sin(a);
    const pin=disc('diaphragm blade pin '+i,.42,.3,[x,y,38.1],optics,'z');
    for(const part of [blade,pin])part.traverse(obj=>{if(obj.material){obj.material=obj.material.clone();obj.material.clippingPlanes=[new THREE.Plane(new THREE.Vector3(0,-1,0),-9)];}});
  }
  ring('rear optical baffle',11.6,9.8,1.2,[0,0,13],optics);

  const bases=new Map(Object.values(assemblies).map(g=>[g,g.position.clone()]));
  const offsets={chassis:[0,0,0],film:[0,0,-42],shutter:[0,0,-14],drive:[-28,32,0],finder:[8,42,0],optics:[0,0,48]};
  function describe(key){return descriptions[key]??descriptions.all;}
  function setLayout({assembly='all',spread=0,film:showFilm=true}){
    for(const [key,g] of Object.entries(assemblies)){
      g.visible=assembly==='all'||key===assembly;
      g.position.copy(bases.get(g));
      // Isolated inspection always shows the local assembled layout.
      if(assembly==='all')g.position.addScaledVector(new THREE.Vector3(...offsets[key]),spread);
    }
    photographicFilm.visible=showFilm;
  }
  return {assemblies,setLayout,describe,descriptions,photographicFilm};
}
