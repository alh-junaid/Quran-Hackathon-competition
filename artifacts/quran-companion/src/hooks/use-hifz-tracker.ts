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

export function useHifzTracker(transcript: string, versesPage: any) {
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

        if (spoken === expectedNormalized || spoken.includes(expectedNormalized) || expectedNormalized.includes(spoken)) {
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
      const utterance = new SpeechSynthesisUtterance(newlyWrongWord.textUthmani);
      utterance.lang = 'ar-SA';
      window.speechSynthesis.speak(utterance);
    }

  }, [transcript, expectedSequence]);

  return wordStates;
}
