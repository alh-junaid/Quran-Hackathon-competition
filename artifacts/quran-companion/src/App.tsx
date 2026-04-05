import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";

// Placeholders for pages we will create next
import Home from "@/pages/home";
import QuranBrowser from "@/pages/quran-browser";
import SurahReader from "@/pages/surah-reader";
import Bookmarks from "@/pages/bookmarks";
import Notes from "@/pages/notes";
import Collections from "@/pages/collections";
import CollectionDetail from "@/pages/collection-detail";
import Goals from "@/pages/goals";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/quran" component={QuranBrowser} />
        <Route path="/quran/:surahNumber" component={SurahReader} />
        <Route path="/bookmarks" component={Bookmarks} />
        <Route path="/notes" component={Notes} />
        <Route path="/collections" component={Collections} />
        <Route path="/collections/:id" component={CollectionDetail} />
        <Route path="/goals" component={Goals} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
