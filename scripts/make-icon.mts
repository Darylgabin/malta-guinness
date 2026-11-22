// Writes app/icon.svg from the same harp outline the 3D model uses.
import { writeFileSync } from 'node:fs';
import { harpSvgMarkup } from '../lib/harpGeometry.ts';
const svg = harpSvgMarkup('#d4a038', 0.05)
  .replace('viewBox="-1.45 -2.3 2.9 4.4"', 'viewBox="-2.5 -2.5 5 5"')
  .replace('<path', '<rect x="-2.5" y="-2.5" width="5" height="5" rx="1.1" fill="#24110a"/><path');
writeFileSync(new URL('../app/icon.svg', import.meta.url), svg);
console.log('app/icon.svg written');
