import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Squad from "./pages/Squad";
import SquadPage from "./pages/SquadPage";
import Tactics from "./pages/Tactics";
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
import MatchSimulation from "./pages/MatchSimulation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/squad" element={<SquadPage />} />
          <Route path="/squad-old" element={<Squad />} />
          <Route path="/tactics" element={<TacticsPage />} />
          <Route path="/tactics-old" element={<Tactics />} />
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
          <Route path="/match" element={<MatchSimulation />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
