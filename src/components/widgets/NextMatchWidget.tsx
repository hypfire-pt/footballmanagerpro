import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function NextMatchWidget() {
  const navigate = useNavigate();

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <Badge variant="outline" className="border-primary/30">
          Premier League - Matchweek 21
        </Badge>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>2 days</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col items-center flex-1">
          <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mb-2">
            <span className="text-white font-bold text-xl">MC</span>
          </div>
          <span className="font-semibold">Manchester City</span>
          <span className="text-xs text-muted-foreground">Home</span>
        </div>

        <div className="flex flex-col items-center px-6">
          <span className="text-3xl font-bold text-muted-foreground">VS</span>
        </div>

        <div className="flex flex-col items-center flex-1">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-2">
            <span className="text-white font-bold text-xl">ARS</span>
          </div>
          <span className="font-semibold">Arsenal</span>
          <span className="text-xs text-muted-foreground">Away</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
        <MapPin className="h-4 w-4" />
        <span>Etihad Stadium • Sat 17 Jan, 15:00</span>
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => navigate('/squad')}
        >
          Set Team
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => navigate('/tactics')}
        >
          Tactics
        </Button>
        <Button 
          className="flex-1"
          onClick={() => navigate('/match')}
        >
          Match Preview
        </Button>
      </div>
    </Card>
  );
}
