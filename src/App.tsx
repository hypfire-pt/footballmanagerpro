import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SeasonProvider } from "@/contexts/SeasonContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SaveProvider } from "@/contexts/SaveContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect } from "react";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import NewGamePage from "./pages/NewGamePage";
import CareerManagementPage from "./pages/CareerManagementPage";
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
            <AuthProvider>
              <SaveProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/new-game" element={<ProtectedRoute><NewGamePage /></ProtectedRoute>} />
                  <Route path="/careers" element={<ProtectedRoute><CareerManagementPage /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/squad" element={<ProtectedRoute><SquadPage /></ProtectedRoute>} />
                <Route path="/tactics" element={<ProtectedRoute><TacticsPage /></ProtectedRoute>} />
                <Route path="/transfers" element={<ProtectedRoute><TransfersPage /></ProtectedRoute>} />
                <Route path="/club" element={<ProtectedRoute><ClubPage /></ProtectedRoute>} />
                <Route path="/finances" element={<ProtectedRoute><FinancesPage /></ProtectedRoute>} />
                <Route path="/competitions" element={<ProtectedRoute><CompetitionsPage /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                <Route path="/world" element={<ProtectedRoute><WorldPage /></ProtectedRoute>} />
                <Route path="/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
                <Route path="/options" element={<ProtectedRoute><OptionsPage /></ProtectedRoute>} />
                <Route path="/league" element={<ProtectedRoute><League /></ProtectedRoute>} />
                <Route path="/match" element={<ProtectedRoute><PlayMatch /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </SaveProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </SeasonProvider>
    </QueryClientProvider>
  );
};

export default App;
