import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";

const TacticsPage = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Tactics</h1>
        <Card className="p-6">
          <p className="text-muted-foreground">Tactical setup interface coming soon...</p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TacticsPage;
