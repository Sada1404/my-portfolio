// src/pages/SkillsPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import RevealOnScroll from "../components/RevealOnScroll";
import SkillsSphere3D from "../components/SkillsSphere3D";
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
          Move the cursor (rocket) near the sphere for a gravity effect on skill nodes.
        </motion.p>
      </section>

      <section className="section section--sphere">
        <div className="skills-sphere3d-wrap">
          <SkillsSphere3D skills={skills} />
        </div>
      </section>

      <section className="section section--resume">
        <RevealOnScroll>
          <h2 className="section-title section-title--bright">By category</h2>
          <div className="skills-list-detail skills-list-detail--icons">
            {Object.entries(skills).map(([group, items]) => (
              <div key={group} className="skills-group">
                <h3 className="skills-group__title skills-group__title--bright">{group}</h3>
                <ul className="skills-group__list skills-group__list--icons">
                  {(items || []).map((item) => {
                    const name = typeof item === "string" ? item : item?.name;
                    const icon = typeof item === "object" && item?.icon ? item.icon : null;
                    return (
                      <li key={name} className="skills-group__item">
                        {icon && <img src={icon} alt="" className="skills-group__icon" />}
                        <span>{name}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      <div className="section section--back">
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>
    </main>
  );
}
