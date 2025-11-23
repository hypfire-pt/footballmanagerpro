import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Users, Activity, Heart, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SquadStatusWidget() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" />
          Squad Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">Injuries</span>
          </div>
          <span className="text-sm font-bold">3</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Suspended</span>
          </div>
          <span className="text-sm font-bold">0</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="font-medium">Avg Fitness</span>
            </div>
            <span className="font-bold">87%</span>
          </div>
          <Progress value={87} className="h-2" />
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Morale</span>
          </div>
          <span className="text-sm font-bold text-green-600">High</span>
        </div>

        <Button 
          variant="outline" 
          size="sm"
          className="w-full"
          onClick={() => navigate('/squad')}
        >
          View Squad
        </Button>
      </CardContent>
    </Card>
  );
}
