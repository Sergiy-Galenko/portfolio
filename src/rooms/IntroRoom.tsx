"use client";

import { motion } from "framer-motion";

import { loadCheckpoint } from "@/lib/storage";
import { useGameStore } from "@/state/gameStore";

export function IntroRoom() {
  const setRoom = useGameStore((state) => state.setRoom);
  const applyCheckpoint = useGameStore((state) => state.applyCheckpoint);
  const setNotification = useGameStore((state) => state.setNotification);
  const soundOn = useGameStore((state) => state.soundOn);
  const toggleSound = useGameStore((state) => state.toggleSound);

  const handleLoadCheckpoint = () => {
    const checkpoint = loadCheckpoint();
    if (!checkpoint) {
      setNotification("No checkpoint found. Start a new run.");
      return;
    }

    applyCheckpoint(checkpoint);
  };

  return (
    <section className="room intro-room">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="room-panel"
      >
        <p className="room-eyebrow">Escape the Deadline</p>
        <h1 className="room-title">Quest Initialization</h1>
        <p className="room-description">
          Goal: prove you can ship products, not only write code.
        </p>

        <div className="button-row">
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(126, 211, 33, 0.5)" }}
            whileTap={{ scale: 0.97 }}
            className="pixel-btn btn-primary"
            onClick={() => setRoom(1)}
            aria-label="Start game and go to room 1"
          >
            Start
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="pixel-btn"
            onClick={handleLoadCheckpoint}
            aria-label="Load last checkpoint"
          >
            Load last checkpoint
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="pixel-btn"
            onClick={toggleSound}
            aria-label="Toggle game sound"
          >
            Sound: {soundOn ? "ON" : "OFF"}
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}

