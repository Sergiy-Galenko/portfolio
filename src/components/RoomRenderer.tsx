"use client";

import { AnimatePresence, motion } from "framer-motion";

import { RoomExplorer } from "@/components/RoomExplorer";
import type { RoomId } from "@/types/game";

interface RoomRendererProps {
  currentRoom: RoomId;
}

export function RoomRenderer({ currentRoom }: RoomRendererProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentRoom}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -18 }}
        transition={{ duration: 0.28 }}
      >
        <RoomExplorer roomId={currentRoom} />
      </motion.div>
    </AnimatePresence>
  );
}
