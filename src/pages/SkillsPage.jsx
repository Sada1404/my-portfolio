// src/pages/SkillsPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import RevealOnScroll from "../components/RevealOnScroll";
import SkillsSphere3D from "../components/SkillsSphere3D";
import SkillsArchitecture from "../components/SkillsArchitecture";
import resumeData from "../data/resume.json";

export default function SkillsPage() {
  const skills = resumeData.technicalSkills || {};

  return (
    <main className="site site--page">
      <section className="section section--page-hero">
        <motion.h1
          className="page-title page-title--bright"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Technical Skills
        </motion.h1>
        <motion.p
          className="page-subtitle page-subtitle--bright"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          Drag to rotate the sphere. Hover over a skill for a highlight.
        </motion.p>
      </section>

      <section className="section section--sphere">
        <div className="skills-sphere3d-wrap">
          <SkillsSphere3D skills={skills} />
        </div>
      </section>

      <section className="section section--resume" style={{ overflow: "visible" }}>
        <RevealOnScroll>
          <h2 className="section-title hero section-title--bright">Architecture & Stack</h2>
        </RevealOnScroll>
        <SkillsArchitecture skills={skills} />
      </section>

      <div className="section section--back">
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>
    </main>
  );
}
