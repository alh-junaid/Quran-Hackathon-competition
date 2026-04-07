import { useState } from "react";
import { useListCollections, useCreateCollection, getListCollectionsQueryKey, useSearchQuran, getSearchQuranQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Library, Sparkles, HeartHandshake, Feather, Compass, Search, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const CURATED_THEMES = [
  { id: "patience", title: "Patience & Perseverance", query: "patient", icon: HeartHandshake, color: "from-rose-500/20 to-red-600/5", border: "border-rose-500/30", text: "text-rose-600 dark:text-rose-400" },
  { id: "forgiveness", title: "Allah's Forgiveness", query: "forgive", icon: Feather, color: "from-blue-400/20 to-indigo-500/5", border: "border-blue-400/30", text: "text-blue-600 dark:text-blue-400" },
  { id: "jannah", title: "Descriptions of Paradise", query: "paradise", icon: Sparkles, color: "from-emerald-400/20 to-teal-500/5", border: "border-emerald-400/30", text: "text-emerald-600 dark:text-emerald-400" },
  { id: "guidance", title: "Seeking Guidance", query: "guide", icon: Compass, color: "from-amber-400/20 to-orange-500/5", border: "border-amber-400/30", text: "text-amber-600 dark:text-amber-400" },
];

function ThemeDialog({ theme, open, onOpenChange }: { theme: typeof CURATED_THEMES[0] | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  const queryParams = { q: theme?.query ?? "", page: 1 };
  const { data: searchResults, isLoading } = useSearchQuran(
    queryParams,
    { query: { enabled: !!theme && open, queryKey: getSearchQuranQueryKey(queryParams) } }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] bg-card/95 backdrop-blur-xl border-border/50 flex flex-col overflow-hidden p-0 rounded-3xl">
        <div className={`p-8 bg-gradient-to-br ${theme?.color} border-b ${theme?.border}`}>
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl bg-background shadow-sm ${theme?.border} border`}>
              {theme && <theme.icon className={`h-8 w-8 ${theme.text}`} />}
            </div>
            <div>
              <DialogTitle className="text-3xl font-serif font-bold text-foreground mb-2">{theme?.title}</DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                Exploring verses across the Quran related to "{theme?.query}".
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
            </div>
          ) : searchResults?.results.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No verses found for this theme.</div>
          ) : (
            <div className="space-y-6">
              {searchResults?.results.map((verse, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: idx * 0.05 }}
                  key={verse.verseKey}
                >
                  <Card className="rounded-2xl border-border/50 bg-card/50 overflow-hidden group hover:border-primary/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4 border-b border-border/40 pb-3">
                        <Link href={`/quran/${verse.verseKey.split(':')[0]}`} className="font-medium text-sm text-primary hover:underline bg-primary/5 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                          {verse.surahName} <ChevronRight className="h-3 w-3" />
                        </Link>
                        <span className="text-xs font-mono text-muted-foreground">{verse.verseKey}</span>
                      </div>
                      <div className="font-arabic text-3xl text-right leading-[2.2] text-foreground mb-4 drop-shadow-sm" dir="rtl">
                        {verse.textUthmani}
                      </div>
                      <div className="text-muted-foreground font-outfit leading-relaxed border-l-2 border-primary/20 pl-4 py-1">
                        {verse.translation}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Collections() {
  const { data: collections, isLoading } = useListCollections();
  const createCollection = useCreateCollection();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [activeTheme, setActiveTheme] = useState<typeof CURATED_THEMES[0] | null>(null);

  const handleCreate = () => {
    if (!name.trim()) return;
    createCollection.mutate({
      data: { name, description }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCollectionsQueryKey() });
        setOpen(false);
        setName("");
        setDescription("");
        toast({ title: "Collection created", description: "Your new collection is ready to store verses." });
      }
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-10 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-6"
      >
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Library className="h-4 w-4" />
            <span>Thematic Explorations</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
            Tadabbur Themes
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Dive deeply into the semantic concepts of the Quran or build your own curated lists of verses.
          </p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg hover:shadow-primary/25 h-12 px-6">
              <Plus className="mr-2 h-5 w-5" /> Create Personal
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl border-border/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">New Collection</DialogTitle>
              <DialogDescription>Create a custom folder to organize specific verses you encounter.</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Collection Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Duas of Prophets" className="rounded-xl h-11 bg-muted/50 focus-visible:ring-primary/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Description (Optional)</label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this collection about?" className="rounded-xl min-h-[100px] bg-muted/50 focus-visible:ring-primary/50" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost" className="rounded-xl">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreate} disabled={createCollection.isPending || !name.trim()} className="rounded-xl shadow-md">
                Create Collection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      <Tabs defaultValue="curated" className="w-full">
        <TabsList className="h-14 w-full justify-start rounded-full bg-muted/30 p-1 mb-8 border border-border/50 backdrop-blur-sm">
          <TabsTrigger value="curated" className="rounded-full px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all text-base">
            Curated Deep-Dives
          </TabsTrigger>
          <TabsTrigger value="personal" className="rounded-full px-8 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all text-base">
            My Collections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="curated" className="outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CURATED_THEMES.map((theme, index) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveTheme(theme)}
              >
                <Card className={`h-full p-8 cursor-pointer group rounded-3xl border ${theme.border} bg-gradient-to-br ${theme.color} hover:-translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden relative`}>
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                    <theme.icon className={`w-32 h-32 ${theme.text}`} />
                  </div>
                  <div className={`p-3 rounded-2xl bg-background/80 shadow-sm w-fit mb-6 ${theme.text}`}>
                    <theme.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-serif font-bold text-2xl mb-3 text-foreground group-hover:text-primary transition-colors">{theme.title}</h3>
                  <div className="mt-8 flex items-center font-medium text-sm group-hover:underline decoration-2 underline-offset-4 opacity-80 gap-2">
                    Start Exploring <Search className="w-4 h-4" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="personal" className="outline-none">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-3xl bg-card/50" />)}
            </div>
          ) : collections?.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-16 text-center border border-border/50 border-dashed rounded-3xl bg-card/30 backdrop-blur-sm"
            >
              <Library className="h-16 w-16 mx-auto text-muted-foreground/30 mb-6" />
              <h3 className="text-xl font-serif font-semibold text-foreground mb-2">No personal collections yet</h3>
              <p className="text-muted-foreground">Create your first collection to start organizing verses.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections?.map((collection, index) => (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/collections/${collection.id}`}>
                    <Card className="h-full p-6 hover:border-primary/50 transition-all duration-300 cursor-pointer group rounded-3xl border-border/50 bg-card/60 backdrop-blur-md hover:shadow-lg hover:-translate-y-1">
                      <div className="flex flex-col h-full">
                        <h3 className="font-serif font-bold text-xl mb-3 group-hover:text-primary transition-colors">{collection.name}</h3>
                        {collection.description && (
                          <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">{collection.description}</p>
                        )}
                        <div className="mt-auto pt-4 border-t border-border/40 flex justify-between items-center text-sm">
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                            {collection.verseCount} {collection.verseCount === 1 ? 'verse' : 'verses'}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ThemeDialog theme={activeTheme} open={!!activeTheme} onOpenChange={(open) => !open && setActiveTheme(null)} />
    </div>
  );
}
