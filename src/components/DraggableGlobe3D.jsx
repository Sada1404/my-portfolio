// src/components/DraggableGlobe3D.jsx – Addverb-style draggable 3D globe for hero
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";

export default function DraggableGlobe3D({ className = "" }) {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 3.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.pointerEvents = "auto";
    renderer.domElement.style.cursor = "grab";

    // Sphere geometry with wireframe + dots style (Addverb-like)
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x1a0a0a,
      transparent: true,
      opacity: 0.85,
      wireframe: false,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Dots on surface (points)
    const dotCount = 800;
    const dotGeo = new THREE.BufferGeometry();
    const dotPos = new Float32Array(dotCount * 3);
    for (let i = 0; i < dotCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.02;
      dotPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      dotPos[i * 3 + 1] = r * Math.cos(phi);
      dotPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    dotGeo.setAttribute("position", new THREE.BufferAttribute(dotPos, 3));
    const dotMat = new THREE.PointsMaterial({
      color: 0xdc2626,
      size: 0.02,
      transparent: true,
      opacity: 0.8,
    });
    const dots = new THREE.Points(dotGeo, dotMat);
    scene.add(dots);

    // Drag state
    let isDragging = false;
    let prevX = 0, prevY = 0;
    let rotY = 0, rotX = 0;

    function onPointerDown(e) {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      renderer.domElement.style.cursor = "grabbing";
    }
    function onPointerMove(e) {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;
      rotY += dx * 0.005;
      rotX += dy * 0.005;
      rotX = Math.max(-0.8, Math.min(0.8, rotX));
      sphere.rotation.y = rotY;
      sphere.rotation.x = rotX;
      dots.rotation.y = rotY;
      dots.rotation.x = rotX;
    }
    function onPointerUp() {
      isDragging = false;
      renderer.domElement.style.cursor = "grab";
    }

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    let rafId;
    function animate() {
      if (!isDragging) {
        rotY += 0.0003;
        sphere.rotation.y = rotY;
        dots.rotation.y = rotY;
      }
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    }
    animate();

    function onResize() {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      const h = containerRef.current.offsetHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointerdown", onPointerDown);
      cancelAnimationFrame(rafId);
      renderer.dispose();
      sphere.geometry.dispose();
      sphere.material.dispose();
      dots.geometry.dispose();
      dots.material.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [mounted]);

  return (
    <div
      ref={containerRef}
      className={`draggable-globe3d ${className}`}
      aria-hidden
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(90vmin, 420px)",
        height: "min(90vmin, 420px)",
        pointerEvents: "auto",
      }}
    />
  );
}
