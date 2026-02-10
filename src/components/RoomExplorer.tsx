"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import locationPortfolioData from "@/data/locationPortfolio.json";
import { HeroSprite } from "@/components/sprites/HeroSprite";
import { EnemySprite } from "@/components/sprites/EnemySprite";
import { ROOM_META } from "@/lib/rooms";
import { useGameStore } from "@/state/gameStore";
import type { HeroClass, LocationPortfolioEntry, RoomId } from "@/types/game";

type Direction = "left" | "right";
type EnemyVariant = "slime" | "skeleton" | "bot";

interface PlayerState {
  x: number;
  y: number;
  facing: Direction;
  attacking: boolean;
}

interface EnemyState {
  id: string;
  x: number;
  y: number;
  alive: boolean;
  variant: EnemyVariant;
}

interface DoorNode {
  id: string;
  x: number;
  y: number;
  targetRoom: RoomId;
  lockedByClear: boolean;
}

const STEP = 2.2;
const INTERACT_DISTANCE = 12;

const typedPortfolioData = locationPortfolioData as LocationPortfolioEntry[];

const clampPosition = (value: number): number => Math.min(95, Math.max(5, value));

const ROOM_SPAWN: Record<RoomId, { x: number; y: number }> = {
  0: { x: 12, y: 66 },
  1: { x: 12, y: 66 },
  2: { x: 12, y: 66 },
  3: { x: 12, y: 66 },
  4: { x: 12, y: 66 },
  5: { x: 12, y: 66 },
};

const ROOM_ENEMIES: Record<RoomId, Array<{ x: number; y: number; variant: EnemyVariant }>> = {
  0: [
    { x: 45, y: 40, variant: "slime" },
    { x: 65, y: 66, variant: "skeleton" },
  ],
  1: [
    { x: 42, y: 38, variant: "skeleton" },
    { x: 64, y: 58, variant: "slime" },
    { x: 77, y: 34, variant: "bot" },
  ],
  2: [
    { x: 36, y: 62, variant: "bot" },
    { x: 52, y: 42, variant: "skeleton" },
    { x: 66, y: 64, variant: "slime" },
    { x: 82, y: 40, variant: "bot" },
  ],
  3: [
    { x: 40, y: 40, variant: "skeleton" },
    { x: 58, y: 62, variant: "bot" },
    { x: 76, y: 38, variant: "skeleton" },
    { x: 70, y: 70, variant: "slime" },
  ],
  4: [
    { x: 40, y: 66, variant: "bot" },
    { x: 58, y: 42, variant: "bot" },
    { x: 73, y: 63, variant: "skeleton" },
    { x: 82, y: 34, variant: "slime" },
  ],
  5: [],
};

const ROOM_DOORS: Record<RoomId, DoorNode[]> = {
  0: [{ id: "door-next", x: 92, y: 50, targetRoom: 1, lockedByClear: true }],
  1: [
    { id: "door-prev", x: 8, y: 50, targetRoom: 0, lockedByClear: false },
    { id: "door-next", x: 92, y: 50, targetRoom: 2, lockedByClear: true },
  ],
  2: [
    { id: "door-prev", x: 8, y: 50, targetRoom: 1, lockedByClear: false },
    { id: "door-next", x: 92, y: 50, targetRoom: 3, lockedByClear: true },
  ],
  3: [
    { id: "door-prev", x: 8, y: 50, targetRoom: 2, lockedByClear: false },
    { id: "door-next", x: 92, y: 50, targetRoom: 4, lockedByClear: true },
  ],
  4: [
    { id: "door-prev", x: 8, y: 50, targetRoom: 3, lockedByClear: false },
    { id: "door-next", x: 92, y: 50, targetRoom: 5, lockedByClear: true },
  ],
  5: [{ id: "door-prev", x: 8, y: 50, targetRoom: 4, lockedByClear: false }],
};

const normalizeKey = (key: string): string => key.toLowerCase();

const isTypingContext = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    target.getAttribute("contenteditable") === "true"
  );
};

