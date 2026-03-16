// src/pages/AchievementsPage.jsx – Revamped achievements (Agenko-style)
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import RevealOnScroll from "../components/RevealOnScroll";
import resumeData from "../data/resume.json";

const achievements = resumeData.achievements || [];
const education = resumeData.education || {};
const languages = resumeData.languages || [];

const ACHIEVEMENT_ICONS = ["🚀", "⚡", "🔍", "🔧", "🏆"];

export default function AchievementsPage() {
  return (
    <main className="site site--page site--achievements">
      {/* Hero */}
      <section className="achv-hero">
        <div className="achv-hero__inner">
          <motion.h1
            className="achv-hero__title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Achievements & Education
          </motion.h1>
          <motion.p
            className="achv-hero__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            Milestones, awards, and academic background.
          </motion.p>
          <motion.div
            className="achv-hero__breadcrumb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <Link to="/" className="achv-hero__bc-link">Home</Link>
            <span className="achv-hero__bc-sep">|</span>
            <span className="achv-hero__bc-current">Achievements</span>
          </motion.div>
        </div>
      </section>

      {/* Achievements Grid */}
      <section className="achv-section">
        <RevealOnScroll>
          <span className="achv-section__badge">Highlights</span>
          <h2 className="achv-section__title">Key Achievements</h2>
        </RevealOnScroll>
        <div className="achv-grid">
          {achievements.map((item, i) => (
            <RevealOnScroll key={i} delay={i * 0.08}>
              <motion.div
                className="achv-card"
                whileHover={{ y: -6, boxShadow: "0 16px 48px rgba(0,180,216,0.12)" }}
              >
                <div className="achv-card__icon">{ACHIEVEMENT_ICONS[i % ACHIEVEMENT_ICONS.length]}</div>
                <div className="achv-card__number">{String(i + 1).padStart(2, "0")}</div>
                <p className="achv-card__text">{item}</p>
              </motion.div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* Education */}
      {education && education.degree && (
        <section className="achv-section">
          <div className="achv-edu">
            <RevealOnScroll>
              <div className="achv-edu__content">
                <span className="achv-section__badge">Education</span>
                <h2 className="achv-section__title">Academic Background</h2>
                <div className="achv-edu__card">
                  <div className="achv-edu__icon">🎓</div>
                  <div className="achv-edu__info">
                    <h3 className="achv-edu__degree">{education.degree}</h3>
                    <p className="achv-edu__institution">{education.institution}</p>
                    <div className="achv-edu__meta">
                      <span className="achv-edu__period">{education.period}</span>
                      {education.cgpa && <span className="achv-edu__cgpa">CGPA: {education.cgpa}</span>}
                      {education.percentage && <span className="achv-edu__cgpa">{education.percentage}%</span>}
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
            <RevealOnScroll>
              <div className="achv-edu__visual">
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c476?w=500&h=350&fit=crop"
                  alt="Education"
                  className="achv-edu__image"
                />
              </div>
            </RevealOnScroll>
          </div>
        </section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <section className="achv-section">
          <RevealOnScroll>
            <span className="achv-section__badge">Communication</span>
            <h2 className="achv-section__title">Languages</h2>
          </RevealOnScroll>
          <div className="achv-langs">
            {languages.map((lang, i) => (
              <RevealOnScroll key={lang} delay={i * 0.08}>
                <motion.div
                  className="achv-lang-card"
                  whileHover={{ y: -4 }}
                >
                  <span className="achv-lang-card__flag">🗣️</span>
                  <span className="achv-lang-card__name">{lang}</span>
                </motion.div>
              </RevealOnScroll>
            ))}
          </div>
        </section>
      )}

      <div className="section section--back">
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>
    </main>
  );
}
