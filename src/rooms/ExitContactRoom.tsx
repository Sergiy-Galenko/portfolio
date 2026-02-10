"use client";

import { FormEvent } from "react";
import { motion } from "framer-motion";

import { useGameStore } from "@/state/gameStore";

const classNameMap = {
  "backend-wizard": "Backend Wizard",
  "mobile-ranger": "Mobile Ranger",
  "fullstack-paladin": "Full-Stack Paladin",
  "automation-rogue": "Automation Rogue",
};

export function ExitContactRoom() {
  const chosenClass = useGameStore((state) => state.chosenClass);
  const fixedErrors = useGameStore((state) => state.fixedErrors);
  const unlockedProjects = useGameStore((state) => state.unlockedProjects);
  const hudStats = useGameStore((state) => state.hudStats);
  const setNotification = useGameStore((state) => state.setNotification);
  const completeQuest = useGameStore((state) => state.completeQuest);
  const resetGame = useGameStore((state) => state.resetGame);

  const handleHireSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    completeQuest("quest-contact-signal");
    setNotification("Hire request captured. Wire this to your backend later.");
  };

  return (
    <section className="room">
      <div className="room-panel">
        <h2 className="room-title">Room 5: Exit (Contact Portal)</h2>
        <p className="room-description">
          Quest summary and contact portal. This room is scaffolded and ready for
          content expansion.
        </p>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>Achievements</h3>
            <ul>
              <li>Chosen Class: {chosenClass ? classNameMap[chosenClass] : "None"}</li>
              <li>Fixed CI Errors: {fixedErrors.length}</li>
              <li>Unlocked Cases: {unlockedProjects.length}</li>
              <li>Energy Left: {hudStats.hp}</li>
            </ul>
          </div>
          <div className="summary-card">
            <h3>Contact Portal</h3>
            <div className="button-row">
              <a
                href="https://t.me/yourhandle"
                target="_blank"
                rel="noreferrer"
                className="pixel-btn link-btn"
                aria-label="Open Telegram profile"
              >
                Telegram
              </a>
              <a
                href="mailto:you@example.com"
                className="pixel-btn link-btn"
                aria-label="Send email"
              >
                Email
              </a>
              <a
                href="/cv.pdf"
                className="pixel-btn link-btn"
                aria-label="Download CV file"
              >
                Download CV
              </a>
            </div>
          </div>
        </div>

        <form className="hire-form" onSubmit={handleHireSubmit}>
          <h3>Hire Me</h3>
          <label>
            Name
            <input name="name" type="text" required />
          </label>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            Brief
            <textarea name="brief" rows={4} required />
          </label>
          <div className="button-row">
            <motion.button
              type="submit"
              className="pixel-btn btn-primary"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              aria-label="Submit hire form"
            >
              Send request
            </motion.button>
            <motion.button
              type="button"
              className="pixel-btn"
              onClick={resetGame}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              aria-label="Restart quest from intro"
            >
              Restart Quest
            </motion.button>
          </div>
        </form>
      </div>
    </section>
  );
}
