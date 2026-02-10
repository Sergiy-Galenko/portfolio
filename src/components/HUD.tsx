import type { HeroClass, HUDStats, RoomId } from "@/types/game";

interface HUDProps {
  roomId: RoomId;
  roomTitle: string;
  stats: HUDStats;
  soundOn: boolean;
  heroClass: HeroClass | null;
}

const clampPercent = (value: number, max: number): number =>
  Math.max(0, Math.min(100, (value / max) * 100));

const heroClassLabel = (heroClass: HeroClass | null): string => {
  if (heroClass === "mage") {
    return "Mage";
  }
  if (heroClass === "swordsman") {
    return "Swordsman";
  }
  return "None";
};

export function HUD({ roomId, roomTitle, stats, soundOn, heroClass }: HUDProps) {
  const hpWidth = clampPercent(stats.hp, 100);
  const xpWidth = clampPercent(stats.xp, 30);

  return (
    <header className="hud">
      <div className="hud-row">
        <div className="hud-pill">
          <span>HP</span>
          <strong>{stats.hp}</strong>
        </div>
        <div className="hud-pill">
          <span>XP</span>
          <strong>{stats.xp}</strong>
        </div>
        <div className="hud-pill">
          <span>Coins</span>
          <strong>{stats.coins}</strong>
        </div>
        <div className="hud-pill hud-pill-room">
          <span>Room</span>
          <strong>
            {roomId}/5 + {roomTitle}
          </strong>
        </div>
        <div className="hud-pill">
          <span>Class</span>
          <strong>{heroClassLabel(heroClass)}</strong>
        </div>
        <div className="hud-pill">
          <span>Sound</span>
          <strong>{soundOn ? "ON" : "OFF"}</strong>
        </div>
      </div>
      <div className="hud-bars">
        <div className="meter">
          <div className="meter-label">Energy</div>
          <div className="meter-track">
            <div className="meter-fill hp-fill" style={{ width: `${hpWidth}%` }} />
          </div>
        </div>
        <div className="meter">
          <div className="meter-label">Progress</div>
          <div className="meter-track">
            <div className="meter-fill xp-fill" style={{ width: `${xpWidth}%` }} />
          </div>
        </div>
      </div>
    </header>
  );
}
