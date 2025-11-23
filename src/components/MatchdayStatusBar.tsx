import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MatchdayStatusBarProps {
  matchday: number;
  total: number;
  finished: number;
  scheduled: number;
  isComplete: boolean;
}

export function MatchdayStatusBar({ 
  matchday, 
  total, 
  finished, 
  scheduled, 
  isComplete 
}: MatchdayStatusBarProps) {
  const completionPercentage = total > 0 ? (finished / total) * 100 : 0;
  
  return (
    <Card className="p-4 bg-card/50 border-border/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm">Matchday {matchday} Status</h3>
          {isComplete ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Complete
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <Clock className="w-3 h-3" />
              In Progress
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span className="text-muted-foreground">{finished} Finished</span>
          </div>
          <div className="flex items-center gap-1">
            <Circle className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">{scheduled} Scheduled</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Progress value={completionPercentage} className="h-2" />
        <p className="text-xs text-muted-foreground text-center">
          {finished} / {total} matches completed ({Math.round(completionPercentage)}%)
        </p>
      </div>
    </Card>
  );
}
