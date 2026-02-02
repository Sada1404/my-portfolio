// src/components/SmoothScrollProvider.jsx
import React, { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrollProvider({ children }) {
    const lenisRef = useRef(null);
    const initedRef = useRef(false);

    useEffect(() => {
        if (initedRef.current) return; // guard Double-init in StrictMode
        initedRef.current = true;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) {
            // Respect reduced motion: use native scroll and let ScrollTrigger work normally
            ScrollTrigger.defaults({ scroller: window });
            ScrollTrigger.refresh();
            return;
        }

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
            direction: "vertical",
        });
        lenisRef.current = lenis;

        // RAF loop
        let rafId;
        function raf(time) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);

        // scrollerProxy for root (documentElement). Tolerant getter for different Lenis versions.
        ScrollTrigger.scrollerProxy(document.documentElement, {
            scrollTop(value) {
                if (arguments.length) {
                    lenis.scrollTo(value, { immediate: true });
                }
                // tolerate different lenis implementations
                return (lenis && (lenis.scroll || (lenis.scroll && lenis.scroll.instance))) || 0;
            },
            getBoundingClientRect() {
                return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
            },
            pinType: document.documentElement.style.transform ? "transform" : "fixed",
        });

        // When Lenis scrolls, update ScrollTrigger
        try {
            lenis.on("scroll", ScrollTrigger.update);
        } catch (e) {
            // if lenis doesn't support .on or something goes wrong, ignore gracefully
            // but keep ScrollTrigger.refresh() as a fallback
            console.warn("lenis.on('scroll') failed:", e);
        }

        // Refresh once to ensure ScrollTrigger reads the proxied scroller
        ScrollTrigger.refresh();

        // CLEANUP
        return () => {
            // cancel RAF
            try {
                if (rafId) cancelAnimationFrame(rafId);
            } catch (e) { }

            // destroy lenis safely
            try {
                if (lenisRef.current && typeof lenisRef.current.destroy === "function") {
                    lenisRef.current.destroy();
                }
            } catch (e) {
                console.warn("Error destroying lenis:", e);
            }

            // remove lenis listeners if possible
            try {
                if (lenisRef.current && typeof lenisRef.current.off === "function") {
                    lenisRef.current.off("scroll", ScrollTrigger.update);
                }
            } catch (e) { }

            // Reset scrollerProxy (replace with empty proxy) so ScrollTrigger won't keep referencing our lenis
            try {
                ScrollTrigger.scrollerProxy(document.documentElement, {});
            } catch (e) { }

            // Kill all ScrollTrigger instances if API available (defensive)
            try {
                if (typeof ScrollTrigger.getAll === "function") {
                    const all = ScrollTrigger.getAll();
                    all.forEach((st) => {
                        try {
                            st.kill && st.kill();
                        } catch (e) {
                            // ignore single st kill errors
                        }
                    });
                } else if (typeof ScrollTrigger.killAll === "function") {
                    // older/newer variants may provide killAll
                    ScrollTrigger.killAll();
                }
            } catch (e) {
                console.warn("Error cleaning ScrollTrigger instances:", e);
            }

            // Finally, try a generic refresh to clear internal state
            try {
                ScrollTrigger.refresh();
            } catch (e) { }
        };
    }, []);

    return <div id="lenis-wrapper">{children}</div>;
}
