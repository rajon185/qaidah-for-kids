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
    showHints: false, reward: 'star', childName: '', voiceId: '',
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
    root.dataset.motion = settings.reduceMotion ? 'reduce' : 'ok';
    root.style.setProperty('--text-scale', settings.textSize);
  }
  applySettings();

  // ---------- Helpers ----------
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const lessonById = id => lessons.find(l => l.id === id);
  const go = hash => { location.hash = hash; };
  const rewardIcon = () => ({ star: '⭐', heart: '💚', moon: '🌙', none: '✔️' }[settings.reward] || '⭐');

  function lessonProgress(lesson) {
    const seen = lesson.items.filter(it => progress.seen[it.key]).length;
    return Math.round((seen / lesson.items.length) * 100);
  }

  // Pick the next small batch of items: unseen first, then least-practised.
  function nextBatch(lesson) {
    const size = Math.min(settings.sessionSize, lesson.items.length);
    const unseen = lesson.items.filter(it => !progress.seen[it.key]);
    if (unseen.length >= size) return unseen.slice(0, size);
    const rest = lesson.items.filter(it => progress.seen[it.key])
      .sort((a, b) => (progress.correct[a.key] || 0) - (progress.correct[b.key] || 0));
    return [...unseen, ...rest].slice(0, size);
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

  function viewLearn(id) {
    const lesson = lessonById(id);
    if (!lesson) return go('#/');
    const batch = nextBatch(lesson);
    let i = 0;

    function render() {
      const it = batch[i];
      $app.innerHTML = `
        ${topBar({ title: `${lesson.icon} ${lesson.title}` })}
        <main class="learn">
          ${firstThen(1)}
          <button class="big-card ${it.small ? 'small-text' : ''}" id="card" aria-label="Hear it">
            <span class="arabic" lang="ar" dir="rtl">${esc(it.text)}</span>
            ${settings.showHints ? `<span class="hint">${esc(it.hint)}</span>` : ''}
          </button>
          <div class="controls">
            <button class="btn nav-btn" id="prev" ${i === 0 ? 'disabled' : ''} aria-label="Previous">◀</button>
            <button class="btn speak-btn" id="speak" aria-label="Listen">🔊</button>
            <button class="btn nav-btn next" id="next" aria-label="Next">▶</button>
          </div>
          <div class="dots" aria-label="Card ${i + 1} of ${batch.length}">
            ${batch.map((_, k) => `<span class="${k < i ? 'done' : k === i ? 'now' : ''}"></span>`).join('')}
            <span class="dot-reward">${rewardIcon()}</span>
          </div>
        </main>`;
      const speak = () => { A.say(it, settings); progress.seen[it.key] = true; saveProgress(); };
      document.getElementById('card').onclick = speak;
      document.getElementById('speak').onclick = speak;
      document.getElementById('prev').onclick = () => { if (i > 0) { i--; render(); } };
      document.getElementById('next').onclick = () => {
        progress.seen[it.key] = true; saveProgress();
        if (i < batch.length - 1) { i++; render(); } else { viewQuiz(lesson, batch); }
      };
      if (settings.autoSpeak) setTimeout(speak, 350);
    }
    render();
  }

  // Errorless quiz: few choices, no "wrong" sound, the right answer is gently shown.
  function viewQuiz(lesson, batch) {
    const rounds = shuffle(batch);
    let r = 0, firstTry = 0;

    function render() {
      const target = rounds[r];
      const pool = lesson.items.filter(x => x.text !== target.text);
      const n = Math.min(settings.choices, lesson.items.length);
      const options = shuffle([target, ...shuffle(pool).slice(0, n - 1)]);
      let missed = false;

      $app.innerHTML = `
        ${topBar({ title: `${lesson.icon} Find it` })}
        <main class="quiz">
          ${firstThen(2)}
          <button class="btn speak-btn prompt" id="again" aria-label="Hear again">🔊 Find</button>
          <div class="choices choices-${options.length}">
            ${options.map((o, k) => `<button class="choice ${o.small ? 'small-text' : ''}" data-k="${k}"><span class="arabic" lang="ar" dir="rtl">${esc(o.text)}</span></button>`).join('')}
          </div>
          <div class="dots">
            ${rounds.map((_, k) => `<span class="${k < r ? 'done' : k === r ? 'now' : ''}"></span>`).join('')}
            <span class="dot-reward">${rewardIcon()}</span>
          </div>
        </main>`;
      const ask = () => A.say(target, settings);
      document.getElementById('again').onclick = ask;
      setTimeout(ask, 350);

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
            // Gentle: dim this choice, glow the right one, say it again. No buzzer.
            missed = true;
            btn.classList.add('dim');
            btn.disabled = true;
            const right = [...$app.querySelectorAll('.choice')][options.indexOf(target)];
            right.classList.add('glow');
            ask();
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
    const keys = new Set(await A.clipKeys());
    const voiceNote = A.hasArabicVoice()
      ? 'Tablet voices can sound robotic on single letters. For the most natural sound, record a teacher\'s voice below.'
      : 'No Arabic voice found on this tablet. Install one in the tablet\'s text-to-speech settings, or record your own voice below.';
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
          ${toggle('showHints', 'Show English hints on cards')}
          ${toggle('reduceMotion', 'Reduce movement / animation')}
          ${range('volume', 'Volume', 0.1, 1, 0.1)}
          ${range('rate', 'Voice speed', 0.4, 1.1, 0.1)}
          ${range('textSize', 'Letter size', 0.8, 1.4, 0.1)}
          ${select('sessionSize', 'Cards per session', [[3, '3'], [5, '5'], [8, '8'], [10, '10']])}
          ${select('choices', 'Choices in "Find it"', [[2, '2 (easiest)'], [3, '3'], [4, '4']])}
          ${select('theme', 'Colours', [['calm', 'Calm (soft green)'], ['warm', 'Warm (sand)'], ['contrast', 'High contrast'], ['dark', 'Dark / low light']])}
          ${select('reward', 'Reward symbol', [['star', '⭐ Star'], ['heart', '💚 Heart'], ['moon', '🌙 Moon'], ['none', '✔️ Tick only']])}
          ${select('voiceId', 'Tablet voice', voiceOptions)}
          <button class="btn" id="testVoice">🔊 Test voice</button>
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
      if (confirm('Reset all progress and rewards?')) { progress = { seen: {}, correct: {}, stars: 0, sessions: [] }; saveProgress(); viewParent(); }
    };

    if (A.canRecord()) {
      const sel = document.getElementById('recLesson');
      const list = document.getElementById('recList');
      const renderRec = () => {
        const lesson = lessonById(sel.value);
        list.innerHTML = lesson.items.map((it, k) => `
          <div class="rec-row">
            <span class="arabic rec-text" lang="ar" dir="rtl">${esc(it.text)}</span>
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