const getMovementDirection = (keys: Set<string>): { dx: number; dy: number } => {
  let dx = 0;
  let dy = 0;

  if (keys.has("arrowup") || keys.has("w")) {
    dy -= 1;
  }
  if (keys.has("arrowdown") || keys.has("s")) {
    dy += 1;
  }
  if (keys.has("arrowleft") || keys.has("a")) {
    dx -= 1;
  }
  if (keys.has("arrowright") || keys.has("d")) {
    dx += 1;
  }

  return { dx, dy };
};

const enemyIdForRoom = (roomId: RoomId, index: number): string =>
  `room-${roomId}-enemy-${index + 1}`;

const attackRangeByClass = (heroClass: HeroClass): number =>
  heroClass === "mage" ? 23 : 15;

export function RoomExplorer({ roomId }: { roomId: RoomId }) {
  const heroClass = useGameStore((state) => state.heroClass);
  const setRoom = useGameStore((state) => state.setRoom);
  const setNotification = useGameStore((state) => state.setNotification);
  const registerEnemyDefeat = useGameStore((state) => state.registerEnemyDefeat);
  const markRoomCleared = useGameStore((state) => state.markRoomCleared);
  const markPortfolioShown = useGameStore((state) => state.markPortfolioShown);
  const clearedRooms = useGameStore((state) => state.clearedRooms);
  const defeatedEnemies = useGameStore((state) => state.defeatedEnemies);
  const shownPortfolioRooms = useGameStore((state) => state.shownPortfolioRooms);

  const activeHeroClass: HeroClass = heroClass ?? "swordsman";

  const [player, setPlayer] = useState<PlayerState>({
    x: ROOM_SPAWN[roomId].x,
    y: ROOM_SPAWN[roomId].y,
    facing: "right",
    attacking: false,
  });
  const [enemies, setEnemies] = useState<EnemyState[]>(() =>
    ROOM_ENEMIES[roomId].map((enemy, index) => {
      const enemyId = enemyIdForRoom(roomId, index);
      return {
        id: enemyId,
        x: enemy.x,
        y: enemy.y,
        variant: enemy.variant,
        alive: !defeatedEnemies.includes(enemyId),
      };
    })
  );
  const keysRef = useRef<Set<string>>(new Set());
  const attackTimeoutRef = useRef<number | null>(null);
  const slashTimeoutRef = useRef<number | null>(null);
  const [showSlash, setShowSlash] = useState(false);
  const [moving, setMoving] = useState(false);

  const portfolioEntry = useMemo(
    () => typedPortfolioData.find((entry) => entry.room === roomId) ?? null,
    [roomId]
  );

  const aliveEnemies = useMemo(
    () => enemies.filter((enemy) => enemy.alive),
    [enemies]
  );

  const roomCleared = roomId === 5 || clearedRooms.includes(roomId) || aliveEnemies.length === 0;
  const showPortfolioCard = Boolean(
    portfolioEntry && roomCleared && !shownPortfolioRooms.includes(roomId)
  );

  useEffect(() => {
    if (roomId === 5 || aliveEnemies.length !== 0 || clearedRooms.includes(roomId)) {
      return;
    }

    markRoomCleared(roomId);
    setNotification("Location cleared.");
  }, [aliveEnemies.length, clearedRooms, markRoomCleared, roomId, setNotification]);

  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      if (showPortfolioCard) {
        return;
      }

      setPlayer((previous) => ({
        ...previous,
        x: clampPosition(previous.x + dx * STEP),
        y: clampPosition(previous.y + dy * STEP),
        facing: dx < 0 ? "left" : dx > 0 ? "right" : previous.facing,
      }));
    },
    [showPortfolioCard]
  );

  const attack = useCallback(() => {
    if (showPortfolioCard) {
      return;
    }

    let anyKilled = false;
    const activeRange = attackRangeByClass(activeHeroClass);

    setShowSlash(true);
    if (slashTimeoutRef.current) {
      window.clearTimeout(slashTimeoutRef.current);
    }
    slashTimeoutRef.current = window.setTimeout(() => setShowSlash(false), 150);

    setPlayer((previous) => ({ ...previous, attacking: true }));
    if (attackTimeoutRef.current) {
      window.clearTimeout(attackTimeoutRef.current);
    }
    attackTimeoutRef.current = window.setTimeout(
      () => setPlayer((previous) => ({ ...previous, attacking: false })),
      170
    );

    const targetX = player.x + (player.facing === "right" ? 12 : -12);
    const targetY = player.y;

    setEnemies((previous) =>
      previous.map((enemy) => {
        if (!enemy.alive) {
          return enemy;
        }
        const distance = Math.hypot(enemy.x - targetX, enemy.y - targetY);
        if (distance > activeRange) {
          return enemy;
        }
        anyKilled = true;
        registerEnemyDefeat(enemy.id);
        return {
          ...enemy,
          alive: false,
        };
      })
    );

    if (anyKilled) {
      setNotification("Enemy defeated.");
    }
  }, [
    activeHeroClass,
    player.facing,
    player.x,
    player.y,
    registerEnemyDefeat,
    setNotification,
    showPortfolioCard,
  ]);

  const nearestDoor = useMemo<DoorNode | null>(() => {
    const doors = ROOM_DOORS[roomId];
    let chosen: DoorNode | null = null;
    let min = Number.POSITIVE_INFINITY;

    doors.forEach((door) => {
      const distance = Math.hypot(door.x - player.x, door.y - player.y);
      if (distance < min) {
        min = distance;
        chosen = door;
      }
    });

    if (chosen && min <= INTERACT_DISTANCE) {
      return chosen;
    }

    return null;
  }, [player.x, player.y, roomId]);

  const openDoor = useCallback(
    (door: DoorNode | null) => {
      if (!door || showPortfolioCard) {
        return;
      }

      if (door.lockedByClear && !roomCleared) {
        setNotification("Defeat all enemies.");
        return;
      }

      setRoom(door.targetRoom);
    },
    [roomCleared, setNotification, setRoom, showPortfolioCard]
  );

  const closePortfolioCard = useCallback(() => {
    markPortfolioShown(roomId);
  }, [markPortfolioShown, roomId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingContext(event.target)) {
        return;
      }

      const key = normalizeKey(event.key);

      if (showPortfolioCard) {
        if (key === "enter" || key === "e" || key === " ") {
          event.preventDefault();
          closePortfolioCard();
        }
        return;
      }

      if (
        key === "arrowup" ||
        key === "arrowdown" ||
        key === "arrowleft" ||
        key === "arrowright" ||
        key === "w" ||
        key === "a" ||
        key === "s" ||
        key === "d"
      ) {
        event.preventDefault();
        keysRef.current.add(key);
      }

      if (key === " " || key === "spacebar" || key === "f") {
        event.preventDefault();
        attack();
      }

      if (key === "e" || key === "enter") {
        event.preventDefault();
        openDoor(nearestDoor);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysRef.current.delete(normalizeKey(event.key));
    };

    const movementInterval = window.setInterval(() => {
      if (showPortfolioCard) {
        setMoving(false);
        return;
      }

      const direction = getMovementDirection(keysRef.current);
      if (direction.dx !== 0 || direction.dy !== 0) {
        setMoving(true);
        movePlayer(direction.dx, direction.dy);
      } else {
        setMoving(false);
      }
    }, 16);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.clearInterval(movementInterval);
      if (attackTimeoutRef.current) {
        window.clearTimeout(attackTimeoutRef.current);
      }
      if (slashTimeoutRef.current) {
        window.clearTimeout(slashTimeoutRef.current);
      }
    };
  }, [attack, closePortfolioCard, movePlayer, nearestDoor, openDoor, showPortfolioCard]);

  useEffect(() => {
    if (showPortfolioCard) {
      return;
    }

    const aiInterval = window.setInterval(() => {
      setEnemies((previous) =>
        previous.map((enemy) => {
          if (!enemy.alive) {
            return enemy;
          }

          const toPlayerX = player.x - enemy.x;
          const toPlayerY = player.y - enemy.y;
          const distanceToPlayer = Math.hypot(toPlayerX, toPlayerY);
          const chaseFactor = distanceToPlayer < 24 ? 0.8 : 0.25;
          const jitterX = (Math.random() - 0.5) * 4;
          const jitterY = (Math.random() - 0.5) * 4;

          return {
            ...enemy,
            x: clampPosition(enemy.x + toPlayerX * 0.02 * chaseFactor + jitterX),
            y: clampPosition(enemy.y + toPlayerY * 0.02 * chaseFactor + jitterY),
          };
        })
      );
    }, 420);

    return () => window.clearInterval(aiInterval);
  }, [player.x, player.y, showPortfolioCard]);

  return (
    <section className="arena-shell">
      <div className="arena-top">
        <strong>{ROOM_META[roomId].title}</strong>
        <span>
          Enemies: {aliveEnemies.length}/{enemies.length}
        </span>
      </div>

      <div className={`arena-map room-theme-${roomId}`}>
        {ROOM_DOORS[roomId].map((door) => {
          const locked = door.lockedByClear && !roomCleared;
          const nearby = nearestDoor?.id === door.id;
          return (
            <button
              key={door.id}
              type="button"
              className={`arena-door ${locked ? "locked" : ""} ${nearby ? "nearby" : ""}`}
              style={{
                left: `${door.x}%`,
                top: `${door.y}%`,
              }}
              onClick={() => openDoor(door)}
              aria-label={`Go to room ${door.targetRoom}`}
            >
              {locked ? "LOCK" : "DOOR"}
            </button>
          );
        })}

        {enemies.map((enemy) => (
          <motion.div
            key={enemy.id}
            className="enemy-unit"
            animate={{ left: `${enemy.x}%`, top: `${enemy.y}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
          >
            <EnemySprite variant={enemy.variant} alive={enemy.alive} />
          </motion.div>
        ))}

        <motion.div
          className="player-unit"
          animate={{ left: `${player.x}%`, top: `${player.y}%` }}
          transition={{ type: "spring", stiffness: 380, damping: 25 }}
        >
          <HeroSprite
            moving={moving}
            attacking={player.attacking}
            facing={player.facing}
            heroClass={activeHeroClass}
          />
          {showSlash ? (
            <motion.div
              className={`slash-wave ${player.facing === "left" ? "left" : "right"} ${
                activeHeroClass === "mage" ? "mage" : "swordsman"
              }`}
              initial={{ opacity: 0.88, scale: 0.5 }}
              animate={{ opacity: 0, scale: 1.3 }}
              transition={{ duration: 0.14 }}
            />
          ) : null}
        </motion.div>

        {showPortfolioCard && portfolioEntry ? (
          <motion.div
            className="portfolio-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.article
              className="portfolio-card"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <p className="portfolio-location">{portfolioEntry.location}</p>
              <h2>{portfolioEntry.title}</h2>
              <p className="portfolio-summary">{portfolioEntry.summary}</p>
              <ul className="portfolio-points">
                {portfolioEntry.highlights.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <p className="portfolio-stack">{portfolioEntry.stack.join(" • ")}</p>
              <button
                type="button"
                className="pixel-btn btn-primary"
                onClick={closePortfolioCard}
                aria-label="Close location portfolio card"
              >
                Continue
              </button>
            </motion.article>
          </motion.div>
        ) : null}
      </div>

      <div className="arena-bottom">
        <div className="controls-row">
          <span>Move: WASD / Arrows</span>
          <span>Attack: F / Space</span>
          <span>Door: E</span>
        </div>
        <div className="mobile-controls">
          <button
            type="button"
            className="pixel-btn"
            onClick={() => movePlayer(0, -1)}
            aria-label="Move up"
          >
            Up
          </button>
          <button
            type="button"
            className="pixel-btn"
            onClick={() => movePlayer(-1, 0)}
            aria-label="Move left"
          >
            Left
          </button>
          <button
            type="button"
            className="pixel-btn"
            onClick={() => movePlayer(1, 0)}
            aria-label="Move right"
          >
            Right
          </button>
          <button
            type="button"
            className="pixel-btn"
            onClick={() => movePlayer(0, 1)}
            aria-label="Move down"
          >
            Down
          </button>
          <button
            type="button"
            className="pixel-btn btn-primary"
            onClick={attack}
            aria-label="Attack enemy"
          >
            Attack
          </button>
          <button
            type="button"
            className="pixel-btn btn-primary"
            onClick={() => openDoor(nearestDoor)}
            aria-label="Use nearest door"
          >
            Door
          </button>
        </div>
      </div>
    </section>
  );
}
