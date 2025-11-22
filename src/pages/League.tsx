import Header from "@/components/Header";
import LeagueTable from "@/components/LeagueTable";
import { mockStandings } from "@/data/mockData";

const League = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Premier League</h1>
          <p className="text-muted-foreground">
            2024/25 Season • Matchweek 28
          </p>
        </div>

        <LeagueTable standings={mockStandings} />

        <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-pitch-green/20 border-l-4 border-pitch-green rounded-sm" />
              <span>UEFA Champions League</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500/20 border-l-4 border-blue-500 rounded-sm" />
              <span>UEFA Europa League</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-result-loss/20 border-l-4 border-result-loss rounded-sm" />
              <span>Relegation</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default League;
