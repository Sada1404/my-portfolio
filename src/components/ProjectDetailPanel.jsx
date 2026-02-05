// src/components/ProjectDetailPanel.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectDetailPanel({ project }) {
  if (!project) {
    return (
      <div className="project-detail-panel project-detail-panel--empty">
        <p className="project-detail-panel__placeholder">Select a project to view details.</p>
      </div>
    );
  }

  const {
    title,
    tagline,
    quote,
    description,
    heroImage,
    features = [],
    techStack = [],
    links = {},
  } = project;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={project.id}
        className="project-detail-panel"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.35 }}
      >
        <div className="project-detail-panel__hero-wrap">
          {heroImage && (
            <motion.img
              src={heroImage}
              alt={title}
              className="project-detail-panel__hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}
          <div className="project-detail-panel__hero-overlay" />
        </div>

        {quote && (
          <motion.blockquote
            className="project-detail-panel__quote"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            &ldquo;{quote}&rdquo;
          </motion.blockquote>
        )}

        <motion.h1
          className="project-detail-panel__title"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {title}
        </motion.h1>
        {tagline && (
          <motion.p
            className="project-detail-panel__tagline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {tagline}
          </motion.p>
        )}

        {description && (
          <motion.p
            className="project-detail-panel__description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {description}
          </motion.p>
        )}

        {features.length > 0 && (
          <motion.ul
            className="project-detail-panel__features"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </motion.ul>
        )}

        {techStack.length > 0 && (
          <motion.div
            className="project-detail-panel__tech"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            {techStack.map((t) => (
              <span key={t} className="project-detail-panel__tech-tag">
                {t}
              </span>
            ))}
          </motion.div>
        )}

        <motion.div
          className="project-detail-panel__links"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {links.playStore && (
            <a
              href={links.playStore}
              target="_blank"
              rel="noopener noreferrer"
              className="project-detail-panel__btn project-detail-panel__btn--primary"
            >
              Google Play Store
            </a>
          )}
          {links.liveDemo && (
            <a
              href={links.liveDemo}
              target="_blank"
              rel="noopener noreferrer"
              className="project-detail-panel__btn"
            >
              Live Demo
            </a>
          )}
          {links.tracking && (
            <a
              href={links.tracking}
              target="_blank"
              rel="noopener noreferrer"
              className="project-detail-panel__btn"
            >
              Tracking
            </a>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
