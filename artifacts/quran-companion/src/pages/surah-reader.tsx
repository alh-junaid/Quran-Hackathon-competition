import { useParams, Link } from "wouter";
import { useGetSurahVerses, useListSurahs, useListTranslations } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { AudioPlayer } from "@/components/audio-player";
import { VerseActions } from "@/components/verse-actions";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function SurahReader() {
  const params = useParams();
  const surahNumber = parseInt(params.surahNumber || "1");
  const [translationId, setTranslationId] = useState<number | undefined>(undefined);
  
  const { data: surahs } = useListSurahs();
  const surahInfo = surahs?.find(s => s.id === surahNumber);
  
  const { data: translations } = useListTranslations();
  
  const { data: versesPage, isLoading } = useGetSurahVerses(surahNumber, { 
    perPage: 300,
    ...(translationId ? { translationId } : {})
  });

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/quran" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Surahs
        </Link>
        <Select 
          value={translationId?.toString()} 
          onValueChange={(val) => setTranslationId(parseInt(val))}
        >
          <SelectTrigger className="w-[200px]" data-testid="select-translation">
            <SelectValue placeholder="Select Translation" />
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
          versesPage?.verses.map((verse, index) => (
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
                      {verse.audioUrl && <AudioPlayer src={verse.audioUrl} />}
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
                  
                  <div className="font-arabic text-4xl md:text-5xl leading-loose text-right text-foreground py-4" dir="rtl">
                    {verse.textUthmani}
                  </div>
                  
                  {verse.translation && (
                    <div className="text-lg text-muted-foreground leading-relaxed">
                      {verse.translation}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
