// src/pages/Home.jsx – Overview of each section + skill line; details on section pages
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import RevealOnScroll from "../components/RevealOnScroll";
import GraphNodesBackground from "../components/GraphNodesBackground";
import DraggableGlobe3D from "../components/DraggableGlobe3D";
import ExperienceTimeline from "../components/ExperienceTimeline";
import AutoPlayVideo from "../components/AutoPlayVideo";
import Rotate3DOnHover from "../components/Rotate3DOnHover";
import SkillLine from "../components/SkillLine";
import ComponentShowcase from "../components/ComponentShowcase";
import ScrollImageGrid from "../components/ScrollImageGrid";
import demo from "../assets/demo.mp4";
import democover from "../assets/demo-cover.png";
import projectsData from "../data/projects.json";
import resumeData from "../data/resume.json";

const { profile, projects } = projectsData;
const sortedProjects = [...(projects || [])].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

export default function Home() {
  const experience = resumeData.experience || [];
  const achievements = resumeData.achievements || [];
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.5, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const heroBlur = useTransform(scrollYProgress, [0, 1], ["blur(0px)", "blur(18px)"]);

  const heroBgImage = sortedProjects[0]?.heroImage || "/be1fd2c74b9befa134541732e66deaa0.jpg";

  return (
    <>
      <main className="site site--home">
        <section className="hero hero--revamp" ref={heroRef}>
          <motion.div
            className="hero-zoom-bg"
            style={{
              scale: heroScale,
              opacity: heroOpacity,
              y: heroY,
              filter: heroBlur,
              backgroundImage: `url(${heroBgImage})`,
            }}
          />
          <GraphNodesBackground className="hero__scene" />
          <DraggableGlobe3D className="hero__globe" />
          <div className="hero__content">
            <Rotate3DOnHover>
              <div className="hero-inner">
                <motion.h1
                  className="title hero__title"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {profile.name}
                </motion.h1>
                <motion.p
                  className="subtitle hero__subtitle"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  {profile.title}
                </motion.p>
                <motion.p
                  className="hero__tagline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {profile.tagline}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <a className="cta hero__cta" href="#projects-section">
                    View Projects
                  </a>
                  {profile.contact?.resumePdf && (
                    <a
                      className="cta cta--outline hero__cta"
                      href={profile.contact.resumePdf}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Resume (PDF)
                    </a>
                  )}
                </motion.div>
              </div>
            </Rotate3DOnHover>
          </div>
        </section>

        {/* Overview: Skills */}
        <section id="skills-overview" className="section section--overview">
          <RevealOnScroll>
            <h2 className="section-title section-title--bright">Technical Skills</h2>
            <p className="section-lead section-lead--bright">
              A snapshot of technologies I work with. Full 3D sphere and categories on the Skills page.
            </p>
            <SkillLine skills={resumeData.technicalSkills} />
            <div className="section-cta">
              <Link to="/skills" className="section-cta__link">View full skills & 3D sphere →</Link>
            </div>
          </RevealOnScroll>
        </section>
        
        {/* ── Projects: horizontal image cards ────────────────────── */}
        <section id="projects-section" className="section section--showcase-projects">
          <RevealOnScroll>
            <h2 className="section-title section-title--bright">Featured Projects</h2>
            <p className="section-lead section-lead--bright">
              Full-stack platforms — click to explore.
            </p>
          </RevealOnScroll>

          <div className="showcase-cards">
            {sortedProjects.map((project, i) => (
              <RevealOnScroll key={project.id} delay={i * 0.1}>
                <Link to={`/projects/${project.id}`} className="showcase-card">
                  <motion.div
                    className="showcase-card__inner"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ backgroundImage: `url(${project.heroImage || project.thumbnail})` }}
                  >
                    <div className="showcase-card__overlay" />
                    <div className="showcase-card__content">
                      <span className="showcase-card__label">{project.tags?.[0] || "Project"}</span>
                      <h3 className="showcase-card__title">{project.shortTitle || project.title}</h3>
                      <p className="showcase-card__tagline">{project.tagline}</p>
                      <span className="showcase-card__btn">View Details →</span>
                    </div>
                  </motion.div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>

          <div className="section-cta">
            <Link to="/projects" className="section-cta__link">View all projects →</Link>
          </div>
        </section>

        {/* ── Scroll Image Grid ──────────────────────────────────── */}
        <ScrollImageGrid />

        {/* ── Component Library — Live Demos ──────────────────────── */}
        <section className="section section--components">
          <RevealOnScroll>
            <h2 className="section-title section-title--bright">Custom Component Library</h2>
            <p className="section-lead section-lead--bright">
              24 scalable, reusable components — built like Material UI / Chakra UI.
              <br />Interact with the live demos below.
            </p>
          </RevealOnScroll>
          <ComponentShowcase />
        </section>


        {/* Overview: Experience */}
        <section className="section section--overview">
          <RevealOnScroll>
            <h2 className="section-title section-title--bright">Experience & Education</h2>
            <p className="section-lead section-lead--bright">
              Journey in time — education and professional roles. Full details on the Experience page.
            </p>
            <ExperienceTimeline
              experience={experience}
              education={resumeData.education}
            />
          </RevealOnScroll>
        </section>

        {/* Overview: Achievements */}
        <section className="section section--overview">
          <RevealOnScroll>
            <h2 className="section-title section-title--bright">Achievements</h2>
            <p className="section-lead section-lead--bright">
              Highlights and education summary. Full list on the Achievements page.
            </p>
            <ul className="overview-achievements">
              {achievements.slice(0, 3).map((item, i) => (
                <li key={i} className="overview-achievements__item">{item}</li>
              ))}
            </ul>
            <div className="section-cta">
              <Link to="/about" className="section-cta__link">View all achievements →</Link>
            </div>
          </RevealOnScroll>
        </section>

        {/* Demo video
        <section className="section section--demo">
          <RevealOnScroll>
            <h2 className="section-title section-title--bright">Demo</h2>
            <div className="video-wrapper">
              <AutoPlayVideo
                src={demo}
                poster={democover}
                message="Once upon a time a kid wanted to be Spider-Man. He is a web developer now."
              />
            </div>
          </RevealOnScroll>
        </section> */}

        <footer className="footer">
          <p>
            © {new Date().getFullYear()} {profile.name} — Built with React, Three.js, Motion, Lenis
          </p>
        </footer>
      </main>
    </>
  );
}
