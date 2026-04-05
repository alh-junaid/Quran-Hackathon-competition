import { Router, type IRouter } from "express";
import {
  GetSurahVersesParams,
  GetSurahVersesQueryParams,
  GetVerseParams,
  SearchQuranQueryParams,
  GetVerseTafsirParams,
  GetVerseTafsirQueryParams,
  GetRandomVerseQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const QURAN_API_BASE = "https://api.qurancdn.com/api/qdc";

async function fetchQuranApi(path: string): Promise<unknown> {
  const res = await fetch(`${QURAN_API_BASE}${path}`, {
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Quran API error: ${res.status} for ${path}`);
  }
  return res.json();
}

async function fetchChapterTranslations(surahNumber: number): Promise<Map<string, string>> {
  try {
    const res = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/en.sahih`,
      { headers: { "Accept": "application/json" } }
    );
    if (!res.ok) return new Map();
    const data = await res.json() as { data?: Array<{ ayahs: Array<{ numberInSurah: number; text: string }> }> };
    const translationMap = new Map<string, string>();
    const edition = data.data?.[0];
    if (edition?.ayahs) {
      for (const ayah of edition.ayahs) {
        const key = `${surahNumber}:${ayah.numberInSurah}`;
        translationMap.set(key, ayah.text);
      }
    }
    return translationMap;
  } catch {
    return new Map();
  }
}

router.get("/quran/surahs", async (_req, res): Promise<void> => {
  const data = await fetchQuranApi("/chapters?language=en") as { chapters: unknown[] };
  const surahs = (data.chapters || []).map((s: unknown) => {
    const surah = s as Record<string, unknown>;
    return {
      id: surah.id,
      nameSimple: surah.name_simple,
      nameArabic: surah.name_arabic,
      nameComplex: surah.name_complex,
      versesCount: surah.verses_count,
      revelationPlace: surah.revelation_place,
      translatedName: (surah.translated_name as Record<string, unknown>)?.name ?? surah.name_simple,
    };
  });
  res.json(surahs);
});

router.get("/quran/surahs/:surahNumber/verses", async (req, res): Promise<void> => {
  const params = GetSurahVersesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const queryParams = GetSurahVersesQueryParams.safeParse(req.query);
  const translationId = queryParams.success ? queryParams.data.translationId : 131;
  const page = queryParams.success ? queryParams.data.page : 1;
  const perPage = queryParams.success ? queryParams.data.perPage : 50;

  // Fetch verses and translations in parallel
  const [versesData, translationMap] = await Promise.all([
    fetchQuranApi(
      `/verses/by_chapter/${params.data.surahNumber}?words=true&word_fields=text_uthmani,transliteration&fields=text_uthmani,verse_key&per_page=${perPage}&page=${page}`
    ) as Promise<{ verses: unknown[]; pagination: Record<string, unknown> }>,
    fetchChapterTranslations(params.data.surahNumber),
  ]);

  const verses = (versesData.verses || []).map((v: unknown) => {
    return mapVerse(v as Record<string, unknown>, translationMap);
  });
  const pagination = versesData.pagination || {};

  res.json({
    verses,
    totalCount: (pagination as Record<string, unknown>).total_records ?? 0,
    currentPage: page,
    totalPages: (pagination as Record<string, unknown>).total_pages ?? 1,
  });
});

router.get("/quran/verses/:verseKey", async (req, res): Promise<void> => {
  const params = GetVerseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const verseKey = params.data.verseKey;
  const [surahNum] = verseKey.split(":").map(Number);

  const [verseData, translationMap] = await Promise.all([
    fetchQuranApi(
      `/verses/by_key/${verseKey}?words=true&word_fields=text_uthmani,transliteration&fields=text_uthmani,verse_key&audio=1`
    ) as Promise<{ verse: unknown }>,
    fetchChapterTranslations(surahNum),
  ]);

  if (!verseData.verse) {
    res.status(404).json({ error: "Verse not found" });
    return;
  }

  res.json(mapVerse(verseData.verse as Record<string, unknown>, translationMap));
});

router.get("/quran/search", async (req, res): Promise<void> => {
  const queryParams = SearchQuranQueryParams.safeParse(req.query);
  if (!queryParams.success) {
    res.status(400).json({ error: queryParams.error.message });
    return;
  }

  const { q, page } = queryParams.data;
  const data = await fetchQuranApi(
    `/search?q=${encodeURIComponent(q)}&size=20&page=${page ?? 1}&language=en`
  ) as { search: { results?: unknown[]; total_results?: number; current_page?: number } };

  const search = data.search || {};
  const results = (search.results || []).map((r: unknown) => {
    const result = r as Record<string, unknown>;
    return {
      verseKey: result.verse_key,
      surahName: `Surah ${result.chapter_id}`,
      verseNumber: result.verse_number,
      textUthmani: result.text,
      translation: stripHtml(String(result.translations || "")),
    };
  });

  res.json({
    results,
    totalCount: search.total_results ?? 0,
    currentPage: search.current_page ?? 1,
  });
});

router.get("/quran/translations", async (_req, res): Promise<void> => {
  const data = await fetchQuranApi("/resources/translations?language=en") as { translations: unknown[] };
  const translations = (data.translations || []).map((t: unknown) => {
    const tr = t as Record<string, unknown>;
    return {
      id: tr.id,
      name: tr.name,
      authorName: tr.author_name,
      languageName: tr.language_name,
    };
  });
  res.json(translations);
});

router.get("/quran/tafsirs", async (_req, res): Promise<void> => {
  const data = await fetchQuranApi("/resources/tafsirs?language=en") as { tafsirs: unknown[] };
  const tafsirs = (data.tafsirs || []).map((t: unknown) => {
    const tf = t as Record<string, unknown>;
    return {
      id: tf.id,
      name: tf.name,
      authorName: tf.author_name,
      languageName: tf.language_name,
    };
  });
  res.json(tafsirs);
});

router.get("/quran/verses/:verseKey/tafsir", async (req, res): Promise<void> => {
  const params = GetVerseTafsirParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const queryParams = GetVerseTafsirQueryParams.safeParse(req.query);
  const tafsirId = queryParams.success ? queryParams.data.tafsirId : 169;

  const data = await fetchQuranApi(
    `/tafsirs/${tafsirId}/by_ayah/${params.data.verseKey}`
  ) as { tafsir: { text?: string; body?: string } };

  const rawText = data.tafsir?.text || data.tafsir?.body || "";
  res.json({
    verseKey: params.data.verseKey,
    tafsirId,
    text: stripHtml(rawText),
  });
});

router.get("/quran/random-verse", async (req, res): Promise<void> => {
  const queryParams = GetRandomVerseQueryParams.safeParse(req.query);
  const translationId = queryParams.success ? queryParams.data.translationId : 131;

  const randomSurah = Math.floor(Math.random() * 114) + 1;
  const surahData = await fetchQuranApi(`/chapters/${randomSurah}`) as { chapter: { verses_count: number } };
  const versesCount = surahData.chapter?.verses_count ?? 1;
  const randomVerse = Math.floor(Math.random() * versesCount) + 1;
  const verseKey = `${randomSurah}:${randomVerse}`;

  const [surahNumRand] = verseKey.split(":").map(Number);

  const [verseData, translationMap] = await Promise.all([
    fetchQuranApi(
      `/verses/by_key/${verseKey}?words=true&word_fields=text_uthmani,transliteration&fields=text_uthmani,verse_key&audio=1`
    ) as Promise<{ verse: unknown }>,
    fetchChapterTranslations(surahNumRand),
  ]);

  res.json(mapVerse(verseData.verse as Record<string, unknown>, translationMap));
});

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function mapVerse(v: Record<string, unknown>, translationMap: Map<string, string>) {
  const verseKey = String(v.verse_key ?? "");
  const translation = translationMap.get(verseKey) ?? null;

  const words = v.words as Array<Record<string, unknown>> | undefined;
  const wordByWord = (words || []).map((w: Record<string, unknown>) => {
    const tr = w.translation as Record<string, unknown> | undefined;
    return {
      position: w.position,
      textUthmani: w.text_uthmani,
      translation: typeof tr === "object" && tr !== null ? tr?.text ?? null : null,
      transliteration: typeof w.transliteration === "object" && w.transliteration !== null
        ? (w.transliteration as Record<string, unknown>)?.text ?? null
        : null,
    };
  });

  const audio = v.audio as Record<string, unknown> | undefined;

  // Construct audio URL from verse key using Quran.com CDN (Mishary Rashid Al-Afasy)
  const [surahPart, versePart] = verseKey.split(":");
  const surahPad = surahPart.padStart(3, "0");
  const versePad = (versePart || "1").padStart(3, "0");
  const constructedAudioUrl = `https://verses.quran.com/Alafasy/mp3/${surahPad}${versePad}.mp3`;

  return {
    id: v.id,
    verseNumber: v.verse_number,
    verseKey,
    surahNumber: v.chapter_id,
    textUthmani: v.text_uthmani ?? null,
    translation,
    audioUrl: audio?.url ? `https://verses.quran.com/${audio.url}` : constructedAudioUrl,
    wordByWord,
  };
}

export default router;
