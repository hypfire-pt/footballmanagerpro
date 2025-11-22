import { useNavigate } from "react-router-dom";
import { useSave } from "@/contexts/SaveContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Play, Trash2, Calendar, Trophy, Users } from "lucide-react";
import { format } from "date-fns";

const CareerManagementPage = () => {
  const navigate = useNavigate();
  const { allSaves, currentSave, loadSave, deleteSave, loading } = useSave();

  const handleLoadSave = async (saveId: string) => {
    await loadSave(saveId);
    navigate("/dashboard");
  };

  const handleDeleteSave = async (saveId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSave(saveId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Career Management
            </h1>
            <p className="text-muted-foreground">Select or create a career to continue</p>
          </div>
          <Button onClick={() => navigate("/new-game")} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            New Career
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading careers...</p>
          </div>
        ) : allSaves.length === 0 ? (
          <Card className="border-primary/20">
            <CardContent className="py-12 text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-2xl font-semibold mb-2">No Careers Found</h2>
              <p className="text-muted-foreground mb-6">Start your first managerial career</p>
              <Button onClick={() => navigate("/new-game")} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Career
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allSaves.map((save) => (
              <Card
                key={save.id}
                className={`border transition-all cursor-pointer hover:shadow-lg ${
                  save.id === currentSave?.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleLoadSave(save.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{save.save_name}</CardTitle>
                      <CardDescription>{save.team_name}</CardDescription>
                    </div>
                    {save.is_active && (
                      <Badge variant="default" className="ml-2">
                        Active
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Season {save.season_year}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{format(new Date(save.game_date), "MMM d, yyyy")}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last played: {format(new Date(save.updated_at), "MMM d, yyyy 'at' HH:mm")}
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-border">
                      <Button
                        onClick={() => handleLoadSave(save.id)}
                        className="flex-1"
                        variant={save.is_active ? "default" : "outline"}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {save.is_active ? "Continue" : "Load"}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Career?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{save.save_name}"? This action cannot be
                              undone and all progress will be lost.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => handleDeleteSave(save.id, e)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Career
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CareerManagementPage;
