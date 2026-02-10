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
type ZoneType = "hazard" | "heal" | "boost";
type SceneryType = "tree" | "rock" | "crystal" | "torch" | "ruin" | "lava";

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
  hp: number;
  maxHp: number;
}

interface DoorNode {
  id: string;
  x: number;
  y: number;
  targetRoom: RoomId;
  lockedByClear: boolean;
}

interface ZoneNode {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: ZoneType;
}

interface SceneryNode {
  id: string;
  x: number;
  y: number;
  type: SceneryType;
}

interface RoomBehavior {
  subtitle: string;
  enemyAggression: number;
  jitter: number;
}

interface EnemyStats {
  maxHp: number;
  damage: number;
  attackRange: number;
  attackCooldownMs: number;
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

const ROOM_BEHAVIOR: Record<RoomId, RoomBehavior> = {
  0: { subtitle: "Forest Gate", enemyAggression: 0.75, jitter: 2.1 },
  1: { subtitle: "Iron Bastion", enemyAggression: 0.95, jitter: 1.9 },
  2: { subtitle: "Ember Mine", enemyAggression: 1.15, jitter: 2.5 },
  3: { subtitle: "Shadow Keep", enemyAggression: 1.25, jitter: 1.7 },
  4: { subtitle: "Crystal Labyrinth", enemyAggression: 1.05, jitter: 3.1 },
  5: { subtitle: "Portal Nexus", enemyAggression: 0.5, jitter: 1.1 },
};

const ENEMY_STATS: Record<EnemyVariant, EnemyStats> = {
  slime: {
    maxHp: 2,
    damage: 5,
    attackRange: 9,
    attackCooldownMs: 1000,
  },
  skeleton: {
    maxHp: 3,
    damage: 7,
    attackRange: 10,
    attackCooldownMs: 900,
  },
  bot: {
    maxHp: 4,
    damage: 10,
    attackRange: 14,
    attackCooldownMs: 1150,
  },
};

const ROOM_ENEMIES: Record<RoomId, Array<{ x: number; y: number; variant: EnemyVariant }>> = {
  0: [
    { x: 44, y: 40, variant: "slime" },
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

const ROOM_ZONES: Record<RoomId, ZoneNode[]> = {
  0: [{ id: "spring", x: 24, y: 28, radius: 10, type: "heal" }],
  1: [{ id: "rune", x: 56, y: 50, radius: 11, type: "boost" }],
  2: [{ id: "lava", x: 58, y: 44, radius: 14, type: "hazard" }],
  3: [
    { id: "shadow", x: 48, y: 58, radius: 14, type: "hazard" },
    { id: "rage", x: 76, y: 30, radius: 9, type: "boost" },
  ],
  4: [
    { id: "crystal-heal", x: 30, y: 35, radius: 9, type: "heal" },
    { id: "crystal-boost", x: 70, y: 64, radius: 9, type: "boost" },
  ],
  5: [{ id: "portal-aura", x: 54, y: 48, radius: 11, type: "heal" }],
};

const ROOM_SCENERY: Record<RoomId, SceneryNode[]> = {
  0: [
    { id: "tree-a", x: 18, y: 58, type: "tree" },
    { id: "tree-b", x: 30, y: 72, type: "tree" },
    { id: "rock-a", x: 74, y: 62, type: "rock" },
  ],
  1: [
    { id: "ruin-a", x: 28, y: 30, type: "ruin" },
    { id: "ruin-b", x: 71, y: 29, type: "ruin" },
    { id: "torch-a", x: 50, y: 18, type: "torch" },
  ],
  2: [
    { id: "lava-a", x: 50, y: 45, type: "lava" },
    { id: "lava-b", x: 67, y: 69, type: "lava" },
    { id: "rock-b", x: 24, y: 56, type: "rock" },
  ],
  3: [
    { id: "ruin-c", x: 19, y: 25, type: "ruin" },
    { id: "torch-b", x: 82, y: 27, type: "torch" },
    { id: "rock-c", x: 63, y: 73, type: "rock" },
  ],
  4: [
    { id: "crystal-a", x: 24, y: 34, type: "crystal" },
    { id: "crystal-b", x: 72, y: 63, type: "crystal" },
    { id: "rock-d", x: 57, y: 22, type: "rock" },
  ],
  5: [
    { id: "crystal-c", x: 46, y: 34, type: "crystal" },
    { id: "crystal-d", x: 66, y: 58, type: "crystal" },
  ],
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
  heroClass === "mage" ? 24 : 15;

const attackDamageByClass = (heroClass: HeroClass): number =>
  heroClass === "mage" ? 1 : 2;

const attackCooldownByClass = (heroClass: HeroClass): number =>
  heroClass === "mage" ? 280 : 190;

const isInsideZone = (x: number, y: number, zone: ZoneNode): boolean =>
  Math.hypot(zone.x - x, zone.y - y) <= zone.radius;

const zoneAtPosition = (roomId: RoomId, x: number, y: number): ZoneNode | null => {
  const zones = ROOM_ZONES[roomId];
  for (const zone of zones) {
    if (isInsideZone(x, y, zone)) {
      return zone;
    }
  }
  return null;
};

export function RoomExplorer({ roomId }: { roomId: RoomId }) {
  const heroClass = useGameStore((state) => state.heroClass);
  const playerHp = useGameStore((state) => state.hudStats.hp);
  const setRoom = useGameStore((state) => state.setRoom);
  const setNotification = useGameStore((state) => state.setNotification);
  const registerEnemyDefeat = useGameStore((state) => state.registerEnemyDefeat);
  const markRoomCleared = useGameStore((state) => state.markRoomCleared);
  const markPortfolioShown = useGameStore((state) => state.markPortfolioShown);
  const damagePlayer = useGameStore((state) => state.damagePlayer);
  const healPlayer = useGameStore((state) => state.healPlayer);
  const restorePlayerHealth = useGameStore((state) => state.restorePlayerHealth);
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
      const stats = ENEMY_STATS[enemy.variant];
      const deadByCheckpoint = defeatedEnemies.includes(enemyId);
      return {
        id: enemyId,
        x: enemy.x,
        y: enemy.y,
        variant: enemy.variant,
        hp: deadByCheckpoint ? 0 : stats.maxHp,
        maxHp: stats.maxHp,
        alive: !deadByCheckpoint,
      };
    })
  );
  const keysRef = useRef<Set<string>>(new Set());
  const attackTimeoutRef = useRef<number | null>(null);
  const slashTimeoutRef = useRef<number | null>(null);
  const enemyAttackRef = useRef<Record<string, number>>({});
  const attackGateRef = useRef(0);
  const playerRef = useRef<PlayerState>(player);
  const enemiesRef = useRef<EnemyState[]>(enemies);
  const respawnLockRef = useRef(false);
  const [showSlash, setShowSlash] = useState(false);
  const [moving, setMoving] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);

