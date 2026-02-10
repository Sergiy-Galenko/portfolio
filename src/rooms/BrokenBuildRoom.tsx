"use client";

import { motion } from "framer-motion";

import projectsData from "@/data/projects.json";
import { useGameStore } from "@/state/gameStore";
import type { ProjectCase } from "@/types/game";

interface BuildError {
  id: string;
  message: string;
  file: string;
  projectUnlock?: string;
}

const BUILD_ERRORS: BuildError[] = [
  {
    id: "ci-ts-2314",
    message: "TS2314: Generic type 'ApiResponse' requires 1 type argument.",
    file: "src/services/release.ts:41",
    projectUnlock: "ci-guardian",
  },
  {
    id: "ci-jest-timeout",
    message: "FAIL tests/pipeline.e2e.ts: timeout of 5000ms exceeded.",
    file: "tests/pipeline.e2e.ts:88",
    projectUnlock: "incident-fixer",
  },
  {
    id: "ci-env-missing",
    message: "Process exited with code 1: missing env var 'REDIS_URL'.",
    file: ".github/workflows/build.yml:27",
  },
];

const typedProjects = projectsData as ProjectCase[];

export function BrokenBuildRoom() {
  const fixedErrors = useGameStore((state) => state.fixedErrors);
  const unlockedProjects = useGameStore((state) => state.unlockedProjects);
  const markErrorFixed = useGameStore((state) => state.markErrorFixed);
  const setRoom = useGameStore((state) => state.setRoom);

  const fixedCount = BUILD_ERRORS.filter((error) =>
    fixedErrors.includes(error.id)
  ).length;
  const progress = Math.round((fixedCount / BUILD_ERRORS.length) * 100);

  const visibleProjects = typedProjects.filter((project) =>
    unlockedProjects.includes(project.id)
  );

  return (
    <section className="room broken-build-room">
      <div className="room-panel">
        <h2 className="room-title">Room 2: Broken Build</h2>
        <p className="room-description">
          Click each CI error to patch it. Every successful fix unlocks a project
          case card.
        </p>

        <div className="progress-wrap">
          <div className="progress-meta">
            <span>Build Recovery</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>

        <div className="ci-log">
          {BUILD_ERRORS.map((error) => {
            const fixed = fixedErrors.includes(error.id);
            return (
              <motion.button
                key={error.id}
                type="button"
                className={`ci-line ${fixed ? "fixed" : ""}`}
                onClick={() => markErrorFixed(error.id, error.projectUnlock)}
                whileHover={!fixed ? { scale: 1.01 } : {}}
                whileTap={!fixed ? { scale: 0.99 } : {}}
                animate={fixed ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                transition={{ duration: 0.22 }}
                aria-label={`Fix CI error ${error.id}`}
              >
                <span className="ci-status">{fixed ? "OK" : "ERR"}</span>
                <span className="ci-msg">{error.message}</span>
                <span className="ci-file">{error.file}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="case-grid">
          {visibleProjects.length === 0 ? (
            <p className="muted">
              Patch at least one issue to reveal a project case.
            </p>
          ) : (
            visibleProjects.slice(0, 2).map((project) => (
              <motion.article
                key={project.id}
                className="project-case-card"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3>{project.title}</h3>
                <p>{project.oneLiner}</p>
                <div className="case-field">
                  <strong>Problem:</strong>
                  <span>{project.problem}</span>
                </div>
                <div className="case-field">
                  <strong>Solution:</strong>
                  <span>{project.solution}</span>
                </div>
                <div className="case-field">
                  <strong>Stack:</strong>
                  <span>{project.stack.join(" / ")}</span>
                </div>
                <div className="case-field">
                  <strong>Result:</strong>
                  <span>{project.result}</span>
                </div>
                <div className="button-row">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="pixel-btn link-btn"
                    aria-label={`Open github repository for ${project.title}`}
                  >
                    GitHub
                  </a>
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="pixel-btn link-btn"
                    aria-label={`Open live project for ${project.title}`}
                  >
                    Live
                  </a>
                </div>
              </motion.article>
            ))
          )}
        </div>

        <motion.button
          type="button"
          className="pixel-btn btn-primary"
          onClick={() => setRoom(3)}
          disabled={fixedCount < BUILD_ERRORS.length}
          whileHover={fixedCount === BUILD_ERRORS.length ? { scale: 1.03 } : {}}
          whileTap={fixedCount === BUILD_ERRORS.length ? { scale: 0.97 } : {}}
          aria-label="Continue to room 3 legacy boss fight"
        >
          Continue to Room 3
        </motion.button>
      </div>
    </section>
  );
}

