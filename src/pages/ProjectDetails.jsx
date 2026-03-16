// src/pages/ProjectDetails.jsx – Detailed project view with sidebar
import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import RevealOnScroll from "../components/RevealOnScroll";
import projectsData from "../data/projects.json";

const projects = projectsData.projects || [];

export default function ProjectDetails() {
  const { id } = useParams();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <main className="site site--page">
        <section className="section section--page-hero">
          <h1 className="page-title">Project Not Found</h1>
          <Link to="/projects" className="back-link">← Back to Projects</Link>
        </section>
      </main>
    );
  }

  // Other projects for sidebar
  const otherProjects = projects.filter((p) => p.id !== id).slice(0, 4);

  return (
    <main className="site site--project-details">
      {/* Hero */}
      <section className="pd-hero">
        <div className="pd-hero__inner">
          <motion.span
            className="pd-hero__label"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Portfolio Details
          </motion.span>
          <motion.h1
            className="pd-hero__title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {project.title}
          </motion.h1>
          {project.tagline && (
            <motion.p
              className="pd-hero__tagline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              {project.tagline}
            </motion.p>
          )}
          <motion.div
            className="pd-hero__breadcrumb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/" className="pd-hero__breadcrumb-link">Home</Link>
            <span className="pd-hero__breadcrumb-sep">|</span>
            <Link to="/projects" className="pd-hero__breadcrumb-link">Projects</Link>
            <span className="pd-hero__breadcrumb-sep">|</span>
            <span className="pd-hero__breadcrumb-current">{project.shortTitle || project.title}</span>
          </motion.div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="pd-content">
        <div className="pd-content__grid">
          {/* Main Body */}
          <div className="pd-body">
            {/* Hero Image */}
            {project.heroImage && (
              <RevealOnScroll>
                <div className="pd-body__image-wrap">
                  <img src={project.heroImage} alt={project.title} className="pd-body__image" />
                </div>
              </RevealOnScroll>
            )}

            {/* Meta Bar */}
            <RevealOnScroll>
              <div className="pd-body__meta-bar">
                {project.company && <span className="pd-body__meta-item">{project.company}</span>}
                {project.period && <span className="pd-body__meta-item">{project.period}</span>}
                {project.tags && <span className="pd-body__meta-item">{project.tags[0]}</span>}
              </div>
            </RevealOnScroll>

            {/* Title & Description */}
            <RevealOnScroll>
              <h2 className="pd-body__title">{project.title}</h2>
              <p className="pd-body__desc">{project.description}</p>
            </RevealOnScroll>

            {project.quote && (
              <RevealOnScroll>
                <blockquote className="pd-body__quote">
                  "{project.quote}"
                </blockquote>
              </RevealOnScroll>
            )}

            {/* Second Image */}
            {project.thumbnail && project.thumbnail !== project.heroImage && (
              <RevealOnScroll>
                <div className="pd-body__image-wrap pd-body__image-wrap--secondary">
                  <img src={project.thumbnail} alt={project.title} className="pd-body__image" />
                </div>
              </RevealOnScroll>
            )}
          </div>

          {/* Sidebar */}
          <aside className="pd-sidebar">
            {/* Project Info */}
            <RevealOnScroll>
              <div className="pd-sidebar__card">
                <h3 className="pd-sidebar__heading">Project Info</h3>
                <div className="pd-sidebar__row">
                  <span className="pd-sidebar__label">Company</span>
                  <span className="pd-sidebar__value">{project.company || projectsData.profile?.name || "—"}</span>
                </div>
                <div className="pd-sidebar__row">
                  <span className="pd-sidebar__label">Category</span>
                  <span className="pd-sidebar__value">{project.tags?.[0] || "—"}</span>
                </div>
                {project.period && (
                  <div className="pd-sidebar__row">
                    <span className="pd-sidebar__label">Period</span>
                    <span className="pd-sidebar__value">{project.period}</span>
                  </div>
                )}
                <div className="pd-sidebar__row">
                  <span className="pd-sidebar__label">Stack</span>
                  <span className="pd-sidebar__value">{project.techStack?.slice(0, 3).join(", ") || "—"}</span>
                </div>
                {/* Links */}
                <div className="pd-sidebar__links">
                  {project.links?.playStore && (
                    <a href={project.links.playStore} target="_blank" rel="noopener noreferrer" className="pd-sidebar__link">
                      Play Store ↗
                    </a>
                  )}
                  {project.links?.liveDemo && (
                    <a href={project.links.liveDemo} target="_blank" rel="noopener noreferrer" className="pd-sidebar__link">
                      Live Demo ↗
                    </a>
                  )}
                  {project.links?.tracking && (
                    <a href={project.links.tracking} target="_blank" rel="noopener noreferrer" className="pd-sidebar__link">
                      Tracking ↗
                    </a>
                  )}
                </div>
              </div>
            </RevealOnScroll>

            {/* Tech Tags */}
            {project.techStack && project.techStack.length > 0 && (
              <RevealOnScroll>
                <div className="pd-sidebar__card">
                  <h3 className="pd-sidebar__heading">Tech Stack</h3>
                  <div className="pd-sidebar__tags">
                    {project.techStack.map((t) => (
                      <span key={t} className="pd-sidebar__tag">{t}</span>
                    ))}
                  </div>
                </div>
              </RevealOnScroll>
            )}

            {/* Other Projects */}
            {otherProjects.length > 0 && (
              <RevealOnScroll>
                <div className="pd-sidebar__card">
                  <h3 className="pd-sidebar__heading">Other Projects</h3>
                  <div className="pd-sidebar__other-list">
                    {otherProjects.map((p) => (
                      <Link key={p.id} to={`/projects/${p.id}`} className="pd-sidebar__other-item">
                        {p.thumbnail && <img src={p.thumbnail} alt={p.shortTitle} className="pd-sidebar__other-img" loading="lazy" />}
                        <div className="pd-sidebar__other-info">
                          <span className="pd-sidebar__other-title">{p.shortTitle || p.title}</span>
                          <span className="pd-sidebar__other-tag">{p.tags?.[0]}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </RevealOnScroll>
            )}
          </aside>
        </div>
      </section>

      {/* Features */}
      {project.features && project.features.length > 0 && (
        <section className="pd-process">
          <RevealOnScroll>
            <h2 className="pd-process__title">Key Features</h2>
            <p className="pd-process__subtitle">
              Core capabilities that power this project.
            </p>
          </RevealOnScroll>
          <div className="pd-process__grid">
            {project.features.map((feature, i) => (
              <RevealOnScroll key={i} delay={i * 0.08}>
                <motion.div
                  className="pd-process__card"
                  whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}
                >
                  <div className="pd-process__icon">
                    <span>{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <p className="pd-process__text">{feature}</p>
                </motion.div>
              </RevealOnScroll>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="pd-cta">
        <RevealOnScroll>
          <div className="pd-cta__inner">
            <h2 className="pd-cta__title">
              Interested in working together?
            </h2>
            <Link to="/" className="pd-cta__btn">Contact Me ↗</Link>
          </div>
        </RevealOnScroll>
      </section>

      <div className="section section--back">
        <Link to="/projects" className="back-link">← Back to Projects</Link>
      </div>
    </main>
  );
}
