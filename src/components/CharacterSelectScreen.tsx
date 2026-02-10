"use client";

import { motion } from "framer-motion";

import { HeroSprite } from "@/components/sprites/HeroSprite";
import { useGameStore } from "@/state/gameStore";
import type { HeroClass } from "@/types/game";

interface HeroOption {
  id: HeroClass;
  title: string;
  subtitle: string;
}

const HERO_OPTIONS: HeroOption[] = [
  {
    id: "mage",
    title: "MAG",
    subtitle: "Long range magic attacks",
  },
  {
    id: "swordsman",
    title: "Mechnyk",
    subtitle: "Fast close combat",
  },
];

export function CharacterSelectScreen() {
  const chooseHeroClass = useGameStore((state) => state.chooseHeroClass);

  return (
    <section className="character-select-screen">
      <div className="character-select-wrap">
        <h1>Choose your hero</h1>
        <div className="character-grid">
          {HERO_OPTIONS.map((hero) => (
            <motion.button
              key={hero.id}
              type="button"
              className="character-card"
              whileHover={{ y: -3, boxShadow: "0 0 24px rgba(80, 203, 255, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => chooseHeroClass(hero.id)}
              aria-label={`Choose ${hero.title} class`}
            >
              <div className="character-preview">
                <HeroSprite
                  moving={true}
                  attacking={hero.id === "swordsman"}
                  facing="right"
                  heroClass={hero.id}
                />
              </div>
              <h2>{hero.title}</h2>
              <p>{hero.subtitle}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

