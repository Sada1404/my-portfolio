// src/components/CursorFollower.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import rocket from "../assets/rocket.apng"; // your rocket asset

const isTouchDevice = () =>
    typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 1);

/**
 * Tweak this if the rocket asset is not "forward" along the math direction.
 * - If the rocket tip points to the right by default, use -90 or -45 etc.
 * - Positive rotates clockwise.
 */
const ROTATION_OFFSET = 45; // <- try -45, -90, or 0 depending on your asset

export default function CursorFollower() {
    const [mounted, setMounted] = useState(false);

    // target motion values (pixel coordinates are for top-left of rocket container)
    const tx = useMotionValue(-1000);
    const ty = useMotionValue(-1000);
    const tAngle = useMotionValue(0); // target angle in degrees (math atan2)
    const tSpeed = useMotionValue(0); // 0..1 scaled speed for flame

    // spring configs
    // position spring: medium stiffness (elastic float), higher damping for "space" feel
    const posSpring = { damping: 18, stiffness: 120, mass: 0.9 };
    // angle spring: lower stiffness so it turns with lag; higher damping to avoid overshoot
    const angleSpring = { damping: 26, stiffness: 180, mass: 0.9 };
    // flame spring
    const flameSpring = { damping: 118, stiffness: 190, mass: 10.8 };

    const sx = useSpring(tx, posSpring);
    const sy = useSpring(ty, posSpring);
    const sAngle = useSpring(tAngle, angleSpring);
    const sSpeed = useSpring(tSpeed, flameSpring);

    // rotated value with offset (so asset faces correct way)
    const rotated = useTransform(sAngle, (v) => v + ROTATION_OFFSET);

    const prev = useRef({ x: -1000, y: -1000, t: Date.now() });
    const mountedRef = useRef(false);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (isTouchDevice()) return;
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        function onMove(e) {
            const clientX = e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX);
            const clientY = e.clientY ?? (e.touches && e.touches[0] && e.touches[0].clientY);
            if (clientX == null || clientY == null) return;

            const ROCKET_SIZE = 48; // match the size in CSS, adjust if you change asset size
            const half = ROCKET_SIZE / 2;

            // set target top-left coordinates so rocket center sits at cursor
            tx.set(clientX - half);
            ty.set(clientY - half);

            // velocity and direction
            const dx = clientX - prev.current.x;
            const dy = clientY - prev.current.y;
            const dt = Math.max(1, Date.now() - prev.current.t);
            const speed = Math.hypot(dx, dy) / dt; // px per ms

            // target angle (in degrees) where 0 is to the right, 90 is down, etc.
            let ang = Math.atan2(dy, dx) * (180 / Math.PI);

            // Clamp angle changes to avoid huge jumps when pointer teleports
            const prevAng = prev.current.ang ?? ang;
            let delta = ang - prevAng;
            // normalize delta between -180 and 180
            if (delta > 180) delta -= 360;
            if (delta < -180) delta += 360;
            const MAX_DELTA = 45; // degrees per frame allowed; tweak to limit instantaneous rotation
            if (delta > MAX_DELTA) delta = MAX_DELTA;
            if (delta < -MAX_DELTA) delta = -MAX_DELTA;
            ang = prevAng + delta;

            // scale speed to 0..1 (tweak divisor to change sensitivity)
            const speedVal = Math.min(1, Math.hypot(dx, dy) / 60);

            tAngle.set(ang);
            tSpeed.set(speedVal);

            prev.current = { x: clientX, y: clientY, t: Date.now(), ang };
        }

        function onLeave() {
            // move it offscreen nicely
            tx.set(-1000);
            ty.set(-1000);
            tAngle.set(0);
            tSpeed.set(0);
        }

        window.addEventListener("mousemove", onMove);
        window.addEventListener("touchmove", onMove, { passive: true });
        window.addEventListener("mouseleave", onLeave);
        window.addEventListener("touchstart", onLeave);

        document.documentElement.classList.add("custom-cursor-active");

        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("touchmove", onMove);
            window.removeEventListener("mouseleave", onLeave);
            window.removeEventListener("touchstart", onLeave);
            document.documentElement.classList.remove("custom-cursor-active");
        };
    }, [tx, ty, tAngle, tSpeed]);

    // do not render on SSR or small screens
    if (!mounted || typeof window === "undefined") return null;
    if (window.innerWidth < 700) return null;

    // rocket size constant (adjust if needed)
    const ROCKET_SIZE = 48;

    const follower = (
        <motion.div
            className="cursor-follower"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                translateX: sx,
                translateY: sy,
                rotate: rotated,
                zIndex: 99999,
                pointerEvents: "none",
                width: ROCKET_SIZE,
                height: ROCKET_SIZE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                willChange: "transform, opacity",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ opacity: { duration: 0.15 } }}
            aria-hidden
        >
            <div
                style={{
                    position: "relative",
                    width: ROCKET_SIZE,
                    height: ROCKET_SIZE,
                    transformOrigin: "50% 50%", // rotate around center
                    pointerEvents: "none",
                }}
            >
                <img
                    src={rocket}
                    alt="rocket cursor"
                    style={{
                        width: ROCKET_SIZE,
                        height: ROCKET_SIZE,
                        display: "block",
                        userSelect: "none",
                        pointerEvents: "none",
                        transformOrigin: "50% 50%",
                    }}
                    draggable={false}
                />

                {/* Flame container is positioned relative to rocket and then moved along rocket's local tail axis.
            We also rotate the flame container opposite to rocket rotation so the flame visually points "down" the rocket tail.
            Using sSpeed drives the flame intensity/scale.
        */}
                <motion.div
                    className="rocket-flame-wrap"
                    style={{
                        position: "absolute",
                        left: "5%",
                        top: "70%",
                        width: 0,
                        height: 0,
                        translateX: "-50%",
                        translateY: "20%", // pushes flame out from the center toward the tail area; tweak if needed
                        pointerEvents: "none",
                        rotate: 0, // keep flame independent; it will follow rocket because it is inside rotated container
                    }}
                >
                    <motion.div
                        className="rocket-flame"
                        style={{
                            width: 10,
                            height: 14,
                            borderRadius: 8,
                            rotate: "45deg",
                            transformOrigin: "center",
                            scaleY: sSpeed,
                            opacity: sSpeed,
                            pointerEvents: "none",
                        }}
                    />
                </motion.div>
            </div>
        </motion.div>
    );

    return createPortal(follower, document.body);
}
