// src/components/SkillsSphere3D.jsx – Three.js CSS3DRenderer 3D sphere of skill icons with gravity
import React, { useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import { CSS3DRenderer, CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { getFlattenedSkillsWithIcons } from "../data/resumeHelpers";
import { useCursorPosition } from "../contexts/CursorPositionContext";

const RADIUS = 280;
const ROTATION_SPEED = 0.08;
const GRAVITY_RADIUS = 100;
const GRAVITY_PULL = 25;

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
  const { x: cursorX, y: cursorY } = useCursorPosition();
  const cursorRef = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  cursorRef.current = { x: cursorX, y: cursorY };

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

    const renderer = new CSS3DRenderer({ element: document.createElement("div") });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.pointerEvents = "none";

    const group = new THREE.Group();
    scene.add(group);

    const objects = [];
    const basePositions = [];

    skillsList.forEach((item, i) => {
      const pos = spherePoint(i, skillsList.length);
      basePositions.push(new THREE.Vector3(pos.x, pos.y, pos.z));

      const div = document.createElement("div");
      div.className = "skills-sphere3d-node";
      div.innerHTML = `
        <div class="skills-sphere3d-node__inner">
          ${item.icon ? `<img src="${item.icon}" alt="" class="skills-sphere3d-node__icon" />` : `<span class="skills-sphere3d-node__letter">${item.name.charAt(0)}</span>`}
          <span class="skills-sphere3d-node__label">${item.name}</span>
        </div>
      `;
      const obj = new CSS3DObject(div);
      obj.position.set(pos.x, pos.y, pos.z);
      group.add(obj);
      objects.push({ obj, base: basePositions[i] });
    });

    const vector = new THREE.Vector3();
    const cameraPos = new THREE.Vector3(0, 0, camera.position.z);
    const invMatrix = new THREE.Matrix4();
    let rafId;

    function animate() {
      group.rotation.y += ROTATION_SPEED * 0.01;
      group.updateMatrixWorld(true);
      invMatrix.copy(group.matrixWorld).invert();

      const cursor = cursorRef.current;
      objects.forEach(({ obj, base }) => {
        obj.getWorldPosition(vector);
        vector.project(camera);
        const sx = (vector.x * 0.5 + 0.5) * width;
        const sy = (-vector.y * 0.5 + 0.5) * height;
        const dist = Math.hypot(cursor.x - sx, cursor.y - sy);
        const pull = dist < GRAVITY_RADIUS && dist > 0
          ? (1 - dist / GRAVITY_RADIUS) * GRAVITY_PULL
          : 0;
        const worldPos = obj.getWorldPosition(new THREE.Vector3());
        const toward = cameraPos.clone().sub(worldPos).normalize();
        const towardLocal = toward.applyMatrix4(invMatrix);
        obj.position.x += towardLocal.x * pull;
        obj.position.y += towardLocal.y * pull;
        obj.position.z += towardLocal.z * pull;
        obj.position.x += (base.x - obj.position.x) * 0.03;
        obj.position.y += (base.y - obj.position.y) * 0.03;
        obj.position.z += (base.z - obj.position.z) * 0.03;
      });

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
      cancelAnimationFrame(rafId);
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
