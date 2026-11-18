import * as THREE from 'three';

export function buildMotionRig(root,api,internal){
  const {group,plate,line,solid,extrude,rounded}=api;
  const {film,shutter,drive}=internal.assemblies;
  const find=name=>root.getObjectByName(name);
  function pivot(name,items,point,parent){
    const g=group(name,parent);g.position.set(...point);
    for(const part of items.filter(Boolean)){parent.updateMatrixWorld(true);g.attach(part);}
    return g;
  }
  const byNames=names=>names.map(find);
  const childrenLike=(parent,re)=>parent.children.filter(p=>re.test(p.name));
  const lever=pivot('advance lever motion',byNames(['single stroke advance arm']),[-51,36.1,0],find('top-controls'));
  const knob=find('rewind knob motion');
  const knobShaft=find('rewind shaft'),shaftY=knobShaft.position.y;
  const release=pivot('rewind release motion',byNames(['rewind release arm']),[-52,23.7,17.8],find('front-controls'));
  const button=find('shutter release cup'),plunger=find('release plunger'),transfer=find('release transfer lever');
  const buttonY=button.position.y,plungerY=plunger.position.y,transferRotation=transfer.rotation.z;
  const takeup=pivot('take-up motion',childrenLike(film,/^take-up/),[-51,0,0],film);
  const supply=pivot('supply spindle motion',byNames(['cartridge spool core','rewind coupling shaft','rewind fork']),[51,0,0],film);
  const sprocket=pivot('sprocket motion',childrenLike(film,/^film sprocket|^sprocket spindle/),[-36,0,-6.3],film);
  const clutch=pivot('clutch motion',childrenLike(drive,/^advance clutch/),[-51,0,0],drive);
  const counter=pivot('counter motion',byNames(['frame counter wheel','counter index marks']),[-59,0,-10.1],drive);
  const drum=pivot('drum motion',childrenLike(shutter,/^curtain winding drum|^winding drum end/),[-24,0,0],shutter);
  const springRollers=[30,37].map(x=>pivot('spring roller motion '+x,childrenLike(shutter,new RegExp('^curtain spring roller '+x+'$|^spring roller cap '+x+',')),[x,0,0],shutter));
  const pawl=find('advance ratchet pawl'),pawlRotation=pawl.rotation.z;
  // Axle witness lines make cylindrical rotation visible without adding colour.
  for(const [g,r,y] of [[takeup,8,10.4],[supply,2.5,30.6],[sprocket,3,10],[drum,4.5,8.5],...springRollers.map(g=>[g,2.6,8.3])])line([[0,y,0],[r,y,0]],g,true);

  // Cloth length is taken up on its drum: scale each panel between a fixed
  // roller and its travelling leading bar, rather than sliding through walls.
  const first=plate('moving first cloth curtain',1,25.2,.1,.03,[0,-9,-5.25],shutter,[0,0,0],0);
  const second=plate('moving second cloth curtain',1,25.2,.1,.03,[0,-9,-4.95],shutter,[0,0,0],0);
  const bars=[-5.35,-4.8].map((z,i)=>plate('moving curtain bar '+i,.65,27,.4,.1,[0,-9,z],shutter,[0,0,0],0));
  const ribbons=[];
  for(const y of [-22.2,4.2]){
    ribbons.push([plate('first moving ribbon '+y,1,1.3,.08,.01,[0,y,-5.18],shutter,[0,0,0],0),0]);
    ribbons.push([plate('second moving ribbon '+y,1,1.3,.08,.01,[0,y,-4.85],shutter,[0,0,0],0),1]);
  }
  function span(part,a,b){part.position.x=(a+b)/2;part.scale.x=Math.max(.02,b-a);}

  // Film is a continuous white strip with real perforations. Repeated edge
  // cells wrap under the leaders; no texture scrolling or dashed fake film.
  const filmSheet=group('moving perforated film',internal.photographicFilm);
  const middle=plate('film central band',82,26.5,.12,0,[3,-9,-10.6],filmSheet,[0,0,0],0);
  const tiles=[];
  for(const y of [-9-14.25,-9+14.25]){
    for(const sign of [-1,1])plate('film continuous margin',82,1.755,.12,0,[3,y+sign*1.8675,-10.6],filmSheet,[0,0,0],0);
    for(let i=0;i<18;i++){
      // Inter-hole bridges share the same phase on both edges of the film.
      const part=plate('film perforation bridge',1.95,1.98,.12,0,[0,y,-10.6],filmSheet,[0,0,0],0);
      tiles.push({part,i});
    }
  }
  const leaders=internal.photographicFilm.children.filter(p=>p.name.includes('film leader'));
  const filmClip=new THREE.Plane(new THREE.Vector3(1,0,0),38);
  // Use local-to-world planes so spread inspection can coexist with motion.
  const endClip=new THREE.Plane(new THREE.Vector3(-1,0,0),44);
  const filmMaterials=new Set();
  for(const g of [filmSheet,...leaders])g.traverse(o=>{if(o.material){o.material=o.material.clone();o.material.clippingPlanes=[filmClip,endClip];filmMaterials.add(o.material);}});
  let lastCounter=-1;
  const counterText=find('frame counter digits');
  function apply(s){
    // Sweep toward the photographer and around the outside of the body;
    // the opposite sign sends the arm across the stationary speed dial.
    lever.rotation.y=s.lever*2.55;
    takeup.rotation.y=-s.travel/7.5;supply.rotation.y=-s.travel/10;
    sprocket.rotation.y=-s.travel/38*Math.PI*2;
    clutch.rotation.y=-s.driveTravel/38*2.55;
    clutch.position.y=s.rewind*.7;
    counter.rotation.y=-s.counter*Math.PI*2/40;
    pawl.rotation.z=pawlRotation+(s.action==='advance'?.055*Math.sin(s.progress*100):0);
    drum.rotation.y=-s.first*54/4.5;
    springRollers[0].rotation.y=-s.first*54/2.7;springRollers[1].rotation.y=-s.second*54/2.7;
    button.position.y=buttonY-s.press*1.2;plunger.position.y=plungerY-s.press*1.2;
    transfer.rotation.z=transferRotation+s.press*.12;
    knob.position.y=s.rewind*5;knob.rotation.y=-s.travel/10;
    knobShaft.position.y=shaftY-s.rewind*5;knobShaft.scale.y=1+s.rewind*5/1.4;
    release.rotation.z=s.rewind*-1.05;
    const a=-24+54*s.first,b=-24+54*s.second;
    span(first,-24,a);span(second,b,30);bars[0].position.x=a;bars[1].position.x=b;
    for(const [part,i] of ribbons)i===0?span(part,a,30):span(part,-24,b);
    for(const {part,i} of tiles)part.position.x=-40+((i*4.75-s.travel)%85.5+85.5)%85.5;
    // The tail travels right only once the exposed length is back in the can.
    const tail=Math.min(45,-38+Math.max(0,-s.travel)*.91);
    film.updateMatrixWorld(true);
    filmClip.set(new THREE.Vector3(1,0,0),-tail).applyMatrix4(film.matrixWorld);
    endClip.set(new THREE.Vector3(-1,0,0),44).applyMatrix4(film.matrixWorld);
    filmSheet.visible=s.loaded;leaders.forEach(g=>g.visible=s.loaded);
    const n=Math.floor(s.counter+.0001);
    if(counterText&&n!==lastCounter){
      lastCounter=n;const canvas=counterText.material.map.image,ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='#393939';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${Math.floor(canvas.height*.72)}px Arial`;
      ctx.fillText(String(n),canvas.width/2,canvas.height/2,canvas.width*.96);counterText.material.map.needsUpdate=true;
    }
  }
  return {apply};
}
