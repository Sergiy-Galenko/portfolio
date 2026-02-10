import type { RoomId } from "@/types/game";

export interface RoomMeta {
  id: RoomId;
  title: string;
}

export const ROOM_META: Record<RoomId, RoomMeta> = {
  0: { id: 0, title: "Room 0: Forest Gate" },
  1: { id: 1, title: "Room 1: Iron Bastion" },
  2: { id: 2, title: "Room 2: Ember Mine" },
  3: { id: 3, title: "Room 3: Shadow Keep" },
  4: { id: 4, title: "Room 4: Crystal Labyrinth" },
  5: { id: 5, title: "Room 5: Portal Nexus" },
};
