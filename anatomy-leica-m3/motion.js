// One shared state drives readouts and parts. Time is slowed for inspection;
// these durations are not exposure settings or calibrated gear ratios.
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
export function createMechanism(){
  let action=null,elapsed=0,paused=false,frames=0,loaded=true,cocked=false;
  let travel=0,rewound=0,first=0,second=0,startTravel=0,startFirst=0,startSecond=0,driveTravel=0;
  const durations={advance:3.2,shutter:2.8,rewind:5.6};
  function reset(){action=null;elapsed=0;paused=false;frames=0;loaded=true;cocked=false;travel=0;rewound=0;first=0;second=0;driveTravel=0;}
  function start(kind){
    if(action||!loaded||!(kind in durations))return false;
    if(kind==='advance'&&(cocked||frames>=36)||kind==='shutter'&&!cocked)return false;
    action=kind;elapsed=0;paused=false;startTravel=travel;startFirst=first;startSecond=second;return true;
  }
  function pose(){
    const p=action?clamp(elapsed/durations[action]):0;
    let lever=0,press=0,rewind=loaded?0:1,phase=loaded?(cocked?'已上弦 · 可以释放快门':'待过片'):'倒片完成 · 可重置机构';
    let counter=frames;
    if(action==='advance'){
      const pull=ease(p/.68);lever=p<.68?pull:1-ease((p-.68)/.32);
      travel=startTravel+38*pull;driveTravel=travel;first=second=pull;counter=frames+pull;
      phase=p<.68?'过片 · 输片、计数与布帘上弦':'过片杆回位 · 棘轮保持上弦';
    }else if(action==='shutter'){
      press=ease(p/.12)*(1-ease((p-.84)/.16));
      first=1-clamp((p-.16)/.48);second=1-clamp((p-.38)/.48);
      phase=p<.16?'按下释放杆':p<.38?'前帘释放':p<.86?'后帘跟随 · 曝光缝隙横移':'快门闭合 · 释放钮回位';
    }else if(action==='rewind'){
      rewind=ease(p/.18);const q=ease((p-.2)/.72);
      rewound=(startTravel+92)*q;travel=startTravel-rewound;
      first=startFirst;second=startSecond;
      phase=p<.2?'切换 R · 提起倒片钮':p<.92?'反向输片 · 胶片收回暗盒':'片头退出收片轴 · 倒片完成';
    }
    return {action,paused,progress:p,frames,loaded,cocked,travel,driveTravel,rewound,first,second,lever,press,rewind,counter,phase};
  }
  function tick(dt){
    if(!action||paused)return;
    elapsed=Math.min(durations[action],elapsed+dt);pose();
    if(elapsed>=durations[action]){
      if(action==='advance'){frames++;cocked=true;first=second=1;}
      if(action==='shutter'){cocked=false;first=second=0;}
      if(action==='rewind')loaded=false;
      action=null;elapsed=0;
    }
  }
  return {start,tick,pose,reset,togglePause(){if(action)paused=!paused;}};
}
