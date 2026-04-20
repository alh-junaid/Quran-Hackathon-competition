import { useParams, Link, useLocation } from "wouter";
import { useGetCollection, useDeleteCollection, useRemoveVerseFromCollection, getListCollectionsQueryKey, getGetCollectionQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronLeft, Trash } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format, isValid } from "date-fns";

export default function CollectionDetail() {
  const params = useParams();
  const collectionId = parseInt(params.id || "0");
  const [, setLocation] = useLocation();
  
  const { data: collection, isLoading } = useGetCollection(collectionId, { query: { enabled: !!collectionId, queryKey: getGetCollectionQueryKey(collectionId) } });
  const deleteCollection = useDeleteCollection();
  const removeVerse = useRemoveVerseFromCollection();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDeleteCollection = () => {
    deleteCollection.mutate({ id: collectionId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCollectionsQueryKey() });
        toast({ title: "Collection deleted" });
        setLocation("/collections");
      }
    });
  };

  const handleRemoveVerse = (verseKey: string) => {
    removeVerse.mutate({ id: collectionId, verseKey }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCollectionQueryKey(collectionId) });
        queryClient.invalidateQueries({ queryKey: getListCollectionsQueryKey() });
        toast({ title: "Verse removed" });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-4xl space-y-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!collection) return <div className="p-8 text-center">Collection not found</div>;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl space-y-8">
      <Link href="/collections" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Collections
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">{collection.name}</h1>
          {collection.description && <p className="text-muted-foreground mt-2">{collection.description}</p>}
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" data-testid="button-delete-collection">
              <Trash className="h-4 w-4 mr-2" /> Delete Collection
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the collection and remove all verses from it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteCollection} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="space-y-6">
        {collection.verses?.length === 0 ? (
          <Card className="p-12 text-center border-dashed bg-card/50">
            <p className="text-muted-foreground">This collection is empty. Add verses while reading the Quran.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/quran">Browse Quran</Link>
            </Button>
          </Card>
        ) : (
          collection.verses?.map((verse) => (
            <Card key={verse.id} className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <Link 
                    href={`/quran/${verse.surahNumber}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {verse.surahName} {verse.surahNumber}:{verse.verseNumber}
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveVerse(verse.verseKey)}
                    className="text-muted-foreground hover:text-destructive"
                    disabled={removeVerse.isPending}
                    data-testid={`button-remove-verse-${verse.verseKey}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {verse.textUthmani && (
                  <div className="font-arabic text-3xl text-right leading-loose" dir="rtl">
                    {verse.textUthmani}
                  </div>
                )}
                {verse.translation && (
                  <div className="text-muted-foreground text-lg">
                    {verse.translation}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-2 text-right">
                  Added on {verse.addedAt && isValid(new Date(verse.addedAt)) ? format(new Date(verse.addedAt), "MMM d, yyyy") : "Unknown date"}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
