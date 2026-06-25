import { useState, useMemo } from "react";
import { useGetLevels, useGetStats, useDeleteLevel, getGetLevelsQueryKey, getGetStatsQueryKey, type Level } from "@/lib/localApi";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { StatsGrid } from "@/components/StatsGrid";
import { LevelCard } from "@/components/LevelCard";
import { SkillCard } from "@/components/SkillCard";
import { DifficultyChart } from "@/components/DifficultyChart";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DIFFICULTIES = [
  "Auto",
  "Easy",
  "Normal",
  "Hard",
  "Harder",
  "Insane",
  "Easy Demon",
  "Medium Demon",
  "Hard Demon",
  "Insane Demon",
  "Extreme Demon",
] as const;

type CompletionFilter = "all" | "completed" | "grinding";
type SortKey = "newest" | "oldest" | "best-desc" | "best-asc" | "attempts-desc" | "name";

function sortLevels(levels: Level[], sort: SortKey): Level[] {
  const copy = [...levels];
  switch (sort) {
    case "newest":
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "oldest":
      return copy.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case "best-desc":
      return copy.sort((a, b) => b.bestPercent - a.bestPercent);
    case "best-asc":
      return copy.sort((a, b) => a.bestPercent - b.bestPercent);
    case "attempts-desc":
      return copy.sort((a, b) => b.attempts - a.attempts);
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export default function Dashboard() {
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const deleteLevel = useDeleteLevel();

  const handleDeleteLevel = (id: number) => {
    if (!window.confirm("Remove this level from tracking?")) return;
    deleteLevel.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetLevelsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          toast({ title: "Level removed" });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Failed to delete level" });
        },
      }
    );
  };

  const completedParam =
    completionFilter === "completed" ? true :
    completionFilter === "grinding" ? false :
    undefined;

  const difficultyParam = difficultyFilter === "all" ? undefined : difficultyFilter;

  const { data: stats, isLoading: isStatsLoading } = useGetStats();
  const { data: rawLevels, isLoading: isLevelsLoading } = useGetLevels(
    { completed: completedParam, difficulty: difficultyParam },
  );

  const levels = useMemo(
    () => (rawLevels ? sortLevels(rawLevels, sortKey) : []),
    [rawLevels, sortKey],
  );

  const hasActiveFilters =
    completionFilter !== "all" || difficultyFilter !== "all" || sortKey !== "newest";

  const clearFilters = () => {
    setCompletionFilter("all");
    setDifficultyFilter("all");
    setSortKey("newest");
  };

  return (
    <Layout>
      <div className="mb-10">
        <h1 className="text-4xl font-display text-primary mb-6 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
          Dashboard
        </h1>

        {isStatsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        ) : stats ? (
          <StatsGrid stats={stats} />
        ) : null}

        {stats && rawLevels && <SkillCard stats={stats} levels={rawLevels} />}

        {stats && stats.byDifficulty.length > 0 && <DifficultyChart stats={stats} />}
      </div>

      <div>
        {/* Toolbar */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display text-foreground">Tracked Levels</h2>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground text-xs uppercase tracking-widest h-8 px-2"
                  onClick={clearFilters}
                  data-testid="button-clear-filters"
                >
                  <X size={12} className="mr-1" /> Clear
                </Button>
              )}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <SlidersHorizontal size={14} />
                <span className="text-xs uppercase tracking-widest hidden sm:inline">Filters</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Completion toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden" data-testid="filter-completion">
              {(["all", "grinding", "completed"] as CompletionFilter[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setCompletionFilter(opt)}
                  data-testid={`button-filter-${opt}`}
                  className={`
                    px-4 py-2 text-xs font-display uppercase tracking-wider transition-colors
                    ${completionFilter === opt
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted"}
                  `}
                >
                  {opt === "all" ? "All" : opt === "grinding" ? "Grinding" : "Beaten"}
                </button>
              ))}
            </div>

            {/* Difficulty pills — scrollable row */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1 scrollbar-none" data-testid="filter-difficulty">
              <button
                onClick={() => setDifficultyFilter("all")}
                data-testid="button-diff-all"
                className={`
                  shrink-0 px-3 py-2 rounded-md text-xs font-display uppercase tracking-wider border transition-colors
                  ${difficultyFilter === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40"}
                `}
              >
                All Tiers
              </button>
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(difficultyFilter === d ? "all" : d)}
                  data-testid={`button-diff-${d.toLowerCase().replace(/ /g, "-")}`}
                  className={`
                    shrink-0 px-3 py-2 rounded-md text-xs font-display uppercase tracking-wider border transition-colors
                    ${difficultyFilter === d
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40"}
                  `}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Sort */}
            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
              <SelectTrigger
                className="w-full sm:w-[170px] bg-card border-border text-muted-foreground text-xs font-display uppercase tracking-wider h-[38px] shrink-0"
                data-testid="select-sort"
              >
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="newest" className="font-display uppercase text-xs">Newest First</SelectItem>
                <SelectItem value="oldest" className="font-display uppercase text-xs">Oldest First</SelectItem>
                <SelectItem value="best-desc" className="font-display uppercase text-xs">Best % — High to Low</SelectItem>
                <SelectItem value="best-asc" className="font-display uppercase text-xs">Best % — Low to High</SelectItem>
                <SelectItem value="attempts-desc" className="font-display uppercase text-xs">Most Attempts</SelectItem>
                <SelectItem value="name" className="font-display uppercase text-xs">Name A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid */}
        {isLevelsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : levels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((level) => (
              <LevelCard key={level.id} level={level} onDelete={handleDeleteLevel} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-lg border border-dashed border-border">
            {hasActiveFilters ? (
              <>
                <h3 className="text-xl font-display text-muted-foreground mb-2">No levels match</h3>
                <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters.</p>
                <Button variant="outline" size="sm" onClick={clearFilters} className="font-display uppercase text-xs tracking-wider">
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-display text-muted-foreground mb-2">No levels tracked yet</h3>
                <p className="text-muted-foreground">Start logging your GD grind to see your progress here.</p>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
