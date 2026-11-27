// Audio: a familiar adult's recorded voice first, then the device's Arabic voice.
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

  // ---------- Speech synthesis ----------
  let arabicVoice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const voices = speechSynthesis.getVoices();
    arabicVoice = voices.find(v => /^ar/i.test(v.lang)) || null;
  }
  if ('speechSynthesis' in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }
  const hasArabicVoice = () => !!arabicVoice;

  let current = null;
  function stop() {
    if (current) { current.pause(); current = null; }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }

  async function say(item, settings) {
    if (!settings.sound) return;
    stop();
    const clip = await getClip(item.key);
    if (clip) {
      const url = URL.createObjectURL(clip);
      current = new Audio(url);
      current.volume = settings.volume;
      current.onended = () => URL.revokeObjectURL(url);
      return current.play().catch(() => {});
    }
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(item.say);
    u.lang = 'ar-SA';
    if (arabicVoice) u.voice = arabicVoice;
    u.rate = settings.rate;
    u.volume = settings.volume;
    speechSynthesis.speak(u);
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

  return { say, stop, chime, hasArabicVoice, getClip, saveClip, deleteClip, clipKeys, startRecording, stopRecording, canRecord };
})();

window.QAudio = Audio_;
