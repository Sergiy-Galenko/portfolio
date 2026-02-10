"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

import { CharacterSelectScreen } from "@/components/CharacterSelectScreen";
import { ROOM_META } from "@/lib/rooms";
import { loadCheckpoint, saveCheckpoint } from "@/lib/storage";
import { useGameStore } from "@/state/gameStore";
import type { Checkpoint } from "@/types/game";
import { HUD } from "@/components/HUD";
import { LoadingScreen } from "@/components/LoadingScreen";
import { RoomRenderer } from "@/components/RoomRenderer";

export function GameShell() {
  const phase = useGameStore((state) => state.phase);
  const currentRoom = useGameStore((state) => state.currentRoom);
  const heroClass = useGameStore((state) => state.heroClass);
  const chosenClass = useGameStore((state) => state.chosenClass);
  const fixedErrors = useGameStore((state) => state.fixedErrors);
  const unlockedProjects = useGameStore((state) => state.unlockedProjects);
  const clearedRooms = useGameStore((state) => state.clearedRooms);
  const defeatedEnemies = useGameStore((state) => state.defeatedEnemies);
  const shownPortfolioRooms = useGameStore((state) => state.shownPortfolioRooms);
  const completedQuests = useGameStore((state) => state.completedQuests);
  const inspectedPoints = useGameStore((state) => state.inspectedPoints);
  const soundOn = useGameStore((state) => state.soundOn);
  const hudStats = useGameStore((state) => state.hudStats);
  const notification = useGameStore((state) => state.notification);
  const clearNotification = useGameStore((state) => state.clearNotification);
  const applyCheckpoint = useGameStore((state) => state.applyCheckpoint);
  const setPhase = useGameStore((state) => state.setPhase);

  const bootTimerRef = useRef<number | null>(null);
  const hasHydratedRef = useRef(false);
  const readyToPersistRef = useRef(false);

  useEffect(() => {
    if (hasHydratedRef.current) {
      return;
    }
    hasHydratedRef.current = true;

    const checkpoint = loadCheckpoint();
    if (checkpoint) {
      applyCheckpoint(checkpoint);
    }
    readyToPersistRef.current = true;
  }, [applyCheckpoint]);

  useEffect(() => {
    if (phase !== "loading") {
      return;
    }

    bootTimerRef.current = window.setTimeout(() => {
      setPhase(heroClass ? "battle" : "character-select");
    }, 1800);

    return () => {
      if (bootTimerRef.current !== null) {
        window.clearTimeout(bootTimerRef.current);
      }
    };
  }, [heroClass, phase, setPhase]);

  useEffect(() => {
    if (!readyToPersistRef.current) {
      return;
    }

    const checkpoint: Checkpoint = {
      phase,
      currentRoom,
      heroClass,
      chosenClass,
      fixedErrors,
      unlockedProjects,
      clearedRooms,
      defeatedEnemies,
      shownPortfolioRooms,
      completedQuests,
      inspectedPoints,
      soundOn,
      hudStats,
    };
    saveCheckpoint(checkpoint);
  }, [
    phase,
    chosenClass,
    clearedRooms,
    completedQuests,
    currentRoom,
    defeatedEnemies,
    heroClass,
    fixedErrors,
    hudStats,
    inspectedPoints,
    soundOn,
    shownPortfolioRooms,
    unlockedProjects,
  ]);

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timer = window.setTimeout(() => clearNotification(), 2200);
    return () => window.clearTimeout(timer);
  }, [clearNotification, notification]);

  const roomMeta = ROOM_META[currentRoom];

  return (
    <main className="game-shell">
      <div className="pixel-overlay" />
      {phase === "battle" ? (
        <>
          <HUD
            roomId={currentRoom}
            roomTitle={roomMeta.title}
            stats={hudStats}
            soundOn={soundOn}
            heroClass={heroClass}
          />
          <RoomRenderer currentRoom={currentRoom} />
        </>
      ) : null}
      {phase === "loading" ? <LoadingScreen /> : null}
      {phase === "character-select" ? <CharacterSelectScreen /> : null}

      <AnimatePresence>
        {notification ? (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            {notification}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
