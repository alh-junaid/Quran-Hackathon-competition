import { useListNotes, useDeleteNote, useUpdateNote, getListNotesQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, BookText, Quote, ChevronRight, PenTool } from "lucide-react";
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
        toast({ title: "Reflection removed", description: "Your journey has been updated." });
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
        toast({ title: "Reflection updated", description: "Your insights have been saved." });
      }
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-10 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center pb-8 border-b border-border/50"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mx-auto">
          <BookText className="h-4 w-4" />
          <span>Tadabbur</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
          My Journey
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your personal timeline of reflections, insights, and moments of connection with the divine words.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-8 pl-4 border-l-2 border-border/50 ml-4 md:ml-8">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full max-w-3xl rounded-3xl" />)}
        </div>
      ) : !notes || notes.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-16 text-center shadow-2xl backdrop-blur-sm max-w-3xl mx-auto"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <PenTool className="w-64 h-64" />
          </div>
          <PenTool className="h-16 w-16 mx-auto text-primary/30 mb-6 relative z-10" />
          <h3 className="text-3xl font-serif font-bold text-foreground mb-4 relative z-10">A Blank Canvas</h3>
          <p className="text-lg text-muted-foreground mx-auto mb-8 max-w-md relative z-10">
            You haven't recorded any reflections yet. Dive into a Surah and write your first observation to start your timeline.
          </p>
          <Button asChild size="lg" className="rounded-full shadow-lg hover:shadow-primary/25 px-8 relative z-10">
            <Link href="/quran">Read Quran</Link>
          </Button>
        </motion.div>
      ) : (
        <div className="relative wrap overflow-hidden p-4 md:p-8 h-full">
          <div className="border-2-2 absolute border-opacity-20 border-primary h-full border left-8 md:left-1/2 rounded-full hidden md:block"></div>
          <div className="absolute h-full w-[2px] bg-gradient-to-b from-primary/50 via-primary/20 to-transparent left-6 md:hidden rounded-full"></div>
          
          <AnimatePresence>
            {notes.map((note, index) => {
              const dateObj = new Date(note.updatedAt);
              const day = format(dateObj, 'dd');
              const month = format(dateObj, 'MMM');
              const year = format(dateObj, 'yyyy');
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`mb-12 flex justify-between items-center w-full ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="order-1 md:w-5/12 hidden md:block"></div>
                  
                  {/* Timeline Node */}
                  <div className="z-20 flex items-center order-1 w-12 h-12 rounded-full absolute left-0 md:relative md:left-auto md:mx-auto bg-primary shadow-lg shadow-primary/30 ring-4 ring-background border-2 border-primary/20 shrink-0">
                    <Quote className="h-5 w-5 mx-auto text-primary-foreground drop-shadow-md" />
                  </div>
                  
                  {/* Content Card */}
                  <div className="order-1 rounded-3xl w-full pl-16 md:pl-0 md:w-5/12 ml-4 md:ml-0 overflow-hidden relative">
                    <Card className={`h-full border-border/50 bg-card/60 hover:bg-card/90 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 backdrop-blur-md overflow-hidden relative group`}>
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="p-6 md:p-8 flex flex-col gap-5 relative z-10">
                        <div className="flex items-center justify-between">
                          <Link 
                            href={`/quran/${note.surahNumber}`}
                            className="inline-flex items-center gap-2 font-medium text-primary hover:text-primary/80 transition-colors bg-primary/5 px-4 py-1.5 rounded-full"
                          >
                            <span>{note.surahName}</span>
                            <span className="opacity-60 text-sm font-mono border-l border-primary/20 pl-2 ml-1">{note.surahNumber}:{note.verseNumber}</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>

                          <div className="text-right">
                             <div className="text-2xl font-bold font-serif text-foreground leading-none">{day}</div>
                             <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{month} {year}</div>
                          </div>
                        </div>

                        <div className="relative py-2">
                           <div className="absolute -left-2 top-0 text-primary/10 text-6xl font-serif pointer-events-none p-0 leading-none">"</div>
                           <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed font-outfit text-lg pl-3 relative z-10">
                             {note.content}
                           </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 mt-2 pt-4 border-t border-border/30 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-8 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                            onClick={() => setEditingNote({ id: note.id, content: note.content })}
                          >
                            <Edit className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(note.id)}
                            className="h-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors text-xs"
                            disabled={deleteNote.isPending}
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent className="rounded-3xl p-0 overflow-hidden border-border/50 bg-card/95 backdrop-blur-xl">
          <div className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-b border-border/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" /> Edit Reflection
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 pt-4">
            <Textarea 
              value={editingNote?.content || ""}
              onChange={(e) => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
              className="min-h-[200px] text-lg leading-relaxed rounded-2xl bg-muted/30 focus-visible:ring-primary/40 focus-visible:bg-background transition-all resize-none"
              placeholder="What are your thoughts on these divine words?"
            />
          </div>
          <DialogFooter className="p-6 bg-muted/20 border-t border-border/30 gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="ghost" className="rounded-xl">Discard Changes</Button>
            </DialogClose>
            <Button 
              onClick={handleUpdate} 
              disabled={updateNote.isPending || !editingNote?.content.trim()}
              className="rounded-xl shadow-md px-6"
            >
              Update Journey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
