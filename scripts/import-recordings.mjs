// Builds teacher recordings into the app so every tablet gets the same natural voice.
//
// 1. In the app's grown-ups area, record the cards, then tap "Export" to get qaidah-recordings.json.
// 2. Run: node scripts/import-recordings.mjs path/to/qaidah-recordings.json
// 3. Commit the audio/ folder. The next build/APK plays these recordings.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/import-recordings.mjs qaidah-recordings.json');
  process.exit(1);
}
const data = JSON.parse(readFileSync(file, 'utf8'));
if (!data.clips) throw new Error('Not a Qaidah recordings export');

const EXT = { 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a', 'audio/mpeg': 'mp3', 'audio/aac': 'aac', 'audio/wav': 'wav' };
const manifestPath = 'audio/manifest.json';
let manifest = { files: {} };
try { manifest = JSON.parse(readFileSync(manifestPath, 'utf8')); } catch { /* new manifest */ }

let n = 0;
for (const [key, dataUrl] of Object.entries(data.clips)) {
  const m = /^data:([^;,]+)[^,]*;base64,(.*)$/.exec(dataUrl);
  if (!m) { console.warn(`Skipping ${key}: unrecognised data`); continue; }
  const [lesson, index] = key.split(':');
  if (!/^[a-z]+$/.test(lesson) || !/^\d+$/.test(index)) { console.warn(`Skipping ${key}: bad key`); continue; }
  const ext = EXT[m[1].split(';')[0]] || 'webm';
  mkdirSync(`audio/${lesson}`, { recursive: true });
  const path = `audio/${lesson}/${index}.${ext}`;
  writeFileSync(path, Buffer.from(m[2], 'base64'));
  manifest.files[key] = path;
  n++;
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Imported ${n} recordings into audio/. Commit the audio/ folder to ship them.`);
