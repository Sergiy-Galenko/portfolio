export type RoomId = 0 | 1 | 2 | 3 | 4 | 5;

export type GameClassId =
  | "backend-wizard"
  | "mobile-ranger"
  | "fullstack-paladin"
  | "automation-rogue";

export type HeroClass = "mage" | "swordsman";

export type GamePhase = "loading" | "character-select" | "battle";

export interface HUDStats {
  hp: number;
  xp: number;
  coins: number;
}

export interface ProjectCase {
  id: string;
  title: string;
  oneLiner: string;
  stack: string[];
  problem: string;
  solution: string;
  result: string;
  githubUrl: string;
  liveUrl: string;
  tags: string[];
  classAffinity: GameClassId[];
}

export interface SkillItem {
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
  classAffinity: GameClassId[];
}

export interface SkillGroup {
  id: "front" | "back" | "mobile" | "devops";
  title: string;
  items: SkillItem[];
}

export interface Perk {
  id: string;
  title: string;
  description: string;
  classAffinity: GameClassId[];
}

export interface BossProject {
  title: string;
  context: string;
  actions: string[];
  outcomes: string[];
}

export interface QuestDefinition {
  id: string;
  room: RoomId;
  title: string;
  description: string;
  rewardXp: number;
  rewardCoins: number;
}

export interface LocationPortfolioEntry {
  room: RoomId;
  location: string;
  title: string;
  summary: string;
  highlights: string[];
  stack: string[];
}

export interface Checkpoint {
  phase: GamePhase;
  currentRoom: RoomId;
  heroClass: HeroClass | null;
  chosenClass: GameClassId | null;
  fixedErrors: string[];
  unlockedProjects: string[];
  clearedRooms: RoomId[];
  defeatedEnemies: string[];
  shownPortfolioRooms: RoomId[];
  completedQuests: string[];
  inspectedPoints: string[];
  soundOn: boolean;
  hudStats: HUDStats;
}
