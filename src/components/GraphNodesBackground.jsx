// src/components/GraphNodesBackground.jsx – Metoro-style moving graph nodes + connecting lines
import React, { useRef, useEffect, useState } from "react";

const NODE_COUNT = 80;
const CONNECT_DISTANCE = 120;
const NODE_SPEED = 0.15;
const LINE_OPACITY = 0.12;

function initNodes(width, height) {
  return Array.from({ length: NODE_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * NODE_SPEED,
    vy: (Math.random() - 0.5) * NODE_SPEED,
  }));
}

export default function GraphNodesBackground({ className = "" }) {
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !canvasRef.current) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationId;

    function setSize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      if (nodesRef.current.length === 0) nodesRef.current = initNodes(width, height);
    }
    setSize();

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const nodes = nodesRef.current;

      // Update positions
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        n.x = Math.max(0, Math.min(width, n.x));
        n.y = Math.max(0, Math.min(height, n.y));
      }

      // Draw edges (lines between close nodes)
      ctx.strokeStyle = `rgba(255, 255, 255, ${LINE_OPACITY})`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < CONNECT_DISTANCE) {
            const alpha = (1 - dist / CONNECT_DISTANCE) * LINE_OPACITY;
            ctx.strokeStyle = `rgba(220, 38, 38, ${alpha * 0.5})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes (glowing dots)
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(220, 38, 38, 0.25)";
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener("resize", () => {
      setSize();
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", setSize);
    };
  }, [mounted]);

  return (
    <canvas
      ref={canvasRef}
      className={`graph-nodes-background ${className}`}
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
