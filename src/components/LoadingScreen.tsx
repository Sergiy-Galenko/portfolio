"use client";

import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <section className="loading-screen">
      <motion.div
        className="loading-card"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1>Loading...</h1>
        <motion.div className="loading-bar-track">
          <motion.div
            className="loading-bar-fill"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.7, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

