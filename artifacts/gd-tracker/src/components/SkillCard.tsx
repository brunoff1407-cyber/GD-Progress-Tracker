import type { Stats, Level } from "@workspace/api-client-react";

interface SkillCardProps {
  stats: Stats;
  levels: Level[];
}

const DIFFICULTY_ORDER = [
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

type Difficulty = (typeof DIFFICULTY_ORDER)[number];

const DIFFICULTY_STYLE: Record<Difficulty, { bg: string; text: string; glow: string; label: string }> = {
  Auto:           { bg: "bg-gray-500/20 border-gray-500",          text: "text-gray-300",   glow: "0 0 20px rgba(156,163,175,0.3)", label: "AUTO" },
  Easy:           { bg: "bg-blue-500/20 border-blue-500",          text: "text-blue-300",   glow: "0 0 20px rgba(59,130,246,0.4)",  label: "EASY" },
  Normal:         { bg: "bg-green-500/20 border-green-500",        text: "text-green-300",  glow: "0 0 20px rgba(34,197,94,0.4)",   label: "NORMAL" },
  Hard:           { bg: "bg-yellow-500/20 border-yellow-500",      text: "text-yellow-300", glow: "0 0 20px rgba(234,179,8,0.4)",   label: "HARD" },
  Harder:         { bg: "bg-orange-500/20 border-orange-500",      text: "text-orange-300", glow: "0 0 20px rgba(249,115,22,0.4)",  label: "HARDER" },
  Insane:         { bg: "bg-pink-500/20 border-pink-500",          text: "text-pink-300",   glow: "0 0 20px rgba(236,72,153,0.4)",  label: "INSANE" },
  "Easy Demon":   { bg: "bg-purple-600/20 border-purple-500",      text: "text-purple-300", glow: "0 0 20px rgba(147,51,234,0.5)",  label: "EASY DEMON" },
  "Medium Demon": { bg: "bg-pink-700/20 border-pink-600",          text: "text-pink-200",   glow: "0 0 20px rgba(219,39,119,0.5)",  label: "MEDIUM DEMON" },
  "Hard Demon":   { bg: "bg-red-600/20 border-red-500",            text: "text-red-300",    glow: "0 0 25px rgba(220,38,38,0.5)",   label: "HARD DEMON" },
  "Insane Demon": { bg: "bg-red-900/30 border-red-700",            text: "text-red-200",    glow: "0 0 25px rgba(185,28,28,0.6)",   label: "INSANE DEMON" },
  "Extreme Demon":{ bg: "bg-red-950/40 border-red-500",            text: "text-red-100",    glow: "0 0 30px rgba(239,68,68,0.7)",   label: "EXTREME DEMON" },
};

const SKILL_FLAVOR: Record<Difficulty, string> = {
  "Auto":           "Just starting out — every run counts.",
  "Easy":           "Finding the rhythm. Keep at it.",
  "Normal":         "Getting comfortable with the basics.",
  "Hard":           "Solid fundamentals. The grind is working.",
  "Harder":         "Strong player. Demons are on the horizon.",
  "Insane":         "Top-tier normal levels? Demons await you.",
  "Easy Demon":     "Demon slayer. The real grind begins.",
  "Medium Demon":   "Mid-tier demons fall to you. Respect.",
  "Hard Demon":     "Elite grinder. Most players never reach this.",
  "Insane Demon":   "Insane Demon player. You are built different.",
  "Extreme Demon":  "Extreme Demon player. Absolute top of the game.",
};

const tierIndex = (d: string) => DIFFICULTY_ORDER.indexOf(d as Difficulty);

function computeSkill(
  byDifficulty: { difficulty: string; total: number; completed: number }[],
) {
  const completionMap = new Map(byDifficulty.map((d) => [d.difficulty, d.completed]));

  // Comfortable = highest tier with 2+ completions
  let comfortableTier: Difficulty | null = null;
  for (let i = DIFFICULTY_ORDER.length - 1; i >= 0; i--) {
    const d = DIFFICULTY_ORDER[i];
    if ((completionMap.get(d) ?? 0) >= 2) {
      comfortableTier = d;
      break;
    }
  }

  // Breaking-in = highest tier with exactly 1 completion (above comfortable, or only rating if none comfortable)
  let breakingInTier: Difficulty | null = null;
  const comfortableIdx = comfortableTier ? tierIndex(comfortableTier) : -1;
  for (let i = DIFFICULTY_ORDER.length - 1; i > comfortableIdx; i--) {
    const d = DIFFICULTY_ORDER[i];
    if ((completionMap.get(d) ?? 0) === 1) {
      breakingInTier = d;
      break;
    }
  }

  return { comfortableTier, breakingInTier };
}

export function SkillCard({ stats, levels }: SkillCardProps) {
  const { comfortableTier, breakingInTier } = computeSkill(stats.byDifficulty);

  // "Currently grinding" = highest difficulty among incomplete levels that have progress
  const activePush = levels
    .filter((l) => !l.isCompleted && l.bestPercent > 0)
    .sort((a, b) => tierIndex(b.difficulty) - tierIndex(a.difficulty))[0] ?? null;

  // Display tier — prefer comfortable, else breaking-in, else null
  const displayTier = comfortableTier ?? breakingInTier;

  if (!displayTier && !activePush) return null;

  const style = displayTier ? DIFFICULTY_STYLE[displayTier] : null;
  const isUnranked = !comfortableTier && !breakingInTier;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-6 mb-8 ${style ? style.bg : "bg-card/60 border-border"}`}
      style={style ? { boxShadow: style.glow } : undefined}
      data-testid="card-skill-level"
    >
      {/* background watermark */}
      {style && (
        <div
          className={`absolute inset-0 flex items-center justify-end pr-8 pointer-events-none select-none opacity-5`}
          aria-hidden
        >
          <span className={`font-display text-[120px] leading-none tracking-tighter ${style.text}`}>
            {style.label}
          </span>
        </div>
      )}

      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
        {/* Main rating */}
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Your Skill Level
          </p>

          {isUnranked ? (
            <div>
              <p className="font-display text-2xl text-muted-foreground">Unranked</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Beat 2+ levels at the same difficulty to get ranked.</p>
            </div>
          ) : (
            <div>
              <p
                className={`font-display text-4xl md:text-5xl leading-tight ${style!.text}`}
                data-testid="text-skill-tier"
              >
                {displayTier}
              </p>
              <p className="text-sm text-muted-foreground/80 mt-2 font-sans">
                {comfortableTier
                  ? SKILL_FLAVOR[comfortableTier]
                  : `First ${displayTier} beaten — keep pushing for a second to confirm your rank.`}
              </p>
            </div>
          )}
        </div>

        {/* Side stats */}
        <div className="flex flex-col gap-3 min-w-[200px]">
          {breakingInTier && comfortableTier && tierIndex(breakingInTier) > tierIndex(comfortableTier) && (
            <div
              className="bg-black/30 border border-white/10 rounded-lg px-4 py-3"
              data-testid="card-breaking-in"
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Breaking Into</p>
              <p className={`font-display text-lg ${DIFFICULTY_STYLE[breakingInTier].text}`}>
                {breakingInTier}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">1 beaten — need 1 more to rank up</p>
            </div>
          )}

          {activePush && (
            <div
              className="bg-black/30 border border-white/10 rounded-lg px-4 py-3"
              data-testid="card-current-grind"
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Currently Grinding</p>
              <p className={`font-display text-base ${DIFFICULTY_STYLE[activePush.difficulty as Difficulty]?.text ?? "text-foreground"}`}>
                {activePush.name}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                {activePush.bestPercent}% — {activePush.difficulty}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
