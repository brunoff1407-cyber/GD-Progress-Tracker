import { Level } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { DifficultyBadge } from "./DifficultyBadge";
import { ProgressBar } from "./ProgressBar";
import { Link } from "wouter";
import { Star, CheckCircle } from "lucide-react";

export function LevelCard({ level }: { level: Level }) {
  return (
    <Link href={`/levels/${level.id}`} className="block group">
      <Card className="bg-card border-card-border hover:border-primary/50 transition-all duration-300 group-hover:glow-primary relative overflow-hidden">
        {level.isCompleted && (
          <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
            <div className="absolute top-4 -right-6 bg-accent text-accent-foreground font-display text-xs px-8 py-1 rotate-45 flex items-center justify-center gap-1 shadow-[0_0_10px_hsl(var(--accent))]">
              <CheckCircle size={10} /> DONE
            </div>
          </div>
        )}
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-display text-xl text-foreground group-hover:text-primary transition-colors">{level.name}</h3>
              {level.creator && <p className="text-muted-foreground text-sm">by {level.creator}</p>}
            </div>
            <div className="flex flex-col items-end gap-2">
              <DifficultyBadge difficulty={level.difficulty} />
              {level.stars != null && (
                <div className="flex items-center text-yellow-400 text-xs font-bold gap-1">
                  {level.stars} <Star size={12} className="fill-yellow-400" />
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2 mt-6">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-muted-foreground">Progress</span>
              <span className={level.bestPercent === 100 ? "text-accent" : "text-primary"}>{level.bestPercent}%</span>
            </div>
            <ProgressBar value={level.bestPercent} isCompleted={level.isCompleted} />
            <div className="text-xs text-muted-foreground mt-2 text-right">
              {level.attempts} attempts
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
