// src/pages/ContactPage.jsx – Contact page (Agenko-inspired)
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import RevealOnScroll from "../components/RevealOnScroll";
import projectsData from "../data/projects.json";

const { profile } = projectsData;

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // mailto fallback
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\n${form.message}`);
    window.open(`mailto:shantanusadafale1404@gmail.com?subject=${encodeURIComponent(form.subject || "Portfolio Contact")}&body=${body}`);
    setSent(true);
  }

  return (
    <main className="site site--page site--contact">
      {/* Hero */}
      <section className="contact-hero">
        <div className="contact-hero__inner">
          <motion.h1
            className="contact-hero__title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Contact
          </motion.h1>
          <motion.p
            className="contact-hero__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            Let's build something amazing together.
          </motion.p>
          <motion.div
            className="contact-hero__breadcrumb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <Link to="/" className="contact-hero__bc-link">Home</Link>
            <span className="contact-hero__bc-sep">|</span>
            <span className="contact-hero__bc-current">Contact</span>
          </motion.div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="contact-grid">
        <div className="contact-grid__inner">
          {/* Info Card */}
          <RevealOnScroll>
            <div className="contact-info">
              <div className="contact-info__phone">
                <span className="contact-info__phone-label">Phone</span>
                <a href={`tel:+91${profile.contact?.phone}`} className="contact-info__phone-number">
                  +91 {profile.contact?.phone}
                </a>
              </div>

              <div className="contact-info__section">
                <h4 className="contact-info__heading">Address</h4>
                <p className="contact-info__text">Nashik, Maharashtra, India - 422101</p>
              </div>

              <div className="contact-info__section">
                <h4 className="contact-info__heading">Email</h4>
                <a href="mailto:shantanusadafale1404@gmail.com" className="contact-info__link">
                  shantanusadafale1404@gmail.com
                </a>
              </div>

              <div className="contact-info__section">
                <h4 className="contact-info__heading">Follow</h4>
                <div className="contact-info__socials">
                  <a href="https://linkedin.com/in/shantanu-sadafale-315338232" target="_blank" rel="noopener noreferrer" className="contact-info__social">in</a>
                  <a href="mailto:shantanusadafale1404@gmail.com" className="contact-info__social">@</a>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Form */}
          <RevealOnScroll>
            <div className="contact-form-wrap">
              <span className="contact-form__badge">Get In Touch</span>
              <h2 className="contact-form__title">Get started and grow your business now.</h2>
              <p className="contact-form__desc">
                Have a project in mind? Need a full-stack developer? Let's talk.
              </p>

              {sent ? (
                <motion.div
                  className="contact-form__success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <span className="contact-form__success-icon">✓</span>
                  <p>Your email client should have opened. Looking forward to hearing from you!</p>
                  <button className="contact-form__reset-btn" onClick={() => setSent(false)}>Send Another</button>
                </motion.div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="contact-form__row">
                    <input
                      className="contact-form__input"
                      name="name"
                      placeholder="Name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                    <input
                      className="contact-form__input"
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <input
                    className="contact-form__input"
                    name="subject"
                    placeholder="Subject"
                    value={form.subject}
                    onChange={handleChange}
                  />
                  <textarea
                    className="contact-form__textarea"
                    name="message"
                    placeholder="Message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                  <motion.button
                    type="submit"
                    className="contact-form__submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Send Message
                  </motion.button>
                </form>
              )}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <div className="section section--back">
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>
    </main>
  );
}
