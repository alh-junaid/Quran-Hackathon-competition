import { useState } from "react";
import { useListCollections, useCreateCollection, getListCollectionsQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Library } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Collections() {
  const { data: collections, isLoading } = useListCollections();
  const createCollection = useCreateCollection();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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
        toast({ title: "Collection created" });
      }
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-foreground">Collections</h1>
          <p className="text-muted-foreground">Group verses by topic or theme.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-collection">
              <Plus className="mr-2 h-4 w-4" /> New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Collection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Patience, Hope" data-testid="input-collection-name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Verses about..." />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreate} disabled={createCollection.isPending || !name.trim()} data-testid="button-create-collection">
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : collections?.length === 0 ? (
        <Card className="p-12 text-center border-dashed bg-card/50">
          <Library className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No collections yet. Create one to organize verses.</p>
        </Card>
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
                <Card className="h-full p-6 hover:border-primary/50 transition-colors cursor-pointer group">
                  <div className="flex flex-col h-full">
                    <h3 className="font-serif font-bold text-xl mb-2 group-hover:text-primary transition-colors">{collection.name}</h3>
                    {collection.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{collection.description}</p>
                    )}
                    <div className="mt-auto pt-4 border-t flex justify-between items-center text-sm">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">
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
    </div>
  );
}
