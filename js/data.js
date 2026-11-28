// Qaidah curriculum data, following the order of the Noorani Qaidah.
// Every lesson is a list of items: { text, say, hint, label, vowel, heavy }.
//   text  – what is shown (Arabic)
//   say   – what the speech engine reads (Arabic), when sound is on
//   hint  – longer explanation for the grown-up
//   label – short sound label shown under the card, e.g. "ba", "baa", "Baa"
//   vowel – 'a' | 'i' | 'u' for colour coding (fathah / kasrah / dammah)
//   heavy – contains a full-mouth letter (خ ص ض غ ط ق ظ), read with tafkheem

// name: the letter's name as said in a Qaidah, fully vowelled so the tablet voice reads it
// correctly (e.g. أَلِفْ "Alif", not ألف read as "alf"; بَا "Baa", not باء "baa'un").
const LETTERS = [
  { ch: 'ا', name: 'أَلِفْ', msa: 'ألف', tr: 'Alif', snd: '', joins: false },
  { ch: 'ب', name: 'بَا', msa: 'باء', tr: 'Baa', snd: 'b', joins: true },
  { ch: 'ت', name: 'تَا', msa: 'تاء', tr: 'Taa', snd: 't', joins: true },
  { ch: 'ث', name: 'ثَا', msa: 'ثاء', tr: 'Thaa', snd: 'th', joins: true },
  { ch: 'ج', name: 'جِيمْ', msa: 'جيم', tr: 'Jeem', snd: 'j', joins: true },
  { ch: 'ح', name: 'حَا', msa: 'حاء', tr: 'Ḥaa', snd: 'ḥ', joins: true },
  { ch: 'خ', name: 'خَا', msa: 'خاء', tr: 'Khaa', snd: 'kh', joins: true },
  { ch: 'د', name: 'دَالْ', msa: 'دال', tr: 'Daal', snd: 'd', joins: false },
  { ch: 'ذ', name: 'ذَالْ', msa: 'ذال', tr: 'Dhaal', snd: 'dh', joins: false },
  { ch: 'ر', name: 'رَا', msa: 'راء', tr: 'Raa', snd: 'r', joins: false },
  { ch: 'ز', name: 'زَا', msa: 'زاي', tr: 'Zaa', snd: 'z', joins: false },
  { ch: 'س', name: 'سِينْ', msa: 'سين', tr: 'Seen', snd: 's', joins: true },
  { ch: 'ش', name: 'شِينْ', msa: 'شين', tr: 'Sheen', snd: 'sh', joins: true },
  { ch: 'ص', name: 'صَادْ', msa: 'صاد', tr: 'Ṣaad', snd: 'ṣ', joins: true },
  { ch: 'ض', name: 'ضَادْ', msa: 'ضاد', tr: 'Ḍaad', snd: 'ḍ', joins: true },
  { ch: 'ط', name: 'طَا', msa: 'طاء', tr: 'Ṭaa', snd: 'ṭ', joins: true },
  { ch: 'ظ', name: 'ظَا', msa: 'ظاء', tr: 'Ẓaa', snd: 'ẓ', joins: true },
  { ch: 'ع', name: 'عَيْنْ', msa: 'عين', tr: 'ʿAyn', snd: 'ʿ', joins: true },
  { ch: 'غ', name: 'غَيْنْ', msa: 'غين', tr: 'Ghayn', snd: 'gh', joins: true },
  { ch: 'ف', name: 'فَا', msa: 'فاء', tr: 'Faa', snd: 'f', joins: true },
  { ch: 'ق', name: 'قَافْ', msa: 'قاف', tr: 'Qaaf', snd: 'q', joins: true },
  { ch: 'ك', name: 'كَافْ', msa: 'كاف', tr: 'Kaaf', snd: 'k', joins: true },
  { ch: 'ل', name: 'لَامْ', msa: 'لام', tr: 'Laam', snd: 'l', joins: true },
  { ch: 'م', name: 'مِيمْ', msa: 'ميم', tr: 'Meem', snd: 'm', joins: true },
  { ch: 'ن', name: 'نُونْ', msa: 'نون', tr: 'Noon', snd: 'n', joins: true },
  { ch: 'و', name: 'وَاوْ', msa: 'واو', tr: 'Waaw', snd: 'w', joins: false },
  { ch: 'ه', name: 'هَا', msa: 'هاء', tr: 'Haa', snd: 'h', joins: true },
  { ch: 'ء', name: 'هَمْزَهْ', msa: 'همزة', tr: 'Hamzah', snd: '', joins: false },
  { ch: 'ي', name: 'يَا', msa: 'ياء', tr: 'Yaa', snd: 'y', joins: true },
];

