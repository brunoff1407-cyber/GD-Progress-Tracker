import { Router } from "express";
import { db, levelsTable } from "@workspace/db";
import { sql, count, avg, sum } from "drizzle-orm";

const router = Router();

router.get("/stats", async (_req, res) => {
  const [totals] = await db
    .select({
      totalLevels: count(levelsTable.id),
      completedLevels: sql<number>`cast(count(case when ${levelsTable.isCompleted} = true then 1 end) as int)`,
      totalAttempts: sql<number>`cast(coalesce(sum(${levelsTable.attempts}), 0) as int)`,
      avgBestPercent: avg(levelsTable.bestPercent),
    })
    .from(levelsTable);

  const byDifficultyRows = await db
    .select({
      difficulty: levelsTable.difficulty,
      total: count(levelsTable.id),
      completed: sql<number>`cast(count(case when ${levelsTable.isCompleted} = true then 1 end) as int)`,
    })
    .from(levelsTable)
    .groupBy(levelsTable.difficulty);

  const totalLevels = totals.totalLevels ?? 0;
  const completedLevels = totals.completedLevels ?? 0;

  res.json({
    totalLevels,
    completedLevels,
    totalAttempts: totals.totalAttempts ?? 0,
    completionRate: totalLevels > 0 ? completedLevels / totalLevels : 0,
    avgBestPercent: totals.avgBestPercent ? parseFloat(String(totals.avgBestPercent)) : 0,
    byDifficulty: byDifficultyRows,
  });
});

export default router;
