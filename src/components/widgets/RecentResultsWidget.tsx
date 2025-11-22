import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

export function RecentResultsWidget() {
  const results = [
    { date: '13 Jan', competition: 'PL', home: 'Man City', away: 'Newcastle', score: '2-1', result: 'W' },
    { date: '10 Jan', competition: 'PL', home: 'Liverpool', away: 'Man City', score: '1-1', result: 'D' },
    { date: '07 Jan', competition: 'FA', home: 'Man City', away: 'Chelsea', score: '3-0', result: 'W' },
    { date: '03 Jan', competition: 'PL', home: 'Brighton', away: 'Man City', score: '1-2', result: 'W' },
    { date: '31 Dec', competition: 'PL', home: 'Man City', away: 'Spurs', score: '0-1', result: 'L' },
  ];

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'W': return <Badge className="bg-green-500 hover:bg-green-600">W</Badge>;
      case 'D': return <Badge className="bg-yellow-500 hover:bg-yellow-600">D</Badge>;
      case 'L': return <Badge className="bg-red-500 hover:bg-red-600">L</Badge>;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {results.map((match, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="text-xs text-muted-foreground w-12">{match.date}</div>
                <Badge variant="outline" className="text-xs w-8 justify-center">
                  {match.competition}
                </Badge>
                <div className="flex-1 text-sm">
                  <span className={match.home === 'Man City' ? 'font-semibold' : ''}>
                    {match.home}
                  </span>
                  {' '}
                  <span className="text-muted-foreground text-xs">{match.score}</span>
                  {' '}
                  <span className={match.away === 'Man City' ? 'font-semibold' : ''}>
                    {match.away}
                  </span>
                </div>
              </div>
              {getResultBadge(match.result)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
