// Copies the static web app into www/ for Capacitor to bundle into the APK.
import { cpSync, rmSync, mkdirSync } from 'node:fs';

const OUT = 'www';
const FILES = ['index.html', 'styles.css', 'manifest.json', 'sw.js', 'js', 'icons', 'fonts', 'audio'];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
for (const f of FILES) cpSync(f, `${OUT}/${f}`, { recursive: true });
console.log(`Web app copied to ${OUT}/`);
