"use client";

import { motion } from "framer-motion";

interface EnemySpriteProps {
  variant: "slime" | "skeleton" | "bot";
  alive: boolean;
}

const variantFill = {
  slime: {
    body: "#58e08f",
    accent: "#2f8f5b",
  },
  skeleton: {
    body: "#efeee9",
    accent: "#8d8f9e",
  },
  bot: {
    body: "#f3a66d",
    accent: "#8e3a4d",
  },
};

export function EnemySprite({ variant, alive }: EnemySpriteProps) {
  const colors = variantFill[variant];

  return (
    <motion.svg
      width="52"
      height="58"
      viewBox="0 0 52 58"
      role="img"
      aria-label="Enemy character"
      animate={
        alive
          ? {
              y: [0, -1.5, 0],
              opacity: 1,
              scale: 1,
            }
          : {
              opacity: 0,
              scale: 0.75,
            }
      }
      transition={{
        y: { repeat: alive ? Number.POSITIVE_INFINITY : 0, duration: 0.42 },
        opacity: { duration: 0.22 },
        scale: { duration: 0.22 },
      }}
      style={{ overflow: "visible" }}
    >
      <ellipse cx="26" cy="53" rx="12" ry="3.8" fill="rgba(8,10,14,0.42)" />
      <ellipse cx="26" cy="31" rx="12.5" ry="14.4" fill={colors.body} />
      <ellipse cx="26" cy="36" rx="8.5" ry="6.5" fill={colors.accent} opacity="0.38" />
      <circle cx="21.6" cy="28.2" r="2" fill="#1f2733" />
      <circle cx="30.4" cy="28.2" r="2" fill="#1f2733" />
      <path d="M20.8 35 C23 37, 29 37, 31.2 35" stroke="#1f2733" strokeWidth="1.3" />
      {variant === "skeleton" ? (
        <>
          <rect x="12" y="22" width="4" height="14" rx="2" fill={colors.accent} />
          <rect x="36" y="22" width="4" height="14" rx="2" fill={colors.accent} />
        </>
      ) : null}
      {variant === "bot" ? (
        <rect x="21" y="14.5" width="10" height="4" rx="2" fill={colors.accent} />
      ) : null}
    </motion.svg>
  );
}

