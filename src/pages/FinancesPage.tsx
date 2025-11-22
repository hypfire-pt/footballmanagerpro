import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Trophy,
  Ticket,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { europeanTeams } from "@/data/teams";

const FinancesPage = () => {
  const userClub = europeanTeams.find(team => team.id === "man-city")!;
  const totalBudget = userClub.finances;

  // Financial data
  const [currentSeason] = useState({
    income: {
      ticketSales: 85000000,
      merchandising: 45000000,
      sponsorships: 120000000,
      broadcasting: 180000000,
      prizeMoney: 95000000,
      transferSales: 60000000,
      other: 15000000,
    },
    expenses: {
      playerWages: 280000000,
      staffWages: 45000000,
      transferFees: 150000000,
      agentFees: 25000000,
      facilityMaintenance: 18000000,
      youthDevelopment: 12000000,
      operations: 35000000,
      other: 10000000,
    },
    budgets: {
      transferBudget: totalBudget * 0.6,
      transferSpent: 150000000,
      wageBudget: totalBudget * 0.3,
      wageSpent: 280000000,
    }
  });

  const totalIncome = Object.values(currentSeason.income).reduce((sum, val) => sum + val, 0);
  const totalExpenses = Object.values(currentSeason.expenses).reduce((sum, val) => sum + val, 0);
  const netBalance = totalIncome - totalExpenses;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
    return `€${value}`;
  };

  const getIncomeIcon = (category: string) => {
    const icons: Record<string, any> = {
      ticketSales: Ticket,
      merchandising: ShoppingCart,
      sponsorships: Building2,
      broadcasting: TrendingUp,
      prizeMoney: Trophy,
      transferSales: Users,
      other: DollarSign,
    };
    return icons[category] || DollarSign;
  };

  const getExpenseIcon = (category: string) => {
    const icons: Record<string, any> = {
      playerWages: Users,
      staffWages: Users,
      transferFees: ShoppingCart,
      agentFees: DollarSign,
      facilityMaintenance: Building2,
      youthDevelopment: Trophy,
      operations: Building2,
      other: DollarSign,
    };
    return icons[category] || DollarSign;
  };

  const getCategoryLabel = (key: string) => {
    const labels: Record<string, string> = {
      ticketSales: "Ticket Sales",
      merchandising: "Merchandising",
      sponsorships: "Sponsorships",
      broadcasting: "Broadcasting Rights",
      prizeMoney: "Prize Money",
      transferSales: "Transfer Sales",
      playerWages: "Player Wages",
      staffWages: "Staff Wages",
      transferFees: "Transfer Fees",
      agentFees: "Agent Fees",
      facilityMaintenance: "Facility Maintenance",
      youthDevelopment: "Youth Development",
      operations: "Operations",
      other: "Other",
    };
    return labels[key] || key;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Financial Management</h1>
            <p className="text-muted-foreground">Monitor club finances and budget allocation</p>
          </div>
          <Badge 
            variant={netBalance >= 0 ? "secondary" : "destructive"}
            className="text-lg px-4 py-2"
          >
            {netBalance >= 0 ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2" />
            )}
            {netBalance >= 0 ? "Profit" : "Loss"}: {formatCurrency(Math.abs(netBalance))}
          </Badge>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                  <p className="text-3xl font-bold text-green-500">{formatCurrency(totalIncome)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Current Season</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20">
                  <ArrowUpRight className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                  <p className="text-3xl font-bold text-red-500">{formatCurrency(totalExpenses)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Current Season</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20">
                  <ArrowDownRight className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Net Balance</p>
                  <p className={`text-3xl font-bold ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(netBalance)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Current Season</p>
                </div>
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${netBalance >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {netBalance >= 0 ? (
                    <TrendingUp className={`h-6 w-6 ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Budget</CardTitle>
              <CardDescription>Available funds for player acquisitions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Allocated Budget</span>
                  <span className="font-semibold">{formatCurrency(currentSeason.budgets.transferBudget)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Spent</span>
                  <span className="font-semibold text-red-500">{formatCurrency(currentSeason.budgets.transferSpent)}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">Remaining</span>
                  <span className="font-bold text-green-500">
                    {formatCurrency(currentSeason.budgets.transferBudget - currentSeason.budgets.transferSpent)}
                  </span>
                </div>
                <Progress 
                  value={(currentSeason.budgets.transferSpent / currentSeason.budgets.transferBudget) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {((currentSeason.budgets.transferSpent / currentSeason.budgets.transferBudget) * 100).toFixed(1)}% utilized
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wage Budget</CardTitle>
              <CardDescription>Weekly wage allocation for squad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Allocated Budget</span>
                  <span className="font-semibold">{formatCurrency(currentSeason.budgets.wageBudget)}/week</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Current Wages</span>
                  <span className="font-semibold text-red-500">{formatCurrency(currentSeason.budgets.wageSpent)}/week</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">Available</span>
                  <span className="font-bold text-green-500">
                    {formatCurrency(currentSeason.budgets.wageBudget - currentSeason.budgets.wageSpent)}/week
                  </span>
                </div>
                <Progress 
                  value={(currentSeason.budgets.wageSpent / currentSeason.budgets.wageBudget) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {((currentSeason.budgets.wageSpent / currentSeason.budgets.wageBudget) * 100).toFixed(1)}% utilized
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <Tabs defaultValue="income" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="income">Income Breakdown</TabsTrigger>
            <TabsTrigger value="expenses">Expense Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Income Sources</CardTitle>
                <CardDescription>Detailed breakdown of all revenue streams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(currentSeason.income).map(([key, value]) => {
                    const Icon = getIncomeIcon(key);
                    const percentage = (value / totalIncome) * 100;
                    
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/20">
                              <Icon className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                              <p className="font-semibold">{getCategoryLabel(key)}</p>
                              <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% of total income</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-500">{formatCurrency(value)}</p>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>Detailed breakdown of all expenditures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(currentSeason.expenses).map(([key, value]) => {
                    const Icon = getExpenseIcon(key);
                    const percentage = (value / totalExpenses) * 100;
                    
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/20">
                              <Icon className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                              <p className="font-semibold">{getCategoryLabel(key)}</p>
                              <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% of total expenses</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-500">{formatCurrency(value)}</p>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Financial Health */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Health Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold">
                  {((netBalance / totalIncome) * 100).toFixed(1)}%
                </p>
                <Badge variant={netBalance >= 0 ? "secondary" : "destructive"}>
                  {netBalance >= 0 ? "Healthy" : "At Risk"}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Wage to Revenue</p>
                <p className="text-2xl font-bold">
                  {((currentSeason.expenses.playerWages / totalIncome) * 100).toFixed(1)}%
                </p>
                <Badge variant="secondary">Acceptable</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Debt Level</p>
                <p className="text-2xl font-bold">€0M</p>
                <Badge variant="secondary">Excellent</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Financial Fair Play</p>
                <p className="text-2xl font-bold">Compliant</p>
                <Badge variant="secondary">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Pass
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FinancesPage;
