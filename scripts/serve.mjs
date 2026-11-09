import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('site');
http.createServer((req,res)=>{
 let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 // Simulate a GitHub Pages repository subpath.
 url=url.replace(/^\/remember-the-world(?=\/|$)/,'');
 if(!url||url.endsWith('/'))url+='index.html';
 const file=path.resolve(root,'.'+url);
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
 res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(file).pipe(res);
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173/remember-the-world/'));
