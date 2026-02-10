"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import bossProjectData from "@/data/bossProject.json";
import { useGameStore } from "@/state/gameStore";
import type { BossProject } from "@/types/game";

const typedBossProject = bossProjectData as BossProject;

export function LegacyBossRoom() {
  const setRoom = useGameStore((state) => state.setRoom);
  const completeQuest = useGameStore((state) => state.completeQuest);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleSelectAction = (action: string) => {
    setSelectedAction(action);
    completeQuest("quest-legacy-action");
  };

  return (
    <section className="room">
      <div className="room-panel">
        <h2 className="room-title">Room 3: Boss Fight (Legacy Code)</h2>
        <p className="room-description">{typedBossProject.context}</p>

        <div className="action-grid">
          {typedBossProject.actions.map((action) => (
            <motion.button
              key={action}
              type="button"
              className={`pixel-btn ${selectedAction === action ? "btn-primary" : ""}`}
              onClick={() => handleSelectAction(action)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Boss action ${action}`}
            >
              {action}
            </motion.button>
          ))}
        </div>

        <div className="stub-panel">
          <h3>{typedBossProject.title}</h3>
          <p>
            {selectedAction
              ? `Action selected: ${selectedAction}. Detailed simulation will be expanded in the next iteration.`
              : "Select one of the boss actions to inspect details."}
          </p>
          <ul>
            {typedBossProject.outcomes.map((outcome) => (
              <li key={outcome}>{outcome}</li>
            ))}
          </ul>
        </div>

        <motion.button
          type="button"
          className="pixel-btn btn-primary"
          onClick={() => setRoom(4)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          aria-label="Continue to room 4 system design puzzle"
        >
          Continue to Room 4
        </motion.button>
      </div>
    </section>
  );
}
