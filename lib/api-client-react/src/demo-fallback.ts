import type {
  Bookmark,
  Collection,
  CollectionVerse,
  DashboardSummary,
  DayActivity,
  Goal,
  HealthStatus,
  Note,
  SearchResults,
  StreakInfo,
  Surah,
  Tafsir,
  TafsirContent,
  Translation,
  Verse,
  VersesPage,
} from "./generated/api.schemas";

type DemoStore = {
  bookmarks: Bookmark[];
  notes: Note[];
  collections: Collection[];
  collectionVerses: Record<number, CollectionVerse[]>;
  goal: Goal;
  sessions: Array<{ date: string; versesRead: number }>;
};

type DemoRequest = {
  pathname: string;
  method: string;
  bodyText?: string | null;
};

const STORAGE_KEY = "quran-companion-demo-store";

const SURAH_FIXTURES: Surah[] = [
  { id: 1, nameSimple: "Al-Fatihah", nameArabic: "الفاتحة", nameComplex: "Al-Fātiḥah", versesCount: 7, revelationPlace: "makkah", translatedName: "The Opening" },
  { id: 2, nameSimple: "Al-Baqarah", nameArabic: "البقرة", nameComplex: "Al-Baqarah", versesCount: 286, revelationPlace: "madinah", translatedName: "The Cow" },
  { id: 3, nameSimple: "Ali 'Imran", nameArabic: "آل عمران", nameComplex: "Āl ʿImrān", versesCount: 200, revelationPlace: "madinah", translatedName: "The Family of Imran" },
  { id: 36, nameSimple: "Yasin", nameArabic: "يس", nameComplex: "Yā-Sīn", versesCount: 83, revelationPlace: "makkah", translatedName: "Ya Sin" },
  { id: 55, nameSimple: "Ar-Rahman", nameArabic: "الرحمن", nameComplex: "Ar-Raḥmān", versesCount: 78, revelationPlace: "makkah", translatedName: "The Most Merciful" },
  { id: 67, nameSimple: "Al-Mulk", nameArabic: "الملك", nameComplex: "Al-Mulk", versesCount: 30, revelationPlace: "makkah", translatedName: "The Sovereignty" },
  { id: 112, nameSimple: "Al-Ikhlas", nameArabic: "الإخلاص", nameComplex: "Al-Ikhlāṣ", versesCount: 4, revelationPlace: "makkah", translatedName: "Sincerity" },
  { id: 113, nameSimple: "Al-Falaq", nameArabic: "الفلق", nameComplex: "Al-Falaq", versesCount: 5, revelationPlace: "makkah", translatedName: "The Daybreak" },
  { id: 114, nameSimple: "An-Nas", nameArabic: "الناس", nameComplex: "An-Nās", versesCount: 6, revelationPlace: "makkah", translatedName: "Mankind" },
];