  const portfolioEntry = useMemo(
    () => typedPortfolioData.find((entry) => entry.room === roomId) ?? null,
    [roomId]
  );

  const roomBehavior = ROOM_BEHAVIOR[roomId];

  const aliveEnemies = useMemo(
    () => enemies.filter((enemy) => enemy.alive),
    [enemies]
  );

  const roomCleared = roomId === 5 || clearedRooms.includes(roomId) || aliveEnemies.length === 0;
  const showPortfolioCard = Boolean(
    portfolioEntry && roomCleared && !shownPortfolioRooms.includes(roomId)
  );

  const activeZone = useMemo(
    () => zoneAtPosition(roomId, player.x, player.y),
    [player.x, player.y, roomId]
  );

  useEffect(() => {
    if (roomId === 5 || aliveEnemies.length !== 0 || clearedRooms.includes(roomId)) {
      return;
    }

    markRoomCleared(roomId);
    setNotification("Location cleared.");
  }, [aliveEnemies.length, clearedRooms, markRoomCleared, roomId, setNotification]);

  useEffect(() => {
    if (playerHp > 0 || respawnLockRef.current) {
      return;
    }

    respawnLockRef.current = true;
    setNotification("You were defeated. Respawned.");
    restorePlayerHealth(70);
    window.setTimeout(() => {
      setPlayer((previous) => ({
        ...previous,
        x: ROOM_SPAWN[roomId].x,
        y: ROOM_SPAWN[roomId].y,
        attacking: false,
      }));
      respawnLockRef.current = false;
    }, 120);
  }, [playerHp, restorePlayerHealth, roomId, setNotification]);

  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      if (showPortfolioCard) {
        return;
      }

