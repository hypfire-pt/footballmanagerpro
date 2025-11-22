import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useGameFlow } from "@/contexts/GameFlowContext";
import { 
  ArrowRight, 
  Users, 
  Play, 
  Target, 
  Mail, 
  TrendingUp, 
  DollarSign,
  ChevronRight
} from "lucide-react";

const actionConfig = {
  view_squad: {
    icon: Users,
    title: "Review Your Squad",
    description: "Check player fitness, morale, and form before the next match",
    actionUrl: "/squad",
    actionLabel: "View Squad",
    color: "text-blue-500"
  },
  next_match: {
    icon: Play,
    title: "Play Next Match",
    description: "Your next fixture is ready. Set your tactics and play the match",
    actionUrl: "/calendar",
    actionLabel: "Go to Fixtures",
    color: "text-green-500"
  },
  review_tactics: {
    icon: Target,
    title: "Review Tactics",
    description: "Fine-tune your formation and team instructions",
    actionUrl: "/tactics",
    actionLabel: "Open Tactics",
    color: "text-purple-500"
  },
  check_inbox: {
    icon: Mail,
    title: "Check Your Inbox",
    description: "You have new messages and updates waiting",
    actionUrl: "/inbox",
    actionLabel: "View Messages",
    color: "text-orange-500"
  },
  manage_transfers: {
    icon: TrendingUp,
    title: "Transfer Activity",
    description: "Review transfer offers and scout new players",
    actionUrl: "/transfers",
    actionLabel: "Open Transfers",
    color: "text-yellow-500"
  },
  review_finances: {
    icon: DollarSign,
    title: "Financial Review",
    description: "Check your budget and manage club finances",
    actionUrl: "/finances",
    actionLabel: "View Finances",
    color: "text-emerald-500"
  },
  continue_season: {
    icon: ArrowRight,
    title: "Continue Season",
    description: "Everything is in order. Advance to your next fixture",
    actionUrl: "/calendar",
    actionLabel: "Continue",
    color: "text-primary"
  }
};

export const NextActionPrompt = () => {
  const navigate = useNavigate();
  const { nextAction, pendingTasks, getNextMatchPrompt } = useGameFlow();
  
  const config = actionConfig[nextAction];
  const Icon = config.icon;
  const nextMatch = getNextMatchPrompt();

  return (
    <div className="space-y-4">
      <Card className="glass gaming-card border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <Icon className={`h-5 w-5 ${config.color}`} />
              What's Next?
            </CardTitle>
            <Badge variant="outline" className="font-heading">Priority Action</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-heading font-bold mb-1">{config.title}</h3>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>

          {nextMatch && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Play className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Next Match</span>
              </div>
              <p className="text-sm font-bold">{nextMatch.title}</p>
              <p className="text-xs text-muted-foreground">{nextMatch.description}</p>
            </div>
          )}

          <Button 
            onClick={() => navigate(config.actionUrl)} 
            className="w-full gap-2 btn-glow font-heading"
          >
            {config.actionLabel}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {pendingTasks.length > 0 && (
        <Card className="glass gaming-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Mail className="h-4 w-4 text-orange-500" />
              Pending Tasks
              <Badge variant="secondary" className="ml-auto">{pendingTasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingTasks.slice(0, 3).map(task => (
              <div
                key={task.id}
                className="flex items-start justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => task.actionUrl && navigate(task.actionUrl)}
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.description}</p>
                </div>
                <Badge 
                  variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {task.priority}
                </Badge>
              </div>
            ))}
            {pendingTasks.length > 3 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => navigate('/inbox')}
              >
                View all {pendingTasks.length} tasks
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
