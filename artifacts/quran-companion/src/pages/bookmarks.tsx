import { useListBookmarks, useDeleteBookmark, getListBookmarksQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
        toast({ title: "Bookmark deleted" });
      }
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold text-foreground">Bookmarks</h1>
        <p className="text-muted-foreground">Your saved verses for reflection.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : bookmarks?.length === 0 ? (
        <Card className="p-12 text-center border-dashed bg-card/50">
          <p className="text-muted-foreground">No bookmarks yet. Browse the Quran to save verses.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/quran">Read Quran</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {bookmarks?.map((bookmark, index) => (
            <motion.div
              key={bookmark.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <Link 
                      href={`/quran/${bookmark.surahNumber}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {bookmark.surahName} {bookmark.surahNumber}:{bookmark.verseNumber}
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(bookmark.id)}
                      className="text-muted-foreground hover:text-destructive"
                      disabled={deleteBookmark.isPending}
                      data-testid={`button-delete-bookmark-${bookmark.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {bookmark.textUthmani && (
                    <div className="font-arabic text-3xl text-right leading-loose" dir="rtl">
                      {bookmark.textUthmani}
                    </div>
                  )}
                  {bookmark.translation && (
                    <div className="text-muted-foreground">
                      {bookmark.translation}
                    </div>
                  )}
                  {bookmark.note && (
                    <div className="mt-4 p-4 bg-primary/5 rounded-lg text-sm text-foreground">
                      <span className="font-semibold text-primary block mb-1">Your Note:</span>
                      {bookmark.note}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
