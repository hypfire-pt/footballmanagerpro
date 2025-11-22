import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LeaguePositionWidget() {
  const navigate = useNavigate();

  const form = [
    { result: 'W', score: '2-1' },
    { result: 'W', score: '3-0' },
    { result: 'D', score: '1-1' },
    { result: 'W', score: '2-0' },
    { result: 'L', score: '1-2' },
  ];

  const getResultColor = (result: string) => {
    switch (result) {
      case 'W': return 'bg-green-500';
      case 'D': return 'bg-yellow-500';
      case 'L': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          League Position
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold">1st</span>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">45 points from 20 games</p>
          </div>
          <Badge variant="default" className="h-8">
            Champions League
          </Badge>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Recent Form</p>
          <div className="flex gap-1">
            {form.map((match, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getResultColor(match.result)}`}
                >
                  {match.result}
                </div>
                <span className="text-[10px] text-muted-foreground">{match.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <p className="text-sm font-semibold">Top 4 Standings</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center py-1 bg-primary/10 px-2 rounded">
              <span className="font-medium">1. Manchester City</span>
              <span className="font-bold">45</span>
            </div>
            <div className="flex justify-between items-center py-1 px-2">
              <span>2. Liverpool</span>
              <span className="font-semibold">43</span>
            </div>
            <div className="flex justify-between items-center py-1 px-2">
              <span>3. Arsenal</span>
              <span className="font-semibold">41</span>
            </div>
            <div className="flex justify-between items-center py-1 px-2">
              <span>4. Chelsea</span>
              <span className="font-semibold">38</span>
            </div>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate('/league')}
        >
          View Full Table
        </Button>
      </CardContent>
    </Card>
  );
}
