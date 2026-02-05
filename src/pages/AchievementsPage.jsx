// src/pages/AchievementsPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import RevealOnScroll from "../components/RevealOnScroll";
import resumeData from "../data/resume.json";

export default function AchievementsPage() {
  const achievements = resumeData.achievements || [];
  const education = resumeData.education || {};
  const languages = resumeData.languages || [];

  return (
    <main className="site site--page">
      <section className="section section--page-hero">
        <motion.h1
          className="page-title page-title--bright"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Achievements & Education
        </motion.h1>
        <motion.p
          className="page-subtitle page-subtitle--bright"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          Highlights and background.
        </motion.p>
      </section>

      <section className="section section--resume">
        <RevealOnScroll>
          <h2 className="section-title section-title--bright">Achievements</h2>
          <ul className="achievements-list achievements-list--full">
            {achievements.map((item, i) => (
              <motion.li
                key={i}
                className="achievements-list__item achievements-list__item--bright"
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                {item}
              </motion.li>
            ))}
          </ul>
        </RevealOnScroll>
      </section>

      {education && education.degree && (
        <section className="section section--resume">
          <RevealOnScroll>
            <h2 className="section-title section-title--bright">Education</h2>
            <div className="education-card">
              <h3 className="education-card__degree">{education.degree}</h3>
              <p className="education-card__institution">{education.institution}</p>
              <p className="education-card__meta">{education.period} {education.percentage ? `· ${education.percentage}%` : ""}</p>
            </div>
          </RevealOnScroll>
        </section>
      )}

      {languages.length > 0 && (
        <section className="section section--resume">
          <RevealOnScroll>
            <h2 className="section-title section-title--bright">Languages</h2>
            <ul className="languages-list">
              {languages.map((lang) => (
                <li key={lang} className="languages-list__item">{lang}</li>
              ))}
            </ul>
          </RevealOnScroll>
        </section>
      )}

      <div className="section section--back">
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>
    </main>
  );
}
