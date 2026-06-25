import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  LevelInput,
  LevelUpdate,
  SessionInput,
} from "@workspace/api-client-react";
import {
  computeStats,
  createLevel,
  createSession,
  deleteLevel,
  deleteSession,
  getLevel,
  listLevels,
  listLevelSessions,
  updateLevel,
  type ListLevelsParams,
} from "./localStore";

// Re-export the shared data types and difficulty enums so pages can import
// everything from a single module, just as they did from the API client.
export {
  LevelDifficulty,
  LevelInputDifficulty,
  LevelUpdateDifficulty,
} from "@workspace/api-client-react";
export type {
  DifficultyBreakdown,
  Level,
  LevelInput,
  LevelUpdate,
  Session,
  SessionInput,
  Stats,
} from "@workspace/api-client-react";

// Query keys — kept under a shared "levels" prefix so a single
// invalidateQueries({ queryKey: getGetLevelsQueryKey() }) refreshes lists,
// details and sessions together.
export const getGetLevelsQueryKey = () => ["levels"] as const;
export const getGetStatsQueryKey = () => ["stats"] as const;
export const getGetLevelQueryKey = (id: number) => ["levels", "detail", id] as const;
export const getGetLevelSessionsQueryKey = (levelId: number) =>
  ["levels", "detail", levelId, "sessions"] as const;

type QueryOptions = {
  query?: {
    enabled?: boolean;
    queryKey?: readonly unknown[];
  };
};

export function useGetLevels(params?: ListLevelsParams) {
  return useQuery({
    queryKey: ["levels", "list", params ?? {}],
    queryFn: () => listLevels(params),
  });
}

export function useGetStats() {
  return useQuery({
    queryKey: getGetStatsQueryKey(),
    queryFn: () => computeStats(),
  });
}

export function useGetLevel(id: number, options?: QueryOptions) {
  return useQuery({
    queryKey: (options?.query?.queryKey ?? getGetLevelQueryKey(id)) as unknown[],
    queryFn: () => getLevel(id) ?? null,
    enabled: options?.query?.enabled,
  });
}

export function useGetLevelSessions(levelId: number, options?: QueryOptions) {
  return useQuery({
    queryKey: (options?.query?.queryKey ??
      getGetLevelSessionsQueryKey(levelId)) as unknown[],
    queryFn: () => listLevelSessions(levelId),
    enabled: options?.query?.enabled,
  });
}

export function useCreateLevel() {
  return useMutation({
    mutationFn: async (vars: { data: LevelInput }) => createLevel(vars.data),
  });
}

export function useUpdateLevel() {
  return useMutation({
    mutationFn: async (vars: { id: number; data: LevelUpdate }) =>
      updateLevel(vars.id, vars.data),
  });
}

export function useDeleteLevel() {
  return useMutation({
    mutationFn: async (vars: { id: number }) => deleteLevel(vars.id),
  });
}

export function useCreateSession() {
  return useMutation({
    mutationFn: async (vars: { levelId: number; data: SessionInput }) =>
      createSession(vars.levelId, vars.data),
  });
}

export function useDeleteSession() {
  return useMutation({
    mutationFn: async (vars: { id: number }) => deleteSession(vars.id),
  });
}
