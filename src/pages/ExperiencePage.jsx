// src/pages/ExperiencePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import RevealOnScroll from "../components/RevealOnScroll";
import resumeData from "../data/resume.json";

export default function ExperiencePage() {
  const experience = resumeData.experience || [];

  return (
    <main className="site site--page">
      <section className="section section--page-hero">
        <motion.h1
          className="page-title page-title--bright"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Professional Experience
        </motion.h1>
        <motion.p
          className="page-subtitle page-subtitle--bright"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          Roles and impact across companies.
        </motion.p>
      </section>

      <section className="section section--resume">
        <div className="experience-list experience-list--full">
          {experience.map((job, i) => (
            <RevealOnScroll key={job.company} delay={i * 0.06}>
              <motion.article
                className="experience-card experience-card--with-image"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4 }}
              >
                <div className="experience-card__header">
                  {job.image && (
                    <div className="experience-card__image-wrap">
                      <img src={job.image} alt="" className="experience-card__image" />
                    </div>
                  )}
                  <div className="experience-card__header-text">
                    <h3 className="experience-card__role experience-card__role--bright">{job.role}</h3>
                    <p className="experience-card__company experience-card__company--bright">{job.company}</p>
                    <p className="experience-card__meta experience-card__meta--bright">{job.location} · {job.period}</p>
                  </div>
                </div>
                <ul className="experience-card__points experience-card__points--bright">
                  {(job.points || []).map((point, j) => (
                    <li key={j}>{point}</li>
                  ))}
                </ul>
              </motion.article>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <div className="section section--back">
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>
    </main>
  );
}
