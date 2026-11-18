export function installFloatingControls(){
  const panel=document.getElementById('quickControls'),host=document.getElementById('demo');
  const handle=document.getElementById('quickDrag'),toggle=document.getElementById('quickCollapse');
  let drag=null,placed=false;
  const position=()=>{const p=panel.getBoundingClientRect(),h=host.getBoundingClientRect();return {x:p.left-h.left,y:p.top-h.top};};
  function move(x,y){
    const margin=8;
    panel.style.left=Math.max(margin,Math.min(x,host.clientWidth-panel.offsetWidth-margin))+'px';
    panel.style.top=Math.max(margin,Math.min(y,host.clientHeight-panel.offsetHeight-margin))+'px';
    panel.style.right='auto';panel.style.transform='none';placed=true;
  }
  handle.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    const p=position();drag={id:e.pointerId,x:e.clientX,y:e.clientY,originX:p.x,originY:p.y};
    handle.setPointerCapture(e.pointerId);panel.classList.add('dragging');e.preventDefault();
  });
  handle.addEventListener('pointermove',e=>{if(drag?.id===e.pointerId)move(drag.originX+e.clientX-drag.x,drag.originY+e.clientY-drag.y);});
  function end(){drag=null;panel.classList.remove('dragging');}
  handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);handle.addEventListener('lostpointercapture',end);
  handle.addEventListener('keydown',e=>{
    const offsets={ArrowLeft:[-16,0],ArrowRight:[16,0],ArrowUp:[0,-16],ArrowDown:[0,16]};
    if(!offsets[e.key])return;e.preventDefault();const p=position(),d=offsets[e.key];move(p.x+d[0],p.y+d[1]);
  });
  toggle.onclick=()=>{
    const p=position(),collapsed=panel.classList.toggle('collapsed');
    toggle.textContent=collapsed?'+':'−';toggle.setAttribute('aria-expanded',String(!collapsed));
    toggle.setAttribute('aria-label',collapsed?'展开操作窗':'收起操作窗');toggle.title=collapsed?'展开操作窗':'收起操作窗';
    move(p.x,p.y);
  };
  new ResizeObserver(()=>{if(placed){const p=position();move(p.x,p.y);}}).observe(host);
}
