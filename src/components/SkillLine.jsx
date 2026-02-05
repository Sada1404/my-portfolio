// src/components/SkillLine.jsx – linearly moving horizontal strip of skill icons for Home
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { getFlattenedSkillsWithIcons } from "../data/resumeHelpers";

export default function SkillLine({ skills = {} }) {
  const list = useMemo(() => getFlattenedSkillsWithIcons(skills).slice(0, 28), [skills]);
  const duration = Math.max(25, list.length * 1.5);

  return (
    <div className="skill-line-wrap">
      <motion.div
        className="skill-line"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration, ease: "linear" }}
      >
        {[...list, ...list].map((item, i) => (
          <div key={`${item.name}-${i}`} className="skill-line__item">
            {item.icon ? (
              <img src={item.icon} alt="" className="skill-line__icon" />
            ) : (
              <span className="skill-line__placeholder">{item.name.charAt(0)}</span>
            )}
            <span className="skill-line__name">{item.name}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
