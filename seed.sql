INSERT INTO "collections" ("name", "description") VALUES ('Beautiful Duas', 'Powerful supplications from the Quran.');
INSERT INTO "collections" ("name", "description") VALUES ('Heart-Soothing Verses', 'Verses to bring peace and tranquility to the heart.');

-- Duas
INSERT INTO "collection_verses" ("collection_id", "verse_key", "surah_number", "surah_name", "verse_number", "text_uthmani", "translation") 
VALUES (1, '2:201', 2, 'Al-Baqarah', 201, 'وَمِنْهُم مَّن يَقُولُ رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', 'But among them is he who says, "Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire."');

INSERT INTO "collection_verses" ("collection_id", "verse_key", "surah_number", "surah_name", "verse_number", "text_uthmani", "translation") 
VALUES (1, '3:8', 3, 'Ali ''Imran', 8, 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ', '[Who say], "Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower."');

-- Peace
INSERT INTO "collection_verses" ("collection_id", "verse_key", "surah_number", "surah_name", "verse_number", "text_uthmani", "translation")
VALUES (2, '13:28', 13, 'Ar-Ra''d', 28, 'الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', 'Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.');

INSERT INTO "collection_verses" ("collection_id", "verse_key", "surah_number", "surah_name", "verse_number", "text_uthmani", "translation")
VALUES (2, '20:46', 20, 'Ta-Ha', 46, 'قَالَ لَا تَخَافَا ۖ إِنَّنِي مَعَكُمَا أَسْمَعُ وَأَرَىٰ', '[Allah] said, "Fear not. Indeed, I am with you both; I hear and I see."');
