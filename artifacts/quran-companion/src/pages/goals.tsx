import { useState } from "react";
import { useGetGoal, useUpsertGoal, useGetStreak, getGetGoalQueryKey, getGetStreakQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flame, Target, Trophy, Calendar as CalendarIcon, CheckCircle2, BookOpen, Star, ArrowUpRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

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
        toast({ title: "Goal updated", description: "Your daily verse target has been set successfully." });
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

  // Determine user level based on total verses
  const totalVerses = goal?.totalVersesRead || 0;
  const level = Math.floor(Math.sqrt(totalVerses / 10)) + 1;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-10 min-h-[calc(100vh-4rem)]">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Trophy className="h-4 w-4" />
          <span>Level {level} Explorer</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
          Your Progress Journey
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Visualizing your daily dedication. Every single verse is a step toward profound understanding.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {/* Streak Card */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.1 }}
           className="md:col-span-2"
        >
          <Card className="h-full bg-gradient-to-br from-orange-500/10 via-card to-card border-orange-500/20 relative overflow-hidden rounded-3xl shadow-lg backdrop-blur-md">
            <div className="absolute -right-20 -top-20 text-orange-500/10 rotate-12 pointer-events-none blur-xl">
              <Flame className="w-96 h-96" />
            </div>
            
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl font-serif">
                <div className="p-2 bg-orange-500/20 rounded-xl">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              {loadingStreak ? (
                <Skeleton className="h-24 w-40 mt-4 rounded-xl opacity-50" />
              ) : (
                <div className="flex items-baseline gap-4 mt-2">
                  <span className="text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500 drop-shadow-sm">
                    {streak?.currentStreak || 0}
                  </span>
                  <span className="text-2xl text-muted-foreground font-medium">Days</span>
                </div>
              )}
              
              <div className="mt-12 pt-6 border-t border-border/50">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">The Last 30 Days</p>
                  {streak?.currentStreak && streak.currentStreak > 0 && (
                    <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 rounded-md font-medium inline-flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" /> Active
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {last30Days.map((date, i) => {
                    const dayData = streak?.recentDays.find(d => isSameDay(new Date(d.date), date));
                    const isRead = dayData?.read;
                    return (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 + (i * 0.01) }}
                        key={date.toISOString()}
                        className={`w-7 h-7 rounded-[8px] flex items-center justify-center text-[10px] transition-all hover:scale-125 hover:z-20 shadow-sm
                          ${isRead 
                            ? 'bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-emerald-500/20' 
                            : 'bg-muted/50 border border-border/50 text-muted-foreground/30'
                          }`}
                        title={`${format(date, 'MMM d')}: ${isRead ? dayData.versesRead + ' verses' : 'No reading'}`}
                      >
                        {isRead ? <CheckCircle2 className="h-4 w-4 drop-shadow-sm" /> : null}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Goal Card */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.2 }}
        >
          <Card className="h-full rounded-3xl border border-primary/20 bg-card overflow-hidden relative shadow-lg">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Target className="w-32 h-32" />
            </div>
            
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-serif">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                Daily Target
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)] flex flex-col items-center justify-center relative z-10 p-6">
              {loadingGoal ? (
                <Skeleton className="h-32 w-full rounded-2xl opacity-50" />
              ) : isEditing ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full space-y-4"
                >
                  <Input 
                    type="number" 
                    value={target} 
                    onChange={e => setTarget(e.target.value)}
                    min="1"
                    className="h-16 text-center text-3xl font-bold bg-muted/50 rounded-2xl border-primary/30 focus-visible:ring-primary/50"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl h-11">Cancel</Button>
                    <Button onClick={handleSaveGoal} disabled={upsertGoal.isPending} className="rounded-xl h-11 shadow-md shadow-primary/20">Save</Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className="w-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl border border-primary/10 shadow-inner group"
                >
                  <div className="text-6xl font-black text-foreground mb-1 tracking-tighter group-hover:scale-105 transition-transform duration-300">
                    {goal?.dailyVerseTarget || 10}
                  </div>
                  <div className="text-sm font-medium text-primary/80 uppercase tracking-widest mb-6">Verses / Day</div>
                  <Button variant="secondary" size="sm" onClick={startEditing} className="rounded-full px-6 shadow-sm hover:shadow relative overflow-hidden group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    Adjust Target
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* All-time Stats */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="md:col-span-3 mt-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="rounded-3xl border-border/50 bg-card/60 backdrop-blur-md overflow-hidden group hover:border-primary/30 transition-colors">
               <CardContent className="p-8 flex items-center justify-between">
                 <div>
                   <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Total Verses Read</div>
                   <div className="text-4xl font-bold flex items-center gap-2">
                     {goal?.totalVersesRead || 0}
                   </div>
                 </div>
                 <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                   <BookOpen className="h-8 w-8 text-blue-500" />
                 </div>
               </CardContent>
             </Card>

             <Card className="rounded-3xl border-border/50 bg-card/60 backdrop-blur-md overflow-hidden group hover:border-orange-500/30 transition-colors">
               <CardContent className="p-8 flex items-center justify-between">
                 <div>
                   <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Longest Streak</div>
                   <div className="text-4xl font-bold flex items-baseline gap-1">
                     {streak?.longestStreak || 0} <span className="text-lg text-muted-foreground font-medium">days</span>
                   </div>
                 </div>
                 <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                   <Star className="h-8 w-8 text-orange-500" />
                 </div>
               </CardContent>
             </Card>

             <Card className="rounded-3xl border-border/50 bg-card/60 backdrop-blur-md overflow-hidden group hover:border-primary/30 transition-colors">
               <CardContent className="p-8 flex items-center justify-between">
                 <div>
                   <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Total Active Days</div>
                   <div className="text-4xl font-bold flex items-baseline gap-1">
                     {goal?.totalDaysRead || 0} <span className="text-lg text-muted-foreground font-medium">days</span>
                   </div>
                 </div>
                 <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                   <CalendarIcon className="h-8 w-8 text-primary" />
                 </div>
               </CardContent>
             </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
