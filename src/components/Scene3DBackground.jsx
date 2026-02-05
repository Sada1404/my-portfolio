// src/components/Scene3DBackground.jsx
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";

/**
 * Subtle Three.js background: gradient fog, soft particles, and optional grid.
 * Respects prefers-reduced-motion.
 */
export default function Scene3DBackground({ className = "" }) {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    Object.assign(canvas.style, {
      display: "block",
      width: "-webkit-fill-available",
      height: "-webkit-fill-available",
      position: "fixed",
      left: "0px",
      top: "0px",
    });
    container.appendChild(canvas);

    // Soft particles
    const particleCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 24;
      positions[i + 1] = (Math.random() - 0.5) * 24;
      positions[i + 2] = (Math.random() - 0.5) * 12;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xdc2626,
      size: 0.08,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let frame = 0;
    function animate() {
      frame++;
      particles.rotation.y = frame * 0.00015;
      particles.rotation.x = Math.sin(frame * 0.0005) * 0.05;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    function onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    onResize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [mounted]);

  return (
    <div
      ref={containerRef}
      className={`scene3d-background ${className}`}
      aria-hidden
      style={{
        display: "block",
        width: "-webkit-fill-available",
        height: "-webkit-fill-available",
        position: "fixed",
        left: 0,
        top: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    />
  );
}
