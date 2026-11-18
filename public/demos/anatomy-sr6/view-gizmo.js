import * as THREE from 'three';

// Share the main camera's orientation, independently of zoom or target position.
export function createViewGizmo(host, camera, view) {
  const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(184,184);
  renderer.setClearColor(0,0);
  renderer.domElement.setAttribute('aria-hidden','true');
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), axes = new THREE.Group();
  scene.add(axes, new THREE.HemisphereLight(0xffffff,0x607080,2));
  const light = new THREE.DirectionalLight(0xffffff,2);
  light.position.set(-3,5,6);scene.add(light);
  const projection = new THREE.OrthographicCamera(-1.8,1.8,1.8,-1.8,.1,20);
  projection.position.z=6;
  const hub = new THREE.Mesh(new THREE.SphereGeometry(.13,16,12),new THREE.MeshStandardMaterial({color:0x87959c,roughness:.5}));
  axes.add(hub);
  const entries=[];
  for(const [axis,color,vector,names] of [
    ['X','#ec5964',[1,0,0],['前端','后端']],
    ['Y','#64be69',[0,1,0],['顶部','底部']],
    ['Z','#559cf1',[0,0,1],['侧面','另一侧']]
  ])for(const [i,sign] of [1,-1].entries()){
    const dir=new THREE.Vector3(...vector).multiplyScalar(sign);
    const group=new THREE.Group();
    group.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
    const material=new THREE.MeshStandardMaterial({color,roughness:.45});
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.036,.036,.88,12),material);
    stem.position.y=.5;
    const tip=new THREE.Mesh(new THREE.ConeGeometry(.115,.27,16),material);
    tip.position.y=1.025;
    group.add(stem,tip);axes.add(group);
    const button=document.createElement('button');
    button.id='axis-'+axis+(sign>0?'-positive':'-negative');
    button.textContent=(sign>0?'+':'−')+axis;
    button.title=button.textContent+' · '+names[i]+'视图';
    button.setAttribute('aria-label',button.title);
    button.style.setProperty('--axis',color);
    button.onclick=()=>view(axis==='Y'?[0,sign,.001]:dir.toArray());
    host.appendChild(button);
    entries.push({dir,button});
  }
  const inverse=new THREE.Quaternion(),point=new THREE.Vector3();
  return {update(){
    inverse.copy(camera.quaternion).invert();
    axes.quaternion.copy(inverse);
    for(const {dir,button} of entries){
      point.copy(dir).multiplyScalar(1.42).applyQuaternion(inverse);
      const depth=point.z;
      point.project(projection);
      button.style.left=((point.x+1)*92)+'px';
      button.style.top=((1-point.y)*92)+'px';
      button.style.zIndex=String(Math.round(100+depth*20));
      button.style.opacity=depth<-.2?'.65':'1';
    }
    renderer.render(scene,projection);
  }};
}
