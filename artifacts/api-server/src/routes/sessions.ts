import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, levelsTable, sessionsTable } from "@workspace/db";
import {
  CreateSessionBody,
  CreateSessionParams,
  GetLevelSessionsParams,
  DeleteSessionParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/levels/:levelId/sessions", async (req, res) => {
  const parseResult = GetLevelSessionsParams.safeParse({ levelId: Number(req.params.levelId) });
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid level id" });
    return;
  }

  const [level] = await db.select().from(levelsTable).where(eq(levelsTable.id, parseResult.data.levelId));
  if (!level) {
    res.status(404).json({ error: "Level not found" });
    return;
  }

  const sessions = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.levelId, parseResult.data.levelId))
    .orderBy(sessionsTable.sessionDate);

  res.json(sessions.reverse());
});

router.post("/levels/:levelId/sessions", async (req, res) => {
  const paramsResult = CreateSessionParams.safeParse({ levelId: Number(req.params.levelId) });
  if (!paramsResult.success) {
    res.status(400).json({ error: "Invalid level id" });
    return;
  }

  const bodyResult = CreateSessionBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const [level] = await db.select().from(levelsTable).where(eq(levelsTable.id, paramsResult.data.levelId));
  if (!level) {
    res.status(404).json({ error: "Level not found" });
    return;
  }

  const body = bodyResult.data;
  const [session] = await db
    .insert(sessionsTable)
    .values({
      levelId: paramsResult.data.levelId,
      attempts: body.attempts,
      bestPercent: body.bestPercent,
      notes: body.notes ?? null,
      sessionDate: body.sessionDate ? new Date(body.sessionDate) : new Date(),
    })
    .returning();

  res.status(201).json(session);
});

router.delete("/sessions/:id", async (req, res) => {
  const parseResult = DeleteSessionParams.safeParse({ id: Number(req.params.id) });
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid session id" });
    return;
  }

  const [deleted] = await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.id, parseResult.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  res.status(204).send();
});

export default router;
