// src/components/ScrollDownHint.jsx – Janissne-style "SCROLL DOWN" at bottom of hero
import React from "react";
import { motion } from "framer-motion";

export default function ScrollDownHint() {
  return (
    <motion.div
      className="scroll-down-hint"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.5 }}
    >
      <span className="scroll-down-hint__text">SCROLL DOWN</span>
      <motion.span
        className="scroll-down-hint__chevron"
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        ↓
      </motion.span>
    </motion.div>
  );
}
