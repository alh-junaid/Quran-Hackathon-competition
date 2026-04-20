import {
  getGetDashboardSummaryQueryKey,
  getGetStreakQueryKey,
  useGetDashboardSummary,
  useGetStreak,
  useLogReadingSession,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Flame,
  Target,
  Bookmark,
  BookText,
  Library,
  CheckCircle2,
  CalendarCheck,
  Clock3,
  Brain,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AudioPlayer } from "@/components/audio-player";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type PlanFocus = "read" | "memorize" | "reflect";

interface ChallengeVerse {
  id: number;
  verseKey: string;
  textUthmani: string;
  translation: string;
  audioUrl?: string;
}

function getReflectionPrompt(verseKey?: string): string {
  const prompts = [
    "What action can I take today based on this verse?",
    "Which word in this ayah stayed with me and why?",
    "How does this verse change how I treat people today?",
    "What habit can I improve this week because of this verse?",
    "How can I turn this meaning into a dua right now?",
  ];

  if (!verseKey) {
    return prompts[0];
  }

  const hash = Array.from(verseKey).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return prompts[hash % prompts.length];
}

function buildDailyPlan(minutes: number, focus: PlanFocus, versesTarget: number): string[] {
  if (focus === "memorize") {
    if (minutes <= 5) {
      return [
        "Listen to one short passage twice with focus.",
        "Recite one verse from memory and check accuracy.",
        "Repeat one difficult phrase five times slowly.",
      ];
    }

    if (minutes <= 10) {
      return [
        "Warm up with audio for two verses.",
        "Memorize one new verse and review one older verse.",
        "Close with one complete recitation without looking.",
      ];
    }

    return [
      "Review two previously memorized verses.",
      "Memorize one to two new verses in chunks.",
      "Recite the full set three times with meaning in mind.",
    ];
  }

  if (focus === "reflect") {
    if (minutes <= 5) {
      return [
        "Read one verse with translation.",
        "Write one reflection sentence.",
        "End with one short dua from what you learned.",
      ];
    }

    if (minutes <= 10) {
      return [
        "Read two to three verses with translation.",
        "Capture one lesson in your notes.",
        "Choose one behavior change for today.",
      ];
    }

    return [
      "Read a short passage and translation carefully.",
      "Create or update one thematic collection.",
      "Write one practical action and one dua.",
    ];
  }

  if (minutes <= 5) {
    return [
      `Read at least ${Math.max(1, Math.floor(versesTarget / 2))} verses with attention.`,
      "Save one bookmark for your next session.",
      "Complete the daily challenge to protect your streak.",
    ];
  }

  if (minutes <= 10) {
    return [
      `Read ${Math.max(versesTarget, 3)} verses and review translation.`,
      "Listen to audio for one selected verse.",
      "Add one note about what stood out.",
    ];
  }

  return [
    `Read ${Math.max(versesTarget + 2, 5)} verses with translation.`,
    "Re-listen and recite at least two verses out loud.",
    "Add one note and one bookmark before ending.",
  ];
}

