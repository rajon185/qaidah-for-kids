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

## Tablet-first

- Touch targets are at least 64px. Accidental zoom, text selection and long-press menus are disabled on child screens.
- Layouts for portrait and landscape.
- Installable (PWA) to run full-screen like a native app.
  - **iPad (Safari):** Share → *Add to Home Screen*.
  - **Android (Chrome):** ⋮ menu → *Install app* / *Add to Home screen*.
- Works offline after the first visit.

### Voice

The app uses a recorded voice if one exists for a card. Otherwise it uses the tablet's built-in Arabic text-to-speech voice. If no Arabic voice is installed:
- **iPad:** Settings → Accessibility → Spoken Content → Voices → Arabic.
- **Android:** Settings → Text-to-speech → Google TTS → Install voice data → Arabic.

Tablet voices are not always accurate for single letters with harakat. For best results, and especially for correct tajweed, **record a teacher's or parent's voice** in the grown-ups area.

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
```

To add or change lesson content, edit `js/data.js`.

## Privacy

Everything stays on the tablet. Progress, settings and voice recordings are stored in the browser's local storage and IndexedDB, and nothing is sent anywhere.

## License

MIT
