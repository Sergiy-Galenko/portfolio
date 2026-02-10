"use client";

import { motion } from "framer-motion";
import type { HeroClass } from "@/types/game";

interface HeroSpriteProps {
  moving: boolean;
  attacking: boolean;
  facing: "left" | "right";
  heroClass: HeroClass;
}

export function HeroSprite({
  moving,
  attacking,
  facing,
  heroClass,
}: HeroSpriteProps) {
  const isMage = heroClass === "mage";
  const armorGradient = isMage ? "heroArmorMage" : "heroArmorSword";
  const capeColor = isMage ? "#563f97" : "#385c87";
  const weaponGlow = isMage ? "#be8bff" : "#6be2ff";

  return (
    <motion.svg
      width="56"
      height="64"
      viewBox="0 0 56 64"
      role="img"
      aria-label="Hero character"
      animate={{
        scaleX: facing === "left" ? -1 : 1,
        y: moving ? [0, -2, 0] : 0,
      }}
      transition={{
        y: { repeat: moving ? Number.POSITIVE_INFINITY : 0, duration: 0.35 },
      }}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="heroArmorSword" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8ee5ff" />
          <stop offset="100%" stopColor="#2f6da1" />
        </linearGradient>
        <linearGradient id="heroArmorMage" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c8a8ff" />
          <stop offset="100%" stopColor="#5b3f99" />
        </linearGradient>
      </defs>

      <motion.ellipse
        cx="28"
        cy="59"
        rx="13"
        ry="4"
        fill="rgba(4,10,20,0.55)"
        animate={{ opacity: moving ? [0.45, 0.65, 0.45] : 0.45 }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.4 }}
      />

      <motion.g
        animate={attacking ? { rotate: -18, x: 6, y: -2 } : { rotate: 0, x: 0, y: 0 }}
        style={{ originX: "28px", originY: "36px" }}
      >
        {isMage ? (
          <>
            <rect x="40" y="27" width="2.8" height="15" rx="1.3" fill="#d6c3ff" />
            <circle cx="41.4" cy="25.8" r="3.2" fill={weaponGlow} />
            <circle cx="41.4" cy="25.8" r="1.4" fill="#ecdeff" />
          </>
        ) : (
          <>
            <rect x="39" y="29" width="11" height="3" rx="2" fill="#e7edf4" />
            <rect x="48" y="29.4" width="6" height="2.2" rx="1" fill={weaponGlow} />
          </>
        )}
      </motion.g>

      <rect x="24" y="26" width="10" height="15" rx="4" fill={`url(#${armorGradient})`} />
      <rect x="18" y="28" width="7" height="13" rx="3" fill={capeColor} />
      <rect x="31" y="28" width="7" height="13" rx="3" fill={capeColor} />

      <ellipse cx="28" cy="17.5" rx="9.2" ry="10.5" fill="#f3ca9b" />
      <path
        d="M19 16 C21 8, 34 7, 37 16 L37 12 C37 7, 33 4, 28 4 C22 4, 18 8, 19 12 Z"
        fill={isMage ? "#332559" : "#1f3047"}
      />
      <circle cx="24.6" cy="17.2" r="1.2" fill="#1d2633" />
      <circle cx="31.2" cy="17.2" r="1.2" fill="#1d2633" />
      <path d="M25 22.5 C27 24.2, 29 24.2, 31 22.5" stroke="#9a6847" strokeWidth="1.2" />

      <rect x="22" y="41" width="5.6" height="14" rx="2.8" fill={isMage ? "#433070" : "#2f5d85"} />
      <rect
        x="28.4"
        y="41"
        width="5.6"
        height="14"
        rx="2.8"
        fill={isMage ? "#433070" : "#2f5d85"}
      />
      <rect x="21.4" y="53" width="6.8" height="3.6" rx="1.8" fill="#16263b" />
      <rect x="28" y="53" width="6.8" height="3.6" rx="1.8" fill="#16263b" />
    </motion.svg>
  );
}
