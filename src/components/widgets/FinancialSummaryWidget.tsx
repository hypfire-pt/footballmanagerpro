import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrentSave } from "@/hooks/useCurrentSave";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export function FinancialSummaryWidget() {
  const navigate = useNavigate();
  const { currentSave } = useCurrentSave();
  const [finances, setFinances] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFinances() {
      if (!currentSave?.id) return;

      try {
        const { data, error } = await supabase
          .from('save_finances')
          .select('*')
          .eq('save_id', currentSave.id)
          .single();

        if (error) throw error;
        setFinances(data);
      } catch (err) {
        console.error('Error fetching finances:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFinances();
  }, [currentSave?.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4 text-primary" />
            Finances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!finances) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4 text-primary" />
            Finances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No financial data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="h-4 w-4 text-primary" />
          Finances
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Club Balance</p>
          <p className="text-2xl font-bold gradient-text">{formatCurrency(finances.balance)}</p>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Transfer Budget</p>
            <p className="text-sm font-bold text-green-600">{formatCurrency(finances.transfer_budget)}</p>
          </div>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Wage Budget (Weekly)</p>
            <p className="text-sm font-bold">{formatCurrency(finances.wage_budget)}</p>
          </div>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              Revenue
            </p>
            <p className="text-xs font-bold text-green-600">{formatCurrency(finances.total_revenue)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-500" />
              Expenses
            </p>
            <p className="text-xs font-bold text-red-600">{formatCurrency(finances.total_expenses)}</p>
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm"
          className="w-full"
          onClick={() => navigate('/finances')}
        >
          Financial Details
        </Button>
      </CardContent>
    </Card>
  );
}