const VERSE_FIXTURES: Record<string, Verse> = {
  "1:1": { id: 1, verseNumber: 1, verseKey: "1:1", surahNumber: 1, textUthmani: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "In the name of Allah, the Most Gracious, the Most Merciful.", audioUrl: "https://verses.quran.com/Alafasy/mp3/001001.mp3", wordByWord: [] },
  "1:2": { id: 2, verseNumber: 2, verseKey: "1:2", surahNumber: 1, textUthmani: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation: "All praise is for Allah, Lord of the worlds.", audioUrl: "https://verses.quran.com/Alafasy/mp3/001002.mp3", wordByWord: [] },
  "1:3": { id: 3, verseNumber: 3, verseKey: "1:3", surahNumber: 1, textUthmani: "الرَّحْمَٰنِ الرَّحِيمِ", translation: "The Most Gracious, the Most Merciful.", audioUrl: "https://verses.quran.com/Alafasy/mp3/001003.mp3", wordByWord: [] },
  "1:4": { id: 4, verseNumber: 4, verseKey: "1:4", surahNumber: 1, textUthmani: "مَالِكِ يَوْمِ الدِّينِ", translation: "Master of the Day of Judgment.", audioUrl: "https://verses.quran.com/Alafasy/mp3/001004.mp3", wordByWord: [] },
  "1:5": { id: 5, verseNumber: 5, verseKey: "1:5", surahNumber: 1, textUthmani: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation: "You alone we worship and You alone we ask for help.", audioUrl: "https://verses.quran.com/Alafasy/mp3/001005.mp3", wordByWord: [] },
  "1:6": { id: 6, verseNumber: 6, verseKey: "1:6", surahNumber: 1, textUthmani: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation: "Guide us to the straight path.", audioUrl: "https://verses.quran.com/Alafasy/mp3/001006.mp3", wordByWord: [] },
  "1:7": { id: 7, verseNumber: 7, verseKey: "1:7", surahNumber: 1, textUthmani: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ", translation: "The path of those You have blessed.", audioUrl: "https://verses.quran.com/Alafasy/mp3/001007.mp3", wordByWord: [] },
  "2:153": { id: 153, verseNumber: 153, verseKey: "2:153", surahNumber: 2, textUthmani: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ", translation: "O believers! Seek comfort in patience and prayer.", audioUrl: "https://verses.quran.com/Alafasy/mp3/002153.mp3", wordByWord: [] },
  "2:255": { id: 255, verseNumber: 255, verseKey: "2:255", surahNumber: 2, textUthmani: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ", translation: "Allah - there is no deity except Him, the Ever-Living, the Sustainer.", audioUrl: "https://verses.quran.com/Alafasy/mp3/002255.mp3", wordByWord: [] },
  "2:284": { id: 284, verseNumber: 284, verseKey: "2:284", surahNumber: 2, textUthmani: "لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ", translation: "To Allah belongs whatever is in the heavens and whatever is in the earth.", audioUrl: "https://verses.quran.com/Alafasy/mp3/002284.mp3", wordByWord: [] },
  "2:285": { id: 285, verseNumber: 285, verseKey: "2:285", surahNumber: 2, textUthmani: "آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ", translation: "The Messenger has believed in what was revealed to him from his Lord.", audioUrl: "https://verses.quran.com/Alafasy/mp3/002285.mp3", wordByWord: [] },
  "2:286": { id: 286, verseNumber: 286, verseKey: "2:286", surahNumber: 2, textUthmani: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", translation: "Allah does not burden a soul beyond what it can bear.", audioUrl: "https://verses.quran.com/Alafasy/mp3/002286.mp3", wordByWord: [] },
  "3:133": { id: 133, verseNumber: 133, verseKey: "3:133", surahNumber: 3, textUthmani: "وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ", translation: "And hasten to forgiveness from your Lord.", audioUrl: "https://verses.quran.com/Alafasy/mp3/003133.mp3", wordByWord: [] },
  "3:200": { id: 200, verseNumber: 200, verseKey: "3:200", surahNumber: 3, textUthmani: "يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا", translation: "O believers! Be steadfast and remain mindful of Allah.", audioUrl: "https://verses.quran.com/Alafasy/mp3/003200.mp3", wordByWord: [] },
  "11:115": { id: 115, verseNumber: 115, verseKey: "11:115", surahNumber: 11, textUthmani: "وَاصْبِرْ فَإِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ", translation: "Be patient, for Allah does not let the reward of those who do good be lost.", audioUrl: "https://verses.quran.com/Alafasy/mp3/011115.mp3", wordByWord: [] },
  "39:53": { id: 53, verseNumber: 53, verseKey: "39:53", surahNumber: 39, textUthmani: "لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ", translation: "Do not despair of the mercy of Allah.", audioUrl: "https://verses.quran.com/Alafasy/mp3/039053.mp3", wordByWord: [] },
  "67:1": { id: 1, verseNumber: 1, verseKey: "67:1", surahNumber: 67, textUthmani: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ", translation: "Blessed is the One in whose Hand is all authority.", audioUrl: "https://verses.quran.com/Alafasy/mp3/067001.mp3", wordByWord: [] },
  "112:1": { id: 1, verseNumber: 1, verseKey: "112:1", surahNumber: 112, textUthmani: "قُلْ هُوَ اللَّهُ أَحَدٌ", translation: "Say, He is Allah, the One.", audioUrl: "https://verses.quran.com/Alafasy/mp3/112001.mp3", wordByWord: [] },
  "112:2": { id: 2, verseNumber: 2, verseKey: "112:2", surahNumber: 112, textUthmani: "اللَّهُ الصَّمَدُ", translation: "Allah, the Absolute.", audioUrl: "https://verses.quran.com/Alafasy/mp3/112002.mp3", wordByWord: [] },
  "112:3": { id: 3, verseNumber: 3, verseKey: "112:3", surahNumber: 112, textUthmani: "لَمْ يَلِدْ وَلَمْ يُولَدْ", translation: "He neither begets nor is born.", audioUrl: "https://verses.quran.com/Alafasy/mp3/112003.mp3", wordByWord: [] },
  "112:4": { id: 4, verseNumber: 4, verseKey: "112:4", surahNumber: 112, textUthmani: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", translation: "And there is none comparable to Him.", audioUrl: "https://verses.quran.com/Alafasy/mp3/112004.mp3", wordByWord: [] },
  "113:1": { id: 1, verseNumber: 1, verseKey: "113:1", surahNumber: 113, textUthmani: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", translation: "Say, I seek refuge in the Lord of daybreak.", audioUrl: "https://verses.quran.com/Alafasy/mp3/113001.mp3", wordByWord: [] },
  "113:2": { id: 2, verseNumber: 2, verseKey: "113:2", surahNumber: 113, textUthmani: "مِن شَرِّ مَا خَلَقَ", translation: "From the evil of what He created.", audioUrl: "https://verses.quran.com/Alafasy/mp3/113002.mp3", wordByWord: [] },
  "113:3": { id: 3, verseNumber: 3, verseKey: "113:3", surahNumber: 113, textUthmani: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", translation: "And from the evil of darkness when it settles.", audioUrl: "https://verses.quran.com/Alafasy/mp3/113003.mp3", wordByWord: [] },
  "113:4": { id: 4, verseNumber: 4, verseKey: "113:4", surahNumber: 113, textUthmani: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", translation: "And from the evil of those who blow on knots.", audioUrl: "https://verses.quran.com/Alafasy/mp3/113004.mp3", wordByWord: [] },
  "113:5": { id: 5, verseNumber: 5, verseKey: "113:5", surahNumber: 113, textUthmani: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", translation: "And from the evil of an envier when he envies.", audioUrl: "https://verses.quran.com/Alafasy/mp3/113005.mp3", wordByWord: [] },
  "114:1": { id: 1, verseNumber: 1, verseKey: "114:1", surahNumber: 114, textUthmani: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", translation: "Say, I seek refuge in the Lord of mankind.", audioUrl: "https://verses.quran.com/Alafasy/mp3/114001.mp3", wordByWord: [] },
  "114:2": { id: 2, verseNumber: 2, verseKey: "114:2", surahNumber: 114, textUthmani: "مَلِكِ النَّاسِ", translation: "The Sovereign of mankind.", audioUrl: "https://verses.quran.com/Alafasy/mp3/114002.mp3", wordByWord: [] },
  "114:3": { id: 3, verseNumber: 3, verseKey: "114:3", surahNumber: 114, textUthmani: "إِلَٰهِ النَّاسِ", translation: "The God of mankind.", audioUrl: "https://verses.quran.com/Alafasy/mp3/114003.mp3", wordByWord: [] },
  "114:4": { id: 4, verseNumber: 4, verseKey: "114:4", surahNumber: 114, textUthmani: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", translation: "From the evil of the whisperer who withdraws.", audioUrl: "https://verses.quran.com/Alafasy/mp3/114004.mp3", wordByWord: [] },
  "114:5": { id: 5, verseNumber: 5, verseKey: "114:5", surahNumber: 114, textUthmani: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", translation: "Who whispers into the breasts of mankind.", audioUrl: "https://verses.quran.com/Alafasy/mp3/114005.mp3", wordByWord: [] },
  "114:6": { id: 6, verseNumber: 6, verseKey: "114:6", surahNumber: 114, textUthmani: "مِنَ الْجِنَّةِ وَالنَّاسِ", translation: "From among jinn and mankind.", audioUrl: "https://verses.quran.com/Alafasy/mp3/114006.mp3", wordByWord: [] },
};

function supportsLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function nowIso(): string {
  return new Date().toISOString();
}

function parseJson<T>(bodyText?: string | null): T | null {
  if (!bodyText) return null;
  try {
    return JSON.parse(bodyText) as T;
  } catch {
    return null;
  }
}

function seedStore(): DemoStore {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  return {
    bookmarks: [
      {
        id: 1,
        verseKey: "2:255",
        surahNumber: 2,
        surahName: "Al-Baqarah",
        verseNumber: 255,
        textUthmani: VERSE_FIXTURES["2:255"].textUthmani,
        translation: VERSE_FIXTURES["2:255"].translation ?? null,
        note: "Powerful verse for reflection.",
        createdAt: nowIso(),
      },
    ],
    notes: [
      {
        id: 1,
        verseKey: "1:6",
        surahNumber: 1,
        surahName: "Al-Fatihah",
        verseNumber: 6,
        content: "Ask for guidance before making plans.",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ],
    collections: [
      {
        id: 1,
        name: "Daily Guidance",
        description: "Verses to return to every morning.",
        verseCount: 2,
        verses: [],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ],
    collectionVerses: {
      1: [
        {
          id: 1,
          verseKey: "1:6",
          surahNumber: 1,
          surahName: "Al-Fatihah",
          verseNumber: 6,
          textUthmani: VERSE_FIXTURES["1:6"].textUthmani,
          translation: VERSE_FIXTURES["1:6"].translation ?? null,
          addedAt: nowIso(),
        },
        {
          id: 2,
          verseKey: "2:286",
          surahNumber: 2,
          surahName: "Al-Baqarah",
          verseNumber: 286,
          textUthmani: VERSE_FIXTURES["2:286"].textUthmani,
          translation: VERSE_FIXTURES["2:286"].translation ?? null,
          addedAt: nowIso(),
        },
      ],
    },
    goal: {
      id: 1,
      dailyVerseTarget: 5,
      currentStreak: 4,
      longestStreak: 9,
      totalVersesRead: 42,
      totalDaysRead: 12,
      lastReadAt: todayStr,
      createdAt: nowIso(),
    },
    sessions: [
      { date: twoDaysAgo.toISOString().split("T")[0], versesRead: 5 },
      { date: yesterday.toISOString().split("T")[0], versesRead: 4 },
      { date: todayStr, versesRead: 6 },
    ],
  };
}

function readStore(): DemoStore {
  if (!supportsLocalStorage()) {
    return seedStore();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const store = seedStore();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return store;
  }

  try {
    return { ...seedStore(), ...JSON.parse(raw) } as DemoStore;
  } catch {
    const store = seedStore();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return store;
  }
}

function writeStore(store: DemoStore): void {
  if (!supportsLocalStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function verseFromFixture(verseKey: string): Verse | null {
  const verse = VERSE_FIXTURES[verseKey];
  return verse ? { ...verse, wordByWord: verse.wordByWord ?? [] } : null;
}

function versesPage(surahNumber: number): VersesPage {
  const verses = Object.values(VERSE_FIXTURES).filter((verse) => verse.surahNumber === surahNumber);
  return { verses, totalCount: verses.length, currentPage: 1, totalPages: 1 };
}

function searchResults(query: string): SearchResults {
  const q = query.toLowerCase();
  const keys = Object.keys(VERSE_FIXTURES).filter((verseKey) => {
    const verse = VERSE_FIXTURES[verseKey];
    return `${verse.verseKey} ${verse.translation ?? ""} ${verse.textUthmani}`.toLowerCase().includes(q);
  });

  const results = keys.map((verseKey) => {
    const verse = VERSE_FIXTURES[verseKey];
    return {
      verseKey: verse.verseKey,
      surahName: SURAH_FIXTURES.find((surah) => surah.id === verse.surahNumber)?.nameSimple ?? `Surah ${verse.surahNumber}`,
      verseNumber: verse.verseNumber,
      textUthmani: verse.textUthmani,
      translation: verse.translation ?? null,
    };
  });

  if (results.length > 0) {
    return { results, totalCount: results.length, currentPage: 1 };
  }

  return {
    results: [
      {
        verseKey: "1:6",
        surahName: "Al-Fatihah",
        verseNumber: 6,
        textUthmani: VERSE_FIXTURES["1:6"].textUthmani,
        translation: VERSE_FIXTURES["1:6"].translation ?? null,
      },
    ],
    totalCount: 1,
    currentPage: 1,
  };
}

function dailyChallenge(): { verses: Verse[] } {
  const keys = ["2:284", "2:285", "2:286"];
  return { verses: keys.map((key) => verseFromFixture(key)).filter((verse): verse is Verse => verse !== null) };
}

function streakInfo(store: DemoStore): StreakInfo {
  const recentDays: DayActivity[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const session = store.sessions.find((item) => item.date === dateStr);
    const versesRead = session?.versesRead ?? 0;
    recentDays.push({ date: dateStr, versesRead, read: versesRead > 0 });
  }

  return {
    currentStreak: store.goal.currentStreak,
    longestStreak: store.goal.longestStreak,
    totalDaysRead: store.goal.totalDaysRead,
    lastReadAt: store.goal.lastReadAt,
    recentDays,
  };
}

function dashboardSummary(store: DemoStore): DashboardSummary {
  return {
    totalBookmarks: store.bookmarks.length,
    totalNotes: store.notes.length,
    totalCollections: store.collections.length,
    currentStreak: store.goal.currentStreak,
    longestStreak: store.goal.longestStreak,
    totalVersesRead: store.goal.totalVersesRead,
    dailyVerseTarget: store.goal.dailyVerseTarget,
    lastReadAt: store.goal.lastReadAt,
    recentBookmarks: [...store.bookmarks].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    recentNotes: [...store.notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5),
  };
}

function parseId(pathname: string, prefix: string): number | null {
  const suffix = pathname.slice(prefix.length);
  const match = suffix.match(/^(\d+)/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

function withVersesCount(collection: Collection, verses: CollectionVerse[] = []): Collection {
  return { ...collection, verseCount: verses.length, verses };
}

function ensureGoal(store: DemoStore): Goal {
  if (!store.goal) {
    store.goal = seedStore().goal;
  }
  return store.goal;
}

function setGoal(store: DemoStore, goal: Goal): Goal {
  store.goal = goal;
  writeStore(store);
  return goal;
}

function handleLog(store: DemoStore, versesRead: number): Goal {
  const today = new Date().toISOString().split("T")[0];
  const goal = ensureGoal(store);

  const existing = store.sessions.find((session) => session.date === today);
  if (existing) {
    existing.versesRead += versesRead;
  } else {
    store.sessions.push({ date: today, versesRead });
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const yesterdaySession = store.sessions.find((session) => session.date === yesterdayStr);
  const lastReadDate = goal.lastReadAt ? new Date(goal.lastReadAt).toISOString().split("T")[0] : null;

  let newStreak = goal.currentStreak;
  if (lastReadDate === today) {
    newStreak = goal.currentStreak;
  } else if (lastReadDate === yesterdayStr || !lastReadDate || yesterdaySession) {
    newStreak = goal.currentStreak + 1;
  } else {
    newStreak = 1;
  }

  return setGoal(store, {
    ...goal,
    currentStreak: newStreak,
    longestStreak: Math.max(goal.longestStreak, newStreak),
    totalVersesRead: goal.totalVersesRead + versesRead,
    totalDaysRead: lastReadDate === today ? goal.totalDaysRead : goal.totalDaysRead + 1,
    lastReadAt: nowIso(),
  });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function mapVerse(v: Record<string, unknown>, translationMap: Map<string, string>): Verse {
  const verseKey = String(v.verse_key ?? "");
  const translation = translationMap.get(verseKey) ?? null;
  const audio = v.audio as Record<string, unknown> | undefined;

  return {
    id: Number(v.id ?? 0),
    verseNumber: Number(v.verse_number ?? 0),
    verseKey,
    surahNumber: Number(v.chapter_id ?? 0),
    textUthmani: String(v.text_uthmani ?? ""),
    translation,
    audioUrl: audio?.url ? `https://verses.quran.com/${audio.url}` : `https://verses.quran.com/Alafasy/mp3/${verseKey.replace(":", "").padStart(6, "0")}.mp3`,
    wordByWord: [],
  };
}

function routeFromSearchParams(request: DemoRequest): URLSearchParams {
  return new URL(request.pathname, "https://demo.local").searchParams;
}

export async function getDemoFallbackByUrl<T = unknown>(url: string, method: string, bodyText?: string | null): Promise<T | null> {
  const parsed = new URL(url, "https://demo.local");
  const request: DemoRequest = { pathname: parsed.pathname, method: method.toUpperCase(), bodyText };

  try {
    if (request.pathname === "/api/healthz") {
      return { status: "ok" } as T;
    }

    if (request.pathname === "/api/quran/daily-challenge") {
      return dailyChallenge() as T;
    }

    if (request.pathname === "/api/quran/surahs") {
      return SURAH_FIXTURES as T;
    }

    if (request.pathname.startsWith("/api/quran/surahs/") && request.pathname.endsWith("/verses")) {
      const surahNumber = Number(request.pathname.split("/")[4]);
      return versesPage(surahNumber) as T;
    }

    if (request.pathname.startsWith("/api/quran/verses/") && request.pathname.includes("/tafsir")) {
      const verseKey = request.pathname.split("/")[4];
      return { verseKey, tafsirId: Number(routeFromSearchParams(request).get("tafsirId") ?? "169"), text: "Reflection content is not available in demo mode." } as T;
    }

    if (request.pathname.startsWith("/api/quran/verses/")) {
      const verseKey = request.pathname.split("/")[4];
      return verseFromFixture(verseKey) as T;
    }

    if (request.pathname === "/api/quran/search") {
      return searchResults(routeFromSearchParams(request).get("q") ?? "") as T;
    }

    if (request.pathname === "/api/quran/translations") {
      return [
        { id: 131, name: "English Translation", authorName: "Sahih International", languageName: "English" },
        { id: 17, name: "English Tafsir", authorName: "Ibn Kathir", languageName: "English" },
      ] as T;
    }

    if (request.pathname === "/api/quran/tafsirs") {
      return [
        { id: 169, name: "Tafsir for Reflection", authorName: "Demo", languageName: "English" },
      ] as T;
    }

    if (request.pathname === "/api/quran/random-verse") {
      const keys = Object.keys(VERSE_FIXTURES);
      const key = keys[Math.floor(Math.random() * keys.length)] ?? "1:6";
      return verseFromFixture(key) as T;
    }

    if (request.pathname === "/api/dashboard/summary") {
      return dashboardSummary(readStore()) as T;
    }

    if (request.pathname === "/api/goals") {
      const store = readStore();
      if (request.method === "GET") {
        return ensureGoal(store) as T;
      }
      if (request.method === "POST") {
        const payload = parseJson<{ dailyVerseTarget: number }>(bodyText ?? null);
        if (!payload) return null;
        return setGoal(store, { ...ensureGoal(store), dailyVerseTarget: Number(payload.dailyVerseTarget) }) as T;
      }
    }

    if (request.pathname === "/api/goals/log" && request.method === "POST") {
      const store = readStore();
      const payload = parseJson<{ versesRead: number }>(bodyText ?? null);
      if (!payload) return null;
      return handleLog(store, Number(payload.versesRead)) as T;
    }

    if (request.pathname === "/api/goals/streak") {
      return streakInfo(readStore()) as T;
    }

    if (request.pathname === "/api/bookmarks") {
      const store = readStore();
      if (request.method === "GET") {
        return [...store.bookmarks].sort((a, b) => a.createdAt.localeCompare(b.createdAt)) as T;
      }
      if (request.method === "POST") {
        const payload = parseJson<Partial<Bookmark>>(bodyText ?? null);
        if (!payload) return null;
        const bookmark: Bookmark = {
          id: Date.now(),
          verseKey: String(payload.verseKey ?? ""),
          surahNumber: Number(payload.surahNumber ?? 0),
          surahName: String(payload.surahName ?? ""),
          verseNumber: Number(payload.verseNumber ?? 0),
          textUthmani: payload.textUthmani ?? null,
          translation: payload.translation ?? null,
          note: payload.note ?? null,
          createdAt: nowIso(),
        };
        store.bookmarks.push(bookmark);
        writeStore(store);
        return bookmark as T;
      }
    }

    if (request.pathname.startsWith("/api/bookmarks/check/")) {
      const store = readStore();
      const verseKey = decodeURIComponent(request.pathname.split("/").slice(4).join("/"));
      const bookmark = store.bookmarks.find((item) => item.verseKey === verseKey);
      return { bookmarked: Boolean(bookmark), bookmarkId: bookmark?.id ?? null } as T;
    }

    if (request.pathname.startsWith("/api/bookmarks/") && request.method === "DELETE") {
      const store = readStore();
      const id = parseId(request.pathname, "/api/bookmarks/");
      if (id == null) return null;
      store.bookmarks = store.bookmarks.filter((item) => item.id !== id);
      writeStore(store);
      return null;
    }

    if (request.pathname === "/api/notes") {
      const store = readStore();
      if (request.method === "GET") {
        return [...store.notes].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt)) as T;
      }
      if (request.method === "POST") {
        const payload = parseJson<Partial<Note>>(bodyText ?? null);
        if (!payload) return null;
        const note: Note = {
          id: Date.now(),
          verseKey: String(payload.verseKey ?? ""),
          surahNumber: Number(payload.surahNumber ?? 0),
          surahName: String(payload.surahName ?? ""),
          verseNumber: Number(payload.verseNumber ?? 0),
          content: String(payload.content ?? ""),
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        store.notes.push(note);
        writeStore(store);
        return note as T;
      }
    }

    if (request.pathname.startsWith("/api/notes/")) {
      const store = readStore();
      const id = parseId(request.pathname, "/api/notes/");
      if (id == null) return null;
      const index = store.notes.findIndex((item) => item.id === id);
      if (request.method === "GET") {
        return (store.notes[index] ?? null) as T;
      }
      if (request.method === "PATCH") {
        const payload = parseJson<{ content: string }>(bodyText ?? null);
        if (!payload || index < 0) return null;
        store.notes[index] = { ...store.notes[index], content: payload.content, updatedAt: nowIso() };
        writeStore(store);
        return store.notes[index] as T;
      }
      if (request.method === "DELETE") {
        if (index < 0) return null;
        store.notes.splice(index, 1);
        writeStore(store);
        return null;
      }
    }

    if (request.pathname === "/api/collections") {
      const store = readStore();
      if (request.method === "GET") {
        return store.collections.map((collection) => withVersesCount(collection, store.collectionVerses[collection.id] ?? [])) as T;
      }
      if (request.method === "POST") {
        const payload = parseJson<Partial<Collection>>(bodyText ?? null);
        if (!payload) return null;
        const collection: Collection = {
          id: Date.now(),
          name: String(payload.name ?? "Untitled collection"),
          description: payload.description ?? null,
          verseCount: 0,
          verses: [],
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        store.collections.push(collection);
        store.collectionVerses[collection.id] = [];
        writeStore(store);
        return collection as T;
      }
    }

    if (request.pathname.startsWith("/api/collections/") && request.pathname.split("/").length === 4) {
      const store = readStore();
      const id = parseId(request.pathname, "/api/collections/");
      if (id == null) return null;
      const collection = store.collections.find((item) => item.id === id);
      if (!collection) return null;
      const verses = store.collectionVerses[id] ?? [];
      if (request.method === "GET") {
        return withVersesCount(collection, verses) as T;
      }
      if (request.method === "PATCH") {
        const payload = parseJson<{ name?: string; description?: string | null }>(bodyText ?? null);
        if (!payload) return null;
        const updated = {
          ...collection,
          name: payload.name ?? collection.name,
          description: payload.description === undefined ? collection.description : payload.description,
          updatedAt: nowIso(),
        };
        store.collections = store.collections.map((item) => (item.id === id ? updated : item));
        writeStore(store);
        return withVersesCount(updated, verses) as T;
      }
      if (request.method === "DELETE") {
        store.collections = store.collections.filter((item) => item.id !== id);
        delete store.collectionVerses[id];
        writeStore(store);
        return null;
      }
    }

    if (request.pathname.startsWith("/api/collections/") && request.pathname.endsWith("/verses") && request.method === "POST") {
      const store = readStore();
      const id = parseId(request.pathname, "/api/collections/");
      if (id == null) return null;
      const payload = parseJson<{ verseKey: string; surahNumber: number; surahName: string; verseNumber: number; textUthmani?: string | null; translation?: string | null }>(bodyText ?? null);
      if (!payload) return null;
      const verses = store.collectionVerses[id] ?? (store.collectionVerses[id] = []);
      if (!verses.find((verse) => verse.verseKey === payload.verseKey)) {
        verses.push({
          id: Date.now(),
          verseKey: payload.verseKey,
          surahNumber: payload.surahNumber,
          surahName: payload.surahName,
          verseNumber: payload.verseNumber,
          textUthmani: payload.textUthmani ?? null,
          translation: payload.translation ?? null,
          addedAt: nowIso(),
        });
      }
      const collection = store.collections.find((item) => item.id === id);
      if (!collection) return null;
      collection.verseCount = verses.length;
      collection.verses = verses;
      writeStore(store);
      return withVersesCount(collection, verses) as T;
    }

    if (request.pathname.startsWith("/api/collections/") && request.pathname.includes("/verses/") && request.method === "DELETE") {
      const store = readStore();
      const parts = request.pathname.split("/");
      const id = Number(parts[3]);
      const verseKey = decodeURIComponent(parts.slice(5).join("/"));
      const verses = store.collectionVerses[id] ?? [];
      store.collectionVerses[id] = verses.filter((verse) => verse.verseKey !== verseKey);
      const collection = store.collections.find((item) => item.id === id);
      if (collection) {
        collection.verseCount = store.collectionVerses[id].length;
        collection.verses = store.collectionVerses[id];
      }
      writeStore(store);
      return null;
    }

    if (request.pathname === "/api/dashboard/summary") {
      return dashboardSummary(readStore()) as T;
    }

    return null;
  } catch {
    return null;
  }
}

export function getDailyChallengeFallback(): { verses: Verse[] } {
  return dailyChallenge();
}

export function getDemoFallback<T = unknown>(request: DemoRequest): Promise<T | null> {
  return getDemoFallbackByUrl<T>(request.pathname, request.method, request.bodyText);
}
