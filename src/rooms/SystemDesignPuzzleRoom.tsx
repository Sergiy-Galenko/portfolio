"use client";

import { motion } from "framer-motion";

import { useGameStore } from "@/state/gameStore";

const PUZZLE_BLOCKS = ["API Gateway", "Auth", "Queue", "Cache", "DB"];

export function SystemDesignPuzzleRoom() {
  const setRoom = useGameStore((state) => state.setRoom);
  const completeQuest = useGameStore((state) => state.completeQuest);

  return (
    <section className="room">
      <div className="room-panel">
        <h2 className="room-title">Room 4: Puzzle (System Design)</h2>
        <p className="room-description">
          Drag & drop puzzle area is prepared for the next MVP slice. Blocks and
          validation logic are scaffolded.
        </p>

        <div className="stub-panel">
          <h3>Architecture Canvas (Stub)</h3>
          <div className="puzzle-zone">
            {PUZZLE_BLOCKS.map((block) => (
              <motion.div
                key={block}
                className="puzzle-block"
                whileHover={{ y: -3 }}
              >
                {block}
              </motion.div>
            ))}
          </div>
          <p className="muted">
            TODO: connect drag-and-drop state and architecture scoring.
          </p>
          <button
            type="button"
            className="pixel-btn"
            onClick={() => completeQuest("quest-design-zone")}
            aria-label="Inspect and complete system design quest"
          >
            Inspect architecture notes
          </button>
        </div>

        <motion.button
          type="button"
          className="pixel-btn btn-primary"
          onClick={() => setRoom(5)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          aria-label="Continue to room 5 exit contact portal"
        >
          Continue to Room 5
        </motion.button>
      </div>
    </section>
  );
}