// Full-mouth letters (حروف الاستعلاء: خُصَّ ضَغْطٍ قِظْ) are always read heavy (tafkheem).
const HEAVY = 'خصضغطقظ';
LETTERS.forEach(l => { l.heavy = HEAVY.includes(l.ch); });

// Other spellings a grown-up can pick in the app if the tablet voice says a letter name
// wrongly (voices differ between tablets). The first one is the default.
function nameOptions(l) {
  const opts = [l.name];
  if (/\u064E\u0627$/.test(l.name)) {          // names like بَا "Baa": try longer forms
    const base = l.name.slice(0, -1);             // بَ
    opts.push(base + '\u0627\u0621\u0652');      // بَاءْ  (ends with a hamza stop)
    opts.push(base + '\u0622');                  // بَآ   (madd sign: hold the aa)
  }
  opts.push(l.msa);                               // باء  (the voice's own reading)
  return [...new Set(opts)];
}
LETTERS.forEach(l => { l.options = nameOptions(l); });

const ZWJ = '‍';
const FATHA = 'َ', KASRA = 'ِ', DAMMA = 'ُ';
const FATHATAN = 'ً', KASRATAN = 'ٍ', DAMMATAN = 'ٌ';
const SUKOON = 'ْ', SHADDA = 'ّ';
const DAGGER_ALIF = 'ٰ', SUB_ALIF = 'ٖ', INV_DAMMA = 'ٗ';

// Letters that can carry vowels in the drills (Alif itself can't – use Hamzah form أ)
const VOWEL_LETTERS = LETTERS.map(l => (l.ch === 'ا' || l.ch === 'ء') ? { ...l, ch: 'أ', snd: '', heavy: false } : l)
  .filter((l, i, arr) => arr.findIndex(x => x.ch === l.ch) === i);

function seatFor(ch, vowel) {
  // Hamzah needs a seat: إ for kasra, أ otherwise
  if (ch === 'أ' && (vowel === KASRA || vowel === KASRATAN)) return 'إ';
  return ch;
}

