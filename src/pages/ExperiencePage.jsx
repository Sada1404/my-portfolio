// src/pages/ExperiencePage.jsx – Experience cards with click-to-expand detail view
import React, { useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

import resumeData from "../data/resume.json";
import projectsData from "../data/projects.json";

const experience = resumeData.experience || [];
const allProjects = projectsData.projects || [];

/* ── Experience Card (list view) ──────────────────────────────── */
function ExperienceCard({ job, index, onClick }) {
  return (
    <motion.div
      className="exp-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      layout
    >
      <div className="exp-card__header">
        <div className="exp-card__number">{String(index + 1).padStart(2, "0")}</div>
        {job.image && (
          <div className="exp-card__img-wrap">
            <img src={job.image} alt={job.company} className="exp-card__img" loading="lazy" />
          </div>
        )}
        <div className="exp-card__info">
          <h3 className="exp-card__role">{job.role}</h3>
          <p className="exp-card__company">{job.company}</p>
          <p className="exp-card__meta">
            {job.location} · {job.period}
            {job.type && <span className="exp-card__type">{job.type}</span>}
          </p>
        </div>
      </div>
      <p className="exp-card__summary">{job.summary}</p>
      {job.skills && job.skills.length > 0 && (
        <div className="exp-card__skills">
          {job.skills.slice(0, 6).map((s) => (
            <span key={s} className="exp-card__skill-tag">{s}</span>
          ))}
          {job.skills.length > 6 && (
            <span className="exp-card__skill-tag exp-card__skill-tag--more">+{job.skills.length - 6}</span>
          )}
        </div>
      )}
      <span className="exp-card__cta">View Details →</span>
    </motion.div>
  );
}

/* ── Sidebar: Skills ──────────────────────────────────────────── */
function SidebarSkills({ skills }) {
  if (!skills || skills.length === 0) return null;
  return (
    <div className="exp-sidebar__section">
      <h4 className="exp-sidebar__heading">Skills & Technologies</h4>
      <div className="exp-sidebar__tags">
        {skills.map((s) => (
          <span key={s} className="exp-sidebar__tag">{s}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Sidebar: Related Projects ─────────────────────────────── */
function SidebarProjects({ projects }) {
  if (!projects || projects.length === 0) return null;
  return (
    <div className="exp-sidebar__section">
      <h4 className="exp-sidebar__heading">Related Projects</h4>
      <div className="exp-sidebar__project-list">
        {projects.map((proj) => (
          <a
            key={proj.name}
            href={proj.url}
            target={proj.url?.startsWith("http") ? "_blank" : undefined}
            rel={proj.url?.startsWith("http") ? "noopener noreferrer" : undefined}
            className="exp-sidebar__project"
          >
            <div className="exp-sidebar__project-info">
              <span className="exp-sidebar__project-name">{proj.name}</span>
              <span className="exp-sidebar__project-desc">{proj.description?.slice(0, 80)}...</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ── Sidebar: Other Experiences ────────────────────────────── */
function SidebarOtherExperiences({ current, experiences, onSelect }) {
  const others = experiences.filter((e) => e.id !== current.id);
  if (others.length === 0) return null;
  return (
    <div className="exp-sidebar__section">
      <h4 className="exp-sidebar__heading">Other Experiences</h4>
      <div className="exp-sidebar__other-list">
        {others.map((job) => (
          <div key={job.id} className="exp-sidebar__other-item" onClick={() => onSelect(job)}>
            {job.image && <img src={job.image} alt={job.company} className="exp-sidebar__other-img" loading="lazy" />}
            <div className="exp-sidebar__other-info">
              <span className="exp-sidebar__other-role">{job.role}</span>
              <span className="exp-sidebar__other-company">{job.company}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Detail View (Blog-detail style) ──────────────────────── */
function ExperienceDetail({ job, onBack, onSelectJob }) {
  const detailRef = useRef(null);

  return (
    <motion.div
      className="exp-detail"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
      ref={detailRef}
    >
      {/* Breadcrumb */}
      <div className="exp-detail__breadcrumb">
        <Link to="/experience" className="exp-detail__breadcrumb-link" onClick={(e) => { e.preventDefault(); onBack(); }}>
          Experience
        </Link>
        <span className="exp-detail__breadcrumb-sep">|</span>
        <span className="exp-detail__breadcrumb-current">{job.company}</span>
      </div>

      <div className="exp-detail__layout">
        {/* Main content */}
        <div className="exp-detail__main">
          {/* Hero image */}
          {job.gallery && job.gallery.length > 0 && (
            <div className="exp-detail__hero-img">
              <img src={job.gallery[0].src} alt={job.gallery[0].alt} loading="lazy" />
            </div>
          )}

          {/* Meta bar */}
          <div className="exp-detail__meta-bar">
            {job.image && <img src={job.image} alt={job.company} className="exp-detail__avatar" />}
            <span className="exp-detail__meta-company">{job.company}</span>
            <span className="exp-detail__meta-period">{job.period}</span>
            <span className="exp-detail__meta-location">{job.location}</span>
          </div>

          {/* Title */}
          <h2 className="exp-detail__title">{job.role}</h2>
          {job.type && <span className="exp-detail__type-badge">{job.type}</span>}

          {/* Description */}
          <div className="exp-detail__description">
            <p>{job.description}</p>
          </div>

          {/* Key Achievements */}
          <div className="exp-detail__section">
            <h3 className="exp-detail__section-title">Key Achievements</h3>
            <ul className="exp-detail__points">
              {(job.points || []).map((point, i) => (
                <li key={i}>
                  <span className="exp-detail__point-icon">✓</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Projects detail (inline) */}
          {job.projects && job.projects.length > 0 && (
            <div className="exp-detail__section">
              <h3 className="exp-detail__section-title">Projects</h3>
              <div className="exp-detail__projects-grid">
                {job.projects.map((proj) => (
                  <div key={proj.name} className="exp-detail__project-card">
                    <div className="exp-detail__project-header">
                      <h4 className="exp-detail__project-name">{proj.name}</h4>
                      {proj.url && (
                        <a href={proj.url} target="_blank" rel="noopener noreferrer" className="exp-detail__project-link">
                          Visit →
                        </a>
                      )}
                    </div>
                    <p className="exp-detail__project-desc">{proj.description}</p>
                    {proj.tech && (
                      <div className="exp-detail__project-tech">
                        {proj.tech.map((t) => (
                          <span key={t} className="exp-detail__tech-tag">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {job.gallery && job.gallery.length > 1 && (
            <div className="exp-detail__section">
              <h3 className="exp-detail__section-title">Gallery</h3>
              <div className="exp-detail__gallery">
                {job.gallery.slice(1).map((item, i) => (
                  <motion.div
                    key={i}
                    className="exp-detail__gallery-item"
                    whileHover={{ scale: 1.03, y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  >
                    <img src={item.src} alt={item.alt} loading="lazy" />
                    <span className={`exp-detail__gallery-badge exp-detail__gallery-badge--${item.type || "project"}`}>
                      {item.type === "team" ? "Moment" : "Project"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Skills inline (mobile) */}
          <div className="exp-detail__mobile-skills">
            <SidebarSkills skills={job.skills} />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="exp-detail__sidebar">
          <SidebarSkills skills={job.skills} />
          <SidebarProjects projects={job.projects} />
          <SidebarOtherExperiences current={job} experiences={experience} onSelect={onSelectJob} />
        </aside>
      </div>
    </motion.div>
  );
}

/* ── Main Page ─────────────────────────────────────────────── */
export default function ExperiencePage() {
  const [selectedJob, setSelectedJob] = useState(null);

  function handleSelect(job) {
    setSelectedJob(job);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setSelectedJob(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="site site--page site--experience">
      {/* Hero */}
      <section className="experience-hero">
        <div className="experience-hero__inner">
          <motion.h1
            className="experience-hero__title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {selectedJob ? selectedJob.company : "Professional Experience"}
          </motion.h1>
          <motion.p
            className="experience-hero__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {selectedJob
              ? `${selectedJob.role} · ${selectedJob.period}`
              : "Roles, products, and the people I built them with."}
          </motion.p>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {selectedJob ? (
          <ExperienceDetail
            key={selectedJob.id}
            job={selectedJob}
            onBack={handleBack}
            onSelectJob={handleSelect}
          />
        ) : (
          <motion.section
            key="list"
            className="exp-list-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Portfolio intro */}
            <div className="exp-intro">
              <motion.p
                className="exp-intro__subtitle"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                New collection of delivery, logistics & automation work.
              </motion.p>
              <motion.p
                className="exp-intro__text"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Dispatcher, Rider App, Search Engine at Mangwale; Driphunter and e-commerce platforms at Avhad Enterprises;
                Automation tools at ABB India — click any card to explore in detail.
              </motion.p>
            </div>

            {/* Cards */}
            <div className="exp-cards-grid">
              {experience.map((job, index) => (
                <ExperienceCard
                  key={job.id || job.company}
                  job={job}
                  index={index}
                  onClick={() => handleSelect(job)}
                />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="section section--back">
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>
    </main>
  );
}
