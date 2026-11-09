import fs from 'node:fs';
import {unzipSync,strFromU8} from 'fflate';
import {XMLParser} from 'fast-xml-parser';
const file=process.argv[2];
if(!file)throw Error('Usage: node scripts/import.mjs path/to/new.docx');
const zip=unzipSync(fs.readFileSync(file));
const xml=strFromU8(zip['word/document.xml']);
if(/<w:(tbl|hyperlink|txbxContent|del|ins)[\s>]/.test(xml))throw Error('Complex Word content detected; inspect before importing');
const parser=new XMLParser({preserveOrder:true,ignoreAttributes:false,parseTagValue:false,trimValues:false});
const tree=parser.parse(xml);const paragraphs=[];
function leaf(nodes){let s='';for(const n of nodes)for(const [k,v]of Object.entries(n)){if(k==='#text')s+=v;else if(k==='w:br')s+='\n';else if(k==='w:tab')s+='\t';else if(Array.isArray(v))s+=leaf(v);}return s;}
function walk(nodes){for(const n of nodes)for(const [k,v]of Object.entries(n)){
 if(k==='w:p'){
  const runs=[];let style=null;
  for(const item of v){
   if(item['w:pPr'])for(const prop of item['w:pPr'])if(prop['w:pStyle'])style=prop[':@']?.['@_w:val']||null;
   if(item['w:r']){const r=item['w:r'];const props=r.find(x=>x['w:rPr'])?.['w:rPr']||[];
    const enabled=key=>props.some(p=>p[key]&&!['0','false','off'].includes(p[':@']?.['@_w:val']));
    const text=leaf(r.filter(x=>!x['w:rPr']));if(text)runs.push({text,bold:enabled('w:b'),italic:enabled('w:i')});
   }
  }
  const text=runs.map(r=>r.text).join('');if(text)paragraphs.push({runs,text,style});
 }else if(Array.isArray(v))walk(v);
}}
walk(tree);
if(paragraphs.filter(p=>p.style==='Chapter').length!==10)throw Error('Expected ten chapters; import cancelled');
const target='source/article.json';
// Keep a local backup; source is only replaced when this explicit import command is invoked.
if(fs.existsSync(target))fs.copyFileSync(target,`source/article.backup-${Date.now()}.json`);
fs.writeFileSync(target,JSON.stringify(paragraphs,null,2)+'\n');
console.log('Imported '+paragraphs.length+' paragraphs. Preserve original.docx as the matching verification baseline before build/test.');
