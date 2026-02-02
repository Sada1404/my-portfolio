// src/pages/Home.jsx
import React from "react";
import SmoothScrollProvider from "../components/SmoothScrollProvider";
import CursorFollower from "../components/CursorFollower";
import RevealOnScroll from "../components/RevealOnScroll";
import AutoPlayVideo from "../components/AutoPlayVideo";
import ProjectCard from "../components/ProjectCard";
import demo from "../assets/demo.mp4";
import democover from "../assets/demo-cover.png";
import SkewOnHover from "../components/SkewOnHover";
import Rotate3DOnHover from "../components/Rotate3DOnHover";



export default function Home() {
    return (
        <>
            <CursorFollower />

            <main className="site">
                <section className="hero">
                    <Rotate3DOnHover>
                        <div className="hero-inner">
                            <h1 className="title">Shantanu Sadafale</h1>
                            <p className="subtitle">Full-Stack Developer</p>
                            <p className="subtitle">• React • Node • AWS</p>
                            <a className="cta" href="#projects">
                                View Projects
                            </a>
                        </div>
                    </Rotate3DOnHover>
                </section>

                <section id="projects" className="section">
                    <h2 className="section-title">Selected Projects</h2>

                    <div className="grid">
                        <RevealOnScroll>
                            <ProjectCard title="Mangwale Rider App" summary="React Native partner app — real-time rider tracking and FCM." tags={["React Native", "Firebase", "Realtime"]} />
                        </RevealOnScroll>

                        <RevealOnScroll delay={0.08}>
                            <ProjectCard title="Track Dispatcher Portal" summary="React dispatcher dashboard with Live map & GSAP interactions." tags={["React", "GSAP", "Microservices"]} />
                        </RevealOnScroll>

                        <RevealOnScroll delay={0.16}>
                            <ProjectCard title="Driphunter Admin Panel" summary="Admin tools with Instagram and shipping integrations." tags={["CodeIgniter", "API", "Automation"]} />
                        </RevealOnScroll>
                    </div>
                </section>

                <section className="section">
                    <h2 className="section-title">Demo: Auto-play video when in view</h2>
                    <div className="video-wrapper">
                        <AutoPlayVideo src={demo} poster={democover} message="Once upon a time a kid wanted to be Spider-Man. He is a web developer now." />
                    </div>
                </section>

                <footer className="footer">
                    <p>© {new Date().getFullYear()} Shantanu Sadafale — Built with React + Lenis + GSAP + Framer Motion</p>
                </footer>
            </main>
        </>
    );
}
