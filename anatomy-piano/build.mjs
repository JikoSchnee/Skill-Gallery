import * as k from './vendor/iso-kit.mjs';
import {writeFileSync,readFileSync} from 'node:fs';
// Concept: a pinned cylinder plucks tuned comb teeth inside a grand-piano case.
// Parts: 3 feet, 3 legs, 3 collars, floor, 29 rim sections, lid, lid stay,
// 2 hinges, keyboard bed, 14 white keys, 10 black keys, 2 cheeks, 2 pedals,
// mechanism bed, 4 screws, 2 bearings, cylinder, 14 teeth, comb bridge,
// spring barrel, winding knob, governor and 2 drive wheels.
const ring=[[-100,64],[-100,-135],[-88,-148],[-62,-151],[-34,-148],[-10,-138],[8,-121],[18,-99],[21,-74],[28,-51],[42,-35],[64,-28],[88,-23],[100,-13],[100,64]];
const bounds=[...k.boxCorners({x:-110,y:-155,w:240,d:260},0,105),...ring.map(([x,y])=>[-100+(x+100)*Math.cos(.95),y,108+(x+100)*Math.sin(.95)])];
const P=k.fitProjection(bounds,900,650,{pad:65,azimuth:39,elevation:32});
const pt=p=>k.iso(p,P), path=(ps,close=true)=>ps.map((p,i)=>(i?'L':'M')+pt(p).join(',')).join('')+(close?'Z':'');
const colors={black:['#313332','#242625','#191c1c','#101313','#454744'],ivory:['#f0ecdf','#d6d0bf','#b8b3a6','#89877d','#fff9ea'],metal:['#a79b79','#807656','#655e48','#4d493b','#d5caab']};
function solid(s,m='black'){const c=colors[m];return `<g stroke-linejoin="round"><path d="${s.fill}" fill="${c[2]}"/>${s.shades.map((d,i)=>`<path d="${d}" fill="${c[Math.min(i,3)]}"/>`).join('')}<path d="${s.top}" fill="${c[0]}"/><path d="${s.outline}" fill="none" stroke="${c[4]}" stroke-width=".7"/></g>`;}
const box=(x,y,w,d,z,h,m='black')=>solid(k.slabOf({x,y,w,d,r:1},z,h,P,3,.5),m);
const cyl=(x,y,r,z,h,m='metal')=>solid(k.cylinder(x,y,r,z,h,P,48),m);
const line=(ps,color='#b2a480',w=.7)=>`<path d="${path(ps,false)}" stroke="${color}" stroke-width="${w}" fill="none"/>`;
let a=[];
a.push(`<ellipse cx="452" cy="529" rx="244" ry="49" fill="#292d25" opacity=".13" filter="url(#shadow)"/>`);
for(const [x,y] of [[-81,-114],[-84,68],[84,57]]){a.push(cyl(x,y,7,0,5),solid(k.extrude([[x-5,y-5],[x+5,y-5],[x+8,y+8],[x-8,y+8]],5,66,P)),cyl(x,y,10,65,5));}
a.push(box(-21,57,42,8,20,5));for(const x of [-10,10])a.push(box(x-2,60,4,19,14,4,'metal'));
a.push(solid(k.extrude(ring,70,12,P,{convex:false})));
a.push(solid(k.extrude(ring.map(([x,y])=>[x*.94,y*.94]),82,2,P,{convex:false}),'metal'));
// Back rim, then the interior and near rim.
const rim=i=>{const p=ring[i],q=ring[(i+1)%ring.length];return solid(k.extrude([p,q,[q[0]*.94,q[1]*.94],[p[0]*.94,p[1]*.94]],82,20,P));};
for(let i=0;i<ring.length-1;i++)a.push(rim(i));
const mc=pt([-20,-50,85]), mt=pt([-35,-30,85]);
a.push(`<g transform="translate(${mt}) scale(.75) translate(${-mc[0]} ${-mc[1]})">`);
a.push(box(-63,-91,117,74,85,3,'metal'));
for(const x of [-57,47])for(const y of [-85,-23]){a.push(cyl(x,y,2,88,1));a.push(line([[x-1,y,89],[x+1,y,89]],'#373a32'));}
// Horizontal barrel, rendered as facets around its x axis.
function barrel(angle=0){let o=[];const x0=-49,x1=36,y=-62,z=103,r=13;for(let j=0;j<48;j++){let t=j*Math.PI*2/48,u=(j+1)*Math.PI*2/48;const verts=[[x0,y+Math.cos(t)*r,z+Math.sin(t)*r],[x1,y+Math.cos(t)*r,z+Math.sin(t)*r],[x1,y+Math.cos(u)*r,z+Math.sin(u)*r],[x0,y+Math.cos(u)*r,z+Math.sin(u)*r]];if(Math.cos(t)*.6+Math.sin(t)*.8>0){const l=Math.round(39+22*Math.max(0,Math.sin(t)));o.push(`<path d="${path(verts)}" fill="hsl(43 20% ${l}%)"/>`);}}for(const x of [x0,x1])o.push(`<path d="${path(Array.from({length:48},(_,j)=>[x,y+Math.cos(j*Math.PI/24)*r,z+Math.sin(j*Math.PI/24)*r]))}" fill="#a99a72" stroke="#d9cba5" stroke-width=".6"/>`);return o.join('');}
a.push(box(-57,-70,7,16,88,16,'metal'));a.push(barrel());a.push('<g id="pins"></g>');a.push(box(37,-70,7,16,88,16,'metal'));
a.push(box(-50,-24,88,8,89,5,'metal'));
for(let i=0;i<14;i++)a.push(`<g id="tooth${i}" class="tooth">${box(-48+i*6,-48,3.8,24,91,1.6,'metal')}</g>`);
a.push(cyl(-65,0,16,85,13));a.push(line(Array.from({length:90},(_,i)=>{const t=i*.19,r=2+i*.13;return[-65+Math.cos(t)*r,Math.sin(t)*r,98.3];}),'#5d594b'));
for(const [x,y,r] of [[-30,-1,11],[-9,-1,9]]){a.push(cyl(x,y,r,85,4));for(let i=0;i<16;i++){let t=i*Math.PI/8;a.push(line([[x+Math.cos(t)*3,y+Math.sin(t)*3,89.2],[x+Math.cos(t)*r,y+Math.sin(t)*r,89.2]],'#4c4d43'));}}
a.push(cyl(34,0,4,88,16),box(20,-3,28,6,104,2,'metal'));
a.push('</g>');
a.push(rim(ring.length-1));
a.push(box(-104,64,208,39,73,8));
for(let i=0;i<14;i++)a.push(`<g id="key${i}">${box(-94+i*13.5,65,12.8,33,81,5,'ivory')}</g>`);
for(let i=0;i<13;i++)if(![2,6,9].includes(i))a.push(box(-85+i*13.5,65,7,19,86,5));
a.push(box(-105,63,10,40,81,9),box(95,63,10,40,81,9));
a.push(cyl(114,16,4,77,12),cyl(114,16,11,87,3));
for(let i=0;i<24;i++){let t=i*Math.PI/12;a.push(line([[114+Math.cos(t)*9,16+Math.sin(t)*9,90],[114+Math.cos(t)*11,16+Math.sin(t)*11,90]],'#d5c9a8'));}
a.push('<g id="lid"></g>');
const svg=`<svg viewBox="0 0 900 650" role="img" aria-label="钢琴形机械八音盒，琴盖下可见滚筒和音梳"><defs><filter id="shadow"><feGaussianBlur stdDeviation="15"/></filter></defs>${a.join('')}</svg>`;
const runtime=readFileSync(new URL('./live.js',import.meta.url),'utf8');
const html=readFileSync(new URL('./template.html',import.meta.url),'utf8').replace('<!--FIGURE-->',svg).replace('/*MODEL*/',`const P=${JSON.stringify(P)}, ring=${JSON.stringify(ring)};\n${k.iso.toString()}\n${runtime}`);
// Runtime projection is deliberately explicit, avoiding kit internal dependencies.
writeFileSync(new URL('./index.html',import.meta.url),html);
console.log('Built anatomy-piano/index.html');
