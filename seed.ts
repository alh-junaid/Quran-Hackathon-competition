import { db } from './lib/db/src/index.js';
import { collections, collectionVerses } from './lib/db/src/schema/collections.js';

async function seed() {
  console.log("Seeding Collections...");
  
  // Create Collections
  const col1 = await db.insert(collections).values({
    name: "Beautiful Duas",
    description: "Powerful supplications from the Quran."
  }).returning({ id: collections.id });
  
  const col2 = await db.insert(collections).values({
    name: "Heart-Soothing Verses",
    description: "Verses to bring peace and tranquility to the heart."
  }).returning({ id: collections.id });

  const duaColId = col1[0].id;
  const peaceColId = col2[0].id;

  // Insert verses into Duas Collection
  await db.insert(collectionVerses).values([
    {
      collectionId: duaColId,
      verseKey: "2:201",
      surahNumber: 2,
      surahName: "Al-Baqarah",
      verseNumber: 201,
      textUthmani: "وَمِنْهُم مَّن يَقُولُ رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
      translation: "But among them is he who says, 'Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.'"
    },
    {
       collectionId: duaColId,
       verseKey: "3:8",
       surahNumber: 3,
       surahName: "Ali 'Imran",
       verseNumber: 8,
       textUthmani: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ",
       translation: "[Who say], 'Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower.'"
    }
  ]);

  // Insert verses into Peace Collection
  await db.insert(collectionVerses).values([
    {
      collectionId: peaceColId,
      verseKey: "13:28",
      surahNumber: 13,
      surahName: "Ar-Ra'd",
      verseNumber: 28,
      textUthmani: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
      translation: "Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured."
    },
    {
      collectionId: peaceColId,
      verseKey: "20:46",
      surahNumber: 20,
      surahName: "Ta-Ha",
      verseNumber: 46,
      textUthmani: "قَالَ لَا تَخَافَا ۖ إِنَّنِي مَعَكُمَا أَسْمَعُ وَأَرَىٰ",
      translation: "[Allah] said, 'Fear not. Indeed, I am with you both; I hear and I see.'"
    }
  ]);

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
