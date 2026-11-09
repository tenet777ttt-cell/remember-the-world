import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {unzipSync,strFromU8} from 'fflate';
import {XMLParser} from 'fast-xml-parser';
const parser=new XMLParser({preserveOrder:true,ignoreAttributes:false,parseTagValue:false,trimValues:false,processEntities:true});
function wordParagraphs(file){
 const zip=unzipSync(fs.readFileSync(file));
 const tree=parser.parse(strFromU8(zip['word/document.xml']));const out=[];
 function text(nodes){let s='';for(const n of nodes){for(const [k,v] of Object.entries(n)){if(k==='#text')s+=v;else if(k==='w:br')s+='\n';else if(k==='w:tab')s+='\t';else if(Array.isArray(v))s+=text(v);}}return s;}
 function walk(nodes){for(const n of nodes)for(const [k,v] of Object.entries(n)){if(k==='w:p'){const s=text(v);if(s)out.push(s);}else if(Array.isArray(v))walk(v);}}
 walk(tree);return out;
}
const source=JSON.parse(fs.readFileSync('source/article.json','utf8').replace(/^\uFEFF/,''));
const html=fs.readFileSync('site/index.html','utf8');
const entities=s=>s.replace(/&quot;/g,'"').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&amp;/g,'&');
const rendered=[...html.matchAll(/<(p|h2) data-source-index="(\d+)"[^>]*>([\s\S]*?)<\/\1>/g)].map(m=>({i:Number(m[2]),text:entities(m[3].replace(/<\/?(?:strong|em)>/g,''))}));
assert.equal(rendered.length,source.length);
const expected=source.map(p=>p.text.replace('2026年11月8日','2026年11月2日'));
rendered.forEach((p,i)=>{assert.equal(p.i,i);assert.equal(p.text,expected[i],`Paragraph ${i}`);assert(!p.text.includes('\uFFFD'));});
assert.equal(source.filter(p=>p.style==='Chapter').length,10);
assert.equal([...html.matchAll(/id="chapter-\d+"/g)].length,10);
assert(html.includes('id="epilogue"'));
for(const m of html.matchAll(/href="#([^\"]+)"/g))assert(html.includes(`id="${m[1]}"`),`Broken anchor ${m[1]}`);
const scripts=fs.readFileSync('site/app.js','utf8');
assert(!/https?:\/\//.test(scripts),'Unexpected network endpoint');
const originalExists=fs.existsSync('source/original.docx');
if(originalExists){assert.deepEqual(wordParagraphs('source/original.docx'),source.map(p=>p.text),'Independent Word extraction mismatch');assert.deepEqual(wordParagraphs('source/一个想记得世界的人_11月2日版.docx'),expected,'Updated Word mismatch');}
const report={status:'PASS',paragraphs:rendered.length,chapters:10,authorizedDateChanges:2,originalDocxVerified:originalExists,updatedDocxVerified:originalExists,exactTextAndOrder:true,allAnchorsResolve:true,replacementCharacters:0,sha256:crypto.createHash('sha256').update(JSON.stringify(expected)).digest('hex'),note:originalExists?'Compared independent OOXML extraction, JSON, updated Word and rendered HTML.':'CI compared approved JSON with HTML; original Word is intentionally excluded from public repository.'};
fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/content-check.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
