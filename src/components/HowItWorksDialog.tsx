import { HelpCircle, Users, TrendingUp, Trophy, Calendar, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function HowItWorksDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 hover:bg-primary/10">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">How it works</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            How to Play Football Manager Pro
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="getting-started">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Getting Started</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2 pl-7">
                <p><strong>1. Create Your Career:</strong> Start by creating a new career and selecting your team from top European leagues.</p>
                <p><strong>2. Build Your Squad:</strong> Navigate to the Squad page to view your players and manage your team roster.</p>
                <p><strong>3. Set Your Tactics:</strong> Go to the Tactics page to choose your formation and team instructions.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="playing-matches">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Playing Matches</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2 pl-7">
                <p><strong>Watch Live:</strong> Matches are simulated in real-time with visual pitch representation showing ball movement and player positions.</p>
                <p><strong>Half-Time Tactics:</strong> At half-time, you can make tactical adjustments and plan substitutions for the second half.</p>
                <p><strong>Make Changes:</strong> Adjust your mentality, formation, pressing intensity, and make substitutions during the match.</p>
                <p><strong>Post-Match:</strong> Review detailed statistics, player ratings, and match highlights after the final whistle.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="season-progression">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Season Progression</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2 pl-7">
                <p><strong>Match by Match:</strong> Play matches in chronological order through the season.</p>
                <p><strong>Fast Forward:</strong> Use the Continue button on the dashboard to simulate other league matches and advance to your next fixture.</p>
                <p><strong>Track Progress:</strong> Monitor your league position, form, and statistics throughout the season.</p>
                <p><strong>Matchday Results:</strong> View summaries of all league matches after each matchday completes.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="team-management">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Team Management</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2 pl-7">
                <p><strong>Squad Page:</strong> View all your players, their stats, fitness, morale, and form ratings.</p>
                <p><strong>Tactics Page:</strong> Choose formations (4-4-2, 4-3-3, etc.) and set team instructions for mentality, tempo, width, and pressing.</p>
                <p><strong>Finances:</strong> Manage your budget, track revenue and expenses, and plan for transfers.</p>
                <p><strong>Club Info:</strong> View your club's history, facilities, and reputation.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="competitions">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Competitions & Stats</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-2 pl-7">
                <p><strong>League Table:</strong> Monitor your position and track your rivals' results in the standings.</p>
                <p><strong>Player Stats:</strong> View top scorers, assist leaders, and player ratings across the league.</p>
                <p><strong>Match History:</strong> Review all completed fixtures with detailed match reports and statistics.</p>
                <p><strong>World View:</strong> Explore other leagues, competitions, and clubs around Europe.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-6">
            <p className="text-sm font-medium mb-2">💡 Pro Tip</p>
            <p className="text-sm text-muted-foreground">
              Your game auto-saves every 2 minutes, so your progress is always protected. Focus on tactics, 
              player development, and making smart decisions to climb the league table!
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-heading font-bold mb-4">Subscription Plans</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-2">FREE</div>
                <div className="text-sm text-muted-foreground mb-3">1 Week Trial</div>
                <div className="text-xs text-muted-foreground">Full access to all features</div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-2">€1.99</div>
                <div className="text-sm text-muted-foreground mb-3">1 Week</div>
                <div className="text-xs text-muted-foreground">Continue your career</div>
              </div>
              
              <div className="bg-card border border-primary/50 rounded-lg p-4 text-center relative">
                <div className="absolute -top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">Best Value</div>
                <div className="text-2xl font-bold text-primary mb-2">€4.99</div>
                <div className="text-sm text-muted-foreground mb-3">1 Month</div>
                <div className="text-xs text-muted-foreground">Save 60%</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
