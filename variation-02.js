'use strict';
gsap.registerPlugin(ScrollTrigger);
// Storyboard coordinates, not screenshots. Every visible facet persists through the timeline.
const NS='http://www.w3.org/2000/svg';
const poly=(parent,points,i)=>{const el=document.createElementNS(NS,'polygon');el.setAttribute('points',points.flat().join(' '));el.setAttribute('fill',i%2?'url(#light)':'url(#teal)');document.querySelector(parent).append(el);return el;};
const add=(points,x,y)=>points.map(([a,b])=>[a+x,b+y]);
const ring=[
 [[-235,-30],[-45,-230],[35,-150],[-155,50]],
 [[-45,-230],[110,-230],[230,-115],[155,-35]],
 [[110,-230],[230,-115],[155,-35],[35,-150]],
 [[230,-115],[235,40],[45,240],[-35,160]],
 [[235,40],[45,240],[-35,160],[155,-35]],
 [[45,240],[-110,240],[-230,125],[-155,50]],
 [[-110,240],[-230,125],[-155,50],[-35,160]],
 [[-230,125],[-235,-30],[-155,50],[-35,160]]
];
// Four primary strips plus four fold triangles form the asymmetric hollow brand mark.
const final=[
 [[-235,-30],[-45,-230],[35,-150],[-155,50]],
 [[-45,-230],[110,-230],[35,-150],[35,-150]],
 [[110,-230],[230,-115],[155,-35],[35,-150]],
 [[230,-115],[235,40],[155,-35],[155,-35]],
 [[235,40],[45,240],[-35,160],[155,-35]],
 [[45,240],[-110,240],[-35,160],[-35,160]],
 [[-110,240],[-230,125],[-155,50],[-35,160]],
 [[-230,125],[-235,-30],[-155,50],[-155,50]]
].map(p=>add(p,960,555));
const initial=[
 [[770,390],[910,215],[973,285],[831,461]],
 [[910,215],[955,242],[993,333],[973,285]],
 [[973,285],[1070,425],[1004,458],[938,385]],
 [[1004,458],[1027,490],[914,495],[960,439]],
 [[947,482],[1039,568],[989,635],[898,552]],
 [[970,609],[1069,702],[992,814],[924,749]],
 [[937,751],[1038,806],[995,840],[870,806]],
 [[807,835],[1101,835],[1091,922],[794,922]]
];
const offsets=[[-580,-85],[-430,-245],[580,-55],[760,0],[590,210],[-110,330],[-610,260],[-770,30]];
const spread=final.map((p,i)=>{const center=p.reduce((s,v)=>[s[0]+v[0]/4,s[1]+v[1]/4],[0,0]);return p.map(([x,y])=>[960+offsets[i][0]*.90+(x-center[0])*.85,555+offsets[i][1]*.88+(y-center[1])*.85]);});
const thin=spread.map((p,i)=>{const center=p.reduce((s,v)=>[s[0]+v[0]/4,s[1]+v[1]/4],[0,0]);return p.map(([x,y])=>[960+offsets[i][0]*.72+(x-center[0])*.23,555+offsets[i][1]*1.03+(y-center[1])*.23]);});
initial.forEach((p,i)=>{initial[i]=p.map(([x,y])=>[1190+(x-960)*.86,530+(y-555)*.86]);});
const sides=initial.map((p,i)=>poly('#depth',p,i));
const els=initial.map((p,i)=>poly('#facets',p,i));
final.forEach((p,i)=>poly('#ghost',p,i));
const chains=Array.from({length:46},(_,i)=>poly('#chain',[[0,-27],[28,0],[0,27],[-28,0]],i));
const ghost=document.querySelector('#ghost'),title=document.querySelector('#title');
const state={progress:0};
const clamp=v=>Math.max(0,Math.min(1,v));const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
const mix=(a,b,t)=>a.map(([x,y],i)=>[x+(b[i][0]-x)*t,y+(b[i][1]-y)*t]);
const planeTargets=[[[0,470],[215,490],[215,690],[0,720]],[[255,445],[345,475],[345,690],[255,725]],[[425,480],[770,480],[770,710],[425,710]],...Array.from({length:6},(_,i)=>[[850+i*190,480-i*5],[1080+i*190,445-i*5],[1080+i*190,740+i*5],[850+i*190,710+i*5]])];
const planes=planeTargets.map((p,i)=>poly('#project-planes',p,i));
function render(){ 
 const p=state.progress;
 const a=smooth((p-10)/15),b=smooth((p-25)/15),c=smooth((p-40)/18);
 title.style.opacity=1-smooth((p-10)/10);
 title.setAttribute('transform',`translate(0 ${-120*a})`);
 els.forEach((el,i)=>{
  let points=p<=25?mix(initial[i],thin[i],a):p<=40?mix(thin[i],spread[i],b):mix(spread[i],final[i],c);
  const lift=20*(1-c)+7*c;
  const edge=[points[2],points[3],[points[3][0]+lift,points[3][1]+lift*.8],[points[2][0]+lift,points[2][1]+lift*.8]];
  sides[i].setAttribute('points',edge.flat().join(' '));
  sides[i].setAttribute('fill',i%2?'#426f79':'#315e68');
  el.setAttribute('points',points.flat().join(' '));
 });
 ghost.style.opacity=.14*b*(1-c);
 chains.forEach((el,i)=>{
  const y=555+(i-22.5)*(12+22*a)-b*1550;
  const scale=(.12+.88*a)*(1-b*.65);
  el.setAttribute('transform',`translate(${960+Math.sin(i*2.7)*8*a} ${y}) scale(${scale})`);
  el.style.opacity=a*(1-b);
 });
 document.querySelector('#construction').style.opacity=.18+.48*b*(1-c);
 document.querySelector('#construction').setAttribute('transform',`translate(${230*(1-a)} ${-25*(1-a)})`);
 const emerge=smooth((p-58)/14),depart=smooth((p-72)/10),reveal=smooth((p-82)/10),browse=smooth((p-92)/8);
 const recent=document.querySelector('#recent');
 recent.style.opacity=emerge;
 const size=(.58+.42*emerge)*(1-.48*reveal);
 recent.setAttribute('transform',`translate(${960*(1-size)} ${555*(1-size)-260*reveal-180*browse}) scale(${size})`);
 recent.style.opacity=emerge*(1-browse);
 const hole=[[805,605],[995,405],[1115,520],[925,715]];
 const open=[[0,1080],[0,0],[1920,0],[1920,1080]];
 document.querySelector('#aperture-shape').setAttribute('points',mix(hole,open,depart).flat().join(' '));
 for(const id of ['facets','depth']){
  document.querySelector('#'+id).setAttribute('transform',`translate(${-1500*depart} ${-55*depart})`);
  document.querySelector('#'+id).style.opacity=1-depart;
 }
 if(p>58) document.querySelector('#construction').style.opacity=.18*(1-emerge);
 document.querySelector('#project-planes').style.opacity=reveal;
 planes.forEach((el,i)=>{const target=planeTargets[i];const collapsed=target.map(([x,y])=>[960+(x-960)*.05,1000+(y-595)*.08]);el.setAttribute('points',mix(collapsed,target,reveal).flat().join(' '));});
 document.querySelector('#company-name').style.opacity=browse;
 const step=p<18?0:p<32?1:p<49?2:p<=58?3:p<=72?4:p<=82?5:p<=92?6:7;
 document.querySelector('#scene-number').textContent=['01','02','03','04','05','06','07','08'][step];
 document.querySelector('#scene-label').textContent=['THE STARTING POINT','A SYSTEM OF PARTS','A NEW PERSPECTIVE','CONNECTED AS ONE','THROUGH THE CENTER','RECENT WORK','OPENING POSSIBILITIES','EXPLORE THE PROJECTS'][step];
 document.querySelector('#progress-bar').style.transform=`scaleX(${p/100})`;
 document.querySelector('#intro').dataset.progress=p.toFixed(4);
}
// Original 0–58 geometry retained; append 58–100 on the same master timeline.
const timeline=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{id:'onework-intro',trigger:'#intro',start:'top top',end:()=>`+=${Math.round(innerHeight*10)}`,pin:true,scrub:true,invalidateOnRefresh:true}});
// scrub:true is deliberately immediate: stop scrolling = stop animation (no trailing catch-up).
timeline.to(state,{progress:100,duration:100,onUpdate:render},0);
render();
window.onework={timeline,state,render,version:'scene-01-08-variation-02'};
