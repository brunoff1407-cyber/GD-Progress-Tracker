import { LevelDifficulty } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

const DIFFICULTY_COLORS: Record<LevelDifficulty, string> = {
  [LevelDifficulty.Auto]: "bg-gray-500 text-white",
  [LevelDifficulty.Easy]: "bg-blue-500 text-white",
  [LevelDifficulty.Normal]: "bg-green-500 text-white",
  [LevelDifficulty.Hard]: "bg-yellow-500 text-yellow-950",
  [LevelDifficulty.Harder]: "bg-orange-500 text-orange-950",
  [LevelDifficulty.Insane]: "bg-pink-500 text-white",
  [LevelDifficulty.Easy_Demon]: "bg-purple-600 text-white glow-secondary",
  [LevelDifficulty.Medium_Demon]: "bg-pink-600 text-white glow-secondary",
  [LevelDifficulty.Hard_Demon]: "bg-red-600 text-white glow-secondary",
  [LevelDifficulty.Insane_Demon]: "bg-red-800 text-white glow-secondary",
  [LevelDifficulty.Extreme_Demon]: "bg-red-950 text-red-100 border-red-500 border glow-destructive",
};

export function DifficultyBadge({ difficulty }: { difficulty: LevelDifficulty }) {
  return (
    <Badge className={`font-display uppercase px-2 py-0.5 rounded-sm ${DIFFICULTY_COLORS[difficulty]}`} variant="outline">
      {difficulty}
    </Badge>
  );
}
