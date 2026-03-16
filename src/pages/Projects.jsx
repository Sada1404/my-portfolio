// src/pages/Projects.jsx – Agenko-style masonry project grid
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import projectsData from "../data/projects.json";

const projects = [...(projectsData.projects || [])].sort(
  (a, b) => (a.order ?? 99) - (b.order ?? 99)
);

function ProjectTile({ project, index }) {
  const sizeClass = project.size === "large" ? "proj-tile--large" : project.size === "small" ? "proj-tile--small" : "";

  return (
    <motion.div
      className={`proj-tile ${sizeClass}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
    >
      <Link to={`/projects/${project.id}`} className="proj-tile__link">
        <motion.div
          className="proj-tile__inner"
          whileHover={{ scale: 1.03, y: -6 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          <div className="proj-tile__img-wrap">
            <img
              src={project.heroImage || project.thumbnail}
              alt={project.title}
              className="proj-tile__img"
              loading="lazy"
            />
            <div className="proj-tile__overlay" />
          </div>
          <div className="proj-tile__content">
            <div className="proj-tile__tags">
              {(project.tags || []).slice(0, 3).map((tag) => (
                <span key={tag} className="proj-tile__tag">{tag}</span>
              ))}
            </div>
            <h3 className="proj-tile__title">{project.shortTitle || project.title}</h3>
            <p className="proj-tile__tagline">{project.tagline}</p>
            {project.company && (
              <span className="proj-tile__company">{project.company}</span>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export default function Projects() {
  return (
    <main className="site site--projects">
      {/* Hero */}
      <section className="proj-hero">
        <div className="proj-hero__inner">
          <motion.h1
            className="proj-hero__title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Projects
          </motion.h1>
          <motion.p
            className="proj-hero__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            Full-stack platforms, search engines, and e-commerce solutions — click to explore.
          </motion.p>

          {/* Breadcrumb */}
          <motion.div
            className="proj-hero__breadcrumb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <Link to="/" className="proj-hero__breadcrumb-link">Home</Link>
            <span className="proj-hero__breadcrumb-sep">|</span>
            <span className="proj-hero__breadcrumb-current">Projects</span>
          </motion.div>
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="proj-grid-section">
        <div className="proj-masonry">
          {projects.map((project, index) => (
            <ProjectTile key={project.id} project={project} index={index} />
          ))}
        </div>
      </section>

      <div className="section section--back">
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>
    </main>
  );
}