export default function Home() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: streak, isLoading: loadingStreak } = useGetStreak();
  const [availableMinutes, setAvailableMinutes] = useState<5 | 10 | 20>(10);
  const [planFocus, setPlanFocus] = useState<PlanFocus>("read");

  const {
    data: challengeVerses,
    isLoading: loadingChallenge,
    isError: challengeError,
    refetch: refetchChallenge,
  } = useQuery({
    queryKey: ["daily-challenge"],
    queryFn: async () => {
      const res = await fetch("/api/quran/daily-challenge");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json().then((d) => d.verses as ChallengeVerse[]);
    },
  });

  const [completed, setCompleted] = useState(false);
  const completeChallenge = useLogReadingSession({
    mutation: {
      onSuccess: () => {
        setCompleted(true);
        void queryClient.invalidateQueries({ queryKey: getGetStreakQueryKey() });
        void queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        void queryClient.invalidateQueries({ queryKey: ["daily-challenge"] });
        toast({
          title: "Habit recorded",
          description: "Your reading session was saved and your streak refreshed.",
        });
      },
      onError: () => {
        toast({
          title: "Could not save completion",
          description: "Try again in a moment. The app is still usable for reading.",
          variant: "destructive",
        });
      },
    },
  });

  const handleCompleteChallenge = () => {
    completeChallenge.mutate({
      data: {
        versesRead: challengeVerses?.length || 1,
      },
    });
  };

  const displayStreak = streak?.currentStreak || 0;
  const dailyTarget = summary?.dailyVerseTarget || 5;
  const weeklyTarget = dailyTarget * 7;
  const recentWeek = (streak?.recentDays ?? []).slice(-7);
  const weeklyVersesRead = recentWeek.reduce((acc, day) => acc + day.versesRead, 0);
  const weeklyActiveDays = recentWeek.filter((day) => day.read).length;
  const weeklyProgress = weeklyTarget > 0 ? Math.min(100, Math.round((weeklyVersesRead / weeklyTarget) * 100)) : 0;
  const smartPlanSteps = buildDailyPlan(availableMinutes, planFocus, dailyTarget);
  const reflectionPrompt = getReflectionPrompt(challengeVerses?.[0]?.verseKey);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">As-salamu alaykum</h1>
        <p className="text-muted-foreground">Continue your journey with the Quran today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              ) : challengeError ? (
                <div className="space-y-4 rounded-xl border border-dashed border-border p-4">
                  <p className="text-sm text-muted-foreground">Could not load today&apos;s verses.</p>
                  <Button variant="outline" size="sm" onClick={() => void refetchChallenge()}>
                    Retry
                  </Button>
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

                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Sparkles className="h-4 w-4" />
                      <p className="text-sm font-semibold">Today&apos;s Reflection Prompt</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{reflectionPrompt}</p>
                  </div>

                  <AnimatePresence>
                    {!completed ? (
                      <motion.div exit={{ opacity: 0, scale: 0.9 }}>
                        <Button
                          onClick={handleCompleteChallenge}
                          disabled={completeChallenge.isPending}
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
                        Habit Completed! Streak updated.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-primary" />
                Smart Daily Plan
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Personalized plan based on your available time and learning focus.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-medium">Available Time</p>
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 20].map((minutes) => (
                    <Button
                      key={minutes}
                      variant={availableMinutes === minutes ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAvailableMinutes(minutes as 5 | 10 | 20)}
                    >
                      {minutes} min
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Focus Mode</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "read", label: "Read" },
                    { key: "memorize", label: "Memorize" },
                    { key: "reflect", label: "Reflect" },
                  ].map((focus) => (
                    <Button
                      key={focus.key}
                      variant={planFocus === focus.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPlanFocus(focus.key as PlanFocus)}
                    >
                      {focus.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  Suggested Session Plan
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {smartPlanSteps.map((step, index) => (
                    <li key={step} className="flex gap-2">
                      <span className="text-primary font-medium">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-primary" />
                Weekly Progress Summary
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Last 7 days of consistency compared to your daily target.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Verses (7d)</p>
                  <p className="text-xl font-semibold">{weeklyVersesRead}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Active Days</p>
                  <p className="text-xl font-semibold">{weeklyActiveDays}/7</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Target (7d)</p>
                  <p className="text-xl font-semibold">{weeklyTarget}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Target Progress</p>
                  <p className="text-sm font-semibold">{weeklyProgress}%</p>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${weeklyProgress}%` }}
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {weeklyProgress >= 100
                  ? "Excellent consistency this week. Keep your momentum alive."
                  : weeklyProgress >= 60
                    ? "Strong progress. A few more sessions will complete your weekly goal."
                    : "You are building momentum. Short daily sessions can quickly increase consistency."}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}