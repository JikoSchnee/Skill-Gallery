import * as THREE from 'three';

// Construct actual planar section faces from shell/plane intersections. GPU
// clipping alone has no cap: it exposes back surfaces and leaves ragged rims.
export function sectionCaps(exterior,surface,lineMaterial,y=-9){
  exterior.updateWorldMatrix(true,true);
  const caps=new THREE.Group();caps.name='exterior-section-faces';
  const capMaterial=surface.clone();capMaterial.side=THREE.DoubleSide;
  const pointKey=p=>`${Math.round(p.x*10000)},${Math.round(p.z*10000)}`;
  const contains=(p,poly)=>{let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
  }return inside;};
  exterior.traverse(obj=>{
    if(!obj.isMesh||obj.material!==surface)return;
    const geometry=obj.geometry,position=geometry.attributes.position,index=geometry.index;
    const count=index?index.count:position.count,edges=[],edgeKeys=new Set(),nodes=new Map();
    for(let i=0;i<count;i+=3){
      const triangle=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(position,index?index.getX(i+j):i+j).applyMatrix4(obj.matrixWorld));
      const hits=[];
      for(let j=0;j<3;j++){
        const a=triangle[j],b=triangle[(j+1)%3],da=a.y-y,db=b.y-y;
        if((da<0&&db>=0)||(db<0&&da>=0)){
          const p=a.clone().lerp(b,da/(da-db));if(!hits.some(q=>q.distanceToSquared(p)<1e-12))hits.push(p);
        }
      }
      if(hits.length!==2||hits[0].distanceToSquared(hits[1])<1e-12)continue;
      const keys=hits.map(pointKey);if(keys[0]===keys[1])continue;
      const edgeKey=keys.slice().sort().join('|');if(edgeKeys.has(edgeKey))continue;edgeKeys.add(edgeKey);
      const id=edges.length;edges.push(keys);
      keys.forEach((key,j)=>{if(!nodes.has(key))nodes.set(key,{p:hits[j],edges:[]});nodes.get(key).edges.push(id);});
    }
    const used=new Set(),loops=[];
    edges.forEach((edge,id)=>{
      if(used.has(id))return;
      const start=edge[0];let current=start,nextId=id;const loop=[];let closed=false;
      for(let n=0;n<=edges.length;n++){
        loop.push(nodes.get(current).p);used.add(nextId);
        const e=edges[nextId];current=e[0]===current?e[1]:e[0];
        if(current===start){closed=true;break;}
        nextId=nodes.get(current).edges.find(k=>!used.has(k));if(nextId===undefined)break;
      }
      if(closed&&loop.length>=3)loops.push(loop.map(p=>new THREE.Vector2(p.x,-p.z)));
    });
    const rings=loops.map(points=>({points,area:Math.abs(THREE.ShapeUtils.area(points)),parent:null,depth:0})).filter(r=>r.area>1e-5).sort((a,b)=>b.area-a.area);
    rings.forEach((r,i)=>{
      for(let j=i-1;j>=0;j--)if(contains(r.points[0],rings[j].points)){r.parent=rings[j];r.depth=r.parent.depth+1;break;}
    });
    for(const r of rings){
      if(r.depth%2)continue;
      const shape=new THREE.Shape(r.points);
      for(const h of rings.filter(h=>h.parent===r))shape.holes.push(new THREE.Path(h.points));
      const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape),capMaterial);mesh.rotation.x=-Math.PI/2;mesh.position.y=y+.002;caps.add(mesh);
    }
    for(const r of rings){
      const points=r.points.map(p=>new THREE.Vector3(p.x,y+.005,-p.y));
      caps.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points),lineMaterial));
    }
  });
  return caps;
}
