import type {
  Level,
  Session,
  Stats,
  LevelInput,
  LevelUpdate,
  SessionInput,
  LevelDifficulty,
  DifficultyBreakdown,
} from "@workspace/api-client-react";

// Device-local persistence for tracker data. The app has no login; levels and
// practice sessions live only in this browser's localStorage, keeping each
// user's tracking data private to their own browser.

function keyFor(base: string): string {
  return base;
}

const LEVELS_BASE = "gd_tracker_levels";
const SESSIONS_BASE = "gd_tracker_sessions";
const LEVEL_SEQ_BASE = "gd_tracker_level_seq";
const SESSION_SEQ_BASE = "gd_tracker_session_seq";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function nextId(key: string): number {
  const next = read<number>(key, 0) + 1;
  write(key, next);
  return next;
}

function allLevels(): Level[] {
  return read<Level[]>(keyFor(LEVELS_BASE), []);
}

function allSessions(): Session[] {
  return read<Session[]>(keyFor(SESSIONS_BASE), []);
}

export interface ListLevelsParams {
  completed?: boolean;
  difficulty?: string;
}

export function listLevels(params?: ListLevelsParams): Level[] {
  let levels = allLevels();
  if (params?.completed !== undefined) {
    levels = levels.filter((l) => l.isCompleted === params.completed);
  }
  if (params?.difficulty) {
    levels = levels.filter((l) => l.difficulty === params.difficulty);
  }
  // Newest-updated first, matching the previous server ordering.
  return levels.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getLevel(id: number): Level | undefined {
  return allLevels().find((l) => l.id === id);
}

export function createLevel(input: LevelInput): Level {
  const now = new Date().toISOString();
  const level: Level = {
    id: nextId(keyFor(LEVEL_SEQ_BASE)),
    name: input.name,
    creator: input.creator ?? null,
    difficulty: input.difficulty as LevelDifficulty,
    stars: input.stars ?? null,
    bestPercent: input.bestPercent ?? 0,
    attempts: input.attempts ?? 0,
    isCompleted: false,
    notes: input.notes ?? null,
    createdAt: now,
    updatedAt: now,
  };
  const levels = allLevels();
  levels.push(level);
  write(keyFor(LEVELS_BASE), levels);
  return level;
}

export function updateLevel(id: number, data: LevelUpdate): Level {
  const levels = allLevels();
  const idx = levels.findIndex((l) => l.id === id);
  if (idx === -1) throw new Error("Level not found");

  const updated: Level = { ...levels[idx], updatedAt: new Date().toISOString() };
  if (data.name !== undefined) updated.name = data.name;
  if (data.creator !== undefined) updated.creator = data.creator;
  if (data.difficulty !== undefined) updated.difficulty = data.difficulty as LevelDifficulty;
  if (data.stars !== undefined) updated.stars = data.stars;
  if (data.bestPercent !== undefined) updated.bestPercent = data.bestPercent;
  if (data.attempts !== undefined) updated.attempts = data.attempts;
  if (data.isCompleted !== undefined) updated.isCompleted = data.isCompleted;
  if (data.notes !== undefined) updated.notes = data.notes;

  levels[idx] = updated;
  write(keyFor(LEVELS_BASE), levels);
  return updated;
}

export function deleteLevel(id: number): void {
  write(keyFor(LEVELS_BASE), allLevels().filter((l) => l.id !== id));
  // Cascade: remove practice sessions belonging to the deleted level.
  write(keyFor(SESSIONS_BASE), allSessions().filter((s) => s.levelId !== id));
}

export function listLevelSessions(levelId: number): Session[] {
  return allSessions().filter((s) => s.levelId === levelId);
}

export function createSession(levelId: number, input: SessionInput): Session {
  const now = new Date().toISOString();
  const session: Session = {
    id: nextId(keyFor(SESSION_SEQ_BASE)),
    levelId,
    attempts: input.attempts,
    bestPercent: input.bestPercent,
    notes: input.notes ?? null,
    sessionDate: input.sessionDate ?? now,
    createdAt: now,
  };
  const sessions = allSessions();
  sessions.push(session);
  write(keyFor(SESSIONS_BASE), sessions);
  return session;
}

export function deleteSession(id: number): void {
  write(keyFor(SESSIONS_BASE), allSessions().filter((s) => s.id !== id));
}

export function computeStats(): Stats {
  const levels = allLevels();
  const totalLevels = levels.length;
  const completedLevels = levels.filter((l) => l.isCompleted).length;
  const totalAttempts = levels.reduce((acc, l) => acc + l.attempts, 0);
  const avgBestPercent =
    totalLevels > 0
      ? levels.reduce((acc, l) => acc + l.bestPercent, 0) / totalLevels
      : 0;

  const byDifficultyMap = new Map<string, DifficultyBreakdown>();
  for (const l of levels) {
    const entry =
      byDifficultyMap.get(l.difficulty) ??
      { difficulty: l.difficulty, total: 0, completed: 0 };
    entry.total += 1;
    if (l.isCompleted) entry.completed += 1;
    byDifficultyMap.set(l.difficulty, entry);
  }

  return {
    totalLevels,
    completedLevels,
    totalAttempts,
    // Fraction (0..1), matching the previous server computation.
    completionRate: totalLevels > 0 ? completedLevels / totalLevels : 0,
    avgBestPercent,
    byDifficulty: Array.from(byDifficultyMap.values()),
  };
}
