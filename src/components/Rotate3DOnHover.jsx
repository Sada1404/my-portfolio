// src/components/Rotate3DOnHover.jsx
import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * <Rotate3DOnHover>
 * Replaces skew with smooth 3D rotateX / rotateY using springs.
 *
 * Props:
 *  - children: node
 *  - maxRotate: degrees (default 12)
 *  - translate: px (subtle translation, default 6)
 *  - className: optional
 */
export default function Rotate3DOnHover({ children, maxRotate = 12, translate = 6, className = "" }) {
    const ref = useRef(null);

    const mx = useMotionValue(0); // -1..1
    const my = useMotionValue(0); // -1..1

    const sX = useSpring(mx, { stiffness: 200, damping: 22 });
    const sY = useSpring(my, { stiffness: 200, damping: 22 });

    // map motion values to rotateX / rotateY and translate values
    const rotateX = useTransform(sY, (v) => `${-v * maxRotate}deg`); // invert mapping so moving mouse down tilts forward
    const rotateY = useTransform(sX, (v) => `${v * maxRotate}deg`);
    const tX = useTransform(sX, (v) => `${v * translate}px`);
    const tY = useTransform(sY, (v) => `${v * translate}px`);

    function onMove(e) {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2); // -1..1
        const dy = (e.clientY - cy) / (rect.height / 2); // -1..1
        const clamp = (n) => Math.max(-1, Math.min(1, n));
        mx.set(clamp(dx));
        my.set(clamp(dy));
    }

    function onLeave() {
        mx.set(0);
        my.set(0);
    }

    return (
        <motion.div
            ref={ref}
            className={className}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={{
                display: "inline-block",
                transformStyle: "preserve-3d",
                perspective: 900,
                willChange: "transform",
                translateX: tX,
                translateY: tY,
                rotateX: rotateX,
                rotateY: rotateY,
            }}
        >
            {children}
        </motion.div>
    );
}
