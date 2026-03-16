// src/App.jsx
import React, { useState, useCallback } from "react";
import './App.css'

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { CursorPositionProvider } from "./contexts/CursorPositionContext";
import SmoothScrollProvider from "./components/SmoothScrollProvider";
import CursorFollower from "./components/CursorFollower";
import ScrollProgress from "./components/ScrollProgress";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import SkillsPage from "./pages/SkillsPage";
import ExperiencePage from "./pages/ExperiencePage";

import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProjectDetails from "./pages/ProjectDetails";

function NavLinks({ onClick }) {
  return (
    <>
      <Link to="/" className="site-nav__link" onClick={onClick}>Home</Link>
      <Link to="/projects" className="site-nav__link" onClick={onClick}>Projects</Link>
      <Link to="/skills" className="site-nav__link" onClick={onClick}>Skills</Link>
      <Link to="/experience" className="site-nav__link" onClick={onClick}>Experience</Link>
      <Link to="/about" className="site-nav__link" onClick={onClick}>About</Link>
      <Link to="/contact" className="site-nav__link" onClick={onClick}>Contact</Link>
    </>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <BrowserRouter>
      <CursorPositionProvider>
      <CursorFollower />
      <ScrollProgress />
      <SmoothScrollProvider>
        <div className="app-wrap">
          <nav className={`site-nav${menuOpen ? " site-nav--open" : ""}`}>
            <button
              className="site-nav__burger"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
            <div className="site-nav__links">
              <NavLinks onClick={closeMenu} />
            </div>
          </nav>
          {menuOpen && <div className="site-nav__backdrop" onClick={closeMenu} />}

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/experience" element={<ExperiencePage />} />

            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </div>
      </SmoothScrollProvider>
      </CursorPositionProvider>
    </BrowserRouter>
  );
}
