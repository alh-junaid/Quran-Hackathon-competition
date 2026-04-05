import { 
  useGetDashboardSummary, 
  useGetStreak 
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Target, Bookmark, BookText, Library, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AudioPlayer } from "@/components/audio-player";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
  const queryClient = useQueryClient();
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  
  // Custom Hackathon Integration
  const { data: challengeVerses, isLoading: loadingChallenge } = useQuery({
    queryKey: ['daily-challenge'],
    queryFn: async () => {
      const res = await fetch('/api/quran/daily-challenge');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json().then(d => d.verses as any[]);
    }
  });
  
  const [completed, setCompleted] = useState(false);
  const completeChallenge = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/user/streak/increment', { method: 'POST' });
      return res.json();
    },
    onSuccess: () => {
      setCompleted(true);
      queryClient.invalidateQueries({ queryKey: ['getStreak'] });
    }
  });

  const { data: streak, isLoading: loadingStreak } = useGetStreak();
  // Override visual streak if just completed
  const displayStreak = completed ? (streak?.currentStreak || 0) + 1 : (streak?.currentStreak || 0);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">As-salamu alaykum</h1>
        <p className="text-muted-foreground">Continue your journey with the Quran today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Verse of the Day */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2"
        >
          <Card className="h-full bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-primary flex items-center gap-2">
                <BookText className="h-5 w-5" />
                Daily Micro-Habit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingChallenge ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : challengeVerses && challengeVerses.length > 0 ? (
                <div className="space-y-6">
                  {challengeVerses.map((verse, idx) => (
                    <motion.div 
                      key={verse.id} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: idx * 0.1 }}
                      className="border-b border-border/50 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between items-start mb-2">
                         {verse.audioUrl && <AudioPlayer src={verse.audioUrl} />}
                         <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">{verse.verseKey}</span>
                      </div>
                      <div className="font-arabic text-2xl md:text-3xl leading-loose text-right" dir="rtl">
                        {verse.textUthmani}
                      </div>
                      <p className="text-muted-foreground mt-2 text-sm italic">"{verse.translation}"</p>
                    </motion.div>
                  ))}
                  
                  <AnimatePresence>
                    {!completed ? (
                      <motion.div exit={{ opacity: 0, scale: 0.9 }}>
                        <Button 
                          onClick={() => completeChallenge.mutate()} 
                          className="w-full font-bold group mt-4 h-12"
                          size="lg"
                        >
                          <CheckCircle2 className="mr-2 h-5 w-5 group-hover:text-green-400 transition-colors" />
                          Complete Daily Challenge
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 p-4 rounded-lg flex items-center justify-center font-bold"
                      >
                        <Flame className="mr-2 h-5 w-5 animate-pulse" />
                        Habit Completed! Streak increased.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <p className="text-muted-foreground">Could not load verses.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Streak & Goal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-6"
        >
          <Card>
            <CardContent className="pt-6">
              {loadingStreak ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Flame className="h-7 w-7 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{displayStreak}</p>
                    <p className="text-sm text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span className="text-sm">Verses Read</span>
                    </div>
                    <span className="font-medium">{summary?.totalVersesRead || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Bookmark className="h-4 w-4" />
                      <span className="text-sm">Bookmarks</span>
                    </div>
                    <span className="font-medium">{summary?.totalBookmarks || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Library className="h-4 w-4" />
                      <span className="text-sm">Collections</span>
                    </div>
                    <span className="font-medium">{summary?.totalCollections || 0}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
