import fs from 'node:fs';
import path from 'node:path';
import {zipSync} from 'fflate';
const archive='一个想记得世界的人-web-完整项目.zip';
const files={};
function walk(dir=''){
 for(const item of fs.readdirSync(dir||'.',{withFileTypes:true})){
  if(['node_modules','.git','.playwright-cli'].includes(item.name)||item.name.endsWith('.zip'))continue;
  const rel=path.join(dir,item.name);
  if(item.isDirectory())walk(rel);else files['一个想记得世界的人-web/'+rel.split(path.sep).join('/')]=fs.readFileSync(rel);
 }
}
walk();fs.writeFileSync(archive,zipSync(files,{level:6}));console.log(`Packaged ${Object.keys(files).length} files into ${archive}`);
