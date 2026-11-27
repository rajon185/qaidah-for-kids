// Audio: a familiar adult's recorded voice first, then recordings bundled with the app,
// then the best-sounding Arabic voice on the device.
// Also a soft, low-volume chime (no buzzers, no loud sounds).

const Audio_ = (() => {
  // ---------- IndexedDB store for recordings ----------
  const DB_NAME = 'qaidah-recordings';
  let dbPromise = null;
  function db() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore('clips');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  }
  async function tx(mode, fn) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const t = d.transaction('clips', mode);
      const r = fn(t.objectStore('clips'));
      t.oncomplete = () => resolve(r && r.result);
      t.onerror = () => reject(t.error);
    });
  }
  const getClip = key => tx('readonly', s => s.get(key)).catch(() => null);
  const saveClip = (key, blob) => tx('readwrite', s => s.put(blob, key));
  const deleteClip = key => tx('readwrite', s => s.delete(key));
  const clipKeys = () => tx('readonly', s => s.getAllKeys()).catch(() => []);

  // ---------- Bundled audio (real recordings shipped with the app) ----------
  // audio/manifest.json maps item keys ("letters:0") to files. See scripts/import-recordings.mjs.
  let bundled = {};
  fetch('audio/manifest.json').then(r => (r.ok ? r.json() : {})).then(m => { bundled = (m && m.files) || {}; }).catch(() => {});

  // ---------- Speech synthesis ----------
  // In the Android app (Capacitor) the WebView has no speechSynthesis, so use the
  // native TextToSpeech plugin. In a browser, use the Web Speech API.
  // The app has no bundler, so @capacitor/core's registerPlugin isn't loaded. Call the plugin
  // through the native bridge (window.Capacitor.nativePromise) that the Android app injects.
  const cap = window.Capacitor;
  const isNative = !!(cap && cap.isNativePlatform && cap.isNativePlatform() && cap.nativePromise);
  const callTTS = (method, options = {}) => cap.nativePromise('TextToSpeech', method, options);
  const nativeTTS = isNative ? {
    speak: o => callTTS('speak', o),
    stop: () => callTTS('stop'),
    getSupportedVoices: () => callTTS('getSupportedVoices'),
    openInstall: () => callTTS('openInstall'),
  } : null;
  // Android's speech engine starts up asynchronously; retry calls made before it is ready.
  const retryOnce = fn => fn().catch(() => new Promise(r => setTimeout(r, 800)).then(fn));

  // All Arabic voices on the device, best first. Each: { id, name, lang, local, index, voice }.
  let voices = [];

  // Prefer natural/neural/high-quality voices; avoid compact or robotic engines.
  function score(v) {
    const name = `${v.name} ${v.id}`;
    let s = 0;
    if (/neural|natural|enhanced|premium|wavenet|studio|siri|online|network/i.test(name)) s += 4;
    if (/google|microsoft|samsung/i.test(name)) s += 1;
    if (/compact|eloquence|espeak|robot/i.test(name)) s -= 5;
    if (/^ar[-_]SA/i.test(v.lang)) s += 1;
    // Network voices sound better but need internet; fall back to on-device voices offline.
    if (!v.local) s += navigator.onLine ? 2 : -6;
    return s;
  }
  function rank(list) {
    voices = list.filter(v => /^ar/i.test(v.lang)).sort((x, y) => score(y) - score(x));
  }

  function loadVoices() {
    if (nativeTTS) {
      return retryOnce(nativeTTS.getSupportedVoices).then(r => {
        rank(((r && r.voices) || []).map((v, index) => ({ id: v.voiceURI || v.name, name: v.name, lang: v.lang, local: v.localService, index })));
      }).catch(() => {});
    }
    if ('speechSynthesis' in window) {
      rank(speechSynthesis.getVoices().map(v => ({ id: v.voiceURI || v.name, name: v.name, lang: v.lang, local: v.localService, voice: v })));
    }
    return Promise.resolve();
  }
  loadVoices();
  if (!nativeTTS && 'speechSynthesis' in window) speechSynthesis.onvoiceschanged = loadVoices;
  window.addEventListener('online', loadVoices);
  window.addEventListener('offline', loadVoices);

  const hasArabicVoice = () => voices.length > 0;
  const listVoices = () => voices.map(v => ({ id: v.id, label: `${v.name} (${v.lang}${v.local ? '' : ', needs internet'})` }));
  const chooseVoice = id => (id && voices.find(v => v.id === id)) || voices[0] || null;

  let current = null;
  function stop() {
    if (current) { current.pause(); current = null; }
    if (nativeTTS) nativeTTS.stop().catch(() => {});
    else if ('speechSynthesis' in window) speechSynthesis.cancel();
  }

  function playBlobOrUrl(src, settings) {
    const isBlob = src instanceof Blob;
    const url = isBlob ? URL.createObjectURL(src) : src;
    current = new Audio(url);
    current.volume = settings.volume;
    if (isBlob) current.onended = () => URL.revokeObjectURL(url);
    return current.play().catch(() => {});
  }

  // Order: this tablet's own recording → recordings bundled with the app → device voice.
  async function say(item, settings) {
    if (!settings.sound) return;
    stop();
    const clip = await getClip(item.key);
    if (clip) return playBlobOrUrl(clip, settings);
    if (bundled[item.key]) return playBlobOrUrl(bundled[item.key], settings);
    return speak(item.say, settings);
  }

  function speak(text, settings) {
    const v = chooseVoice(settings.voiceId);
    if (nativeTTS) {
      const opts = { text, lang: v ? v.lang : 'ar', rate: settings.rate, pitch: 1.0, volume: settings.volume, category: 'playback' };
      if (v) opts.voice = v.index;
      return retryOnce(() => nativeTTS.speak(opts)).catch(() => {});
    }
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = v ? v.lang : 'ar-SA';
    if (v) u.voice = v.voice;
    u.rate = settings.rate;
    u.volume = settings.volume;
    speechSynthesis.speak(u);
  }

  // ---------- Export / import recordings (share one voice across tablets) ----------
  const blobToDataURL = blob => new Promise((resolve, reject) => {
    const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = () => reject(r.error); r.readAsDataURL(blob);
  });
  async function exportClips() {
    const keys = await clipKeys();
    const clips = {};
    for (const k of keys) clips[k] = await blobToDataURL(await getClip(k));
    return new Blob([JSON.stringify({ app: 'qaidah-for-kids', version: 1, clips })], { type: 'application/json' });
  }
  async function importClips(file) {
    const data = JSON.parse(await file.text());
    if (!data || !data.clips) throw new Error('Not a recordings file');
    let n = 0;
    for (const [k, dataUrl] of Object.entries(data.clips)) {
      await saveClip(k, await (await fetch(dataUrl)).blob());
      n++;
    }
    return n;
  }

  // ---------- Gentle chime ----------
  let ctx = null;
  function chime(settings) {
    if (!settings.sound || !settings.chime) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      [523.25, 659.25].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, now + i * 0.12);
        g.gain.linearRampToValueAtTime(0.08 * settings.volume, now + i * 0.12 + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.6);
        o.connect(g).connect(ctx.destination);
        o.start(now + i * 0.12);
        o.stop(now + i * 0.12 + 0.65);
      });
    } catch (e) { /* audio not available */ }
  }

  // ---------- Recording ----------
  let recorder = null;
  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks = [];
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => chunks.push(e.data);
    const done = new Promise(resolve => {
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        resolve(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }));
      };
    });
    recorder.start();
    return done;
  }
  function stopRecording() { if (recorder && recorder.state !== 'inactive') recorder.stop(); }
  const canRecord = () => !!(navigator.mediaDevices && window.MediaRecorder);

  // Opens Android's "install voice data" screen so a grown-up can add the Arabic voice.
  const canInstallVoice = () => !!nativeTTS;
  const installVoice = () => (nativeTTS ? nativeTTS.openInstall().catch(() => {}) : undefined);

  return { say, speak, stop, chime, hasArabicVoice, listVoices, canInstallVoice, installVoice, reloadVoices: loadVoices, getClip, saveClip, deleteClip, clipKeys, exportClips, importClips, startRecording, stopRecording, canRecord, bundledCount: () => Object.keys(bundled).length };
})();

window.QAudio = Audio_;
