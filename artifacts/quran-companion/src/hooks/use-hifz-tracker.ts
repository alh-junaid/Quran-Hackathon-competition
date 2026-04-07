import { useState, useEffect, useRef, useMemo } from 'react';

const normalizeArabic = (text: string) => {
  if (!text) return "";
  return text
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ /g, "")
    .trim();
};

const detectTajweedRule = (word: string) => {
  // Meem or Noon followed by Shaddah
  if (/[\u0645\u0646]\u0651/.test(word)) return "Ghunnah";
  // Qaf, Twa, Ba, Jeem, Dal with Sukoon
  if (/[\u0642\u0637\u0628\u062C\u062F]\u0652/.test(word)) return "Qalqalah";
  // Madd marker
  if (/[\u0653\u06E4]/.test(word) || /آ/.test(word)) return "Madd";
  return null;
};

export function useHifzTracker(transcript: string, versesPage: any, leniency: 'strict' | 'lenient' = 'strict', correctionVoice: string = 'en-US') {
  const [wordStates, setWordStates] = useState<Record<string, 'correct' | 'wrong'>>({});
  const spokenErrors = useRef(new Set<string>());

  const expectedSequence = useMemo(() => {
    if (!versesPage) return [];
    const seq: any[] = [];
    for (const verse of versesPage.verses) {
      if (verse.wordByWord) {
        for (const word of verse.wordByWord) {
          seq.push({ ...word, verseId: verse.id });
        }
      }
    }
    return seq;
  }, [versesPage]);

  useEffect(() => {
    if (!transcript || expectedSequence.length === 0) {
      setWordStates({});
      spokenErrors.current.clear();
      return;
    }

    const tWords = transcript.split(/\s+/).map(normalizeArabic).filter(Boolean);
    const newStates: Record<string, 'correct' | 'wrong'> = {};
    let expectedIdx = 0;
    let newlyWrongWord = null;

    for (let i = 0; i < tWords.length; i++) {
      if (expectedIdx >= expectedSequence.length) break;

      const spoken = tWords[i];
      let matched = false;
      
      // Look ahead up to 3 words to allow recovery
      for (let lookahead = 0; lookahead < 3; lookahead++) {
        if (expectedIdx + lookahead >= expectedSequence.length) break;
        const potentialWord = expectedSequence[expectedIdx + lookahead];
        const expectedNormalized = normalizeArabic(potentialWord.textUthmani);

        let isMatch = spoken === expectedNormalized || spoken.includes(expectedNormalized) || expectedNormalized.includes(spoken);
        
        if (!isMatch && leniency === 'lenient' && expectedNormalized.length >= 3 && spoken.length >= 3) {
            // Lenient phonetic matching: accept if they share a 3-character sequential root
            for (let j = 0; j <= expectedNormalized.length - 3; j++) {
                if (spoken.includes(expectedNormalized.substring(j, j + 3))) {
                    isMatch = true;
                    break;
                }
            }
        }

        if (isMatch) {
          // If we matched a lookahead, mark skipped words as wrong
          for (let skip = 0; skip < lookahead; skip++) {
            const skippedWord = expectedSequence[expectedIdx + skip];
            const skipKey = `${skippedWord.verseId}-${skippedWord.position}`;
            newStates[skipKey] = 'wrong';
            if (!spokenErrors.current.has(skipKey) && !newlyWrongWord) {
              newlyWrongWord = skippedWord;
              spokenErrors.current.add(skipKey);
            }
          }
          
          const matchKey = `${potentialWord.verseId}-${potentialWord.position}`;
          newStates[matchKey] = 'correct';
          expectedIdx += lookahead + 1;
          matched = true;
          break;
        }
      }

      if (!matched) {
        // If we didn't match the current word or lookaheads, mark current expected as wrong
        const expectedWord = expectedSequence[expectedIdx];
        const key = `${expectedWord.verseId}-${expectedWord.position}`;
        newStates[key] = 'wrong';
        if (!spokenErrors.current.has(key) && !newlyWrongWord) {
          newlyWrongWord = expectedWord;
          spokenErrors.current.add(key);
        }
      }
    }

    setWordStates(newStates);

    if (newlyWrongWord) {
      // Instantly clear the speech queue so it NEVER spams sentences ahead of time!
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      try {
        const rule = detectTajweedRule(newlyWrongWord.textUthmani);
        
        let textToSpeak = "";
        
        if (rule) {
          if (correctionVoice === 'ur-PK') {
             textToSpeak = `Yahan Tajweed dekhein, shayad aap ne ${rule} miss kiya hai.`;
          } else {
             textToSpeak = `Correction. Check your Tajweed, you might have missed the ${rule} rule here.`;
          }
        } else {
          if (correctionVoice === 'ur-PK') {
              textToSpeak = `Ghalat. Lafz ka matlab hai, ${newlyWrongWord.translation}`;
          } else {
              textToSpeak = `Correction. The word means, ${newlyWrongWord.translation}`;
          }
        }
        
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = correctionVoice;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error("Speech API error", e);
      }
    }

  }, [transcript, expectedSequence, leniency, correctionVoice]);

  return wordStates;
}