const lessons = [
  {
    id: 'letters',
    num: 1,
    title: 'Single Letters',
    titleAr: 'الحروف المفردة',
    icon: '🔤',
    about: 'The 29 letters, one at a time. Hear the name, look at the shape.',
    items: LETTERS.map(l => ({ text: l.ch, say: l.name, hint: l.tr, label: l.tr, heavy: l.heavy, letter: l.ch })),
  },
  {
    id: 'forms',
    num: 2,
    title: 'Letter Shapes',
    titleAr: 'أشكال الحروف',
    icon: '🧩',
    about: 'Letters change shape at the start, middle and end of a word.',
    items: LETTERS.filter(l => l.ch !== 'ء').map(l => {
      const forms = l.joins
        ? [l.ch, l.ch + ZWJ, ZWJ + l.ch + ZWJ, ZWJ + l.ch]
        : [l.ch, ZWJ + l.ch];
      return { text: forms.join('  '), say: l.name, letter: l.ch, label: l.tr, heavy: l.heavy, hint: `${l.tr} — ${l.joins ? 'alone · start · middle · end' : 'alone · end (does not join after)'}`, small: true };
    }),
  },
  {
    id: 'joined',
    num: 3,
    title: 'Joined Letters',
    titleAr: 'الحروف المركبة',
    icon: '🔗',
    about: 'Two letters joined together. Say each letter name.',
    items: [
      ['ل', 'ا'], ['ب', 'ا'], ['ت', 'ا'], ['ث', 'ا'], ['ج', 'ا'], ['ح', 'ا'], ['خ', 'ا'],
      ['ب', 'ت'], ['ت', 'ث'], ['ج', 'ح'], ['ح', 'خ'], ['س', 'ش'], ['ص', 'ض'], ['ط', 'ظ'],
      ['ع', 'غ'], ['ف', 'ق'], ['ك', 'ل'], ['ل', 'م'], ['م', 'ن'], ['ن', 'ه'], ['ه', 'ي'],
    ].map(([a, b]) => {
      const A = LETTERS.find(l => l.ch === a), B = LETTERS.find(l => l.ch === b);
      return { text: a + b, say: `${A.name} ${B.name}`, letters: [a, b], hint: `${A.tr} ${B.tr}`, label: `${A.tr} · ${B.tr}`, heavy: A.heavy || B.heavy };
    }),
  },
  {
    id: 'muqattaat',
    num: 4,
    title: 'Disjointed Letters',
    titleAr: 'الحروف المقطعات',
    icon: '✨',
    about: 'Special letters at the start of some Surahs. Each letter is read by its name.',
    items: [
      ['الٓمٓ', 'أَلِفْ لَامْ مِيمْ', 'Alif Laam Meem'],
      ['الٓرٰ', 'أَلِفْ لَامْ رَا', 'Alif Laam Raa'],
      ['الٓمٓرٰ', 'أَلِفْ لَامْ مِيمْ رَا', 'Alif Laam Meem Raa'],
      ['الٓمٓصٓ', 'أَلِفْ لَامْ مِيمْ صَادْ', 'Alif Laam Meem Ṣaad'],
      ['كٓهيٓعٓصٓ', 'كَافْ هَا يَا عَيْنْ صَادْ', 'Kaaf Haa Yaa ʿAyn Ṣaad'],
      ['طٰهٰ', 'طَا هَا', 'Ṭaa Haa'],
      ['طسٓمٓ', 'طَا سِينْ مِيمْ', 'Ṭaa Seen Meem'],
      ['طسٓ', 'طَا سِينْ', 'Ṭaa Seen'],
      ['يسٓ', 'يَا سِينْ', 'Yaa Seen'],
      ['صٓ', 'صَادْ', 'Ṣaad'],
      ['حمٓ', 'حَا مِيمْ', 'Ḥaa Meem'],
      ['عٓسٓقٓ', 'عَيْنْ سِينْ قَافْ', 'ʿAyn Seen Qaaf'],
      ['قٓ', 'قَافْ', 'Qaaf'],
      ['نٓ', 'نُونْ', 'Noon'],
    ].map(([text, say, hint]) => ({ text, say, hint, label: hint.replace(/ /g, ' · '), heavy: /[خصضغطقظ]/.test(text) })),
  },
  {
    id: 'harakat',
    num: 5,
    title: 'Short Vowels',
    titleAr: 'الحركات',
    icon: '🎵',
    about: 'Fathah (a), Kasrah (i), Dammah (u). Each letter with all three.',
    items: VOWEL_LETTERS.flatMap(l => [
      { text: seatFor(l.ch, FATHA) + FATHA, hint: `${l.tr} + Fathah (a)`, label: `${l.snd}a`, vowel: 'a' },
      { text: seatFor(l.ch, KASRA) + KASRA, hint: `${l.tr} + Kasrah (i)`, label: `${l.snd}i`, vowel: 'i' },
      { text: seatFor(l.ch, DAMMA) + DAMMA, hint: `${l.tr} + Dammah (u)`, label: `${l.snd}u`, vowel: 'u' },
    ].map(it => ({ ...it, heavy: l.heavy }))).map(it => ({ ...it, say: it.text })),
  },
  {
    id: 'tanween',
    num: 6,
    title: 'Tanween',
    titleAr: 'التنوين',
    icon: '🎶',
    about: 'Double vowels: an, in, un.',
    items: VOWEL_LETTERS.flatMap(l => [
      { text: seatFor(l.ch, FATHATAN) + FATHATAN + (['ة', 'أ'].includes(l.ch) ? '' : 'ا'), hint: `${l.tr} + Fathatan (an)`, label: `${l.snd}an`, vowel: 'a' },
      { text: seatFor(l.ch, KASRATAN) + KASRATAN, hint: `${l.tr} + Kasratan (in)`, label: `${l.snd}in`, vowel: 'i' },
      { text: seatFor(l.ch, DAMMATAN) + DAMMATAN, hint: `${l.tr} + Dammatan (un)`, label: `${l.snd}un`, vowel: 'u' },
    ].map(it => ({ ...it, heavy: l.heavy }))).map(it => ({ ...it, say: it.text })),
  },
  {
    id: 'standing',
    num: 7,
    title: 'Standing Vowels',
    titleAr: 'الحركات القائمة',
    icon: '📏',
    about: 'Standing fathah, kasrah and dammah are stretched for 2 counts.',
    items: ['ب', 'ه', 'ل', 'م', 'ن', 'ك', 'ر', 'ذ'].flatMap(ch => {
      const l = LETTERS.find(x => x.ch === ch);
      return [
        { text: ch + DAGGER_ALIF, say: ch + FATHA + 'ا', hint: `${l.tr} + standing Fathah (aa)`, label: `${l.snd}aa`, vowel: 'a', heavy: l.heavy },
        { text: ch + SUB_ALIF, say: ch + KASRA + 'ي', hint: `${l.tr} + standing Kasrah (ee)`, label: `${l.snd}ee`, vowel: 'i', heavy: l.heavy },
        { text: ch + INV_DAMMA, say: ch + DAMMA + 'و', hint: `${l.tr} + inverted Dammah (oo)`, label: `${l.snd}oo`, vowel: 'u', heavy: l.heavy },
      ];
    }),
  },
  {
    id: 'madd',
    num: 8,
    title: 'Long Vowels',
    titleAr: 'حروف المد',
    icon: '〰️',
    about: 'Alif, Waaw and Yaa stretch the sound for 2 counts: aa, oo, ee.',
    items: VOWEL_LETTERS.filter(l => l.ch !== 'أ').flatMap(l => [
      { text: l.ch + FATHA + 'ا', hint: `${l.tr} + Alif (aa)`, label: `${l.snd}aa`, vowel: 'a' },
      { text: l.ch + KASRA + 'ي', hint: `${l.tr} + Yaa (ee)`, label: `${l.snd}ee`, vowel: 'i' },
      { text: l.ch + DAMMA + 'و', hint: `${l.tr} + Waaw (oo)`, label: `${l.snd}oo`, vowel: 'u' },
    ].map(it => ({ ...it, heavy: l.heavy }))).map(it => ({ ...it, say: it.text })),
  },
  {
    id: 'leen',
    num: 9,
    title: 'Soft Letters',
    titleAr: 'حروف اللين',
    icon: '🪶',
    about: 'Waaw and Yaa with sukoon after a fathah: ay, aw.',
    items: VOWEL_LETTERS.filter(l => !['أ', 'و', 'ي'].includes(l.ch)).flatMap(l => [
      { text: l.ch + FATHA + 'ي' + SUKOON, hint: `${l.tr} + Yaa with sukoon (ay)`, label: `${l.snd}ay`, vowel: 'a' },
      { text: l.ch + FATHA + 'و' + SUKOON, hint: `${l.tr} + Waaw with sukoon (aw)`, label: `${l.snd}aw`, vowel: 'a' },
    ].map(it => ({ ...it, heavy: l.heavy }))).map(it => ({ ...it, say: it.text })),
  },
  {
    id: 'sukoon',
    num: 10,
    title: 'Sukoon',
    titleAr: 'السكون',
    icon: '⏸️',
    about: 'A letter with sukoon is stopped — joined to the letter before it.',
    items: VOWEL_LETTERS.filter(l => l.ch !== 'أ').flatMap(l => [
      { text: 'أَ' + l.ch + SUKOON, hint: `${l.tr} with sukoon after Fathah`, label: `a${l.snd}`, vowel: 'a' },
      { text: 'إِ' + l.ch + SUKOON, hint: `${l.tr} with sukoon after Kasrah`, label: `i${l.snd}`, vowel: 'i' },
      { text: 'أُ' + l.ch + SUKOON, hint: `${l.tr} with sukoon after Dammah`, label: `u${l.snd}`, vowel: 'u' },
    ].map(it => ({ ...it, heavy: l.heavy }))).map(it => ({ ...it, say: it.text })),
  },
  {
    id: 'shaddah',
    num: 11,
    title: 'Shaddah',
    titleAr: 'التشديد',
    icon: '💪',
    about: 'Shaddah means the letter is said twice — once stopped, once with the vowel.',
    items: VOWEL_LETTERS.filter(l => l.ch !== 'أ').flatMap(l => [
      { text: 'أَ' + l.ch + SHADDA + FATHA, hint: `${l.tr} with Shaddah + Fathah`, label: `a${l.snd}-${l.snd}a`, vowel: 'a' },
      { text: 'إِ' + l.ch + SHADDA + KASRA, hint: `${l.tr} with Shaddah + Kasrah`, label: `i${l.snd}-${l.snd}i`, vowel: 'i' },
      { text: 'أُ' + l.ch + SHADDA + DAMMA, hint: `${l.tr} with Shaddah + Dammah`, label: `u${l.snd}-${l.snd}u`, vowel: 'u' },
    ].map(it => ({ ...it, heavy: l.heavy }))).map(it => ({ ...it, say: it.text })),
  },
  {
    id: 'words',
    num: 12,
    title: 'First Words',
    titleAr: 'كلمات',
    icon: '📖',
    about: 'Putting it all together: short words from the Qur\'an.',
    items: [
      ['اللّٰهُ', 'Allaah'], ['رَبُّ', 'Rabbu'], ['نُوْرٌ', 'Noorun'], ['قَلَمٌ', 'Qalamun'],
      ['كِتَابٌ', 'Kitaabun'], ['بَيْتٌ', 'Baytun'], ['يَوْمٌ', 'Yawmun'], ['قُلْ', 'Qul'],
      ['هُوَ', 'Huwa'], ['أَحَدٌ', 'Ahadun'], ['الصَّمَدُ', 'As-Samad'], ['الرَّحْمٰنِ', 'Ar-Rahmaan'],
      ['الرَّحِيْمِ', 'Ar-Raheem'], ['الْحَمْدُ', 'Al-Hamdu'], ['الْعٰلَمِيْنَ', "Al-'Aalameen"],
      ['مٰلِكِ', 'Maaliki'], ['النَّاسِ', 'An-Naas'], ['الْفَلَقِ', 'Al-Falaq'],
    ].map(([text, hint]) => ({ text, say: text, hint, label: hint })),
  },
];

lessons.forEach(lesson => lesson.items.forEach((it, i) => { it.key = `${lesson.id}:${i}`; }));

window.QAIDAH = { lessons, LETTERS };
