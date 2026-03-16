// src/components/ScrollImageGrid.jsx – Scroll-driven image grid with layered reveal
import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Placeholder images — replace with your own later
const LAYER1_IMAGES = [
  "https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1556304044-0699e31c6a34?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1590330297626-d7aff25a0431?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1565321590372-09331b9dd1eb?w=800&auto=format&fit=crop&q=60",
];

const LAYER2_IMAGES = [
  "https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1637414165749-9b3cd88b8271?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1699911251220-8e0de3b5ce88?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1667483629944-6414ad0648c5?w=800&auto=format&fit=crop&q=60",
  "https://plus.unsplash.com/premium_photo-1706078438060-d76ced26d8d5?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1525385444278-b7968e7e28dc?w=800&auto=format&fit=crop&q=60",
];

const LAYER3_IMAGES = [
  "https://images.unsplash.com/reserve/LJIZlzHgQ7WPSh5KVTCB_Typewriter.jpg?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=60",
];

const CENTER_IMAGE =
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60";

function AnimatedLayer({ images, layerIndex, scrollYProgress }) {
  // opacity: hold at 0 until 55%, then fade to 1
  const opacity = useTransform(scrollYProgress, [0, 0.55, 0.95 - layerIndex * 0.05], [0, 0, 1]);
  // scale: hold at 0 until 30%, then scale to 1
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.95 - layerIndex * 0.05], [0, 0, 1]);

  return (
    <motion.div
      className={`sig-layer sig-layer--${layerIndex + 1}`}
      style={{ opacity, scale }}
    >
      {images.map((src, i) => (
        <div key={i} className="sig-layer__cell">
          <img src={src} alt="" loading="lazy" />
        </div>
      ))}
    </motion.div>
  );
}

function ScalerImage({ scrollYProgress }) {
  const scalerRef = useRef(null);
  const [dims, setDims] = useState({ vw: 1200, vh: 800, cellW: 240, cellH: 300 });

  const measure = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const el = scalerRef.current;
    if (el) {
      const cellW = el.offsetWidth;
      const cellH = el.offsetHeight;
      setDims({ vw, vh, cellW: cellW || 240, cellH: cellH || 300 });
    } else {
      setDims((d) => ({ ...d, vw, vh }));
    }
  }, []);

  useEffect(() => {
    // Measure after layout
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  // Shrink from viewport size → natural cell size (in px)
  const width = useTransform(
    scrollYProgress,
    [0, 0.8],
    [dims.vw, dims.cellW]
  );
  const height = useTransform(
    scrollYProgress,
    [0, 0.8],
    [dims.vh, dims.cellH]
  );

  return (
    <div className="sig-scaler" ref={scalerRef}>
      <motion.img
        src={CENTER_IMAGE}
        alt=""
        style={{ width, height }}
        loading="lazy"
      />
    </div>
  );
}

export default function ScrollImageGrid() {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <section className="sig-section" ref={sectionRef}>
      <div className="sig-sticky">
        <div className="sig-grid">
          <AnimatedLayer images={LAYER1_IMAGES} layerIndex={0} scrollYProgress={scrollYProgress} />
          <AnimatedLayer images={LAYER2_IMAGES} layerIndex={1} scrollYProgress={scrollYProgress} />
          <AnimatedLayer images={LAYER3_IMAGES} layerIndex={2} scrollYProgress={scrollYProgress} />
          <ScalerImage scrollYProgress={scrollYProgress} />
        </div>
      </div>
    </section>
  );
}
