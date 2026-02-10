"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import perksData from "@/data/perks.json";
import projectsData from "@/data/projects.json";
import skillsData from "@/data/skills.json";
import { useGameStore } from "@/state/gameStore";
import type { GameClassId, Perk, ProjectCase, SkillGroup } from "@/types/game";

interface ClassCard {
  id: GameClassId;
  title: string;
  subtitle: string;
}

const CLASS_CARDS: ClassCard[] = [
  {
    id: "backend-wizard",
    title: "Backend Wizard",
    subtitle: "API architecture, data integrity, and resilient systems.",
  },
  {
    id: "mobile-ranger",
    title: "Mobile Ranger",
    subtitle: "Cross-platform UX, offline sync, and performance on the edge.",
  },
  {
    id: "fullstack-paladin",
    title: "Full-Stack Paladin",
    subtitle: "End-to-end product execution from UI to infrastructure.",
  },
  {
    id: "automation-rogue",
    title: "Automation Rogue",
    subtitle: "CI hardening, scripting, and time-saving automation.",
  },
];

const typedSkills = skillsData as SkillGroup[];
const typedPerks = perksData as Perk[];
const typedProjects = projectsData as ProjectCase[];

export function SkillCheckRoom() {
  const chosenClass = useGameStore((state) => state.chosenClass);
  const chooseClass = useGameStore((state) => state.chooseClass);
  const setRoom = useGameStore((state) => state.setRoom);
  const setNotification = useGameStore((state) => state.setNotification);
  const [shakeContinue, setShakeContinue] = useState(false);

  const highlightedProjects = useMemo(() => {
    if (!chosenClass) {
      return [];
    }

    return typedProjects.filter((project) =>
      project.classAffinity.includes(chosenClass)
    );
  }, [chosenClass]);

  const handleContinue = () => {
    if (!chosenClass) {
      setShakeContinue(true);
      setNotification("Select a class before entering Room 2.");
      setTimeout(() => setShakeContinue(false), 400);
      return;
    }

    setRoom(2);
  };

  return (
    <section className="room skill-room">
      <div className="room-panel">
        <h2 className="room-title">Room 1: Skill Check</h2>
        <p className="room-description">
          Choose your class. The skill map and project feed react to your role.
        </p>

        <div className="class-grid">
          {CLASS_CARDS.map((item) => (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => chooseClass(item.id)}
              className={`class-card ${chosenClass === item.id ? "active" : ""}`}
              whileHover={{ y: -4, boxShadow: "0 0 30px rgba(79, 195, 247, 0.35)" }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Choose class ${item.title}`}
            >
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
            </motion.button>
          ))}
        </div>

        <div className="skill-tree-grid">
          {typedSkills.map((group) => (
            <div key={group.id} className="skill-group-card">
              <h3>{group.title}</h3>
              <ul className="skill-list">
                {group.items.map((skill) => {
                  const highlighted =
                    chosenClass !== null &&
                    skill.classAffinity.includes(chosenClass);
                  return (
                    <li
                      key={skill.name}
                      className={`skill-item ${highlighted ? "highlighted" : ""}`}
                    >
                      <div className="skill-meta">
                        <span>{skill.name}</span>
                        <span>Lv {skill.level}</span>
                      </div>
                      <div className="skill-level-track">
                        <span
                          className="skill-level-fill"
                          style={{ width: `${(skill.level / 5) * 100}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="perk-grid">
          {typedPerks.map((perk) => {
            const highlighted =
              chosenClass !== null && perk.classAffinity.includes(chosenClass);
            return (
              <motion.article
                key={perk.id}
                className={`perk-card ${highlighted ? "active" : ""}`}
                whileHover={{ scale: 1.02 }}
              >
                <h4>{perk.title}</h4>
                <p>{perk.description}</p>
              </motion.article>
            );
          })}
        </div>

        <div className="project-teaser">
          <h3>Class-Relevant Projects</h3>
          {highlightedProjects.length === 0 ? (
            <p className="muted">
              Select a class to see filtered project cases and skill affinity.
            </p>
          ) : (
            <ul>
              {highlightedProjects.slice(0, 3).map((project) => (
                <li key={project.id}>
                  <strong>{project.title}</strong>
                  <span>{project.oneLiner}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <motion.button
          type="button"
          className={`pixel-btn btn-primary ${shakeContinue ? "shake" : ""}`}
          onClick={handleContinue}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          aria-label="Continue to room 2 broken build"
        >
          Continue to Room 2
        </motion.button>
      </div>
    </section>
  );
}
