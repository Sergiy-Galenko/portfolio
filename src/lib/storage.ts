import type { Checkpoint } from "@/types/game";

const CHECKPOINT_KEY = "escape-the-deadline:checkpoint:v1";

const isValidCheckpoint = (value: unknown): value is Partial<Checkpoint> => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const checkpoint = value as Partial<Checkpoint>;
  return (
    (checkpoint.phase === undefined || typeof checkpoint.phase === "string") &&
    typeof checkpoint.currentRoom === "number" &&
    (checkpoint.heroClass === undefined ||
      checkpoint.heroClass === null ||
      typeof checkpoint.heroClass === "string") &&
    (checkpoint.chosenClass === undefined ||
      checkpoint.chosenClass === null ||
      typeof checkpoint.chosenClass === "string") &&
    Array.isArray(checkpoint.fixedErrors) &&
    Array.isArray(checkpoint.unlockedProjects) &&
    typeof checkpoint.soundOn === "boolean" &&
    typeof checkpoint.hudStats?.hp === "number" &&
    typeof checkpoint.hudStats?.xp === "number" &&
    typeof checkpoint.hudStats?.coins === "number"
  );
};

export const saveCheckpoint = (checkpoint: Checkpoint): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(checkpoint));
};

export const loadCheckpoint = (): Checkpoint | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(CHECKPOINT_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!isValidCheckpoint(parsed)) {
      return null;
    }

    const partial = parsed as Partial<Checkpoint>;
    return {
      phase: partial.phase ?? "loading",
      currentRoom: partial.currentRoom ?? 0,
      heroClass: partial.heroClass ?? null,
      chosenClass: partial.chosenClass ?? null,
      fixedErrors: partial.fixedErrors ?? [],
      unlockedProjects: partial.unlockedProjects ?? [],
      clearedRooms: Array.isArray(partial.clearedRooms)
        ? partial.clearedRooms
        : [],
      defeatedEnemies: Array.isArray(partial.defeatedEnemies)
        ? partial.defeatedEnemies
        : [],
      shownPortfolioRooms: Array.isArray(partial.shownPortfolioRooms)
        ? partial.shownPortfolioRooms
        : [],
      completedQuests: Array.isArray(partial.completedQuests)
        ? partial.completedQuests
        : [],
      inspectedPoints: Array.isArray(partial.inspectedPoints)
        ? partial.inspectedPoints
        : [],
      soundOn: partial.soundOn ?? true,
      hudStats: partial.hudStats ?? { hp: 100, xp: 0, coins: 0 },
    };
  } catch {
    return null;
  }
};

export const clearCheckpoint = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CHECKPOINT_KEY);
};
