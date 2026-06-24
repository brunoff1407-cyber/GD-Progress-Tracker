import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  type TooltipProps,
} from "recharts";
import type { Stats } from "@workspace/api-client-react";

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
];

const DIFFICULTY_COLOR: Record<string, string> = {
  "Auto":           "#9ca3af",
  "Easy":           "#3b82f6",
  "Normal":         "#22c55e",
  "Hard":           "#eab308",
  "Harder":         "#f97316",
  "Insane":         "#ec4899",
  "Easy Demon":     "#a855f7",
  "Medium Demon":   "#db2777",
  "Hard Demon":     "#dc2626",
  "Insane Demon":   "#991b1b",
  "Extreme Demon":  "#7f1d1d",
};

interface ChartRow {
  name: string;
  shortName: string;
  completed: number;
  grinding: number;
  total: number;
  color: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload as ChartRow;
  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-lg p-3 shadow-xl min-w-[160px]">
      <p className="font-display text-sm mb-2" style={{ color: row.color }}>{label}</p>
      <div className="space-y-1 font-sans text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Beaten</span>
          <span className="text-accent font-bold">{row.completed}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Grinding</span>
          <span className="text-primary font-bold">{row.grinding}</span>
        </div>
        <div className="flex justify-between gap-4 border-t border-white/10 pt-1 mt-1">
          <span className="text-muted-foreground">Total</span>
          <span className="text-foreground font-bold">{row.total}</span>
        </div>
      </div>
    </div>
  );
}

export function DifficultyChart({ stats }: { stats: Stats }) {
  if (!stats.byDifficulty || stats.byDifficulty.length === 0) return null;

  const data: ChartRow[] = DIFFICULTY_ORDER
    .filter((d) => stats.byDifficulty.some((b) => b.difficulty === d))
    .map((d) => {
      const row = stats.byDifficulty.find((b) => b.difficulty === d)!;
      return {
        name: d,
        shortName: d.replace(" Demon", "").replace("Extreme", "Xtrm"),
        completed: row.completed,
        grinding: row.total - row.completed,
        total: row.total,
        color: DIFFICULTY_COLOR[d] ?? "#9ca3af",
      };
    });

  return (
    <div className="bg-card border border-card-border rounded-xl p-6 mb-8" data-testid="chart-difficulty">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Breakdown by Difficulty
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-accent/80" />
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Beaten</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary/60" />
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Grinding</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
          barGap={2}
          barCategoryGap="28%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            strokeOpacity={0.4}
            horizontal={true}
            vertical={false}
          />
          <XAxis
            dataKey="shortName"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "Outfit, sans-serif" }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "Outfit, sans-serif" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />

          <Bar dataKey="completed" name="Beaten" stackId="a" radius={[0, 0, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
                fillOpacity={0.9}
              />
            ))}
          </Bar>
          <Bar dataKey="grinding" name="Grinding" stackId="a" radius={[3, 3, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
                fillOpacity={0.25}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
