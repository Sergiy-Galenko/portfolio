"use client";

import { create } from "zustand";

import type {
  Checkpoint,
  GameClassId,
  GamePhase,
  HeroClass,
  HUDStats,
  RoomId,
} from "@/types/game";

const INITIAL_HUD_STATS: HUDStats = {
  hp: 100,
  xp: 0,
  coins: 0,
};

interface GameState {
  phase: GamePhase;
  currentRoom: RoomId;
  heroClass: HeroClass | null;
  chosenClass: GameClassId | null;
  fixedErrors: string[];
  unlockedProjects: string[];
  clearedRooms: RoomId[];
  defeatedEnemies: string[];
  shownPortfolioRooms: RoomId[];
  completedQuests: string[];
  inspectedPoints: string[];
  soundOn: boolean;
  hudStats: HUDStats;
  notification: string | null;
  setPhase: (phase: GamePhase) => void;
  setRoom: (room: RoomId) => void;
  chooseHeroClass: (heroClass: HeroClass) => void;
  markPortfolioShown: (roomId: RoomId) => void;
  setNotification: (message: string) => void;
  clearNotification: () => void;
  toggleSound: () => void;
  chooseClass: (classId: GameClassId) => void;
  markErrorFixed: (errorId: string, projectId?: string) => void;
  completeQuest: (
    questId: string,
    rewards?: {
      xp?: number;
      coins?: number;
      hp?: number;
    }
  ) => void;
  markPointInspected: (pointId: string) => void;
  registerEnemyDefeat: (enemyId: string) => void;
  markRoomCleared: (roomId: RoomId) => void;
  applyCheckpoint: (checkpoint: Checkpoint) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  phase: "loading",
  currentRoom: 0,
  heroClass: null,
  chosenClass: null,
  fixedErrors: [],
  unlockedProjects: [],
  clearedRooms: [],
  defeatedEnemies: [],
  shownPortfolioRooms: [],
  completedQuests: [],
  inspectedPoints: [],
  soundOn: true,
  hudStats: INITIAL_HUD_STATS,
  notification: null,
  setPhase: (phase) =>
    set(() => ({
      phase,
    })),
  setRoom: (room) =>
    set(() => ({
      currentRoom: room,
    })),
  chooseHeroClass: (heroClass) =>
    set(() => ({
      heroClass,
      phase: "battle",
      currentRoom: 0,
      clearedRooms: [],
      defeatedEnemies: [],
      shownPortfolioRooms: [],
      hudStats: INITIAL_HUD_STATS,
      notification: heroClass === "mage" ? "Mage ready." : "Swordsman ready.",
    })),
  markPortfolioShown: (roomId) =>
    set((state) => {
      if (state.shownPortfolioRooms.includes(roomId)) {
        return {};
      }
      return {
        shownPortfolioRooms: [...state.shownPortfolioRooms, roomId],
      };
    }),
  setNotification: (message) =>
    set(() => ({
      notification: message,
    })),
  clearNotification: () =>
    set(() => ({
      notification: null,
    })),
  toggleSound: () =>
    set((state) => ({
      soundOn: !state.soundOn,
      notification: `Sound ${state.soundOn ? "off" : "on"}.`,
    })),
  chooseClass: (classId) =>
    set((state) => ({
      chosenClass: classId,
      hudStats: {
        ...state.hudStats,
        coins: Math.max(state.hudStats.coins, 12),
      },
      completedQuests: state.completedQuests.includes("quest-class-selection")
        ? state.completedQuests
        : [...state.completedQuests, "quest-class-selection"],
      notification: "Class selected. Build your route to the exit.",
    })),
  markErrorFixed: (errorId, projectId) =>
    set((state) => {
      if (state.fixedErrors.includes(errorId)) {
        return {
          notification: "This error is already fixed.",
        };
      }

      const nextFixedErrors = [...state.fixedErrors, errorId];
      const shouldUnlockProject = Boolean(
        projectId && !state.unlockedProjects.includes(projectId)
      );
      const nextUnlockedProjects =
        shouldUnlockProject && projectId
          ? [...state.unlockedProjects, projectId]
          : state.unlockedProjects;
      const allBuildErrorsFixed = nextFixedErrors.length >= 3;
      const questAlreadyDone = state.completedQuests.includes("quest-build-rescue");
      const nextCompletedQuests =
        allBuildErrorsFixed && !questAlreadyDone
          ? [...state.completedQuests, "quest-build-rescue"]
          : state.completedQuests;

      return {
        fixedErrors: nextFixedErrors,
        unlockedProjects: nextUnlockedProjects,
        completedQuests: nextCompletedQuests,
        hudStats: {
          hp: Math.max(0, state.hudStats.hp - 4),
          xp:
            state.hudStats.xp +
            (shouldUnlockProject ? 1 : 0) +
            (allBuildErrorsFixed && !questAlreadyDone ? 2 : 0),
          coins:
            state.hudStats.coins +
            1 +
            (allBuildErrorsFixed && !questAlreadyDone ? 2 : 0),
        },
        notification: "Patch applied successfully.",
      };
    }),
  completeQuest: (questId, rewards) =>
    set((state) => {
      if (state.completedQuests.includes(questId)) {
        return {};
      }

      return {
        completedQuests: [...state.completedQuests, questId],
        hudStats: {
          hp: Math.max(0, state.hudStats.hp + (rewards?.hp ?? 0)),
          xp: state.hudStats.xp + (rewards?.xp ?? 1),
          coins: state.hudStats.coins + (rewards?.coins ?? 1),
        },
        notification: "Quest completed.",
      };
    }),
  markPointInspected: (pointId) =>
    set((state) => {
      if (state.inspectedPoints.includes(pointId)) {
        return {};
      }

      return {
        inspectedPoints: [...state.inspectedPoints, pointId],
      };
    }),
  registerEnemyDefeat: (enemyId) =>
    set((state) => {
      if (state.defeatedEnemies.includes(enemyId)) {
        return {};
      }

      return {
        defeatedEnemies: [...state.defeatedEnemies, enemyId],
        hudStats: {
          ...state.hudStats,
          xp: state.hudStats.xp + 1,
          coins: state.hudStats.coins + 1,
        },
      };
    }),
  markRoomCleared: (roomId) =>
    set((state) => {
      if (state.clearedRooms.includes(roomId)) {
        return {};
      }

      return {
        clearedRooms: [...state.clearedRooms, roomId],
        hudStats: {
          ...state.hudStats,
          xp: state.hudStats.xp + 2,
          coins: state.hudStats.coins + 2,
        },
      };
    }),
  applyCheckpoint: (checkpoint) =>
    set(() => ({
      phase: checkpoint.phase,
      currentRoom: checkpoint.currentRoom,
      heroClass: checkpoint.heroClass,
      chosenClass: checkpoint.chosenClass,
      fixedErrors: checkpoint.fixedErrors,
      unlockedProjects: checkpoint.unlockedProjects,
      clearedRooms: checkpoint.clearedRooms,
      defeatedEnemies: checkpoint.defeatedEnemies,
      shownPortfolioRooms: checkpoint.shownPortfolioRooms,
      completedQuests: checkpoint.completedQuests,
      inspectedPoints: checkpoint.inspectedPoints,
      soundOn: checkpoint.soundOn,
      hudStats: checkpoint.hudStats,
      notification: "Checkpoint loaded.",
    })),
  resetGame: () =>
    set(() => ({
      phase: "loading",
      currentRoom: 0,
      heroClass: null,
      chosenClass: null,
      fixedErrors: [],
      unlockedProjects: [],
      clearedRooms: [],
      defeatedEnemies: [],
      shownPortfolioRooms: [],
      completedQuests: [],
      inspectedPoints: [],
      soundOn: true,
      hudStats: INITIAL_HUD_STATS,
      notification: "Quest restarted.",
    })),
}));
