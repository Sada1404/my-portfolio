// src/pages/Home.jsx – Overview of each section + skill line; details on section pages
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import RevealOnScroll from "../components/RevealOnScroll";
import GraphNodesBackground from "../components/GraphNodesBackground";
import DraggableGlobe3D from "../components/DraggableGlobe3D";
import ScrollDownHint from "../components/ScrollDownHint";
import ExperienceTimeline from "../components/ExperienceTimeline";
import ProjectCardDynamic from "../components/ProjectCardDynamic";
import ProjectDetailPanel from "../components/ProjectDetailPanel";
import AutoPlayVideo from "../components/AutoPlayVideo";
import Rotate3DOnHover from "../components/Rotate3DOnHover";
import SkillLine from "../components/SkillLine";
import demo from "../assets/demo.mp4";
import democover from "../assets/demo-cover.png";
import projectsData from "../data/projects.json";
import resumeData from "../data/resume.json";

const { profile, projects } = projectsData;
const sortedProjects = [...(projects || [])].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

export default function Home() {
  const [selectedProject, setSelectedProject] = useState(sortedProjects[0] || null);
  const experience = resumeData.experience || [];
  const achievements = resumeData.achievements || [];

  return (
    <>
      <main className="site site--home">
        <section className="hero hero--revamp">
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
          <ScrollDownHint />
        </section>

        <section id="projects-section" className="section section--projects-layout">
          <div className="projects-layout">
            <aside className="projects-sidebar">
              <h2 className="projects-sidebar__title">Projects</h2>
              <div className="projects-sidebar__list">
                {sortedProjects.map((project, index) => (
                  <ProjectCardDynamic
                    key={project.id}
                    project={project}
                    isSelected={selectedProject?.id === project.id}
                    onClick={() => setSelectedProject(project)}
                    layout="sidebar"
                    index={index}
                  />
                ))}
              </div>
            </aside>
            <div className="projects-main">
              <ProjectDetailPanel project={selectedProject} />
            </div>
          </div>
          <div className="section-cta">
            <Link to="/projects" className="section-cta__link">View all projects →</Link>
          </div>
        </section>

        {/* Overview: Skills – linear moving skill line + link to full page */}
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

        {/* Overview: Experience + Education timeline flow */}
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

        {/* Overview: Achievements – preview + link */}
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
              <Link to="/achievements" className="section-cta__link">View all achievements →</Link>
            </div>
          </RevealOnScroll>
        </section>

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
        </section>

        <footer className="footer">
          <p>
            © {new Date().getFullYear()} {profile.name} — Built with React, Three.js, Motion, Lenis
          </p>
        </footer>
      </main>
    </>
  );
}
