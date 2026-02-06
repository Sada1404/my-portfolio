// src/components/ExperienceTimeline.jsx – Education + Experience flow (timeline)
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function ExperienceTimeline({ experience = [], education = null }) {
  const items = [];
  if (education && education.degree) {
    items.push({
      type: "education",
      title: education.degree,
      subtitle: education.institution,
      meta: `${education.period}${education.percentage ? ` · ${education.percentage}%` : ""}`,
      key: "edu",
    });
  }
  experience.forEach((job) => {
    items.push({
      type: "experience",
      title: job.role,
      subtitle: job.company,
      meta: `${job.location} · ${job.period}`,
      image: job.image,
      key: job.company,
    });
  });

  return (
    <div className="experience-timeline">
      {items.map((item, i) => (
        <motion.div
          key={item.key}
          className="experience-timeline__item"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
        >
          <div className="experience-timeline__dot" />
          <div className="experience-timeline__line" />
          <div className="experience-timeline__card">
            {item.image && (
              <img src={item.image} alt="" className="experience-timeline__card-img" />
            )}
            <div className="experience-timeline__card-body">
              <span className="experience-timeline__type">
                {item.type === "education" ? "Education" : "Experience"}
              </span>
              <h3 className="experience-timeline__title">{item.title}</h3>
              <p className="experience-timeline__subtitle">{item.subtitle}</p>
              <p className="experience-timeline__meta">{item.meta}</p>
            </div>
          </div>
        </motion.div>
      ))}
      <div className="experience-timeline__end" />
      <div className="section-cta" style={{ marginTop: "1.5rem" }}>
        <Link to="/experience" className="section-cta__link">View full experience →</Link>
      </div>
    </div>
  );
}
