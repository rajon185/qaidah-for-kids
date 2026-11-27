# Fonts

| File | Font | Licence |
|------|------|---------|
| `indopak-quranwbw.ttf` *(you add it)* | AlQuran IndoPak by QuranWBW (IndoPak Quran script) | **Not openly licensed.** "Not for sale, not for modification, not for distribution without written notice by quranwbw.com". Included for private, personal family use only. |
| `lateef-arabic-700-normal.woff2` | SIL Lateef (South Asian Arabic script, fallback) | SIL Open Font License 1.1 (`LICENSE-Lateef-OFL.txt`) |
| `noto-naskh-arabic-*.woff2` | Noto Naskh Arabic (Madani-style option) | SIL Open Font License 1.1 |
| `nunito-*.woff2` | Nunito (English text) | SIL Open Font License 1.1 |

**Before making this repository or its APKs public** (or publishing to an app store), either get written
permission from quranwbw.com (quranwbw@gmail.com) or delete `indopak-quranwbw.ttf` and its `@font-face`
in `fonts.css`. The app then falls back to SIL Lateef automatically.

## Adding the IndoPak font

The font is not committed by default. To use the same font as the Dua & Hadith app, copy it in from that repo and commit it yourself:

```bash
cp ../Dua-and-Hadith-for-Beginners/app/src/main/assets/www/fonts/indopak.ttf fonts/indopak-quranwbw.ttf
git add fonts/indopak-quranwbw.ttf && git commit -m "Add IndoPak font (private use)"
```

Without it, the app uses SIL Lateef, which also shows IndoPak-style letters with a jazm.
