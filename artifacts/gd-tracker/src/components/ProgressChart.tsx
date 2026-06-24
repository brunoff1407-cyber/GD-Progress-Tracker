import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
  AreaChart,
  type TooltipProps,
} from "recharts";

interface Session {
  id: number;
  bestPercent: number;
  attempts: number;
  notes?: string | null;
  sessionDate: string;
  createdAt: string;
}

interface ProgressChartProps {
  sessions: Session[];
}

interface ChartPoint {
  label: string;
  percent: number;
  attempts: number;
  notes?: string | null;
  fullDate: string;
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload as ChartPoint;
  return (
    <div className="bg-[#0d0d1a] border border-[hsl(var(--primary)/0.4)] rounded-lg p-3 shadow-xl min-w-[160px]">
      <p className="text-xs text-muted-foreground mb-1 font-sans">{d.fullDate}</p>
      <p className="text-2xl font-display text-primary">{d.percent}%</p>
      <p className="text-xs text-muted-foreground mt-1">{d.attempts} attempts</p>
      {d.notes && (
        <p className="text-xs text-foreground/70 mt-2 border-t border-border pt-2 leading-relaxed line-clamp-2">
          {d.notes}
        </p>
      )}
    </div>
  );
}

export function ProgressChart({ sessions }: ProgressChartProps) {
  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(a.sessionDate || a.createdAt).getTime() -
      new Date(b.sessionDate || b.createdAt).getTime()
  );

  const data: ChartPoint[] = sorted.map((s) => {
    const date = new Date(s.sessionDate || s.createdAt);
    return {
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      percent: s.bestPercent,
      attempts: s.attempts,
      notes: s.notes,
    };
  });

  const maxPercent = Math.max(...data.map((d) => d.percent));
  const isCompleted = maxPercent === 100;

  return (
    <div
      className="bg-card border border-card-border rounded-lg p-6 shadow-lg"
      data-testid="chart-progress"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Progress Over Time
        </h3>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: "hsl(var(--primary))", boxShadow: "0 0 6px hsl(var(--primary))" }}
          />
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Best %</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="percentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isCompleted ? "hsl(var(--accent))" : "hsl(var(--primary))"}
                stopOpacity={0.25}
              />
              <stop
                offset="95%"
                stopColor={isCompleted ? "hsl(var(--accent))" : "hsl(var(--primary))"}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            strokeOpacity={0.4}
            vertical={false}
          />

          <XAxis
            dataKey="label"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "Outfit, sans-serif" }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />

          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "Outfit, sans-serif" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}%`}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4" }} />

          <ReferenceLine
            y={100}
            stroke="hsl(var(--accent))"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
            strokeWidth={1}
          />

          <Area
            type="monotone"
            dataKey="percent"
            stroke={isCompleted ? "hsl(var(--accent))" : "hsl(var(--primary))"}
            strokeWidth={2.5}
            fill="url(#percentGradient)"
            dot={{
              r: 4,
              fill: isCompleted ? "hsl(var(--accent))" : "hsl(var(--primary))",
              stroke: "hsl(var(--background))",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
              fill: isCompleted ? "hsl(var(--accent))" : "hsl(var(--primary))",
              stroke: "hsl(var(--background))",
              strokeWidth: 2,
              style: { filter: `drop-shadow(0 0 6px ${isCompleted ? "hsl(var(--accent))" : "hsl(var(--primary))"})`},
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
