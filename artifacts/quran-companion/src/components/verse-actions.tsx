import { useState } from "react";
import { useCheckBookmark, useCreateBookmark, useDeleteBookmark, useListCollections, useAddVerseToCollection, useCreateNote, getListBookmarksQueryKey, getCheckBookmarkQueryKey, getListNotesQueryKey } from "@workspace/api-client-react";
import { Bookmark, BookmarkCheck, BookText, Plus, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface VerseActionsProps {
  verseKey: string;
  surahNumber: number;
  surahName: string;
  verseNumber: number;
  textUthmani?: string | null;
  translation?: string | null;
}

export function VerseActions({ verseKey, surahNumber, surahName, verseNumber, textUthmani, translation }: VerseActionsProps) {
  const { data: bookmarkStatus, isLoading: loadingStatus } = useCheckBookmark(verseKey);
  const createBookmark = useCreateBookmark();
  const deleteBookmark = useDeleteBookmark();
  
  const { data: collections } = useListCollections();
  const addVerseToCollection = useAddVerseToCollection();
  
  const createNote = useCreateNote();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [noteContent, setNoteContent] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);

  const toggleBookmark = () => {
    if (bookmarkStatus?.bookmarked && bookmarkStatus.bookmarkId) {
      deleteBookmark.mutate({ id: bookmarkStatus.bookmarkId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getCheckBookmarkQueryKey(verseKey) });
          queryClient.invalidateQueries({ queryKey: getListBookmarksQueryKey() });
          toast({ title: "Bookmark removed" });
        }
      });
    } else {
      createBookmark.mutate({
        data: { verseKey, surahNumber, surahName, verseNumber, textUthmani, translation }
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getCheckBookmarkQueryKey(verseKey) });
          queryClient.invalidateQueries({ queryKey: getListBookmarksQueryKey() });
          toast({ title: "Verse bookmarked" });
        }
      });
    }
  };

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    createNote.mutate({
      data: { verseKey, surahNumber, surahName, verseNumber, content: noteContent }
    }, {
      onSuccess: () => {
        setNoteOpen(false);
        setNoteContent("");
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
        toast({ title: "Note added successfully" });
      }
    });
  };

  const handleAddToCollection = (collectionId: number) => {
    addVerseToCollection.mutate({
      id: collectionId,
      data: { verseKey, surahNumber, surahName, verseNumber, textUthmani, translation }
    }, {
      onSuccess: () => {
        toast({ title: "Added to collection" });
      }
    });
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleBookmark}
        disabled={loadingStatus || createBookmark.isPending || deleteBookmark.isPending}
        className={bookmarkStatus?.bookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"}
        data-testid={`button-bookmark-${verseKey}`}
      >
        {bookmarkStatus?.bookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
      </Button>

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" data-testid={`button-note-${verseKey}`}>
            <BookText className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note - {surahName} {surahNumber}:{verseNumber}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="font-arabic text-xl mb-4 text-right" dir="rtl">{textUthmani}</div>
            <Textarea 
              placeholder="Write your reflection..." 
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="min-h-[120px]"
              data-testid="input-note-content"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddNote} disabled={createNote.isPending || !noteContent.trim()} data-testid="button-save-note">
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" data-testid={`button-collection-${verseKey}`}>
            <Library className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {collections?.map(c => (
            <DropdownMenuItem key={c.id} onClick={() => handleAddToCollection(c.id)} data-testid={`menuitem-collection-${c.id}`}>
              <Plus className="mr-2 h-4 w-4" /> {c.name}
            </DropdownMenuItem>
          ))}
          {collections?.length === 0 && (
            <div className="p-2 text-sm text-muted-foreground">No collections yet</div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
