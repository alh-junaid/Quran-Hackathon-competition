const http = require('http');

async function doFetch(path, method, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://127.0.0.1:5173/api${path}`,
      {
        method,
        headers: { 'Content-Type': 'application/json' }
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function seed() {
  console.log("Seeding Collections via API...");
  
  const col1 = await doFetch('/collections', 'POST', {
    name: "Beautiful Duas",
    description: "Powerful supplications from the Quran."
  });
  
  const col2 = await doFetch('/collections', 'POST', {
    name: "Heart-Soothing Verses",
    description: "Verses to bring peace and tranquility to the heart."
  });

  const duaColId = col1[0].id;
  const peaceColId = col2[0].id;

  await doFetch(`/collections/${duaColId}/verses`, 'POST', {
    verseKey: "2:201",
    surahNumber: 2,
    surahName: "Al-Baqarah",
    verseNumber: 201,
    textUthmani: "وَمِنْهُم مَّن يَقُولُ رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    translation: "But among them is he who says, 'Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.'"
  });

  await doFetch(`/collections/${duaColId}/verses`, 'POST', {
    verseKey: "3:8",
    surahNumber: 3,
    surahName: "Ali 'Imran",
    verseNumber: 8,
    textUthmani: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ",
    translation: "[Who say], 'Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower.'"
  });

  await doFetch(`/collections/${peaceColId}/verses`, 'POST', {
    verseKey: "13:28",
    surahNumber: 13,
    surahName: "Ar-Ra'd",
    verseNumber: 28,
    textUthmani: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    translation: "Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured."
  });

  console.log("Seeding complete!");
}

seed().catch(console.error);
