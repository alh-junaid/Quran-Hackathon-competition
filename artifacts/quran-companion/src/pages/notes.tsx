import { useListNotes, useDeleteNote, useUpdateNote, getListNotesQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function Notes() {
  const { data: notes, isLoading } = useListNotes();
  const deleteNote = useDeleteNote();
  const updateNote = useUpdateNote();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editingNote, setEditingNote] = useState<{id: number, content: string} | null>(null);

  const handleDelete = (id: number) => {
    deleteNote.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
        toast({ title: "Note deleted" });
      }
    });
  };

  const handleUpdate = () => {
    if (!editingNote || !editingNote.content.trim()) return;
    updateNote.mutate({
      id: editingNote.id,
      data: { content: editingNote.content }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
        setEditingNote(null);
        toast({ title: "Note updated" });
      }
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold text-foreground">Reflections</h1>
        <p className="text-muted-foreground">Your personal notes and thoughts.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : notes?.length === 0 ? (
        <Card className="p-12 text-center border-dashed bg-card/50">
          <p className="text-muted-foreground">No notes yet. Add notes to verses while reading.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/quran">Read Quran</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notes?.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <Link 
                    href={`/quran/${note.surahNumber}`}
                    className="font-medium text-primary hover:underline text-sm"
                  >
                    {note.surahName} {note.surahNumber}:{note.verseNumber}
                  </Link>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => setEditingNote({ id: note.id, content: note.content })}
                      data-testid={`button-edit-note-${note.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(note.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      disabled={deleteNote.isPending}
                      data-testid={`button-delete-note-${note.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 whitespace-pre-wrap text-foreground">
                  {note.content}
                </div>
                <div className="mt-4 text-xs text-muted-foreground text-right border-t pt-4">
                  {format(new Date(note.updatedAt), "MMM d, yyyy")}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              value={editingNote?.content || ""}
              onChange={(e) => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
              className="min-h-[150px]"
              data-testid="input-edit-note"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleUpdate} 
              disabled={updateNote.isPending || !editingNote?.content.trim()}
              data-testid="button-save-note"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
