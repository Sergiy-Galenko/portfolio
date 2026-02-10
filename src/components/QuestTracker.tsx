"use client";

import questsData from "@/data/quests.json";
import { useGameStore } from "@/state/gameStore";
import type { QuestDefinition, RoomId } from "@/types/game";

interface QuestTrackerProps {
  roomId: RoomId;
}

const typedQuests = questsData as QuestDefinition[];

const clampPercent = (value: number, max: number): number =>
  Math.max(0, Math.min(100, (value / max) * 100));

export function QuestTracker({ roomId }: QuestTrackerProps) {
  const completedQuests = useGameStore((state) => state.completedQuests);

  const roomQuests = typedQuests.filter((quest) => quest.room === roomId);
  const roomCompleted = roomQuests.filter((quest) =>
    completedQuests.includes(quest.id)
  ).length;
  const totalCompleted = typedQuests.filter((quest) =>
    completedQuests.includes(quest.id)
  ).length;

  return (
    <section className="quest-tracker">
      <div className="quest-tracker-head">
        <h2>Quest Log</h2>
        <div className="quest-count">
          Room: {roomCompleted}/{roomQuests.length} | Total: {totalCompleted}/
          {typedQuests.length}
        </div>
      </div>
      <div className="quest-progress-track">
        <div
          className="quest-progress-fill"
          style={{
            width: `${clampPercent(totalCompleted, typedQuests.length)}%`,
          }}
        />
      </div>
      <ul className="quest-list">
        {roomQuests.map((quest) => {
          const completed = completedQuests.includes(quest.id);
          return (
            <li key={quest.id} className={`quest-item ${completed ? "done" : ""}`}>
              <div className="quest-item-title">
                <span>{completed ? "DONE" : "OPEN"}</span>
                <strong>{quest.title}</strong>
              </div>
              <p>{quest.description}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

