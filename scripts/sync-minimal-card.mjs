import {copyFile,readFile,writeFile} from 'node:fs/promises';
const src='cards/holo-minimal',dest='public/cards/holo-minimal';
for(const name of ['subject','background','lineart','text'])await copyFile(`${src}/assets/${name}.png`,`${dest}/${name}.png`);
for(const name of ['card.blend','preview.png'])await copyFile(`${src}/${name}`,`${dest}/${name}`);
await copyFile(`${src}/web/assets/card.glb`,`${dest}/card.glb`);
const config=JSON.parse(await readFile(`${src}/card-config.json`,'utf8'));
config.assets=Object.fromEntries(['subject','background','lineart','text'].map(n=>[n,`./${n}.png`]));config.assets.model='./card.glb';
await writeFile(`${dest}/card-config.json`,JSON.stringify(config,null,2));
