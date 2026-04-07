import { useParams, Link } from "wouter";
import { useGetSurahVerses, useListSurahs, useListTranslations } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { AudioPlayer } from "@/components/audio-player";
import { VerseActions } from "@/components/verse-actions";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Brain, ChevronLeft, Info, Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { Button } from "@/components/ui/button";

import { useHifzTracker } from "@/hooks/use-hifz-tracker";


const RECITERS = [
  { id: "Alafasy_128kbps", name: "Mishary Alafasy" },
  { id: "Abdurrahmaan_As-Sudais_192kbps", name: "Abdur-Rahman as-Sudais" },
  { id: "Abdul_Basit_Murattal_192kbps", name: "Abdul Baset (Murattal)" }
];

export default function SurahReader() {
  const params = useParams();
  const surahNumber = parseInt(params.surahNumber || "1");
  const [translationId, setTranslationId] = useState<number | undefined>(undefined);
  const [reciterPath, setReciterPath] = useState<string>("Alafasy_128kbps");
  const [isHifzMode, setIsHifzMode] = useState(false);
  const [showHifzResult, setShowHifzResult] = useState(false);
  const [leniency, setLeniency] = useState<'strict' | 'lenient'>('lenient');
  const [correctionVoice, setCorrectionVoice] = useState<'en-US' | 'ur-PK'>('en-US');
  
  const { isListening, transcript, startListening, stopListening, setTranscript } = useSpeechRecognition();
  
  const { data: surahs } = useListSurahs();
  const surahInfo = surahs?.find(s => s.id === surahNumber);
  
  const { data: translations } = useListTranslations();
  
  const { data: versesPage, isLoading } = useGetSurahVerses(surahNumber, { 
    perPage: 300,
    ...(translationId ? { translationId } : {})
  });
  
  const wordStates = useHifzTracker(transcript, versesPage, leniency, correctionVoice);
  
  const handleToggleHifz = (checked: boolean) => {
    setIsHifzMode(checked);
    if (!checked) {
      stopListening();
      setShowHifzResult(false);
      setTranscript("");
    }
  };
  
  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
      setShowHifzResult(true);
    } else {
      setTranscript("");
      setShowHifzResult(false);
      startListening();
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Link href="/quran" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Surahs
        </Link>
        <div className="flex border-b pb-4 lg:border-none lg:pb-0 items-center justify-end gap-4 flex-wrap">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10 transition-colors hover:bg-primary/10 cursor-help">
                  <Brain className={`h-4 w-4 ${isHifzMode ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                  <Label htmlFor="hifz-mode" className="text-sm font-medium cursor-help">Hifz Mode</Label>
                  <Switch id="hifz-mode" checked={isHifzMode} onCheckedChange={handleToggleHifz} />
                  <Info className="h-3 w-3 text-muted-foreground ml-1" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-center">
                <p>Turning on Hifz Mode blurs the Arabic text. Hover over any word to reveal it and test your memorization!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isHifzMode && (
            <div className="flex items-center gap-2">
              <Select value={leniency} onValueChange={(v: 'strict'|'lenient') => setLeniency(v)}>
                <SelectTrigger className="w-[110px] rounded-full h-8 text-xs bg-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lenient">Lenient</SelectItem>
                  <SelectItem value="strict">Strict</SelectItem>
                </SelectContent>
              </Select>
              <Select value={correctionVoice} onValueChange={(v: 'en-US'|'ur-PK') => setCorrectionVoice(v)}>
                <SelectTrigger className="w-[120px] rounded-full h-8 text-xs bg-primary/10 text-primary border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">Voice: English</SelectItem>
                  <SelectItem value="ur-PK">Voice: Urdu</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={isListening ? "destructive" : "outline"}
                size="sm"
                onClick={handleToggleListening}
                className="rounded-full shadow-sm gap-2"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isListening ? "Stop Auto-Check" : (transcript ? "Restart Checking" : "Start Reciting")}
              </Button>
            </div>
          )}

          <Select value={reciterPath} onValueChange={setReciterPath}>
            <SelectTrigger className="w-[180px] rounded-full">
              <SelectValue placeholder="Select Reciter" />
            </SelectTrigger>
            <SelectContent>
              {RECITERS.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={translationId?.toString()} 
            onValueChange={(val) => setTranslationId(parseInt(val))}
          >
            <SelectTrigger className="w-[180px] rounded-full" data-testid="select-translation">
              <SelectValue placeholder="Translation" />
            </SelectTrigger>
            <SelectContent>
              {translations?.map(t => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  {t.name} ({t.languageName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {surahInfo ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 px-4 rounded-3xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/10 space-y-6"
        >
          <h1 className="text-5xl md:text-7xl font-arabic text-primary" dir="rtl">{surahInfo.nameArabic}</h1>
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-bold text-foreground">{surahInfo.nameSimple}</h2>
            <p className="text-muted-foreground">{surahInfo.translatedName} • {surahInfo.revelationPlace} • {surahInfo.versesCount} verses</p>
          </div>
        </motion.div>
      ) : (
        <Skeleton className="h-[250px] w-full rounded-3xl" />
      )}

      <div className="space-y-8">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          ))
        ) : (
          versesPage?.verses.map((verse, index) => {
            // Construct the standard everyayah.com format reliably without regex issues
            let verseAudioUrl = verse.audioUrl;
            if (verseAudioUrl) {
              const [surahNum, verseNum] = verse.verseKey.split(':');
              const paddedSurah = surahNum.padStart(3, '0');
              const paddedVerse = verseNum.padStart(3, '0');
              verseAudioUrl = `https://everyayah.com/data/${reciterPath}/${paddedSurah}${paddedVerse}.mp3`;
            }

            return (
              <motion.div
                key={verse.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
              >
                <Card className="p-6 hover:border-primary/30 transition-colors">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/50 pb-4">
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                          {verse.verseNumber}
                        </span>
                        {verseAudioUrl && <AudioPlayer src={verseAudioUrl} />}
                      </div>
                      <VerseActions 
                        verseKey={verse.verseKey} 
                        surahNumber={verse.surahNumber} 
                        surahName={surahInfo?.nameSimple || ""} 
                        verseNumber={verse.verseNumber}
                        textUthmani={verse.textUthmani}
                        translation={verse.translation}
                      />
                    </div>
                    
                    <div className="font-arabic text-4xl md:text-5xl leading-loose text-right text-foreground py-4 flex flex-wrap justify-start gap-x-3 gap-y-6" dir="rtl">
                      {(verse as any).wordByWord?.length ? (
                        (verse as any).wordByWord.map((word: any) => {
                          const state = wordStates[`${verse.id}-${word.position}`];
                          
                          // Determine the visual display for the word
                          let visualClass = "";
                          if (isHifzMode) {
                              if (state === 'correct') {
                                visualClass = 'text-green-500 font-bold blur-none';
                              } else if (state === 'wrong') {
                                visualClass = 'text-red-500 font-bold blur-none';
                              } else {
                                visualClass = 'blur-[6px] hover:blur-none cursor-help opacity-90 hover:opacity-100';
                              }
                          }
                          
                          return (
                            <span 
                              key={word.position}
                              className={`transition-all duration-300 ${visualClass}`}
                              title={word.translation || ""}
                            >
                              {word.textUthmani}
                            </span>
                          );
                        })
                      ) : (
                        <span className={`transition-all duration-300 ${isHifzMode ? 'blur-[6px] hover:blur-none cursor-help' : ''}`}>
                          {verse.textUthmani}
                        </span>
                      )}
                    </div>
                    
                    {verse.translation && (
                      <div className="text-lg text-muted-foreground leading-relaxed font-outfit border-l-2 border-primary/20 pl-4 py-1">
                        {verse.translation}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
