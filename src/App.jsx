// src/App.jsx
import React from "react";
import './App.css'

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import SmoothScrollProvider from "./components/SmoothScrollProvider";
import Home from "./pages/Home";
import Projects from "./pages/Projects";

export default function App() {
  return (
    <BrowserRouter>
      {/* SmoothScrollProvider should wrap routes so Lenis lives at top-level */}
      <SmoothScrollProvider>
        <main className="site">
          <section>
            <nav style={{ position: "fixed", top: 12, left: 12, zIndex: 9999 }}>
              <Link to="/" style={{ marginRight: 12 }}>
                Home
              </Link>
              <Link to="/projects">Projects</Link>
            </nav>

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
            </Routes>
          </section>
        </main>
      </SmoothScrollProvider>
    </BrowserRouter>
  );
}
