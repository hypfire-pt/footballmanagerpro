import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Users, Activity, Heart, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SquadStatusWidget() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Squad Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>Injuries</span>
            </div>
            <span className="font-semibold">3 players</span>
          </div>
          <div className="text-xs text-muted-foreground pl-6">
            K. De Bruyne (2 weeks), J. Stones (1 week), K. Walker (3 days)
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span>Suspended</span>
            </div>
            <span className="font-semibold">0 players</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span>Average Fitness</span>
            </div>
            <span className="font-semibold">87%</span>
          </div>
          <Progress value={87} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-blue-500" />
              <span>Team Morale</span>
            </div>
            <span className="font-semibold text-green-600">High</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate('/squad')}
        >
          View Full Squad
        </Button>
      </CardContent>
    </Card>
  );
}
