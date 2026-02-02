// src/components/SkewOnHover.jsx
import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Wrap any element with <SkewOnHover> to give a reverse skew toward cursor.
 * Props:
 *  - children: React node
 *  - maxSkew: degrees (default 8)
 *  - strength: multiplier for translation (default 6)
 *  - className: optional
 */
export default function SkewOnHover({ children, maxSkew = 8, strength = 6, className = "" }) {
    const ref = useRef(null);

    // motion values
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const sx = useSpring(mx, { stiffness: 200, damping: 24 });
    const sy = useSpring(my, { stiffness: 200, damping: 24 });

    // derived transforms: skewX and skewY and a subtle translate
    const skewX = useTransform(sx, (v) => {
        // v is -1..1
        return `${-v * maxSkew}deg`;
    });
    const skewY = useTransform(sy, (v) => `${v * maxSkew}deg`);
    const tX = useTransform(sx, (v) => `${v * strength}px`);
    const tY = useTransform(sy, (v) => `${-v * strength}px`);

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
                perspective: 800,
                willChange: "transform",
                // we apply both skew and tiny positional translate for a lively feel
                translateX: tX,
                translateY: tY,
                skewX: skewX,
                skewY: skewY,
            }}
        >
            {children}
        </motion.div>
    );
}
