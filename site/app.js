(() => {
 'use strict';
 const $ = s => document.querySelector(s);
 const key = 'remember-world:v1:' + location.pathname;
 const read = name => {try{return JSON.parse(localStorage.getItem(key+name));}catch{return null;}};
 const save = (name,value) => {try{localStorage.setItem(key+name,JSON.stringify(value));}catch{}};
 let size = Number(read('size')) || 19;
 const setSize = value => {size=Math.max(16,Math.min(26,value));document.documentElement.style.setProperty('--size',size+'px');save('size',size);document.querySelectorAll('[data-size-value]').forEach(e=>e.textContent=size+' px');document.querySelectorAll('[data-size]').forEach(e=>e.disabled=(e.dataset.size==='1'?size===26:size===16));};
 setSize(size);
 document.querySelectorAll('[data-size]').forEach(b=>b.addEventListener('click',()=>setSize(size+Number(b.dataset.size))));
 const toast = text => {$('#status').textContent=text;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#status').textContent='',4000);};
 const openDialog = id => {const d=$(id);if(d.showModal)d.showModal();else d.setAttribute('open','');};
 document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openDialog(b.dataset.open)));
 document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
 document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
 document.querySelectorAll('.dialog-toc a').forEach(a=>a.addEventListener('click',()=>$('#contents').close()));
 $('#top').addEventListener('click',()=>{window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
 const shareURL=()=>location.origin+location.pathname;
 $('#share-url').value=shareURL();
 $('#copy').addEventListener('click',async()=>{try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(shareURL());}else{const input=$('#share-url');input.focus();input.select();if(!document.execCommand('copy'))throw Error('copy');}toast('网址已复制');}catch{$('#share-url').focus();$('#share-url').select();toast('请长按网址复制，或使用浏览器分享菜单');}});
 $('#native-share').addEventListener('click',async()=>{if(navigator.share){try{await navigator.share({title:document.title,url:shareURL()});}catch(e){if(e.name!=='AbortError')toast('请使用复制网址或浏览器分享菜单');}}else toast('请使用复制网址，或微信右上角的分享菜单');});
 const saved = read('position');
 const article=$('#article');
 let ticking=false, activeSave = !saved || !!location.hash;
 const paras=[...document.querySelectorAll('[data-source-index]')];
 const headings=[...article.querySelectorAll('h2[id]')];
 let lastWrite=0;
 function update(){
  ticking=false;
  const start=article.getBoundingClientRect().top+scrollY-90;
  const end=article.getBoundingClientRect().bottom+scrollY-innerHeight;
  const value=Math.max(0,Math.min(100,100*(scrollY-start)/Math.max(1,end-start)));
  $('#progress').value=value;$('#percent').textContent=Math.round(value)+'%';
  let current='article';for(const h of headings){if(h.getBoundingClientRect().top<=150)current=h.id;}
  document.querySelectorAll('.toc a').forEach(a=>{if(a.hash==='#'+current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  if(activeSave&&Date.now()-lastWrite>500){const p=paras.find(p=>p.getBoundingClientRect().bottom>95);if(p){save('position',{index:Number(p.dataset.sourceIndex),offset:p.getBoundingClientRect().top-95,percent:Math.round(value)});lastWrite=Date.now();}}
 }
 let saveTimer;
 addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(update);ticking=true;}clearTimeout(saveTimer);saveTimer=setTimeout(()=>{lastWrite=0;update();},550);},{passive:true});
 addEventListener('resize',update);
 addEventListener('pagehide',()=>{lastWrite=0;update();});
 if(saved&&saved.percent>0&&saved.percent<100&&!location.hash){$('#resume').hidden=false;$('#resume-percent').textContent=saved.percent+'%';}
 $('#continue').addEventListener('click',()=>{const p=document.querySelector('[data-source-index="'+saved.index+'"]');if(p)window.scrollTo({top:p.getBoundingClientRect().top+scrollY-95-(Number(saved.offset)||0),behavior:'instant'});activeSave=true;$('#resume').hidden=true;update();});
 $('#dismiss').addEventListener('click',()=>{activeSave=true;$('#resume').hidden=true;lastWrite=0;update();});
 update();
})();
