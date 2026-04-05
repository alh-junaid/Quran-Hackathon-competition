import { useState } from "react";
import { useGetGoal, useUpsertGoal, useGetStreak, getGetGoalQueryKey, getGetStreakQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flame, Target, Trophy, Calendar as CalendarIcon, CheckCircle2, BookOpen } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, isSameDay } from "date-fns";
import { motion } from "framer-motion";

export default function Goals() {
  const { data: goal, isLoading: loadingGoal } = useGetGoal();
  const { data: streak, isLoading: loadingStreak } = useGetStreak();
  const upsertGoal = useUpsertGoal();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [target, setTarget] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveGoal = () => {
    const val = parseInt(target);
    if (isNaN(val) || val <= 0) return;

    upsertGoal.mutate({
      data: { dailyVerseTarget: val }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetGoalQueryKey() });
        setIsEditing(false);
        toast({ title: "Goal updated" });
      }
    });
  };

  const startEditing = () => {
    setTarget(goal?.dailyVerseTarget?.toString() || "10");
    setIsEditing(true);
  };

  // Generate last 30 days calendar
  const today = new Date();
  const last30Days = Array.from({ length: 30 }, (_, i) => subDays(today, 29 - i));

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold text-foreground">Goals & Progress</h1>
        <p className="text-muted-foreground">Track your journey with the Quran.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Streak Card */}
        <Card className="md:col-span-2 bg-gradient-to-br from-card to-card border-primary/20 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-orange-500/5 rotate-12">
            <Flame className="w-64 h-64" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStreak ? (
              <Skeleton className="h-20 w-32" />
            ) : (
              <div className="flex items-baseline gap-4">
                <div className="text-6xl font-bold tracking-tighter text-foreground">
                  {streak?.currentStreak || 0}
                </div>
                <div className="text-xl text-muted-foreground font-medium">Days</div>
              </div>
            )}
            <div className="mt-8">
              <p className="text-sm font-medium mb-3">Last 30 Days</p>
              <div className="flex flex-wrap gap-2">
                {last30Days.map((date, i) => {
                  const dayData = streak?.recentDays.find(d => isSameDay(new Date(d.date), date));
                  const isRead = dayData?.read;
                  return (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.01 }}
                      key={date.toISOString()}
                      className={`w-6 h-6 rounded-sm flex items-center justify-center text-[10px]
                        ${isRead 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground/30'
                        }`}
                      title={`${format(date, 'MMM d')}: ${isRead ? dayData.versesRead + ' verses' : 'No reading'}`}
                    >
                      {isRead ? <CheckCircle2 className="h-4 w-4" /> : null}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Goal Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Daily Goal
            </CardTitle>
            <CardDescription>Verses to read per day</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingGoal ? (
              <Skeleton className="h-16 w-full" />
            ) : isEditing ? (
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  value={target} 
                  onChange={e => setTarget(e.target.value)}
                  min="1"
                  className="w-24 text-center text-lg font-bold"
                  data-testid="input-goal-target"
                />
                <Button onClick={handleSaveGoal} disabled={upsertGoal.isPending} data-testid="button-save-goal">Save</Button>
                <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 bg-primary/5 rounded-xl border border-primary/10">
                <div className="text-4xl font-bold text-primary mb-1">{goal?.dailyVerseTarget || 10}</div>
                <div className="text-sm text-muted-foreground mb-4">verses / day</div>
                <Button variant="outline" size="sm" onClick={startEditing} data-testid="button-edit-goal">
                  Change Goal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All-time Stats */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-secondary" />
              All-Time Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingGoal ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border rounded-xl p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{goal?.totalVersesRead || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Verses Read</div>
                </div>
                <div className="bg-card border rounded-xl p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                    <Flame className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{streak?.longestStreak || 0}</div>
                  <div className="text-sm text-muted-foreground">Longest Streak (Days)</div>
                </div>
                <div className="bg-card border rounded-xl p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <CalendarIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{streak?.totalDaysRead || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Active Days</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
