import { Stats } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Target, TrendingUp, Skull } from "lucide-react";

export function StatsGrid({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card className="bg-card border-card-border border-l-4 border-l-primary relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
          <Target size={100} />
        </div>
        <CardContent className="p-4">
          <div className="text-muted-foreground text-sm font-medium mb-1 uppercase tracking-wider">Levels</div>
          <div className="text-3xl font-display text-foreground">{stats.totalLevels}</div>
        </CardContent>
      </Card>

      <Card className="bg-card border-card-border border-l-4 border-l-accent relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
          <Trophy size={100} />
        </div>
        <CardContent className="p-4">
          <div className="text-muted-foreground text-sm font-medium mb-1 uppercase tracking-wider">Completed</div>
          <div className="text-3xl font-display text-accent">{stats.completedLevels}</div>
          <div className="text-xs text-muted-foreground mt-1">({stats.completionRate.toFixed(1)}% rate)</div>
        </CardContent>
      </Card>

      <Card className="bg-card border-card-border border-l-4 border-l-destructive relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
          <Skull size={100} />
        </div>
        <CardContent className="p-4">
          <div className="text-muted-foreground text-sm font-medium mb-1 uppercase tracking-wider">Attempts</div>
          <div className="text-3xl font-display text-foreground">{stats.totalAttempts}</div>
        </CardContent>
      </Card>

      <Card className="bg-card border-card-border border-l-4 border-l-secondary relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
          <TrendingUp size={100} />
        </div>
        <CardContent className="p-4">
          <div className="text-muted-foreground text-sm font-medium mb-1 uppercase tracking-wider">Avg Best</div>
          <div className="text-3xl font-display text-secondary">{stats.avgBestPercent.toFixed(1)}%</div>
        </CardContent>
      </Card>
    </div>
  );
}
