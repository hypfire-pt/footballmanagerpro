import Header from "@/components/Header";
import MatchCard from "@/components/MatchCard";
import { mockMatches } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Trophy, TrendingUp, Users, DollarSign } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      label: "League Position",
      value: "3rd",
      icon: Trophy,
      color: "text-pitch-green",
    },
    {
      label: "Points",
      value: "63",
      icon: TrendingUp,
      color: "text-blue-500",
    },
    {
      label: "Squad Size",
      value: "25",
      icon: Users,
      color: "text-purple-500",
    },
    {
      label: "Budget",
      value: "£45M",
      icon: DollarSign,
      color: "text-stat-gold",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, Manager! Here's your team overview.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
              </Card>
            );
          })}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Fixtures</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
