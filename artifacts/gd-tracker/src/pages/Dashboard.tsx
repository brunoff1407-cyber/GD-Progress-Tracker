import { useGetLevels, useGetStats } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { StatsGrid } from "@/components/StatsGrid";
import { LevelCard } from "@/components/LevelCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading: isStatsLoading } = useGetStats();
  const { data: levels, isLoading: isLevelsLoading } = useGetLevels();

  return (
    <Layout>
      <div className="mb-10">
        <h1 className="text-4xl font-display text-primary mb-6 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">Dashboard</h1>
        {isStatsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
          </div>
        ) : stats ? (
          <StatsGrid stats={stats} />
        ) : null}
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display text-foreground">Tracked Levels</h2>
        </div>
        
        {isLevelsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
          </div>
        ) : levels && levels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((level) => (
              <LevelCard key={level.id} level={level} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-lg border border-border">
            <h3 className="text-xl font-display text-muted-foreground mb-2">No levels tracked yet</h3>
            <p className="text-muted-foreground mb-6">Start logging your GD grind to see your progress here.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