      setPlayer((previous) => {
        const zone = zoneAtPosition(roomId, previous.x, previous.y);
        const speedMultiplier = zone?.type === "boost" ? 1.45 : 1;
        const step = STEP * speedMultiplier;

        return {
          ...previous,
          x: clampPosition(previous.x + dx * step),
          y: clampPosition(previous.y + dy * step),
          facing: dx < 0 ? "left" : dx > 0 ? "right" : previous.facing,
        };
      });
    },
    [roomId, showPortfolioCard]
  );

  const attack = useCallback(() => {
    if (showPortfolioCard) {
      return;
    }

    const now = Date.now();
    const cooldown = attackCooldownByClass(activeHeroClass);
    if (now - attackGateRef.current < cooldown) {
      return;
    }
    attackGateRef.current = now;

    const activeRange = attackRangeByClass(activeHeroClass);
    const activeDamage = attackDamageByClass(activeHeroClass);
    const targetX = playerRef.current.x + (playerRef.current.facing === "right" ? 12 : -12);
    const targetY = playerRef.current.y;

    let nearestTargetId: string | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const enemy of enemiesRef.current) {
      if (!enemy.alive) {
        continue;
      }
      const distance = Math.hypot(enemy.x - targetX, enemy.y - targetY);
      if (distance <= activeRange && distance < nearestDistance) {
        nearestDistance = distance;
        nearestTargetId = enemy.id;
      }
    }

    setShowSlash(true);
    if (slashTimeoutRef.current) {
      window.clearTimeout(slashTimeoutRef.current);
    }
    slashTimeoutRef.current = window.setTimeout(() => setShowSlash(false), 160);

    setPlayer((previous) => ({ ...previous, attacking: true }));
    if (attackTimeoutRef.current) {
      window.clearTimeout(attackTimeoutRef.current);
    }
    attackTimeoutRef.current = window.setTimeout(
      () => setPlayer((previous) => ({ ...previous, attacking: false })),
      180
    );

    if (!nearestTargetId) {
      return;
    }

    let defeated = false;
    setEnemies((previous) =>
      previous.map((enemy) => {
        if (enemy.id !== nearestTargetId || !enemy.alive) {
          return enemy;
        }

        const nextHp = Math.max(0, enemy.hp - activeDamage);
        if (nextHp <= 0) {
          defeated = true;
          registerEnemyDefeat(enemy.id);
          return {
            ...enemy,
            hp: 0,
            alive: false,
          };
        }

        return {
          ...enemy,
          hp: nextHp,
        };
      })
    );

    if (defeated) {
      setNotification("Enemy defeated.");
    }
  }, [activeHeroClass, registerEnemyDefeat, setNotification, showPortfolioCard]);

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

          const toPlayerX = playerRef.current.x - enemy.x;
          const toPlayerY = playerRef.current.y - enemy.y;
          const distanceToPlayer = Math.hypot(toPlayerX, toPlayerY);
          const chaseFactor = distanceToPlayer < 24 ? roomBehavior.enemyAggression : 0.22;
          const jitterX = (Math.random() - 0.5) * roomBehavior.jitter;
          const jitterY = (Math.random() - 0.5) * roomBehavior.jitter;

          return {
            ...enemy,
            x: clampPosition(enemy.x + toPlayerX * 0.02 * chaseFactor + jitterX),
            y: clampPosition(enemy.y + toPlayerY * 0.02 * chaseFactor + jitterY),
          };
        })
      );
    }, 330);

    return () => window.clearInterval(aiInterval);
  }, [roomBehavior.enemyAggression, roomBehavior.jitter, showPortfolioCard]);

  useEffect(() => {
    if (showPortfolioCard) {
      return;
    }

    const strikeInterval = window.setInterval(() => {
      const now = Date.now();
      let totalDamage = 0;

      for (const enemy of enemiesRef.current) {
        if (!enemy.alive) {
          continue;
        }

        const stats = ENEMY_STATS[enemy.variant];
        const distance = Math.hypot(
          enemy.x - playerRef.current.x,
          enemy.y - playerRef.current.y
        );
        if (distance > stats.attackRange) {
          continue;
        }

        const lastAttackAt = enemyAttackRef.current[enemy.id] ?? 0;
        if (now - lastAttackAt < stats.attackCooldownMs) {
          continue;
        }

        enemyAttackRef.current[enemy.id] = now;
        totalDamage += stats.damage;
      }

      if (totalDamage > 0) {
        damagePlayer(totalDamage);
        setPlayerHit(true);
        window.setTimeout(() => setPlayerHit(false), 150);
      }
    }, 120);

    return () => window.clearInterval(strikeInterval);
  }, [damagePlayer, showPortfolioCard]);

  useEffect(() => {
    if (showPortfolioCard) {
      return;
    }

    const zoneInterval = window.setInterval(() => {
      const zone = zoneAtPosition(roomId, playerRef.current.x, playerRef.current.y);
      if (!zone) {
        return;
      }

      if (zone.type === "hazard") {
        damagePlayer(2);
      } else if (zone.type === "heal") {
        healPlayer(1);
      }
    }, 520);

    return () => window.clearInterval(zoneInterval);
  }, [damagePlayer, healPlayer, roomId, showPortfolioCard]);

  return (
    <section className="arena-shell">
      <div className="arena-top">
        <strong>{ROOM_META[roomId].title}</strong>
        <span>
          {roomBehavior.subtitle} | Enemies: {aliveEnemies.length}/{enemies.length}
        </span>
      </div>

      <div className={`arena-map room-theme-${roomId} ${playerHit ? "player-hit" : ""}`}>
        {ROOM_SCENERY[roomId].map((item) => (
          <span
            key={item.id}
            className={`scenery scenery-${item.type}`}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          />
        ))}

        {ROOM_ZONES[roomId].map((zone) => (
          <span
            key={zone.id}
            className={`arena-zone zone-${zone.type} ${activeZone?.id === zone.id ? "active" : ""}`}
            style={{
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.radius * 2}%`,
              height: `${zone.radius * 2}%`,
            }}
          />
        ))}

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
            {enemy.alive ? (
              <div className="enemy-hp-track">
                <span
                  className="enemy-hp-fill"
                  style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                />
              </div>
            ) : null}
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
              <p className="portfolio-stack">{portfolioEntry.stack.join(" | ")}</p>
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

