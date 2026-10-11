import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  console.error('❌ Error: El directorio dist/ no existe. Ejecuta el build primero.');
  process.exit(1);
}

// 1. Sincronizar index.html compilado hacia la raíz del repositorio
const distIndex = path.join(distDir, 'index.html');
const rootIndex = path.join(rootDir, 'index.html');
if (fs.existsSync(distIndex)) {
  fs.copyFileSync(distIndex, rootIndex);
  console.log('✓ Sincronizado: dist/index.html -> ./index.html');
}

// 2. Sincronizar directorio assets/ hacia la raíz del repositorio
const distAssets = path.join(distDir, 'assets');
const rootAssets = path.join(rootDir, 'assets');
if (fs.existsSync(distAssets)) {
  if (fs.existsSync(rootAssets)) {
    fs.rmSync(rootAssets, { recursive: true, force: true });
  }
  fs.cpSync(distAssets, rootAssets, { recursive: true });
  console.log('✓ Sincronizado: dist/assets -> ./assets');
}

// 3. Sincronizar archivos estáticos y favicons
const staticFiles = [
  '.nojekyll',
  'favicon-32x32.png',
  'favicon-192x192.png',
  'favicon.svg',
  'logo-principal.png',
  'logo-dark.png',
  'logo-light.png',
  'brand-logo-transparent.png',
  'icons.svg',
];

for (const file of staticFiles) {
  const distFile = path.join(distDir, file);
  const rootFile = path.join(rootDir, file);
  if (fs.existsSync(distFile)) {
    fs.copyFileSync(distFile, rootFile);
  }
}

console.log('✓ Publicación lista para GitHub Pages (tanto Actions como Pages Legacy).');
