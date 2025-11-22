import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, TrendingUp, Users, DollarSign } from "lucide-react";

export function NewsFeedWidget() {
  const news = [
    { 
      icon: TrendingUp, 
      category: 'Performance', 
      title: 'Board pleased with recent performances',
      time: '2h ago',
      color: 'text-green-500'
    },
    { 
      icon: Users, 
      category: 'Contract', 
      title: 'De Bruyne close to contract renewal',
      time: '5h ago',
      color: 'text-blue-500'
    },
    { 
      icon: Users, 
      category: 'Youth', 
      title: 'Youth striker impressing in training',
      time: '1d ago',
      color: 'text-purple-500'
    },
    { 
      icon: DollarSign, 
      category: 'Transfer', 
      title: 'Real Madrid monitoring Haaland situation',
      time: '1d ago',
      color: 'text-orange-500'
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          News Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {news.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className={`mt-0.5 ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {item.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                  <p className="text-sm font-medium leading-tight">{item.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
