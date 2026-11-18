import {cp, mkdir} from 'node:fs/promises';
// The shared composition uses staticFile('audio/...') in Studio and the gallery.
const target = new URL('../public/audio/', import.meta.url);
await mkdir(target, {recursive: true});
await cp(new URL('../remotion-guide/public/audio/', import.meta.url), target, {recursive: true});
