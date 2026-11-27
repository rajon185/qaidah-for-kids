# Qaidah for Kids 🌿

A calm, predictable **Noorani Qaidah** app for autistic children, built for **tablets** (iPad and Android).
It runs in the browser, installs to the home screen, and works **offline**. There are no ads, no accounts, no timers and no tracking.

## What it teaches

All 12 lessons follow the order of the Noorani Qaidah:

| # | Lesson | Arabic |
|---|--------|--------|
| 1 | Single letters (all 29) | الحروف المفردة |
| 2 | Letter shapes: alone, start, middle, end | أشكال الحروف |
| 3 | Joined letters | الحروف المركبة |
| 4 | Disjointed letters (الٓمٓ, يسٓ, …) | الحروف المقطعات |
| 5 | Short vowels: Fathah, Kasrah, Dammah | الحركات |
| 6 | Tanween | التنوين |
| 7 | Standing vowels | الحركات القائمة |
| 8 | Long vowels (Madd letters) | حروف المد |
| 9 | Soft letters (Leen) | حروف اللين |
| 10 | Sukoon | السكون |
| 11 | Shaddah | التشديد |
| 12 | First words from the Qur'an | كلمات |

## Designed for autistic learners

- **The same routine every time.** A visual schedule (👀 Look → 👂 Listen → 👆 Tap → ⭐ Reward) shows what comes next.
- **Short sessions.** 3–10 cards (adjustable). Progress dots show how many are left before the reward.
- **One thing on screen at a time.** Big letters, plenty of space, no clutter.
- **Errorless learning.** "Find it" starts with only 2 choices. A wrong tap makes no buzzer and no red. That choice fades, the right one glows softly, and the sound plays again.
- **A familiar voice.** Grown-ups can record their own voice for every card. It plays instead of the tablet's voice.
- **Low sensory load.** Soft colours, a quiet chime (can be turned off), a "Reduce movement" switch, and themes: Calm, Warm, High contrast and Dark.
- **A break whenever needed.** The 🫧 button is always in the same corner and opens a calm breathing circle.
- **Child-proof grown-ups area.** Press and hold for 2 seconds to open settings, progress and recording.

## IndoPak script

Letters are shown in the **IndoPak (South Asian) style** used in printed Noorani Qaidahs, with sukoon drawn as a **jazm**.

- **With the Dua & Hadith app's font:** add `fonts/indopak-quranwbw.ttf` ("AlQuran IndoPak by QuranWBW") as described in [`fonts/README.md`](fonts/README.md), and the app uses it automatically.
  > ⚠️ That font is **not** openly licensed: it may not be distributed without written permission from quranwbw.com. Use it for private family use only, and read `fonts/README.md` before making this repository or its APKs public.
- **Without it:** the app uses the bundled, openly licensed [SIL Lateef](https://software.sil.org/lateef/) font, which also has IndoPak-style letters and a jazm.

Families who learned from Madani-style mushafs can switch to **Arabic (Madani)** in the grown-ups area (*Script style*).

## Tablet-first

- Touch targets are at least 64px. Accidental zoom, text selection and long-press menus are disabled on child screens.
- Layouts for portrait and landscape.
- Installable (PWA) to run full-screen like a native app.
  - **iPad (Safari):** Share → *Add to Home Screen*.
  - **Android (Chrome):** ⋮ menu → *Install app* / *Add to Home screen*.
- Works offline after the first visit.

### Voice: making it sound natural

The app plays the best voice it has, in this order:

1. **A recording made on this tablet** (grown-ups area → *Record your voice*).
2. **Teacher recordings built into the app** (`audio/` folder, see below).
3. **The tablet's text-to-speech voice.** The app picks the most natural Arabic voice available (neural/"enhanced"/network voices first) and lets you choose one under *Tablet voice*.

Text-to-speech is reasonable for whole words but often **sounds robotic on single letters and harakat**, and it does not follow tajweed. For a natural, correct voice, **record a teacher or qari once and build it into the app**, so every tablet gets it:

1. Record the cards in the grown-ups area (in a quiet room), then tap **Export**. This saves `qaidah-recordings.json`.
2. Run `node scripts/import-recordings.mjs qaidah-recordings.json`. This writes `audio/<lesson>/<n>.webm` and `audio/manifest.json`.
3. Commit `audio/` and release. The next APK plays these recordings.

*Export* and *Import* also copy recordings straight from one tablet to another.

If the tablet has no Arabic voice installed:
- **iPad:** Settings → Accessibility → Spoken Content → Voices → Arabic (choose an *Enhanced* or *Premium* voice).
- **Android:** Settings → Text-to-speech → Google TTS → Install voice data → Arabic.

## Android app (APK)

Download the latest APK from the repository's **Releases** page, open it on the tablet, and allow installing from that source.
The APK contains the whole app, so it works fully offline.

Releases are built automatically when a version tag is pushed. See **[RELEASING.md](RELEASING.md)** for branches, the release process and signing.

## Run it

It is plain HTML, CSS and JavaScript, with no build step.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Installing and offline mode need HTTPS (or localhost), so host it on **GitHub Pages**, Netlify or similar to use it on a tablet.

## Project layout

```
index.html      App shell
styles.css      Tablet-first, calm theme
js/data.js      Qaidah curriculum (all lessons and items)
js/audio.js     Recorded voice, text-to-speech, gentle chime
js/app.js       Screens: home, learn, find-it, reward, break, grown-ups
sw.js           Offline cache
manifest.json   Install-to-home-screen settings
fonts/          Bundled fonts (works offline)
audio/          Optional teacher recordings built into the app
android/        Android (Capacitor) project used to build the APK
scripts/        Web build, release and recording-import scripts
.github/        CI (debug APK) and Release (tagged APK) workflows
```

To add or change lesson content, edit `js/data.js`.

## Privacy

Everything stays on the tablet. Progress, settings and voice recordings are stored in the browser's local storage and IndexedDB, and nothing is sent anywhere.

## License

MIT
