import { mkdir, readdir, copyFile, cp } from 'node:fs/promises';
const source=new URL('../anatomy-sr6/',import.meta.url),target=new URL('../public/demos/anatomy-sr6/',import.meta.url);
await mkdir(target,{recursive:true});
for(const name of await readdir(source))if(name.endsWith('.js')||name==='index.html')await copyFile(new URL(name,source),new URL(name,target));
await cp(new URL('vendor/',source),new URL('vendor/',target),{recursive:true});
await import('../anatomy-leica-m3/build.mjs');
