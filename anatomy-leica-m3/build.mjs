import { mkdir, copyFile } from 'node:fs/promises';
const source = new URL('./', import.meta.url);
const target = new URL('../public/demos/leica-m3/', import.meta.url);
await mkdir(new URL('vendor/controls/', target), { recursive: true });
for (const name of ['index.html', 'style.css', 'main.js', 'model.js', 'internals.js', 'section.js', 'motion.js', 'rig.js']) {
  await copyFile(new URL(name, source), new URL(name, target));
}
await copyFile(new URL('../node_modules/three/examples/jsm/controls/OrbitControls.js', source), new URL('vendor/controls/OrbitControls.js', target));
console.log('Built public/demos/leica-m3/');
