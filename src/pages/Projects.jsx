// src/pages/Projects.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RevealOnScroll from "../components/RevealOnScroll";
import ProjectCardDynamic from "../components/ProjectCardDynamic";
import ProjectDetailPanel from "../components/ProjectDetailPanel";
import projectsData from "../data/projects.json";

const projects = [...(projectsData.projects || [])].sort(
  (a, b) => (a.order ?? 99) - (b.order ?? 99)
);

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <main className="site site--projects">
      <section className="section section--projects-grid">
        <motion.h1
          className="page-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          All Projects
        </motion.h1>
        <p className="page-subtitle">
          Click a project to see details. Data is loaded from <code>src/data/projects.json</code> for easy updates.
        </p>

        <div className="projects-grid">
          {projects.map((project, index) => (
            <RevealOnScroll key={project.id} delay={index * 0.06}>
              <ProjectCardDynamic
                project={project}
                isSelected={selectedProject?.id === project.id}
                onClick={() => setSelectedProject(selectedProject?.id === project.id ? null : project)}
                layout="grid"
                index={index}
              />
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {selectedProject && (
          <motion.section
            className="section section--project-detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProjectDetailPanel project={selectedProject} />
            <motion.button
              className="detail-close-btn"
              onClick={() => setSelectedProject(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Close
            </motion.button>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
