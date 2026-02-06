// src/components/SkillsSphere3D.jsx – Three.js CSS3DRenderer 3D sphere of skill icons (hover via CSS)
import React, { useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import { CSS3DRenderer, CSS3DSprite } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { getFlattenedSkillsWithIcons } from "../data/resumeHelpers";

const RADIUS = 280;
const ROTATION_SPEED = 0.08;
const CONNECT_ANGLE_THRESHOLD = 0.65; // connect nodes within this angle (radians)

// Fibonacci-style distribution on sphere
function spherePoint(index, total) {
  const phi = Math.acos(-1 + (2 * index) / total);
  const theta = Math.sqrt(total * Math.PI) * index * 0.5;
  return {
    x: RADIUS * Math.sin(phi) * Math.cos(theta),
    y: RADIUS * Math.cos(phi),
    z: RADIUS * Math.sin(phi) * Math.sin(theta),
  };
}

export default function SkillsSphere3D({ skills = {} }) {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  const skillsList = useMemo(() => getFlattenedSkillsWithIcons(skills).slice(0, 24), [skills]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !containerRef.current || skillsList.length === 0) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
    camera.position.z = 800;

    // WebGL scene for connection lines (drawn behind labels)
    const lineScene = new THREE.Scene();
    const lineCamera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
    lineCamera.position.z = 800;
    const lineGroup = new THREE.Group();
    lineScene.add(lineGroup);

    const basePositions = [];
    skillsList.forEach((_, i) => {
      const pos = spherePoint(i, skillsList.length);
      basePositions.push(new THREE.Vector3(pos.x, pos.y, pos.z));
    });

    // Build line segments between nearby nodes (icons interconnected)
    const linePositions = [];
    for (let i = 0; i < basePositions.length; i++) {
      for (let j = i + 1; j < basePositions.length; j++) {
        const a = basePositions[i];
        const b = basePositions[j];
        const angle = a.angleTo(b);
        if (angle < CONNECT_ANGLE_THRESHOLD) {
          linePositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      }
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xdc2626,
      transparent: true,
      opacity: 0.25,
    });
    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    lineGroup.add(lineSegments);

    const webglRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    webglRenderer.setSize(width, height);
    webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    webglRenderer.setClearColor(0x000000, 0);
    container.appendChild(webglRenderer.domElement);
    webglRenderer.domElement.style.position = "absolute";
    webglRenderer.domElement.style.left = "0";
    webglRenderer.domElement.style.top = "0";
    webglRenderer.domElement.style.pointerEvents = "none";

    const renderer = new CSS3DRenderer({ element: document.createElement("div") });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.zIndex = "1";
    renderer.domElement.style.pointerEvents = "none";

    const group = new THREE.Group();
    scene.add(group);

    skillsList.forEach((item, i) => {
      const pos = basePositions[i];
      const div = document.createElement("div");
      div.className = "skills-sphere3d-node";
      div.innerHTML = `
        <div class="skills-sphere3d-node__inner">
          ${item.icon ? `<img src="${item.icon}" alt="" class="skills-sphere3d-node__icon" />` : `<span class="skills-sphere3d-node__letter">${item.name.charAt(0)}</span>`}
          <span class="skills-sphere3d-node__label">${item.name}</span>
        </div>
      `;
      const obj = new CSS3DSprite(div);
      obj.position.copy(pos);
      obj.scale.setScalar(1.2); // slightly enlarge sprites for better visibility
      group.add(obj);
    });

    let rafId;
    let isDragging = false;
    let prevX = 0, prevY = 0;

    function onPointerDown(e) {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    }
    function onPointerMove(e) {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;
      group.rotation.y += dx * 0.004;
      group.rotation.x += dy * 0.004;
      group.rotation.x = Math.max(-0.8, Math.min(0.8, group.rotation.x));
    }
    function onPointerUp() {
      isDragging = false;
    }

    renderer.domElement.style.pointerEvents = "auto";
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    function animate() {
      if (!isDragging) group.rotation.y += ROTATION_SPEED * 0.01;
      lineGroup.rotation.copy(group.rotation);

      webglRenderer.render(lineScene, lineCamera);
      lineCamera.position.copy(camera.position);
      lineCamera.quaternion.copy(camera.quaternion);
      lineCamera.updateProjectionMatrix();
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
      lineCamera.aspect = w / h;
      lineCamera.updateProjectionMatrix();
      renderer.setSize(w, h);
      webglRenderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      cancelAnimationFrame(rafId);
      lineGeometry.dispose();
      lineMaterial.dispose();
      webglRenderer.dispose();
      if (container.contains(webglRenderer.domElement)) container.removeChild(webglRenderer.domElement);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [mounted, skillsList.length]);

  return (
    <div
      ref={containerRef}
      className="skills-sphere3d"
      aria-hidden
      style={{ width: "100%", height: "100%", minHeight: 380 }}
    />
  );
}
