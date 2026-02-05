// src/components/ProjectCardDynamic.jsx
import React from "react";
import { motion } from "framer-motion";

/**
 * Dynamic project card: hover scale, border glow, grayscale → color on thumbnail.
 * Use in sidebar list or grid; selected state for sidebar.
 */
export default function ProjectCardDynamic({
  project,
  isSelected = false,
  onClick,
  layout = "sidebar",
  index = 0,
}) {
  const { title, shortTitle, thumbnail, tags } = project;
  const displayTitle = shortTitle || title;

  return (
    <motion.article
      className={`project-card-dynamic project-card-dynamic--${layout} ${isSelected ? "is-selected" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      <div className="project-card-dynamic__media">
        <motion.img
          src={thumbnail}
          alt=""
          className="project-card-dynamic__thumb"
          animate={{
            filter: isSelected ? "grayscale(0%) saturate(1.2)" : "grayscale(0.7) saturate(0.6)",
          }}
          transition={{ duration: 0.35 }}
        />
        {layout === "sidebar" && (
          <motion.div
            className="project-card-dynamic__accent"
            initial={false}
            animate={{ opacity: isSelected ? 1 : 0, scaleX: isSelected ? 1 : 0.5 }}
            transition={{ duration: 0.25 }}
          />
        )}
      </div>
      <div className="project-card-dynamic__body">
        <h3 className="project-card-dynamic__title">{displayTitle}</h3>
        {tags && tags.length > 0 && (
          <div className="project-card-dynamic__tags">
            {tags.slice(0, 3).map((t) => (
              <span key={t} className="project-card-dynamic__tag">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}
