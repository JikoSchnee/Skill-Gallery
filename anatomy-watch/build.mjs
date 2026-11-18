import * as k from './vendor/iso-kit.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
// Figure: a skeleton wristwatch. A spring barrel drives the train, an escapement
// meters its motion, and coaxial hands display one shared simulation clock.
// Parts: case, back, bezel, crystal, 4 lugs, 2 straps, 2 keepers, crown/stem,
// 60 hour/minute markers, 12 screws, movement plate, 3 bridges, spring barrel,
// 4 train wheels, escape wheel, balance rim/spokes/spring, 3 hands and 3 hubs.
const P=k.fitProjection(k.boxCorners({x:-150,y:-235,w:310,d:470},0,48),820,750,{pad:40,azimuth:78,elevation:57});
const pt=p=>k.iso(p,P);const mats={steel:['#c9ccc7','#a9afa9','#8a928c','#727c76','#f4f3e9'],dark:['#343d38','#242c28','#19211d','#121a16','#59655b'],gold:['#c2ad7e','#ab9567','#89774d','#6d5e3c','#e7d7ae']};
function solid(s,m='steel'){let c=mats[m];return `<g><path d="${s.fill}" fill="${c[2]}"/>${s.shades.map((d,i)=>`<path d="${d}" fill="${c[i]}"/>`).join('')}<path d="${s.top}" fill="${c[0]}"/><path d="${s.outline}" fill="none" stroke="${c[4]}" stroke-width=".65"/></g>`;}
const slab=(x,y,w,d,z,h,m)=>solid(k.slabOf({x,y,w,d,r:5},z,h,P,8,1),m),cyl=(x,y,r,z,h,m)=>solid(k.cylinder(x,y,r,z,h,P,128,1),m);
const line=(d,color,w=.7)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}"/>`;
const origin=pt([0,0,40]),px=pt([1,0,40]),py=pt([0,1,40]);const M=[px[0]-origin[0],px[1]-origin[1],py[0]-origin[0],py[1]-origin[1],...origin];
let s=[];s.push('<defs><filter id="shadow"><feGaussianBlur stdDeviation="12"/></filter><clipPath id="movementClip"><circle r="93"/></clipPath><linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".12"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".07"/></linearGradient></defs>');
s.push('<ellipse cx="406" cy="429" rx="204" ry="174" fill="#27372c" opacity=".11" filter="url(#shadow)"/>');
for(const [y,d] of [[-231,123],[108,123]]){s.push(slab(-37,y,74,d,9,8,'dark'));s.push(line(k.planOutline({x:-31,y:y+5,w:62,d:d-10,r:5},17.2,P),'#6f7566',.6));for(let j=0;j<d-12;j+=7)for(const x of [-30,30])s.push(line(k.lineOnTop([x,y+7+j],[x,y+10+j],17.4,P),'#a2a18b',.6));}
for(const y of [-124,105])for(const x of [-43,30])s.push(slab(x,y,13,21,15,13,'steel'));
s.push(slab(-39,-192,78,13,17,5,'dark'));
for(let y=151;y<224;y+=15)s.push(`<path d="${k.ring(0,y,2,17.5,P,20)}" fill="#101813"/>`);
s.push(cyl(0,0,121,16,15,'steel'));s.push(line(k.sideArc(0,0,121,22,P,80),'#626c64',1));s.push(cyl(0,0,117,31,5,'steel'));s.push(cyl(0,0,111,36,3,'dark'));
// Crown is extruded along the x axis, connecting flush to the case flank.
function crown(){const p=(x,r,t)=>pt([x,Math.cos(t)*r,25+Math.sin(t)*r]);let out='';for(let j=0;j<48;j++){let t=j*Math.PI/24,u=(j+1)*Math.PI/24;out+=`<path d="M${p(125,11,t)}L${p(144,11,t)}L${p(144,11,u)}L${p(125,11,u)}Z" fill="${j<24?'#b6bcb2':'#6f7b70'}" stroke="#535f54" stroke-width=".45"/>`;}out+=`<path d="${Array.from({length:48},(_,j)=>(j?'L':'M')+p(144,11,j*Math.PI/24)).join('')}Z" fill="#c4c9bc" stroke="#f1f0e3"/>`;return out;}
s.push(slab(116,-4,10,8,21,8,'steel'),`<g id="crownArt">${crown()}</g>`);
s.push(`<g transform="matrix(${M.join(' ')})">`);
s.push('<circle r="108" fill="#e2e0d2"/><circle r="94" fill="#303d34" stroke="#768575" stroke-width="1.5"/><g clip-path="url(#movementClip)"><circle r="91" fill="#536052"/>');
for(let y=-78;y<=78;y+=6)s.push(`<path d="M-92 ${y}H92" stroke="#6e7964" stroke-width=".4" opacity=".4"/>`);
s.push('<g id="train"></g><g id="balance"></g>');
// Bridges are supported at screw seats rather than floating labels.
for(const [x,y,w,h,angle] of [[-40,-25,62,9,0],[5,1,47,8,38],[-24,45,45,7,-8]])s.push(`<g transform="translate(${x} ${y}) rotate(${angle})"><rect x="-7" y="-7" width="${w}" height="${h+6}" rx="5" fill="#8b9580" stroke="#c3c7ad" stroke-width=".7"/><path d="M-2 -3H${w-13}" stroke="#bcc3aa" stroke-width=".5"/></g>`);
for(const [x,y] of [[-40,-25],[15,-25],[5,1],[35,25],[-24,45],[10,40],[-73,-37],[66,-39],[67,49],[-55,69]])s.push(`<circle cx="${x}" cy="${y}" r="3.6" fill="#d4d6bd" stroke="#495b4b"/><path d="M${x-1.7} ${y-1.3}l3.4 2.6" stroke="#405442" stroke-width=".8"/>`);
s.push('<g id="spring"></g></g>');
for(let i=0;i<60;i++){const a=i*Math.PI/30,x=Math.sin(a),y=-Math.cos(a),major=i%5===0;s.push(`<path d="M${x*(major?96:101)} ${y*(major?96:101)}L${x*105} ${y*105}" stroke="${major?'#2f4635':'#8a9180'}" stroke-width="${major?2: .7}"/>`);}
for(const [t,x,y] of [['12',0,-80],['3',81,3],['6',0,85],['9',-81,3]])s.push(`<text x="${x}" y="${y}" fill="#d6dcc2" font-family="Georgia,serif" font-size="9" text-anchor="middle">${t}</text>`);
s.push('<text x="0" y="-57" fill="#c6cdb5" font-family="Georgia,serif" font-size="6" text-anchor="middle" letter-spacing="2.6">ATELIER</text><g id="hands"></g><circle r="4.5" fill="#d5dac3" stroke="#233829" stroke-width="1"/><circle r="1.7" fill="#384f39"/><circle r="109" fill="url(#glass)" pointer-events="none" stroke="#edf0df" stroke-width=".6"/></g>');
const svg=`<svg viewBox="0 0 820 750" role="img" aria-label="镂空机械腕表，可见齿轮传动、摆轮、游丝和时分秒针">${s.join('')}</svg>`;
const html=readFileSync(new URL('./template.html',import.meta.url),'utf8').replace('<!--WATCH-->',svg).replace('/*RUNTIME*/',readFileSync(new URL('./live.js',import.meta.url),'utf8'));
writeFileSync(new URL('./index.html',import.meta.url),html);console.log('Built anatomy-watch/index.html');
