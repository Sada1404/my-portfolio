// src/App.jsx
import React from "react";
import './App.css'

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { CursorPositionProvider } from "./contexts/CursorPositionContext";
import SmoothScrollProvider from "./components/SmoothScrollProvider";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import SkillsPage from "./pages/SkillsPage";
import ExperiencePage from "./pages/ExperiencePage";
import AchievementsPage from "./pages/AchievementsPage";

export default function App() {
  return (
    <BrowserRouter>
      <CursorPositionProvider>
      <SmoothScrollProvider>
        <div className="app-wrap">
          <nav className="site-nav">
            <Link to="/" className="site-nav__link">Home</Link>
            <Link to="/projects" className="site-nav__link">Projects</Link>
            <Link to="/skills" className="site-nav__link">Skills</Link>
            <Link to="/experience" className="site-nav__link">Experience</Link>
            <Link to="/achievements" className="site-nav__link">Achievements</Link>
          </nav>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
          </Routes>
        </div>
      </SmoothScrollProvider>
      </CursorPositionProvider>
    </BrowserRouter>
  );
}
