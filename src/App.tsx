import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SeasonProvider } from "@/contexts/SeasonContext";
import { useEffect } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import SquadPage from "./pages/SquadPage";
import TacticsPage from "./pages/TacticsPage";
import TransfersPage from "./pages/TransfersPage";
import ClubPage from "./pages/ClubPage";
import FinancesPage from "./pages/FinancesPage";
import CompetitionsPage from "./pages/CompetitionsPage";
import CalendarPage from "./pages/CalendarPage";
import WorldPage from "./pages/WorldPage";
import InboxPage from "./pages/InboxPage";
import SearchPage from "./pages/SearchPage";
import OptionsPage from "./pages/OptionsPage";
import League from "./pages/League";
import PlayMatch from "./pages/PlayMatch";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Apply dark mode by default for black & blue theme
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SeasonProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/squad" element={<SquadPage />} />
            <Route path="/tactics" element={<TacticsPage />} />
            <Route path="/transfers" element={<TransfersPage />} />
            <Route path="/club" element={<ClubPage />} />
            <Route path="/finances" element={<FinancesPage />} />
            <Route path="/competitions" element={<CompetitionsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/world" element={<WorldPage />} />
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/options" element={<OptionsPage />} />
            <Route path="/league" element={<League />} />
            <Route path="/match" element={<PlayMatch />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </SeasonProvider>
    </QueryClientProvider>
  );
};

export default App;
