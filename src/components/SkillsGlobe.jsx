// src/components/SkillsGlobe.jsx
import React, { useRef, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useCursorPosition } from "../contexts/CursorPositionContext";

const GRAVITY_RADIUS = 160;
const GRAVITY_STRENGTH = 0.4;
const ROTATION_SPEED = 0.12;

function getFlattenedSkills(skillsObj) {
  const list = [];
  Object.entries(skillsObj || {}).forEach(([, arr]) => {
    if (Array.isArray(arr)) arr.forEach((s) => list.push(String(s)));
  });
  return list.slice(0, 20);
}

export default function SkillsGlobe({ skills = {} }) {
  const containerRef = useRef(null);
  const { x: cursorX, y: cursorY } = useCursorPosition();
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);

  const skillsList = useMemo(() => getFlattenedSkills(skills), [skills]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setCenter({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    };
    update();
    window.addEventListener("resize", update);
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => {
      window.removeEventListener("resize", update);
      obs.disconnect();
    };
  }, []);

  useEffect(() => {
    let raf;
    const tick = () => {
      setRotation((r) => r + ROTATION_SPEED);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const radius = 130;
  const angleStep = (2 * Math.PI) / Math.max(skillsList.length, 1);

  return (
    <div ref={containerRef} className="skills-globe">
      <div className="skills-globe__orbit">
        {skillsList.map((label, i) => {
          const angle = i * angleStep + (rotation * Math.PI) / 180;
          const baseX = radius * Math.cos(angle);
          const baseY = radius * Math.sin(angle);
          const nodeX = center.x + baseX;
          const nodeY = center.y + baseY;
          const dx = cursorX - nodeX;
          const dy = cursorY - nodeY;
          const dist = Math.hypot(dx, dy);
          const pull =
            dist < GRAVITY_RADIUS && dist > 0
              ? GRAVITY_STRENGTH * (1 - dist / GRAVITY_RADIUS)
              : 0;
          const tx = dx * pull;
          const ty = dy * pull;

          return (
            <motion.div
              key={`${label}-${i}`}
              className="skills-globe__node"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                marginLeft: baseX - 24,
                marginTop: baseY - 14,
                x: tx,
                y: ty,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
            >
              <span className="skills-globe__label">{label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
