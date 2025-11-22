import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSave } from "@/contexts/SaveContext";
import { Button } from "@/components/ui/button";
import { Trophy, Users, BarChart3, Calendar, Play, Plus } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { currentSave, allSaves, loading: saveLoading } = useSave();

  useEffect(() => {
    if (!authLoading && !saveLoading && user) {
      // If user has saves and an active save, go to dashboard
      if (currentSave) {
        navigate("/dashboard");
      } else if (allSaves.length > 0) {
        // User has saves but none active, go to career management
        navigate("/careers");
      }
      // Otherwise stay on index to show career options
    }
  }, [user, authLoading, saveLoading, currentSave, allSaves, navigate]);

  if (authLoading || saveLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is logged in and on index, show career options
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="h-16 w-16 text-primary" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Football Manager
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8">
              Choose your path to glory
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" onClick={() => navigate("/new-game")} className="text-lg px-8">
                <Plus className="h-5 w-5 mr-2" />
                New Career
              </Button>
              {allSaves.length > 0 && (
                <Button size="lg" variant="outline" onClick={() => navigate("/careers")} className="text-lg px-8">
                  <Play className="h-5 w-5 mr-2" />
                  Load Career ({allSaves.length})
                </Button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-card border border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-colors">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Build Your Squad</h3>
              <p className="text-sm text-muted-foreground">
                Scout and sign the best players from Europe's top leagues
              </p>
            </div>

            <div className="bg-card border border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-colors">
              <BarChart3 className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Set Your Tactics</h3>
              <p className="text-sm text-muted-foreground">
                Master formations, roles, and team instructions
              </p>
            </div>

            <div className="bg-card border border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-colors">
              <Calendar className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Manage Your Season</h3>
              <p className="text-sm text-muted-foreground">
                Navigate fixtures, competitions, and transfers
              </p>
            </div>

            <div className="bg-card border border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-colors">
              <Trophy className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Win Trophies</h3>
              <p className="text-sm text-muted-foreground">
                Compete across domestic leagues and European competitions
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-16 w-16 text-primary" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Football Manager
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Build your legacy. Lead your team to glory.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
              Start Your Career
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-card border border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-colors">
            <Users className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Build Your Squad</h3>
            <p className="text-sm text-muted-foreground">
              Scout and sign the best players from Europe's top leagues
            </p>
          </div>

          <div className="bg-card border border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-colors">
            <BarChart3 className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Set Your Tactics</h3>
            <p className="text-sm text-muted-foreground">
              Master formations, roles, and team instructions
            </p>
          </div>

          <div className="bg-card border border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-colors">
            <Calendar className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Manage Your Season</h3>
            <p className="text-sm text-muted-foreground">
              Navigate fixtures, competitions, and transfers
            </p>
          </div>

          <div className="bg-card border border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-colors">
            <Trophy className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Win Trophies</h3>
            <p className="text-sm text-muted-foreground">
              Compete across domestic leagues and European competitions
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Featuring teams from Premier League, La Liga, Bundesliga, Serie A, and more
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
