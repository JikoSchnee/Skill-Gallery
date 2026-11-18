const hypot=Math.hypot;
const definitions={
 flow:{name:'流绸',english:'Organic Turbulence',hint:'在画面中按住拖动，拨动流线。',seed:41027,colors:['#49c5bb','#e2b979','#c17770'],fields:[['count','粒子数量',1200,4800,300,2700],['speed','流动速度',.4,2.4,.1,1],['scale','涡流尺度',.5,2.5,.1,1.1],['memory','余迹长度',20,100,1,85]]},
 waves:{name:'相织',english:'Quantum Harmonics',hint:'调节波源与频率，观察相长与相消。',seed:90210,colors:['#324682','#956cce','#8fe2bf'],fields:[['sources','波源数量',3,10,1,6],['frequency','波纹频率',8,36,1,22],['radius','波源间距',.15,.65,.01,.42],['speed','相位速度',.2,2,.1,.6]]},
 growth:{name:'枝语',english:'Recursive Whispers',hint:'改变分枝规则，或重播一株植物的生长。',seed:13618,colors:['#3c6554','#8b9b65','#be8759'],fields:[['depth','分枝层数',5,10,1,9],['angle','分枝角度',16,40,1,25],['ratio','枝长比例',.63,.78,.01,.72],['wind','风的强度',0,1,.05,.25]]}
};
let mode=new URLSearchParams(location.search).get('piece')||'flow';if(!definitions[mode])mode='flow';
let params={},paused=matchMedia('(prefers-reduced-motion: reduce)').matches,tick=0,particles=[],branches=[],fieldImage,phaseOffset=0,palette=[],cnv,ready=false;
const W=900,N=440;
let waveCos,waveSin,waveMask;
const $=id=>document.getElementById(id);
function setControls(){
 const d=definitions[mode];$('piece').value=mode;$('art-title').textContent=d.name;$('art-subtitle').textContent=d.english;$('art-hint').textContent=d.hint;
 $('parameter-controls').innerHTML=d.fields.map(([id,label,min,max,step,value])=>`<div class="control-group"><label for="${id}">${label}</label><div class="slider-container"><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${params[id]}" oninput="updateParam('${id}',this.value)"><span class="value-display" id="${id}-value">${params[id]}</span></div></div>`).join('');
 for(let i=0;i<3;i++){$('color'+(i+1)).value=params.colors[i];$('color'+(i+1)+'-value').textContent=params.colors[i];}
 updateSeedDisplay();$('pause').textContent=paused?'继续':'暂停';$('pause').setAttribute('aria-pressed',String(paused));
}
function defaults(){const d=definitions[mode];params={seed:d.seed,colors:[...d.colors]};for(const [id,,,,,v]of d.fields)params[id]=v;}
function choosePiece(value){mode=value;defaults();setControls();history.replaceState(null,'','?piece='+mode);initializeSystem();}
function setup(){pixelDensity(1);cnv=createCanvas(W,W);cnv.parent('canvas-container');cnv.elt.setAttribute('aria-label','可交互的生成艺术画布');cnv.elt.style.touchAction='none';frameRate(30);fieldImage=createImage(N,N);defaults();setControls();ready=true;initializeSystem();document.querySelector('.loading').remove();if(paused)noLoop();}
function initializeSystem(){
 if(!ready)return;randomSeed(params.seed);noiseSeed(params.seed);tick=0;phaseOffset=random(TWO_PI);palette=params.colors.map(c=>color(c));
 if(mode==='flow'){background('#101f29');particles=Array.from({length:params.count},(_,i)=>new Thread(i));for(let i=0;i<100;i++){flowStep(false);tick++;}}
 if(mode==='waves'){buildWaveField();drawWaves();}
 if(mode==='growth'){branches=[];grow(0,0,155,-HALF_PI,0,-1);tick=paused?360:0;drawPlant();}
 if(paused)redraw();
}
class Thread{
 constructor(i){this.i=i;this.reset();this.age=random(170);}
 reset(){const theta=random(TWO_PI),r=sqrt(random())*355;this.x=450+cos(theta)*r;this.y=450+sin(theta)*r;this.age=0;this.life=random(100,260);this.c=this.i%17<11?0:this.i%17<15?1:2;}
}
function flowStep(interactive){
 const ctx=drawingContext;ctx.fillStyle=`rgba(16,31,41,${.004+(100-params.memory)*.0007})`;ctx.fillRect(0,0,W,W);
 ctx.lineWidth=.72;
 for(const p of particles){
  const x=p.x,y=p.y,dx=x-450,dy=y-450,r=hypot(dx,dy)+1;
  let a=atan2(dy,dx)+HALF_PI+.85*sin(r*.012+phaseOffset)+ (noise(x*.0025*params.scale,y*.0025*params.scale,tick*.0006)-.5)*4;
  let vx=cos(a),vy=sin(a);
  if(interactive&&mouseIsPressed&&mouseX>0&&mouseX<W&&mouseY>0&&mouseY<W){let mx=x-mouseX,my=y-mouseY,m=hypot(mx,my)+1,f=exp(-m*m/23000)*3;vx+=-my/m*f;vy+=mx/m*f;}
  p.x+=vx*params.speed*1.65;p.y+=vy*params.speed*1.65;p.age++;
  const alpha=min(1,p.age/18,(p.life-p.age)/25)*.4;
  const c=palette[p.c];ctx.strokeStyle=`rgba(${red(c)},${green(c)},${blue(c)},${max(0,alpha)})`;
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(p.x,p.y);ctx.stroke();
  if(p.age>p.life||hypot(p.x-450,p.y-450)>395)p.reset();
 }
}
function buildWaveField(){
 waveCos=new Float32Array(N*N);waveSin=new Float32Array(N*N);waveMask=new Float32Array(N*N);
 const points=[];for(let j=0;j<params.sources;j++){const a=TWO_PI*j/params.sources+phaseOffset;points.push([cos(a)*params.radius,sin(a)*params.radius]);}
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const u=(x-N/2)/(N*.46),v=(y-N/2)/(N*.46),i=y*N+x;
  waveMask[i]=1-easeBetween(.82,1.03,hypot(u,v));
  for(const [px,py]of points){const d=hypot(u-px,v-py)*params.frequency*PI;waveCos[i]+=cos(d)/params.sources;waveSin[i]+=sin(d)/params.sources;}
 }
}
function drawWaves(){
 fieldImage.loadPixels();const data=fieldImage.pixels;
 const t=tick*.022*params.speed,ct=cos(t),st=sin(t),cols=palette.map(c=>[red(c),green(c),blue(c)]);
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const index=y*N+x,value=waveCos[index]*ct+waveSin[index]*st;
  const edge=waveMask[index],power=pow(abs(value),.75),ripple=exp(-pow(value/.075,2));
  const glow=min(1,power*.9+ripple*.4)*edge;
  let mix=constrain(power*2,0,1),a=cols[0],b=cols[1];if(power>.5){a=cols[1];b=cols[2];mix=(power-.5)*2;}
  const k=(y*N+x)*4;data[k]=10+(a[0]+(b[0]-a[0])*mix)*glow;data[k+1]=16+(a[1]+(b[1]-a[1])*mix)*glow;data[k+2]=29+(a[2]+(b[2]-a[2])*mix)*glow;data[k+3]=255;
 }
 fieldImage.updatePixels();image(fieldImage,0,0,W,W);
 noFill();stroke(143,226,191,45);strokeWeight(.7);circle(450,450,816);
}
function easeBetween(a,b,v){v=constrain((v-a)/(b-a),0,1);return v*v*(3-2*v);}
function grow(x,y,len,a,depth,parent){
 const id=branches.length,angle=a+random(-.055,.055);const b={x,y,ex:x+cos(angle)*len,ey:y+sin(angle)*len,len,a:angle,depth,parent,leaf:random(),phase:random(TWO_PI)};branches.push(b);
 if(depth<params.depth){const spread=radians(params.angle)*random(.82,1.12);grow(b.ex,b.ey,len*params.ratio*random(.91,1.04),angle-spread,depth+1,id);grow(b.ex,b.ey,len*params.ratio*random(.91,1.04),angle+spread,depth+1,id);}
}
function drawPlant(){
 background('#f1eee3');const ctx=drawingContext;
 // Paper grain is deterministic and independent of the tree's RNG sequence.
 noStroke();fill(92,86,61,12);for(let i=0;i<1200;i++){const x=(i*167.13+params.seed%71)%900,y=(i*97.39)%900;circle(x,y,.8);}
 let minX=0,maxX=0,minY=0;for(const b of branches){minX=min(minX,b.ex);maxX=max(maxX,b.ex);minY=min(minY,b.ey);}
 const scaleFactor=min(650/max(1,maxX-minX),650/max(1,-minY));
 push();translate(450-(maxX+minX)*.5*scaleFactor,795);scale(scaleFactor);
 const time=tick/28;
 for(const b of branches){
  const p=easeBetween(b.depth*.56,b.depth*.56+.85,time);if(!p)continue;
  const sway=(x,y)=>sin(tick*.017+y*.008+phaseOffset)*params.wind*pow(abs(y)/500,1.6)*9;
  const x=b.x+sway(b.x,b.y),y=b.y,ex=lerp(b.x,b.ex,p)+sway(b.ex,b.ey),ey=lerp(b.y,b.ey,p);
  const c=lerpColor(palette[0],palette[1],b.depth/(params.depth+1));stroke(c);strokeWeight(max(.45,10*pow(.69,b.depth)));noFill();
  ctx.lineCap='round';bezier(x,y,lerp(x,ex,.35)+2,y,lerp(x,ex,.7),lerp(y,ey,.7),ex,ey);
  if(b.depth>=params.depth-1){const leafScale=easeBetween(.55,1,p);if(!leafScale)continue;push();translate(ex,ey);rotate(b.a+HALF_PI+sin(tick*.014+b.phase)*params.wind*.1);scale(leafScale);noStroke();fill(b.leaf>.88?palette[2]:c);
   const l=10+b.leaf*10;beginShape();vertex(0,0);bezierVertex(-l*.65,-l*.5,-l*.35,-l*1.1,0,-l*1.3);bezierVertex(l*.45,-l*.8,l*.55,-l*.4,0,0);endShape(CLOSE);stroke(241,238,227,115);strokeWeight(.45);line(0,0,0,-l*1.1);pop();}
 }
 pop();stroke(80,92,63,50);strokeWeight(.6);line(315,806,585,806);
}
function draw(){if(!ready)return;if(!paused){tick++;if(mode==='flow')flowStep(true);else if(mode==='waves')drawWaves();else drawPlant();}}
function updateParam(name,value){params[name]=Number(value);$(name+'-value').textContent=value;if(mode==='growth'||name==='count'||name==='scale')initializeSystem();else if(mode==='waves'){if(name!=='speed')buildWaveField();if(paused)drawWaves();}else if(paused){if(mode==='waves')drawWaves();else {flowStep(false);}}}
function updateColor(id,value){const i=Number(id.slice(-1))-1;params.colors[i]=value;$(id+'-value').textContent=value;palette=params.colors.map(c=>color(c));if(mode==='growth')drawPlant();if(mode==='waves')drawWaves();if(mode==='flow')initializeSystem();}
function updateSeedDisplay(){$('seed-input').value=params.seed;}
function updateSeed(){const value=Number($('seed-input').value);if(Number.isSafeInteger(value)&&value>0&&value<=999999999){params.seed=value;initializeSystem();}updateSeedDisplay();}
function previousSeed(){params.seed=max(1,params.seed-1);updateSeedDisplay();initializeSystem();}
function nextSeed(){params.seed++;updateSeedDisplay();initializeSystem();}
function randomSeedAndUpdate(){params.seed=Math.floor(Math.random()*999999)+1;updateSeedDisplay();initializeSystem();}
function resetParameters(){defaults();setControls();initializeSystem();}
function togglePause(){paused=!paused;$('pause').textContent=paused?'继续':'暂停';$('pause').setAttribute('aria-pressed',String(paused));if(paused)noLoop();else loop();}
function exportImage(){saveCanvas(cnv,mode+'-'+params.seed,'png');}
document.addEventListener('visibilitychange',()=>{if(document.hidden)noLoop();else if(!paused)loop();});
window.__art={get ready(){return ready},get mode(){return mode},get params(){return params},get paused(){return paused},get tick(){return tick},choosePiece,initializeSystem,step(n=1){for(let i=0;i<n;i++){tick++;if(mode==='flow')flowStep(false);else if(mode==='waves')drawWaves();else drawPlant();}},get signature(){return mode==='growth'?branches.slice(0,12).map(b=>[b.ex,b.ey]):mode==='flow'?particles.slice(0,12).map(p=>[p.x,p.y]):[phaseOffset,params.seed]}};
