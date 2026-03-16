// src/pages/AboutPage.jsx – About page (Agenko-inspired) with Achievements
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import RevealOnScroll from "../components/RevealOnScroll";
import projectsData from "../data/projects.json";
import resumeData from "../data/resume.json";

const { profile } = projectsData;
const experience = resumeData.experience || [];
const skills = resumeData.technicalSkills || {};
const achievements = resumeData.achievements || [];
const education = resumeData.education || {};
const languages = resumeData.languages || [];

const ACHIEVEMENT_ICONS = ["\u{1F680}", "\u{26A1}", "\u{1F50D}", "\u{1F527}", "\u{1F3C6}"];

// Compute stats
const totalProjects = (projectsData.projects || []).length;
const totalSkills = Object.values(skills).reduce((sum, arr) => sum + arr.length, 0);
const yearsExp = new Date().getFullYear() - 2023; // started 2023

const STATS = [
  { value: `${totalProjects}+`, label: "Production Projects" },
  { value: `${yearsExp}+`, label: "Years Experience" },
  { value: `${totalSkills}+`, label: "Technologies" },
  { value: "60%", label: "Dispatch Time Reduced" },
];

const STRENGTHS = [
  {
    title: "Full-Stack Development",
    percent: 95,
    desc: "React, Next.js, NestJS, Node.js, Flutter, React Native — frontend to backend to mobile.",
  },
  {
    title: "Cloud & DevOps",
    percent: 85,
    desc: "AWS EC2, Docker, NGINX, CI/CD, containerized microservices with TLS termination.",
  },
  {
    title: "Search & AI",
    percent: 80,
    desc: "OpenSearch, semantic vector search (KNN/HNSW), Python embeddings, geospatial filtering.",
  },
  {
    title: "Real-Time Systems",
    percent: 88,
    desc: "Socket.io WebSockets, Firebase FCM, live tracking, real-time order management.",
  },
];

export default function AboutPage() {
  return (
    <main className="site site--page site--about">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero__inner">
          <motion.h1
            className="about-hero__title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            About Me
          </motion.h1>
          <motion.p
            className="about-hero__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {profile.tagline}
          </motion.p>
          <motion.div
            className="about-hero__breadcrumb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <Link to="/" className="about-hero__bc-link">Home</Link>
            <span className="about-hero__bc-sep">|</span>
            <span className="about-hero__bc-current">About</span>
          </motion.div>
        </div>
      </section>

      {/* Profile Section */}
      <section className="about-profile">
        <div className="about-profile__inner">
          <RevealOnScroll>
            <div className="about-profile__image-wrap">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                alt={profile.name}
                className="about-profile__image"
              />
            </div>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="about-profile__text">
              <h2 className="about-profile__name">{profile.name}</h2>
              <p className="about-profile__role">{profile.title}</p>
              <p className="about-profile__bio">
                Full Stack Developer with 2+ years of experience building production-grade web and mobile applications.
                Independently shipped {totalProjects} live platforms at Mangwale, owning frontend (React.js, Next.js, Flutter, React Native),
                backend (Python, Node.js, NestJS), databases (PostgreSQL, MySQL, OpenSearch, Redis), and cloud deployment
                (AWS EC2, NGINX, Docker). Skilled in real-time systems, payment integration, and logistics APIs.
              </p>
              <div className="about-profile__socials">
                <a href="https://linkedin.com/in/shantanu-sadafale-315338232" target="_blank" rel="noopener noreferrer" className="about-profile__social">in</a>
                <a href={`mailto:shantanusadafale1404@gmail.com`} className="about-profile__social">@</a>
                <a href={`tel:+91${profile.contact?.phone}`} className="about-profile__social">tel</a>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats">
        <div className="about-stats__inner">
          {STATS.map((stat, i) => (
            <RevealOnScroll key={stat.label} delay={i * 0.08}>
              <motion.div
                className="about-stats__item"
                whileHover={{ y: -4 }}
              >
                <span className="about-stats__value">{stat.value}</span>
                <span className="about-stats__label">{stat.label}</span>
              </motion.div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* Why Choose Me */}
      <section className="about-why">
        <div className="about-why__inner">
          <RevealOnScroll>
            <div className="about-why__text">
              <span className="about-why__badge">Why Work With Me</span>
              <h2 className="about-why__title">
                Your Trusted Partner for Full-Stack Development & Innovation
              </h2>
              <p className="about-why__desc">
                I specialize in delivering end-to-end solutions — from designing database schemas to building
                responsive UIs to deploying containerized services on AWS. My approach combines rapid iteration
                with production-grade reliability.
              </p>
              <div className="about-why__bars">
                {STRENGTHS.map((item) => (
                  <div key={item.title} className="about-why__bar-item">
                    <div className="about-why__bar-header">
                      <span className="about-why__bar-title">{item.title}</span>
                      <span className="about-why__bar-percent">{item.percent}%</span>
                    </div>
                    <div className="about-why__bar-track">
                      <motion.div
                        className="about-why__bar-fill"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.percent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="about-why__image-wrap">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=450&fit=crop"
                alt="Team collaboration"
                className="about-why__image"
              />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Experience Timeline (compact) */}
      <section className="about-timeline">
        <RevealOnScroll>
          <h2 className="about-timeline__title">Career Journey</h2>
        </RevealOnScroll>
        <div className="about-timeline__list">
          {experience.map((job, i) => (
            <RevealOnScroll key={job.id} delay={i * 0.08}>
              <div className="about-timeline__item">
                <div className="about-timeline__dot" />
                <div className="about-timeline__content">
                  <span className="about-timeline__period">{job.period}</span>
                  <h3 className="about-timeline__role">{job.role}</h3>
                  <p className="about-timeline__company">{job.company} · {job.location}</p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* Achievements */}
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
                  <div className="achv-edu__icon">{"\u{1F393}"}</div>
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
                  <span className="achv-lang-card__flag">{"\u{1F5E3}\u{FE0F}"}</span>
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
