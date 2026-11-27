// Qaidah curriculum data, following the order of the Noorani Qaidah.
// Every lesson is a list of items: { text, say, hint }.
//   text – what is shown (Arabic)
//   say  – what the speech engine reads (Arabic)
//   hint – short helper label for the adult (transliteration)

// name: the letter's name as said in a Qaidah, fully vowelled so the tablet voice reads it
// correctly (e.g. أَلِفْ "Alif", not ألف read as "alf"; بَا "Baa", not باء "baa'un").
const LETTERS = [
  { ch: 'ا', name: 'أَلِفْ', tr: 'Alif', joins: false },
  { ch: 'ب', name: 'بَا', tr: 'Baa', joins: true },
  { ch: 'ت', name: 'تَا', tr: 'Taa', joins: true },
  { ch: 'ث', name: 'ثَا', tr: 'Thaa', joins: true },
  { ch: 'ج', name: 'جِيمْ', tr: 'Jeem', joins: true },
  { ch: 'ح', name: 'حَا', tr: 'Haa', joins: true },
  { ch: 'خ', name: 'خَا', tr: 'Khaa', joins: true },
  { ch: 'د', name: 'دَالْ', tr: 'Daal', joins: false },
  { ch: 'ذ', name: 'ذَالْ', tr: 'Dhaal', joins: false },
  { ch: 'ر', name: 'رَا', tr: 'Raa', joins: false },
  { ch: 'ز', name: 'زَا', tr: 'Zaa', joins: false },
  { ch: 'س', name: 'سِينْ', tr: 'Seen', joins: true },
  { ch: 'ش', name: 'شِينْ', tr: 'Sheen', joins: true },
  { ch: 'ص', name: 'صَادْ', tr: 'Saad', joins: true },
  { ch: 'ض', name: 'ضَادْ', tr: 'Daad', joins: true },
  { ch: 'ط', name: 'طَا', tr: 'Taa (heavy)', joins: true },
  { ch: 'ظ', name: 'ظَا', tr: 'Dhaa (heavy)', joins: true },
  { ch: 'ع', name: 'عَيْنْ', tr: "'Ayn", joins: true },
  { ch: 'غ', name: 'غَيْنْ', tr: 'Ghayn', joins: true },
  { ch: 'ف', name: 'فَا', tr: 'Faa', joins: true },
  { ch: 'ق', name: 'قَافْ', tr: 'Qaaf', joins: true },
  { ch: 'ك', name: 'كَافْ', tr: 'Kaaf', joins: true },
  { ch: 'ل', name: 'لَامْ', tr: 'Laam', joins: true },
  { ch: 'م', name: 'مِيمْ', tr: 'Meem', joins: true },
  { ch: 'ن', name: 'نُونْ', tr: 'Noon', joins: true },
  { ch: 'و', name: 'وَاوْ', tr: 'Waaw', joins: false },
  { ch: 'ه', name: 'هَا', tr: 'Haa (light)', joins: true },
  { ch: 'ء', name: 'هَمْزَهْ', tr: 'Hamzah', joins: false },
  { ch: 'ي', name: 'يَا', tr: 'Yaa', joins: true },
];

const ZWJ = '‍';
const FATHA = 'َ', KASRA = 'ِ', DAMMA = 'ُ';
const FATHATAN = 'ً', KASRATAN = 'ٍ', DAMMATAN = 'ٌ';
const SUKOON = 'ْ', SHADDA = 'ّ';
const DAGGER_ALIF = 'ٰ', SUB_ALIF = 'ٖ', INV_DAMMA = 'ٗ';

