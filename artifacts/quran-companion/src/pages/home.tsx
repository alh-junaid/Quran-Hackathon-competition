import { 
  useGetDashboardSummary, 
  useGetRandomVerse, 
  useGetStreak 
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Target, Bookmark, BookText, Library, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: verse, isLoading: loadingVerse } = useGetRandomVerse();
  const { data: streak, isLoading: loadingStreak } = useGetStreak();
  const verseSurahNum = verse?.verseKey ? Number(verse.verseKey.split(":")[0]) : 1;

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
                Verse of the Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingVerse ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-3/4 ml-auto" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : verse ? (
                <div className="space-y-6">
                  <div className="font-arabic text-3xl md:text-4xl leading-loose text-right text-foreground py-4" dir="rtl">
                    {verse.textUthmani}
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-lg italic">
                      "{verse.translation}"
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-primary">
                        {verse.verseKey}
                      </p>
                      <Link 
                        href={`/quran/${verseSurahNum}`}
                        className="text-sm font-medium text-primary flex items-center gap-1 hover:underline"
                        data-testid="link-read-surah"
                      >
                        Read Surah <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Could not load verse.</p>
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
                    <p className="text-3xl font-bold">{streak?.currentStreak || 0}</p>
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
