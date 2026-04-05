import { useState } from "react";
import { useListSurahs } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function QuranBrowser() {
  const { data: surahs, isLoading } = useListSurahs();
  const [search, setSearch] = useState("");

  const filteredSurahs = surahs?.filter(
    s => 
      s.nameSimple.toLowerCase().includes(search.toLowerCase()) || 
      s.translatedName.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toString() === search
  );

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-serif font-bold text-foreground">The Noble Quran</h1>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by surah name or number..." 
            className="pl-10 py-6 text-lg bg-card/50 border-primary/20 focus-visible:ring-primary/30"
            data-testid="input-search-surah"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurahs?.map((surah, index) => (
            <motion.div
              key={surah.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.5) }}
            >
              <Link 
                href={`/quran/${surah.id}`}
                className="group block h-full p-4 rounded-xl border border-border bg-card hover:bg-primary/5 hover:border-primary/30 transition-all"
                data-testid={`link-surah-${surah.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                    {surah.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                      {surah.nameSimple}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {surah.translatedName}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="font-arabic text-xl text-primary mb-1">{surah.nameArabic}</div>
                    <div className="text-xs text-muted-foreground">{surah.versesCount} verses</div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          {filteredSurahs?.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No surahs found matching "{search}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
