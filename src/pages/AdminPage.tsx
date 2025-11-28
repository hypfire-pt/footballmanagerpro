import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const populateRealPlayers = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('populate-real-players');
      
      if (error) throw error;
      
      setResult(data);
      toast.success(`Successfully updated ${data.updated} teams with real player data!`);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to update player data');
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-heading font-bold mb-6">Admin Dashboard</h1>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Player Database Management
            </CardTitle>
            <CardDescription>
              Update all teams with official 2024-25 player rosters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">What this does:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Removes AI-generated player names like "Bukayo Foden"</li>
                <li>Replaces with real official player names (Bukayo Saka, Phil Foden, etc.)</li>
                <li>Updates rosters for Arsenal, Liverpool, Man City, Man United, Chelsea, Real Madrid, Barcelona, Bayern Munich, PSG</li>
                <li>Players will have authentic names, positions, and nationalities</li>
              </ul>
            </div>

            <Button 
              onClick={populateRealPlayers} 
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Player Database...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Update to Real Player Names
                </>
              )}
            </Button>

            {result && (
              <Alert className={result.error ? "border-destructive" : "border-primary"}>
                {result.error ? (
                  <XCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-primary" />
                )}
                <AlertDescription>
                  {result.error ? (
                    <div>
                      <strong>Error:</strong> {result.error}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div><strong>Success!</strong> {result.message}</div>
                      <div className="text-sm">
                        Updated: {result.updated} teams | Total teams: {result.totalTeams}
                      </div>
                      {result.errors && (
                        <div className="text-sm mt-2">
                          <strong>Errors:</strong>
                          <ul className="list-disc list-inside">
                            {result.errors.map((err: string, i: number) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
