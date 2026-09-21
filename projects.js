'use strict';
const projects=window.projectData;
const list=document.querySelector('#project-list');
list.setAttribute('aria-label','Project gallery — drag horizontally or use arrow keys');
list.tabIndex=0;
projects.forEach((p,i)=>{
 const item=document.createElement('article');item.className='project-card';item.dataset.category=p.category;
 item.innerHTML=`<a class="project-cover" href="project.html?id=${p.id}" aria-label="View ${p.name}" draggable="false">${p.images.map((src,j)=>`<img src="${src}" class="preview-image ${j===0?'shown':''}" alt="${j===0?p.name+' — concept cover':''}" draggable="false" decoding="async">`).join('')}<span class="preview-tag" aria-hidden="true">LOOK INSIDE <span class="image-count">01 / 04</span></span></a><div class="cover-caption"><span class="index">0${i+1}</span><div><h2>${p.name}</h2><p>${p.label}</p></div><a class="view-project" href="project.html?id=${p.id}" aria-label="View ${p.name}">VIEW PROJECT ↗</a></div>`;
 list.append(item);
});
const cards=[...list.querySelectorAll('.project-card')],covers=cards.map(c=>c.querySelector('.project-cover'));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let inputType='mouse';
let hovered=null,playing=null,dwell=0,cycle=0,scrollTimer=0,down=null,dragging=false,suppressClick=false,lastPointer=null,anchor=null;
function frame(cover,index){cover.dataset.frame=index;cover.querySelectorAll('img').forEach((img,i)=>img.classList.toggle('shown',i===index));cover.querySelector('.image-count').textContent=`0${index+1} / 04`;}
function cancel(){clearTimeout(dwell);clearTimeout(cycle);dwell=cycle=0;if(playing){playing.classList.remove('previewing');frame(playing,0);}playing=null;}
function start(cover){if(dragging||down||hovered!==cover||document.hidden)return;cancel();playing=cover;cover.classList.add('previewing');let index=1;frame(cover,index);if(reduced.matches)return;const next=()=>{if(playing!==cover||dragging||document.hidden)return;index=index%3+1;frame(cover,index);cycle=setTimeout(next,1200);};cycle=setTimeout(next,1200);}
function arm(cover){cancel();if(!cover||dragging||down||inputType!=='mouse')return;dwell=setTimeout(()=>start(cover),400);}
function coverAtPointer(){if(!lastPointer)return null;const el=document.elementFromPoint(lastPointer.x,lastPointer.y)?.closest('.project-cover');return el&&list.contains(el)?el:null;}
function updatePerspective(){const center=list.getBoundingClientRect().left+list.clientWidth/2;let nearest=null,best=Infinity;cards.filter(c=>!c.hidden).forEach(c=>{const r=c.getBoundingClientRect(),distance=(r.left+r.width/2-center);if(Math.abs(distance)<best){best=Math.abs(distance);nearest=c;}c.style.setProperty('--turn',`${Math.max(-35,Math.min(35,-distance/16))}deg`);});cards.forEach(c=>c.classList.toggle('active',c===nearest));}
covers.forEach(cover=>{
 cover.dataset.frame='0';
 cover.addEventListener('pointerenter',e=>{inputType=e.pointerType;if(e.pointerType!=='mouse')return;hovered=cover;lastPointer={x:e.clientX,y:e.clientY};anchor={...lastPointer};arm(cover);});
 cover.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||dragging||down)return;lastPointer={x:e.clientX,y:e.clientY};hovered=cover;if(!anchor||Math.hypot(e.clientX-anchor.x,e.clientY-anchor.y)>6){anchor={...lastPointer};arm(cover);}});
 cover.addEventListener('pointerleave',()=>{if(hovered===cover){hovered=null;anchor=null;cancel();}});
});
list.addEventListener('pointerdown',e=>{inputType=e.pointerType;if(e.button!==0)return;cancel();suppressClick=false;down={x:e.clientX,y:e.clientY,scroll:list.scrollLeft,id:e.pointerId};lastPointer={x:e.clientX,y:e.clientY};});
list.addEventListener('pointermove',e=>{if(!down||e.pointerId!==down.id)return;lastPointer={x:e.clientX,y:e.clientY};const dx=e.clientX-down.x,dy=e.clientY-down.y;if(!dragging&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){dragging=true;suppressClick=true;cancel();list.setPointerCapture(e.pointerId);list.classList.add('dragging');}if(dragging){e.preventDefault();list.scrollLeft=down.scroll-dx;}});
function release(e){if(!down)return;const wasDragging=dragging;down=null;dragging=false;list.classList.remove('dragging');if(list.hasPointerCapture(e.pointerId))list.releasePointerCapture(e.pointerId);if(wasDragging){hovered=null;cancel();}else if(e.pointerType==='mouse'){hovered=coverAtPointer();arm(hovered);}}
list.addEventListener('pointerup',release);list.addEventListener('pointercancel',e=>{cancel();release(e);hovered=null;});
window.addEventListener('pointerup',e=>{if(down)release(e);});
list.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopPropagation();suppressClick=false;}},true);
list.addEventListener('dragstart',e=>e.preventDefault());
list.addEventListener('scroll',()=>{cancel();updatePerspective();clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{if(!dragging&&!down){hovered=coverAtPointer();anchor=lastPointer&&{...lastPointer};arm(hovered);}},180);},{passive:true});
list.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();cancel();list.scrollBy({left:(e.key==='ArrowRight'?1:-1)*360,behavior:reduced.matches?'instant':'smooth'});}});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{cancel();hovered=null;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));cards.forEach(card=>card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter);list.scrollLeft=0;updatePerspective();}));
document.querySelectorAll('[data-gallery-step]').forEach(b=>b.addEventListener('click',()=>{cancel();list.scrollBy({left:Number(b.dataset.galleryStep)*360,behavior:reduced.matches?'instant':'smooth'});}));
window.addEventListener('resize',()=>{cancel();updatePerspective();});
window.addEventListener('blur',()=>{hovered=null;cancel();});
window.addEventListener('scroll',()=>{hovered=null;cancel();clearTimeout(scrollTimer);},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){hovered=null;cancel();}});
new IntersectionObserver(entries=>{if(!entries[0].isIntersecting){hovered=null;cancel();clearTimeout(scrollTimer);}}).observe(list);
updatePerspective();
