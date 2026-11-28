// Qaidah for Kids — calm, predictable Qaidah lessons for autistic learners.
(() => {
  const { lessons } = window.QAIDAH;
  const A = window.QAudio;
  const $app = document.getElementById('app');

  // ---------- Settings & progress (localStorage) ----------
  const DEFAULTS = {
    sound: true, chime: true, volume: 0.8, rate: 0.7,
    autoSpeak: true, sessionSize: 5, choices: 2,
    reduceMotion: false, theme: 'calm', textSize: 1,
    showHints: false, reward: 'star', childName: '', voiceId: '', script: 'indopak', letterSay: {},
    showLabel: true, colorCoding: true, findMode: 'auto',
  };
  const load = (k, d) => { try { return { ...d, ...JSON.parse(localStorage.getItem(k)) }; } catch { return { ...d }; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };
  let settings = load('qaidah-settings', DEFAULTS);
  let progress = load('qaidah-progress', { seen: {}, correct: {}, stars: 0, sessions: [] });
  const saveSettings = () => { save('qaidah-settings', settings); applySettings(); };
  const saveProgress = () => save('qaidah-progress', progress);

  function applySettings() {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.dataset.script = settings.script;
    root.dataset.motion = settings.reduceMotion ? 'reduce' : 'ok';
    root.style.setProperty('--text-scale', settings.textSize);
  }
  applySettings();

  // ---------- Helpers ----------
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Arabic for display. Speech always uses the original text.
  // The IndoPak font draws sukoon (U+0652) as a jazm itself. If it is missing and the
  // Lateef fallback is used, swap in the Quranic jazm character (U+06E1) instead.
  let jazmFallback = false;
  if (document.fonts && document.fonts.load) {
    document.fonts.load('40px IndoPak', 'بْ')
      .then(faces => faces.some(f => f.status === 'loaded'), () => false)
      .then(ok => { if (!ok) { jazmFallback = true; route(); } });
  }
  const ar = s => esc(settings.script === 'indopak' && jazmFallback ? String(s).replace(/\u0652/g, '\u06E1') : s);
  const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const lessonById = id => lessons.find(l => l.id === id);
  const go = hash => { location.hash = hash; };
  const rewardIcon = () => ({ star: '⭐', heart: '💚', moon: '🌙', none: '✔️' }[settings.reward] || '⭐');

  // A card's content: Arabic (colour-coded when on), its sound label, and a full-mouth badge.
  // plain = no colours or badges (used in "Find it" so the child looks at the shape).
  function cardContent(it, { plain = false, label = settings.showLabel } = {}) {
    const colour = !plain && settings.colorCoding;
    const cls = colour ? (it.vowel ? ` v-${it.vowel}` : it.heavy ? ' heavy' : '') : '';
    return `<span class="arabic${cls}" lang="ar" dir="rtl">${ar(it.text)}</span>`
      + (label ? `<span class="sound-label${cls}">${esc(it.label)}</span>` : '')
      + (colour && it.heavy ? '<span class="heavy-badge" title="Full-mouth letter: read heavy">💪 full mouth</span>' : '')
      + (!plain && settings.showHints ? `<span class="hint">${esc(it.hint)}</span>` : '');
  }

  // An item is "known" once answered right first time twice. Lesson stars: ★ 1/3, ★★ 2/3, ★★★ all.
  const known = it => (progress.correct[it.key] || 0) >= 2;
  function lessonStars(lesson) {
    const f = lesson.items.filter(known).length / lesson.items.length;
    return f >= 1 ? 3 : f >= 2 / 3 ? 2 : f >= 1 / 3 ? 1 : 0;
  }

  function lessonProgress(lesson) {
    const seen = lesson.items.filter(it => progress.seen[it.key]).length;
    return Math.round((seen / lesson.items.length) * 100);
  }

  // Top bar: always the same place, same buttons (predictability).
  function topBar({ back = '#/', title = '' } = {}) {
    return `
      <header class="topbar">
        <a class="btn icon-btn" href="${back}" aria-label="Back">⬅️</a>
        <h1 class="topbar-title">${esc(title)}</h1>
        <div class="topbar-right">
          <span class="stars" aria-label="Rewards">${rewardIcon()} ${progress.stars}</span>
          <a class="btn icon-btn break-btn" href="#/break" aria-label="Take a break">🫧</a>
        </div>
      </header>`;
  }

  // First / Then board (visual schedule)
  function firstThen(step) {
    const steps = [['👀', 'Look'], ['👂', 'Listen'], ['👆', 'Tap'], [rewardIcon(), 'Reward']];
    return `<ol class="schedule" aria-label="What happens now">
      ${steps.map(([ic, label], i) => `<li class="${i < step ? 'done' : i === step ? 'now' : ''}"><span>${ic}</span>${label}</li>`).join('')}
    </ol>`;
  }

  // ---------- Views ----------
  function viewHome() {
    const name = settings.childName ? `, ${esc(settings.childName)}` : '';
    $app.innerHTML = `
      <header class="topbar">
        <span class="btn icon-btn" aria-hidden="true">🌿</span>
        <h1 class="topbar-title">Assalamu alaykum${name}</h1>
        <div class="topbar-right">
          <span class="stars">${rewardIcon()} ${progress.stars}</span>
          <a class="btn icon-btn break-btn" href="#/break" aria-label="Take a break">🫧</a>
        </div>
      </header>
      <main class="home">
        <div class="lesson-grid">
          ${lessons.map(l => {
            const p = lessonProgress(l);
            return `<a class="lesson-card" href="#/learn/${l.id}">
              <span class="lesson-num">${l.num}</span>
              <span class="lesson-icon" aria-hidden="true">${l.icon}</span>
              <span class="lesson-ar" lang="ar" dir="rtl">${l.titleAr}</span>
              <span class="lesson-title">${esc(l.title)}</span>
              <span class="mastery" aria-label="${lessonStars(l)} of 3 stars">${'★'.repeat(lessonStars(l))}<span class="off">${'★'.repeat(3 - lessonStars(l))}</span></span>
              <span class="bar"><span style="width:${p}%"></span></span>
            </a>`;
          }).join('')}
        </div>
      </main>
      <footer class="home-footer">
        <button class="btn parent-btn" id="parentBtn">🔒 Grown-ups: press and hold</button>
      </footer>`;
    holdToOpen(document.getElementById('parentBtn'), () => go('#/parent'));
  }

  // Parent area opens only with a 2-second press, so children don't wander in.
  function holdToOpen(el, cb) {
    let t = null;
    const start = e => { e.preventDefault(); el.classList.add('holding'); t = setTimeout(() => { el.classList.remove('holding'); cb(); }, 2000); };
    const cancel = () => { clearTimeout(t); el.classList.remove('holding'); };
    el.addEventListener('pointerdown', start);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => el.addEventListener(ev, cancel));
    el.addEventListener('contextmenu', e => e.preventDefault());
  }

  // Cards follow the Qaidah order. Each lesson resumes where it was left, ◀ can always go
  // back to the first card, and a quiz + reward comes after every `sessionSize` cards.
  function viewLearn(id) {
    const lesson = lessonById(id);
    if (!lesson) return go('#/');
    const items = lesson.items;
    const size = Math.min(settings.sessionSize, items.length);
    progress.pos = progress.pos || {};
    let i = progress.pos[id] || 0;
    if (i >= items.length) i = 0;
    let winStart = i; // first card of this session's window (quizzed at the end)

    const winEnd = () => Math.min(winStart + size, items.length); // exclusive
    function remember() { progress.pos[id] = i; saveProgress(); }

    function render() {
      const it = items[i];
      const win = items.slice(winStart, winEnd());
      $app.innerHTML = `
        ${topBar({ title: `${lesson.icon} ${lesson.title}` })}
        <main class="learn">
          ${firstThen(1)}
          <button class="big-card ${it.small ? 'small-text' : ''}" id="card" aria-label="Hear it">
            ${cardContent(it)}
          </button>
          <div class="controls">
            <button class="btn nav-btn" id="prev" ${i === 0 ? 'disabled' : ''} aria-label="Previous">◀</button>
            ${settings.sound ? '<button class="btn speak-btn" id="speak" aria-label="Listen">🔊</button>' : ''}
            <button class="btn nav-btn next" id="next" aria-label="Next">▶</button>
          </div>
          <div class="dots" aria-label="Card ${i - winStart + 1} of ${win.length}">
            ${win.map((_, k) => `<span class="${winStart + k < i ? 'done' : winStart + k === i ? 'now' : ''}"></span>`).join('')}
            <span class="dot-reward">${rewardIcon()}</span>
          </div>
          <div class="position">
            <span>${i + 1} / ${items.length}</span>
            ${i > 0 ? '<button class="btn small-btn" id="first" aria-label="Back to the first card">⏮ Start</button>' : ''}
          </div>
        </main>`;
      const speak = () => { A.say(it, settings); progress.seen[it.key] = true; saveProgress(); };
      document.getElementById('card').onclick = speak;
      const speakBtn = document.getElementById('speak');
      if (speakBtn) speakBtn.onclick = speak;
      const goTo = n => {
        i = n;
        if (i < winStart) winStart = i; // going back before this session: the window moves with you
        remember();
        render();
      };
      document.getElementById('prev').onclick = () => { if (i > 0) goTo(i - 1); };
      const first = document.getElementById('first');
      if (first) first.onclick = () => goTo(0);
      document.getElementById('next').onclick = () => {
        progress.seen[it.key] = true;
        if (i < winEnd() - 1) { goTo(i + 1); return; }
        // End of this session's cards: quiz them, then the next visit continues after them.
        const done = items.slice(winStart, winEnd());
        i = winEnd() >= items.length ? 0 : winEnd();
        remember();
        viewQuiz(lesson, done);
      };
      if (settings.sound && settings.autoSpeak) setTimeout(speak, 350);
    }
    remember();
    render();
  }

  // Errorless "Find it" game. Works without sound:
  //  - "match": find the same shape (shown at the top) — the easiest, errorless start
  //  - "name":  find the card that matches its sound label (e.g. "ba")
  // In "auto" mode each card starts as "match" and moves to "name" once it is known.
  // Choices are shown in plain ink (no colours), so the child looks at the shape.
  function viewQuiz(lesson, batch) {
    const rounds = shuffle(batch);
    let r = 0, firstTry = 0;

    function render() {
      const target = rounds[r];
      const mode = settings.findMode === 'auto' ? (known(target) ? 'name' : 'match') : settings.findMode;
      // distractors must look and sound different from the target
      const pool = lesson.items.filter(x => x.text !== target.text && x.label !== target.label);
      const n = Math.min(settings.choices, pool.length + 1);
      const options = shuffle([target, ...shuffle(pool).slice(0, n - 1)]);
      let missed = false;

      const prompt = mode === 'match'
        ? `<div class="prompt-card ${target.small ? 'small-text' : ''}"><span class="prompt-hint">👀 Find the same</span><span class="arabic" lang="ar" dir="rtl">${ar(target.text)}</span></div>`
        : `<div class="prompt-card name"><span class="prompt-hint">👀 Find</span><span class="sound-label big">${esc(target.label)}</span></div>`;

      $app.innerHTML = `
        ${topBar({ title: `${lesson.icon} Find it` })}
        <main class="quiz">
          ${firstThen(2)}
          <div class="prompt-row">
            ${prompt}
            ${settings.sound ? '<button class="btn speak-btn" id="again" aria-label="Hear it">🔊</button>' : ''}
          </div>
          <div class="choices choices-${options.length}">
            ${options.map((o, k) => `<button class="choice ${o.small ? 'small-text' : ''}" data-k="${k}">${cardContent(o, { plain: true, label: false })}</button>`).join('')}
          </div>
          <div class="dots">
            ${rounds.map((_, k) => `<span class="${k < r ? 'done' : k === r ? 'now' : ''}"></span>`).join('')}
            <span class="dot-reward">${rewardIcon()}</span>
          </div>
        </main>`;
      const ask = () => A.say(target, settings);
      const again = document.getElementById('again');
      if (again) again.onclick = ask;
      if (settings.sound) setTimeout(ask, 350);

      $app.querySelectorAll('.choice').forEach(btn => {
        btn.onclick = () => {
          const o = options[+btn.dataset.k];
          if (o === target) {
            btn.classList.add('correct');
            $app.querySelectorAll('.choice').forEach(b => { b.disabled = true; });
            A.chime(settings);
            if (!missed) { firstTry++; progress.correct[target.key] = (progress.correct[target.key] || 0) + 1; saveProgress(); }
            setTimeout(() => { r++; r < rounds.length ? render() : viewDone(lesson, firstTry, rounds.length); }, 1100);
          } else {
            // Gentle: dim this choice and softly glow the right one. No buzzer, no red.
            missed = true;
            btn.classList.add('dim');
            btn.disabled = true;
            const right = [...$app.querySelectorAll('.choice')][options.indexOf(target)];
            right.classList.add('glow');
            if (settings.sound) ask();
          }
        };
      });
    }
    render();
  }

  function viewDone(lesson, firstTry, total) {
    progress.stars++;
    progress.sessions.push({ lesson: lesson.id, date: new Date().toISOString(), firstTry, total });
    progress.sessions = progress.sessions.slice(-200);
    saveProgress();
    A.chime(settings);
    $app.innerHTML = `
      ${topBar({ title: `${lesson.icon} ${lesson.title}` })}
      <main class="done">
        ${firstThen(3)}
        <div class="reward" aria-live="polite">${rewardIcon()}</div>
        <p class="done-text">All done! Well done${settings.childName ? ', ' + esc(settings.childName) : ''}.</p>
        <div class="done-actions">
          <a class="btn big-btn" href="#/learn/${lesson.id}?again=${Date.now()}">🔁 More</a>
          <a class="btn big-btn" href="#/">🏠 Home</a>
          <a class="btn big-btn" href="#/break">🫧 Break</a>
        </div>
      </main>`;
  }

  // Calm corner: slow breathing circle, no words needed.
  function viewBreak() {
    A.stop();
    $app.innerHTML = `
      ${topBar({ title: 'Break time' })}
      <main class="break">
        <div class="breathe" aria-hidden="true"><span></span></div>
        <p class="breathe-text" id="breatheText">Breathe in…</p>
        <a class="btn big-btn" href="#/">✔️ I'm ready</a>
      </main>`;
    const txt = document.getElementById('breatheText');
    let inhale = true;
    const timer = setInterval(() => {
      if (!document.body.contains(txt)) return clearInterval(timer);
      inhale = !inhale;
      txt.textContent = inhale ? 'Breathe in…' : 'Breathe out…';
    }, 4000);
  }

  // ---------- Grown-ups area ----------
  async function viewParent() {
    await A.reloadVoices();
    const keys = new Set(await A.clipKeys());
    const voiceNote = A.hasArabicVoice()
      ? 'Tablet voices can sound robotic on single letters. For the most natural sound, record a teacher\'s voice below.'
      : 'No Arabic voice found on this tablet. Tap "Install Arabic voice" (or open the tablet\'s Settings → Text-to-speech → Google → Install voice data → Arabic), or record your own voice below.';
    const voiceOptions = [['', 'Best available (automatic)'], ...A.listVoices().map(v => [v.id, v.label])];
    const bundledNote = A.bundledCount() ? `<p class="note">✅ ${A.bundledCount()} teacher recordings are built into this app.</p>` : '';
    const totalSeen = Object.keys(progress.seen).length;
    const recent = progress.sessions.slice(-8).reverse();

    $app.innerHTML = `
      ${topBar({ title: 'Grown-ups' })}
      <main class="parent">
        <section class="panel">
          <h2>Settings</h2>
          <label>Child's name <input type="text" id="childName" value="${esc(settings.childName)}" maxlength="24"></label>
          ${toggle('sound', 'Sound on')}
          ${toggle('chime', 'Soft chime when correct')}
          ${toggle('autoSpeak', 'Speak each card automatically')}
          ${toggle('showLabel', 'Show sound labels (ba · bi · bu) on cards')}
          ${toggle('colorCoding', 'Colour-code vowels and full-mouth letters')}
          ${toggle('showHints', 'Show grown-up notes on cards')}
          ${select('findMode', '"Find it" game', [['auto', 'Same shape first, then by name (recommended)'], ['match', 'Always find the same shape'], ['name', 'Always find by name']])}
          <div class="colour-key" aria-label="Colour key">
            <span class="v-a">بَ Fathah · a</span><span class="v-i">بِ Kasrah · i</span><span class="v-u">بُ Dammah · u</span><span class="heavy">خ ص ض غ ط ق ظ · full mouth 💪</span>
          </div>
          ${toggle('reduceMotion', 'Reduce movement / animation')}
          ${range('volume', 'Volume', 0.1, 1, 0.1)}
          ${range('rate', 'Voice speed', 0.4, 1.1, 0.1)}
          ${range('textSize', 'Letter size', 0.8, 1.4, 0.1)}
          ${select('sessionSize', 'Cards per session', [[3, '3'], [5, '5'], [8, '8'], [10, '10']])}
          ${select('choices', 'Choices in "Find it"', [[2, '2 (easiest)'], [3, '3'], [4, '4']])}
          ${select('script', 'Script style', [['indopak', 'IndoPak (South Asian Qaidah)'], ['madani', 'Arabic (Madani)']])}
          ${select('theme', 'Colours', [['calm', 'Calm (soft green)'], ['warm', 'Warm (sand)'], ['contrast', 'High contrast'], ['dark', 'Dark / low light']])}
          ${select('reward', 'Reward symbol', [['star', '⭐ Star'], ['heart', '💚 Heart'], ['moon', '🌙 Moon'], ['none', '✔️ Tick only']])}
          ${select('voiceId', 'Tablet voice', voiceOptions)}
          <button class="btn" id="testVoice">🔊 Test voice</button>
          ${A.canInstallVoice() ? '<button class="btn" id="installVoice">⬇️ Install Arabic voice</button>' : ''}
          <p class="note">${voiceNote}</p>
          ${bundledNote}
        </section>

        <section class="panel">
          <h2>Progress</h2>
          <p>${rewardIcon()} ${progress.stars} sessions finished · ${totalSeen} cards seen</p>
          <ul class="progress-list">
            ${lessons.map(l => `<li><span>${l.icon} ${esc(l.title)}</span><span class="bar"><span style="width:${lessonProgress(l)}%"></span></span><span>${lessonProgress(l)}%</span></li>`).join('')}
          </ul>
          ${recent.length ? `<h3>Recent</h3><ul class="recent">${recent.map(s => `<li>${new Date(s.date).toLocaleDateString()} — ${esc(lessonById(s.lesson)?.title || s.lesson)}: ${s.firstTry}/${s.total} first try</li>`).join('')}</ul>` : ''}
          <button class="btn danger" id="resetProgress">Reset progress</button>
        </section>

        <section class="panel">
          <h2>Letter pronunciation</h2>
          <p class="note">If the tablet voice says a letter's name wrongly, tap the letter, listen to each spelling with ▶, and choose the one that sounds right. For a perfect sound, record your own voice below.</p>
          <div class="letter-picker" dir="rtl">
            ${window.QAIDAH.LETTERS.map(l => `<button class="btn letter-btn ${settings.letterSay[l.ch] ? 'changed' : ''}" data-letter="${l.ch}" aria-label="${esc(l.tr)}"><span class="arabic" lang="ar">${ar(l.ch)}</span></button>`).join('')}
          </div>
          <div id="pronOptions"></div>
        </section>

        <section class="panel">
          <h2>Record your voice</h2>
          <p class="note">Many children respond best to a familiar voice. Record yourself saying each card; your recording plays instead of the tablet voice.</p>
          ${A.canRecord() ? `
          <label>Lesson
            <select id="recLesson">${lessons.map(l => `<option value="${l.id}">${l.num}. ${esc(l.title)}</option>`).join('')}</select>
          </label>
          <div id="recList" class="rec-list"></div>` : '<p class="note">Recording is not supported in this browser.</p>'}
          <h3>Share recordings</h3>
          <p class="note">Export recordings to copy them to another tablet, or to build them into the app for everyone (see the README).</p>
          <div class="share-row">
            <button class="btn" id="exportRec">⬇️ Export</button>
            <label class="btn">⬆️ Import<input type="file" id="importRec" accept="application/json,.json" hidden></label>
          </div>
        </section>
      </main>`;

    $app.querySelectorAll('[data-setting]').forEach(el => {
      el.addEventListener('change', () => {
        const k = el.dataset.setting;
        settings[k] = el.type === 'checkbox' ? el.checked
          : (el.type === 'range' || typeof DEFAULTS[k] === 'number') ? Number(el.value) : el.value;
        saveSettings();
      });
    });
    document.getElementById('childName').addEventListener('input', e => { settings.childName = e.target.value.trim(); saveSettings(); });
    document.getElementById('testVoice').onclick = () => A.speak('بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ', { ...settings, sound: true });
    const pron = document.getElementById('pronOptions');
    const showPron = ch => {
      const l = window.QAIDAH.LETTERS.find(x => x.ch === ch);
      const current = settings.letterSay[ch] || l.options[0];
      $app.querySelectorAll('.letter-btn').forEach(b => b.classList.toggle('selected', b.dataset.letter === ch));
      pron.innerHTML = `<h3>${esc(l.tr)}</h3>` + l.options.map((o, k) => `
        <div class="pron-row">
          <button class="btn" data-play="${k}" aria-label="Play">▶</button>
          <span class="arabic pron-text" lang="ar" dir="rtl">${esc(o)}</span>
          <button class="btn ${o === current ? 'chosen' : ''}" data-use="${k}">${o === current ? '✔️ Using' : 'Use this'}</button>
        </div>`).join('');
      pron.querySelectorAll('[data-play]').forEach(b => { b.onclick = () => A.speak(l.options[+b.dataset.play], { ...settings, sound: true }); });
      pron.querySelectorAll('[data-use]').forEach(b => {
        b.onclick = () => {
          const o = l.options[+b.dataset.use];
          if (o === l.options[0]) delete settings.letterSay[ch]; else settings.letterSay[ch] = o;
          saveSettings();
          $app.querySelector(`.letter-btn[data-letter="${ch}"]`).classList.toggle('changed', !!settings.letterSay[ch]);
          showPron(ch);
        };
      });
    };
    $app.querySelectorAll('.letter-btn').forEach(b => { b.onclick = () => showPron(b.dataset.letter); });

    const installBtn = document.getElementById('installVoice');
    if (installBtn) installBtn.onclick = () => A.installVoice();
    document.getElementById('exportRec').onclick = async () => {
      const blob = await A.exportClips();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'qaidah-recordings.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    };
    document.getElementById('importRec').onchange = async e => {
      const file = e.target.files[0];
      if (!file) return;
      try { const n = await A.importClips(file); alert(`Imported ${n} recordings.`); viewParent(); }
      catch (err) { alert('That file could not be imported.'); }
    };
    document.getElementById('resetProgress').onclick = () => {
      if (confirm('Reset all progress and rewards?')) { progress = { seen: {}, correct: {}, stars: 0, sessions: [], pos: {} }; saveProgress(); viewParent(); }
    };

    if (A.canRecord()) {
      const sel = document.getElementById('recLesson');
      const list = document.getElementById('recList');
      const renderRec = () => {
        const lesson = lessonById(sel.value);
        list.innerHTML = lesson.items.map((it, k) => `
          <div class="rec-row">
            <span class="arabic rec-text" lang="ar" dir="rtl">${ar(it.text)}</span>
            <span class="rec-hint">${esc(it.hint)}</span>
            <button class="btn rec-btn" data-k="${k}">${keys.has(it.key) ? '🔁 Re-record' : '🎙️ Record'}</button>
            <button class="btn" data-play="${k}">▶</button>
            ${keys.has(it.key) ? `<button class="btn" data-del="${k}" aria-label="Delete recording">🗑️</button>` : ''}
          </div>`).join('');
        list.querySelectorAll('[data-play]').forEach(b => { b.onclick = () => A.say(lesson.items[+b.dataset.play], { ...settings, sound: true }); });
        list.querySelectorAll('[data-del]').forEach(b => { b.onclick = async () => { const it = lesson.items[+b.dataset.del]; await A.deleteClip(it.key); keys.delete(it.key); renderRec(); }; });
        list.querySelectorAll('.rec-btn').forEach(b => {
          b.onclick = async () => {
            const it = lesson.items[+b.dataset.k];
            if (b.classList.contains('recording')) { A.stopRecording(); return; }
            try {
              b.classList.add('recording');
              b.textContent = '⏹️ Stop';
              const blob = await A.startRecording();
              await A.saveClip(it.key, blob);
              keys.add(it.key);
            } catch (e) {
              alert('Could not use the microphone. Please allow microphone access.');
            }
            renderRec();
          };
        });
      };
      sel.onchange = renderRec;
      renderRec();
    }
  }

  function toggle(k, label) {
    return `<label class="toggle"><span>${label}</span><input type="checkbox" data-setting="${k}" ${settings[k] ? 'checked' : ''}><span class="switch" aria-hidden="true"></span></label>`;
  }
  function range(k, label, min, max, step) {
    return `<label>${label}<input type="range" data-setting="${k}" min="${min}" max="${max}" step="${step}" value="${settings[k]}"></label>`;
  }
  function select(k, label, opts) {
    return `<label>${label}<select data-setting="${k}">${opts.map(([v, t]) => `<option value="${v}" ${String(settings[k]) === String(v) ? 'selected' : ''}>${t}</option>`).join('')}</select></label>`;
  }

  // ---------- Router ----------
  function route() {
    A.stop();
    const [path] = location.hash.replace(/^#/, '').split('?');
    const parts = path.split('/').filter(Boolean);
    window.scrollTo(0, 0);
    if (parts[0] === 'learn' && parts[1]) return viewLearn(parts[1]);
    if (parts[0] === 'break') return viewBreak();
    if (parts[0] === 'parent') return viewParent();
    return viewHome();
  }
  window.addEventListener('hashchange', route);
  route();

  // Tablet niceties: double-tap zoom is disabled in CSS (touch-action); block long-press menus on child screens.
  document.addEventListener('contextmenu', e => { if (!e.target.closest('.parent')) e.preventDefault(); });

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
