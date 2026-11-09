import fs from 'node:fs';
import {unzipSync,zipSync,strFromU8,strToU8} from 'fflate';
import {XMLParser} from 'fast-xml-parser';
const raw=JSON.parse(fs.readFileSync('source/article.json','utf8').replace(/^\uFEFF/,''));
const paragraphs=structuredClone(raw);
const changes=[];
for(const [i,p] of paragraphs.entries()){
 if(p.text.includes('2026年11月8日')){
  const before=p.text;p.text=p.text.replace('2026年11月8日','2026年11月2日');
  let replaced=false;
  p.runs=p.runs.map(r=>{if(!replaced&&(r.text==='8'||r.text.includes('2026年11月8日'))){replaced=true;return {...r,text:r.text==='8'?'2':r.text.replace('2026年11月8日','2026年11月2日')};}return r;});
  if(p.runs.map(r=>r.text).join('')!==p.text)throw Error('Date run mismatch');
  changes.push({paragraph:i,before,after:p.text});
 }
}
if(changes.length!==2)throw Error('Expected exactly two date changes');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const chapters=paragraphs.filter(p=>p.style==='Chapter');
if(chapters.length!==10)throw Error('Expected ten chapters');
let c=0;
const content=paragraphs.map((p,i)=>{
 let tag='p',cls='',id='';
 if(p.style==='Chapter'){tag='h2';id=`chapter-${++c}`;}
 else if(i===1){tag='h2';cls='source-title';id='article-title';}
 else if(i===0)cls='source-kicker';else if(i===2)cls='source-subtitle';else if(i===5||i===443)cls='source-meta';
 else if(p.style==='EssayQuote')cls='source-quote';
 else if(p.text==='至于剩下的故事……'){tag='h2';id='epilogue';cls='chapter-end';}
 if(!p.text.trim())cls='source-spacer';
 const inner=p.runs.map(r=>`${r.bold?'<strong>':''}${r.italic?'<em>':''}${esc(r.text)}${r.italic?'</em>':''}${r.bold?'</strong>':''}`).join('');
 return `<${tag} data-source-index="${i}"${id?` id="${id}"`:''}${cls?` class="${cls}"`:''}>${inner}</${tag}>`;
}).join('\n');
const toc=chapters.map((p,i)=>`<a href="#chapter-${i+1}">${esc(p.text)}</a>`).join('');
const sizeControls='<button type="button" data-size="-1" aria-label="缩小正文字号">A−</button><span data-size-value aria-live="polite">19 px</span><button type="button" data-size="1" aria-label="放大正文字号">A＋</button>';
const html=`<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#141618"><meta name="description" content="一个想记得世界的人——写给一个正在重新认识自己的年轻人。一封关于成长、自由与世界的长信。"><title>一个想记得世界的人</title><link rel="icon" href="./favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="./styles.css"><script src="./app.js" defer></script></head>
<body id="beginning"><a href="#article" class="skip">跳到正文</a>
<header class="topbar"><a class="brand" href="#beginning" aria-label="返回封面"><svg viewBox="0 0 30 30" fill="none" aria-hidden="true"><circle cx="15" cy="15" r="10" stroke="currentColor"/><ellipse cx="15" cy="15" rx="15" ry="4" transform="rotate(-35 15 15)" stroke="currentColor"/></svg><span>一个想记得世界的人</span></a><div class="bar-actions"><span id="percent" aria-hidden="true">0%</span><button class="mobile-menu" data-open="#contents">目录</button><button data-open="#share">分享</button></div><progress id="progress" class="progress" value="0" max="100" aria-label="正文阅读进度"></progress></header>
<main><section class="cover" aria-labelledby="cover-title"><div class="orbit" aria-hidden="true"></div><div class="star" aria-hidden="true"></div><div class="cover-label">一封关于自我的长信</div><h1 id="cover-title">一个想记得世界的人</h1><p class="subtitle">写给一个正在重新认识自己的年轻人</p><blockquote class="cover-quote">你不一定要成为一个被世界记住的人。<br>你可以成为一个真正记住了世界的人。</blockquote><time class="cover-date" datetime="2026-11-02">2026 年 11 月 2 日</time><a class="start" href="#article">开始阅读 <span aria-hidden="true">↓</span></a><div class="cover-foot"><span>十个章节，一段仍在继续的故事</span><span>慢慢读，世界还很长。</span></div></section>
<div class="reading-layout"><aside class="sidebar"><nav aria-label="文章目录"><h2>阅读目录</h2><div class="toc"><a href="#article">引言</a>${toc}<a href="#epilogue">至于剩下的故事……</a></div></nav><div class="tools"><div class="tools-label">正文字号</div><div class="tools-row">${sizeControls}</div><p class="privacy">阅读位置仅保存在此浏览器。<br>无需登录，无访问追踪。</p></div></aside><article id="article" aria-labelledby="article-title">${content}<div class="endmark" aria-hidden="true">✧</div></article></div></main>
<footer class="footer">一个想记得世界的人<br>2026 年 11 月 2 日</footer>
<button id="top" class="floating" aria-label="返回顶部">↑</button><div id="resume" class="resume" hidden>上次读到 <span id="resume-percent"></span><button id="continue">继续阅读</button><button id="dismiss" aria-label="关闭并重新阅读">×</button></div>
<dialog id="contents" aria-labelledby="contents-title"><button class="close" data-close aria-label="关闭目录">×</button><h2 id="contents-title">阅读目录</h2><div class="mobile-settings">${sizeControls}</div><nav class="dialog-toc" aria-label="移动端文章目录"><a href="#article">引言</a>${toc}<a href="#epilogue">至于剩下的故事……</a></nav></dialog>
<dialog id="share" aria-labelledby="share-title"><button class="close" data-close aria-label="关闭分享">×</button><h2 id="share-title">把这封长信，分享给一个人</h2><label for="share-url">文章网址</label><input id="share-url" class="share-url" readonly><button id="copy">复制网址</button> <button id="native-share">系统分享</button><p>在微信中，也可以使用右上角菜单分享。</p></dialog><div id="status" class="toast" role="status" aria-live="polite"></div><noscript><p class="no-js">正文与目录可直接阅读；字号调整和位置记忆需要启用 JavaScript。</p></noscript></body></html>`;
fs.writeFileSync('site/index.html',html);
fs.writeFileSync('site/.nojekyll','');
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/authorized-changes.json',JSON.stringify(changes,null,2));
if(fs.existsSync('source/original.docx')){
 const files=unzipSync(fs.readFileSync('source/original.docx'));
 const parser=new XMLParser({ignoreAttributes:false,parseTagValue:false,trimValues:false});
 let n=0;
 let xml=strFromU8(files['word/document.xml']);
 xml=xml.replace(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g,p=>{
  const ts=[...p.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m=>m[1]).join('');
  if(ts.includes('2026年11月8日')){n++;return p.replace(/(<w:t(?:\s[^>]*)?>)8(<\/w:t>)/,'$12$2');}return p;
 });
 if(n!==2)throw Error('Word date count mismatch');
 parser.parse(xml);
 files['word/document.xml']=strToU8(xml);
 fs.writeFileSync('source/一个想记得世界的人_11月2日版.docx',zipSync(files));
}
console.log(`Built ${paragraphs.length} paragraphs, ${chapters.length} chapters; ${changes.length} authorized date edits.`);
