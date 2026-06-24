import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import { db, levelsTable } from "@workspace/db";
import {
  GetLevelsQueryParams,
  CreateLevelBody,
  GetLevelParams,
  UpdateLevelParams,
  UpdateLevelBody,
  DeleteLevelParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/levels", async (req, res) => {
  const parseResult = GetLevelsQueryParams.safeParse(req.query);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const { completed, difficulty } = parseResult.data;

  let query = db.select().from(levelsTable).$dynamic();

  if (completed !== undefined) {
    query = query.where(eq(levelsTable.isCompleted, completed));
  }
  if (difficulty !== undefined) {
    query = query.where(eq(levelsTable.difficulty, difficulty));
  }

  const levels = await query.orderBy(levelsTable.updatedAt);
  res.json(levels.reverse());
});

router.post("/levels", async (req, res) => {
  const parseResult = CreateLevelBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const body = parseResult.data;

  const [level] = await db
    .insert(levelsTable)
    .values({
      name: body.name,
      creator: body.creator ?? null,
      difficulty: body.difficulty,
      stars: body.stars ?? null,
      bestPercent: body.bestPercent ?? 0,
      attempts: body.attempts ?? 0,
      notes: body.notes ?? null,
    })
    .returning();

  res.status(201).json(level);
});

router.get("/levels/:id", async (req, res) => {
  const parseResult = GetLevelParams.safeParse({ id: Number(req.params.id) });
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid level id" });
    return;
  }

  const [level] = await db
    .select()
    .from(levelsTable)
    .where(eq(levelsTable.id, parseResult.data.id));

  if (!level) {
    res.status(404).json({ error: "Level not found" });
    return;
  }

  res.json(level);
});

router.patch("/levels/:id", async (req, res) => {
  const paramsResult = UpdateLevelParams.safeParse({ id: Number(req.params.id) });
  if (!paramsResult.success) {
    res.status(400).json({ error: "Invalid level id" });
    return;
  }

  const bodyResult = UpdateLevelBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const body = bodyResult.data;
  const updates: Partial<typeof levelsTable.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (body.name !== undefined) updates.name = body.name;
  if (body.creator !== undefined) updates.creator = body.creator;
  if (body.difficulty !== undefined) updates.difficulty = body.difficulty;
  if (body.stars !== undefined) updates.stars = body.stars;
  if (body.bestPercent !== undefined) updates.bestPercent = body.bestPercent;
  if (body.attempts !== undefined) updates.attempts = body.attempts;
  if (body.isCompleted !== undefined) updates.isCompleted = body.isCompleted;
  if (body.notes !== undefined) updates.notes = body.notes;

  const [level] = await db
    .update(levelsTable)
    .set(updates)
    .where(eq(levelsTable.id, paramsResult.data.id))
    .returning();

  if (!level) {
    res.status(404).json({ error: "Level not found" });
    return;
  }

  res.json(level);
});

router.delete("/levels/:id", async (req, res) => {
  const parseResult = DeleteLevelParams.safeParse({ id: Number(req.params.id) });
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid level id" });
    return;
  }

  const [deleted] = await db
    .delete(levelsTable)
    .where(eq(levelsTable.id, parseResult.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Level not found" });
    return;
  }

  res.status(204).send();
});

export default router;