// Letters that can carry vowels in the drills (Alif itself can't – use Hamzah form أ)
const VOWEL_LETTERS = LETTERS.map(l => (l.ch === 'ا' || l.ch === 'ء') ? { ...l, ch: 'أ' } : l)
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
    items: LETTERS.map(l => ({ text: l.ch, say: l.name, hint: l.tr })),
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
      return { text: forms.join('  '), say: l.name, hint: `${l.tr} — ${l.joins ? 'alone · start · middle · end' : 'alone · end (does not join after)'}`, small: true };
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
      return { text: a + b, say: `${A.name} ${B.name}`, hint: `${A.tr} ${B.tr}` };
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
      ['الٓمٓصٓ', 'أَلِفْ لَامْ مِيمْ صَادْ', 'Alif Laam Meem Saad'],
      ['كٓهيٓعٓصٓ', 'كَافْ هَا يَا عَيْنْ صَادْ', 'Kaaf Haa Yaa \'Ayn Saad'],
      ['طٰهٰ', 'طَا هَا', 'Taa Haa'],
      ['طسٓمٓ', 'طَا سِينْ مِيمْ', 'Taa Seen Meem'],
      ['طسٓ', 'طَا سِينْ', 'Taa Seen'],
      ['يسٓ', 'يَا سِينْ', 'Yaa Seen'],
      ['صٓ', 'صَادْ', 'Saad'],
      ['حمٓ', 'حَا مِيمْ', 'Haa Meem'],
      ['عٓسٓقٓ', 'عَيْنْ سِينْ قَافْ', '\'Ayn Seen Qaaf'],
      ['قٓ', 'قَافْ', 'Qaaf'],
      ['نٓ', 'نُونْ', 'Noon'],
    ].map(([text, say, hint]) => ({ text, say, hint })),
  },
  {
    id: 'harakat',
    num: 5,
    title: 'Short Vowels',
    titleAr: 'الحركات',
    icon: '🎵',
    about: 'Fathah (a), Kasrah (i), Dammah (u). Each letter with all three.',
    items: VOWEL_LETTERS.flatMap(l => [
      { text: seatFor(l.ch, FATHA) + FATHA, hint: `${l.tr} + Fathah (a)` },
      { text: seatFor(l.ch, KASRA) + KASRA, hint: `${l.tr} + Kasrah (i)` },
      { text: seatFor(l.ch, DAMMA) + DAMMA, hint: `${l.tr} + Dammah (u)` },
    ]).map(it => ({ ...it, say: it.text })),
  },
  {
    id: 'tanween',
    num: 6,
    title: 'Tanween',
    titleAr: 'التنوين',
    icon: '🎶',
    about: 'Double vowels: an, in, un.',
    items: VOWEL_LETTERS.flatMap(l => [
      { text: seatFor(l.ch, FATHATAN) + FATHATAN + (['ة', 'أ'].includes(l.ch) ? '' : 'ا'), hint: `${l.tr} + Fathatan (an)` },
      { text: seatFor(l.ch, KASRATAN) + KASRATAN, hint: `${l.tr} + Kasratan (in)` },
      { text: seatFor(l.ch, DAMMATAN) + DAMMATAN, hint: `${l.tr} + Dammatan (un)` },
    ]).map(it => ({ ...it, say: it.text })),
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
        { text: ch + DAGGER_ALIF, say: ch + FATHA + 'ا', hint: `${l.tr} + standing Fathah (aa)` },
        { text: ch + SUB_ALIF, say: ch + KASRA + 'ي', hint: `${l.tr} + standing Kasrah (ee)` },
        { text: ch + INV_DAMMA, say: ch + DAMMA + 'و', hint: `${l.tr} + inverted Dammah (oo)` },
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
      { text: l.ch + FATHA + 'ا', hint: `${l.tr}aa` },
      { text: l.ch + KASRA + 'ي', hint: `${l.tr}ee` },
      { text: l.ch + DAMMA + 'و', hint: `${l.tr}oo` },
    ]).map(it => ({ ...it, say: it.text })),
  },
  {
    id: 'leen',
    num: 9,
    title: 'Soft Letters',
    titleAr: 'حروف اللين',
    icon: '🪶',
    about: 'Waaw and Yaa with sukoon after a fathah: ay, aw.',
    items: VOWEL_LETTERS.filter(l => !['أ', 'و', 'ي'].includes(l.ch)).flatMap(l => [
      { text: l.ch + FATHA + 'ي' + SUKOON, hint: `${l.tr.toLowerCase()}ay` },
      { text: l.ch + FATHA + 'و' + SUKOON, hint: `${l.tr.toLowerCase()}aw` },
    ]).map(it => ({ ...it, say: it.text })),
  },
  {
    id: 'sukoon',
    num: 10,
    title: 'Sukoon',
    titleAr: 'السكون',
    icon: '⏸️',
    about: 'A letter with sukoon is stopped — joined to the letter before it.',
    items: VOWEL_LETTERS.filter(l => l.ch !== 'أ').flatMap(l => [
      { text: 'أَ' + l.ch + SUKOON, hint: `a${l.tr.toLowerCase().slice(0, 1)}` },
      { text: 'إِ' + l.ch + SUKOON, hint: `i${l.tr.toLowerCase().slice(0, 1)}` },
      { text: 'أُ' + l.ch + SUKOON, hint: `u${l.tr.toLowerCase().slice(0, 1)}` },
    ]).map(it => ({ ...it, hint: `${it.hint} (sukoon)`, say: it.text })),
  },
  {
    id: 'shaddah',
    num: 11,
    title: 'Shaddah',
    titleAr: 'التشديد',
    icon: '💪',
    about: 'Shaddah means the letter is said twice — once stopped, once with the vowel.',
    items: VOWEL_LETTERS.filter(l => l.ch !== 'أ').flatMap(l => [
      { text: 'أَ' + l.ch + SHADDA + FATHA, hint: `${l.tr} with Shaddah + Fathah` },
      { text: 'إِ' + l.ch + SHADDA + KASRA, hint: `${l.tr} with Shaddah + Kasrah` },
      { text: 'أُ' + l.ch + SHADDA + DAMMA, hint: `${l.tr} with Shaddah + Dammah` },
    ]).map(it => ({ ...it, say: it.text })),
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
    ].map(([text, hint]) => ({ text, say: text, hint })),
  },
];

lessons.forEach(lesson => lesson.items.forEach((it, i) => { it.key = `${lesson.id}:${i}`; }));

window.QAIDAH = { lessons, LETTERS };
