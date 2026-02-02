import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function RevealOnScroll({ children, delay = 0 }) {
    const rootRef = useRef(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) return;

        const el = rootRef.current;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                el,
                { autoAlpha: 0, y: 30 },
                {
                    duration: 0.7,
                    autoAlpha: 1,
                    y: 0,
                    delay,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%",
                        end: "top 40%",
                        toggleActions: "play none none reverse",
                        markers: false,
                    },
                }
            );
        }, el);

        return () => ctx.revert();
    }, [delay]);

    return (
        <div ref={rootRef} style={{ willChange: "transform, opacity" }}>
            {children}
        </div>
    );
}
