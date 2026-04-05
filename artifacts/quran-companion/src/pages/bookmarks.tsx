import { useListBookmarks, useDeleteBookmark, getListBookmarksQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2, Bookmark as BookmarkIcon, ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Bookmarks() {
  const { data: bookmarks, isLoading } = useListBookmarks();
  const deleteBookmark = useDeleteBookmark();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    deleteBookmark.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBookmarksQueryKey() });
        toast({ title: "Bookmark removed", description: "The verse has been removed from your reflections." });
      }
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-10 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <BookmarkIcon className="h-4 w-4" />
          <span>My Collection</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
          Saved Bookmarks
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Verses that resonated with you. Return here to reflect on the profound wisdom you've collected.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 w-full rounded-2xl bg-card/50" />)}
        </div>
      ) : !bookmarks || bookmarks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-12 text-center shadow-2xl backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          <BookmarkIcon className="h-16 w-16 mx-auto text-primary/30 mb-6 drop-shadow-sm" />
          <h3 className="text-2xl font-serif font-semibold text-foreground mb-3">Your Journey Begins Here</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
            You haven't saved any verses yet. Start exploring the Quran and bookmark verses that move your heart.
          </p>
          <Button asChild size="lg" className="rounded-full shadow-lg hover:shadow-primary/25 transition-all text-base px-8 h-12">
            <Link href="/quran">Explore the Quran</Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
          <AnimatePresence>
            {bookmarks.map((bookmark, index) => (
              <motion.div
                key={bookmark.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: index * 0.05 }}
              >
                <Card className="group relative h-full flex flex-col p-6 rounded-3xl border border-border/50 bg-card/60 hover:bg-card/90 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 backdrop-blur-md overflow-hidden">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl -z-10 blur-xl" />
                  
                  <div className="flex items-center justify-between border-b border-border/40 pb-5 mb-5 relative z-10">
                    <Link 
                      href={`/quran/${bookmark.surahNumber}`}
                      className="inline-flex items-center gap-2 font-medium text-primary hover:text-primary/80 transition-colors bg-primary/5 px-3 py-1.5 rounded-full"
                    >
                      <span>{bookmark.surahName}</span>
                      <span className="opacity-60 text-sm">{bookmark.surahNumber}:{bookmark.verseNumber}</span>
                      <ExternalLink className="h-3 outline-none" />
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(bookmark.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-9 w-9 transition-colors"
                      disabled={deleteBookmark.isPending}
                      aria-label="Delete bookmark"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1 flex flex-col relative z-10 space-y-6">
                    {bookmark.textUthmani && (
                      <div className="font-arabic text-3xl md:text-4xl text-right leading-[2.2] tracking-wide text-foreground drop-shadow-sm" dir="rtl">
                        {bookmark.textUthmani}
                      </div>
                    )}
                    
                    {bookmark.translation && (
                      <div className="text-muted-foreground text-lg leading-relaxed font-outfit border-l-2 border-primary/30 pl-4 py-1">
                        {bookmark.translation}
                      </div>
                    )}

                    {bookmark.note && (
                      <div className="mt-auto pt-6">
                         <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-sm text-foreground/90 leading-relaxed relative overflow-hidden backdrop-blur-sm">
                           <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 rounded-l-full" />
                           <span className="font-semibold text-primary block mb-2 opacity-80 uppercase tracking-wider text-[11px]">Your Reflection</span>
                           {bookmark.note}
                         </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
