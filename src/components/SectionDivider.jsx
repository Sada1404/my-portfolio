// src/components/SectionDivider.jsx
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SectionDivider({ title = "" }) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ctx = gsap.context(() => {
            // small scale + y + opacity "dive" animation for the divider and title
            gsap.fromTo(
                el.querySelectorAll(".sd-inner > *"),
                { y: 40, autoAlpha: 0, scale: 0.98 },
                {
                    y: 0,
                    autoAlpha: 1,
                    scale: 1,
                    duration: 0.7,
                    ease: "power3.out",
                    stagger: 0.06,
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%",
                        toggleActions: "play none none reverse",
                    },
                }
            );
        }, el);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={ref} className="section-divider" aria-hidden>
            <div className="sd-inner" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
                <div className="sd-line" />
                {title ? <div className="sd-title">{title}</div> : null}
                <div className="sd-line" />
            </div>
        </div>
    );
}
