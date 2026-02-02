// src/components/ParticlesBackground.jsx
import React, { useEffect, useRef } from "react";

export default function ParticlesBackground({ color = "#1f2040", density = 0.0008 }) {
    const canvasRef = useRef(null);
    const rafRef = useRef(null);
    const mouse = useRef({ x: -9999, y: -9999 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let w = (canvas.width = window.innerWidth);
        let h = (canvas.height = window.innerHeight);

        const particleCount = Math.max(30, Math.floor(w * h * density));
        const particles = new Array(particleCount).fill(0).map(() => createParticle(w, h));

        function createParticle(width, height) {
            const size = Math.random() * 2 + 0.6;
            return {
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                size,
                baseSize: size,
                hue: Math.random() * 360,
                drift: Math.random() * 0.2 - 0.1,
            };
        }

        function onResize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            // optional: repopulate particles on large resize
        }

        function onMove(e) {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
        }
        function onLeave() {
            mouse.current.x = -9999;
            mouse.current.y = -9999;
        }
        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("mouseout", onLeave);
        window.addEventListener("resize", onResize);

        function draw() {
            ctx.clearRect(0, 0, w, h);
            // subtle background tint
            // ctx.fillStyle = "rgba(6,7,20,0.12)";
            // ctx.fillRect(0,0,w,h);

            for (let p of particles) {
                // move
                p.x += p.vx + Math.cos(p.y * 0.01) * p.drift;
                p.y += p.vy + Math.sin(p.x * 0.01) * p.drift;

                // wrap
                if (p.x < -10) p.x = w + 10;
                if (p.x > w + 10) p.x = -10;
                if (p.y < -10) p.y = h + 10;
                if (p.y > h + 10) p.y = -10;

                // mouse parallax (subtle)
                const mx = mouse.current.x;
                const my = mouse.current.y;
                let offsetX = 0;
                let offsetY = 0;
                if (mx > -1000) {
                    const dx = (p.x - mx) * 0.0006;
                    const dy = (p.y - my) * 0.0006;
                    offsetX = -dx * 20;
                    offsetY = -dy * 20;
                }

                const x = p.x + offsetX;
                const y = p.y + offsetY;

                // draw glow circle
                const g = ctx.createRadialGradient(x, y, 0, x, y, p.size * 6);
                g.addColorStop(0, "rgba(124,58,237,0.9)");
                g.addColorStop(0.25, "rgba(124,58,237,0.28)");
                g.addColorStop(1, "rgba(124,58,237,0.02)");
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(x, y, p.size * 6, 0, Math.PI * 2);
                ctx.fill();

                // small solid dot center
                ctx.fillStyle = "rgba(255,255,255,0.06)";
                ctx.beginPath();
                ctx.arc(x, y, Math.max(0.8, p.baseSize * 0.6), 0, Math.PI * 2);
                ctx.fill();
            }

            rafRef.current = requestAnimationFrame(draw);
        }

        draw();

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseout", onLeave);
            window.removeEventListener("resize", onResize);
        };
    }, [density, color]);

    const style = {
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
        display: "block",
    };

    return <canvas ref={canvasRef} style={style} />;
}
