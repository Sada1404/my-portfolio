// src/components/AutoPlayVideo.jsx
import React, { useRef, useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";

/**
 * AutoPlayVideo (configurable)
 *
 * - All important timing/trigger/fade values are defined in CONFIG for easy tuning.
 * - Behavior otherwise maintained from your last version.
 */

/* ------------------ CONFIG: tweak these values ------------------ */
const CONFIG = {
    // Intersection threshold to consider the component "in view" (0..1)
    IN_VIEW_RATIO: 0.5,

    // While typing, video opacity will be capped at this value.
    // Set lower to keep poster more dominant during typing; set to 1 to allow full visibility during typing.
    TYPING_CAP: 1,

    // Fraction of typing progress (0..1) after which we attempt to play video early (buffer/play).
    // Lower => attempt play earlier. E.g. 0.25 triggers play when ~99% typed.
    PLAY_FRACTION_TRIGGER: 0.99,

    // Motion spring settings used for video opacity animation.
    // Higher stiffness = faster snap; higher damping = less overshoot.
    VID_SPRING: { stiffness: 120, damping: 20 },

    // If user prefers reduced motion, wait this ms then force visible + play
    TYPING_REDUCED_DELAY: 120,

    // How quickly overlay exit animates when it is removed (in seconds)
    OVERLAY_EXIT_DURATION: 0.1,
};
/* ---------------------------------------------------------------- */

export default function AutoPlayVideo({
    src,
    poster,
    message = "Once upon a time a kid wanted to be Spider-Man. He is a web developer now.",
    typingSpeed = 35,
    betweenWordDelay = 110,
}) {
    const wrapperRef = useRef(null);
    const videoRef = useRef(null);

    const [inView, setInView] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [autoplayBlocked, setAutoplayBlocked] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // typing states
    const words = useMemo(() => message.split(" "), [message]);
    const [wordIndex, setWordIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [completedWords, setCompletedWords] = useState(0);
    const [typingDone, setTypingDone] = useState(false);

    // video opacity motion value (animated with spring)
    const vidOpacity = useMotionValue(0);
    const vidSpring = useSpring(vidOpacity, CONFIG.VID_SPRING);

    // reduced motion check
    const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // IntersectionObserver to detect element visible
    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= CONFIG.IN_VIEW_RATIO) {
                        setInView(true);
                    } else {
                        setInView(false);
                    }
                });
            },
            { threshold: [0, CONFIG.IN_VIEW_RATIO, 1] }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // Reset when scrolled away
    useEffect(() => {
        if (!inView) {
            setShowMessage(false);
            setWordIndex(0);
            setCharIndex(0);
            setCompletedWords(0);
            setTypingDone(false);
            vidOpacity.set(0);
            setAutoplayBlocked(false);
            setIsPlaying(false);
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
            document.documentElement.classList.remove("hide-custom-cursor");
        } else {
            // start showing message when enters view
            setShowMessage(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView]);

    // typing logic (word-by-word)
    useEffect(() => {
        if (!showMessage) return;
        if (prefersReduced) {
            setCompletedWords(words.length);
            setWordIndex(words.length);
            setCharIndex(0);
            setTypingDone(true);
            const t = setTimeout(() => {
                // immediate visible
                vidOpacity.set(1);
                attemptPlay();
                // hide overlay immediately
                setShowMessage(false);
            }, CONFIG.TYPING_REDUCED_DELAY);
            return () => clearTimeout(t);
        }

        let charTimer = null;
        let betweenTimer = null;

        function stepTyping() {
            const currentWord = words[wordIndex] ?? "";
            if (charIndex < currentWord.length) {
                charTimer = window.setTimeout(() => {
                    setCharIndex((c) => c + 1);
                }, typingSpeed);
            } else {
                // finished current word
                setCompletedWords((cw) => cw + 1);
                // small pop delay then next word
                betweenTimer = window.setTimeout(() => {
                    setWordIndex((w) => w + 1);
                    setCharIndex(0);
                }, betweenWordDelay);
            }
        }

        // finished all words?
        if (wordIndex >= words.length) {
            setTypingDone(true);
            // Immediately set video opacity to full and remove overlay (no slow fade)
            vidOpacity.set(1);
            // Try to play immediately (also handled in vidSpring subscriber)
            attemptPlay();
            // Immediately hide overlay and message (quick removal)
            setShowMessage(false);
            return () => { };
        }

        stepTyping();

        return () => {
            if (charTimer) clearTimeout(charTimer);
            if (betweenTimer) clearTimeout(betweenTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showMessage, wordIndex, charIndex]);

    // play helper
    async function attemptPlay() {
        const v = videoRef.current;
        if (!v) return;
        try {
            await v.play();
            setIsPlaying(true);
            setAutoplayBlocked(false);
            // hide cursor while playing
            document.documentElement.classList.add("hide-custom-cursor");
        } catch (err) {
            setIsPlaying(false);
            setAutoplayBlocked(true);
        }
    }

    // manual play fallback
    const handleManualPlay = async () => {
        await attemptPlay();
        // hide message/overlay immediately when user plays
        setShowMessage(false);
        vidOpacity.set(1);
    };

    // show typing caret and dynamic rendering
    const renderTypedWords = () => {
        return words.map((w, i) => {
            const isCompleted = i < completedWords;
            const isCurrent = i === wordIndex;
            const partial = isCompleted ? w : isCurrent ? w.slice(0, charIndex) : "";
            const display = partial + (isCompleted ? " " : "");
            return (
                <motion.span
                    key={`${w}-${i}`}
                    className={`apv-word ${isCompleted ? "apv-word-done" : isCurrent ? "apv-word-current" : ""}`}
                    initial={{ scale: 0.98 }}
                    animate={isCompleted ? { scale: [1.04, 0.98, 1], transition: { duration: 0.45 } } : {}}
                    style={{ display: "inline-block", whiteSpace: "pre" }}
                >
                    {display}
                    {isCurrent && !prefersReduced && <span className="apv-caret" aria-hidden />}
                </motion.span>
            );
        });
    };

    // video opacity ramping logic: map typing progress to target opacity
    useEffect(() => {
        if (!showMessage) return;
        // compute fraction typed: (completedWords + progress in current word)/totalWords
        const totalWords = words.length;
        const curWordLen = words[wordIndex] ? words[wordIndex].length : 0;
        const curProgress = curWordLen ? charIndex / curWordLen : 0;
        const fraction = Math.min(1, (completedWords + curProgress) / totalWords);

        // video opacity target: while typing, cap opacity below 1 (so overlay still controls the final reveal).
        // When typingDone becomes true, we immediately force 1 (handled in typing effect).
        const minOpacity = 0.0;
        const typingCap = CONFIG.TYPING_CAP; // use config
        const computed = Math.min(typingCap, minOpacity + fraction * 1.08);
        vidOpacity.set(computed);

        // begin play early so content is buffering; doesn't change showMessage
        if (fraction > CONFIG.PLAY_FRACTION_TRIGGER && !isPlaying && !autoplayBlocked) {
            attemptPlay();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [completedWords, charIndex, wordIndex, showMessage]);

    // When video visible enough (vidSpring approaching cap or 1) manage cursor
    useEffect(() => {
        const unsub = vidSpring.on("change", (v) => {
            // if below small threshold, restore cursor
            if (v <= 0.05) {
                document.documentElement.classList.remove("hide-custom-cursor");
            }
            // we DO NOT auto-hide overlay here: overlay is controlled by typingDone/showMessage logic.
        });
        return () => {
            if (typeof unsub === "function") unsub();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ensure cursor restored if autoplay blocked
    useEffect(() => {
        if (autoplayBlocked) {
            document.documentElement.classList.remove("hide-custom-cursor");
        }
    }, [autoplayBlocked]);

    // Render UI
    return (
        <div ref={wrapperRef} className="apv-wrapper" style={{ position: "relative", width: "100%" }}>
            {/* Video element (opacity will be animated by vidSpring) */}
            <motion.video
                ref={videoRef}
                src={src}
                poster={poster}
                loop
                muted
                playsInline
                preload="metadata"
                className="apv-video"
                controls={false}
                style={{
                    width: "100%",
                    display: "block",
                    borderRadius: 10,
                    opacity: vidSpring,
                }}
                onPlay={() => {
                    setIsPlaying(true);
                    document.documentElement.classList.add("hide-custom-cursor");
                }}
                onPause={() => {
                    setIsPlaying(false);
                    document.documentElement.classList.remove("hide-custom-cursor");
                }}
            />

            {/* Overlay block: poster + typed message. IMPORTANT: overlay remains shown until showMessage === true.
          We DO NOT fade it out slowly — we remove it immediately when typingDone triggers setShowMessage(false).
      */}
            <AnimatePresence>
                {showMessage && (
                    <motion.div
                        className="apv-overlay"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: CONFIG.OVERLAY_EXIT_DURATION } }}
                        transition={{ duration: CONFIG.OVERLAY_EXIT_DURATION }}
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            pointerEvents: "none",
                        }}
                    >
                        <div
                            className="apv-poster"
                            aria-hidden
                            style={{
                                position: "absolute",
                                inset: 0,
                                backgroundImage: `url(${poster})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center center",
                                backgroundRepeat: "no-repeat",
                                borderRadius: 10,
                                rotate:"270deg",
                                pointerEvents: "none",
                            }}
                        />

                        <motion.div
                            className="apv-message"
                            role="status"
                            aria-live="polite"
                            initial={{ scale: 0.98, opacity: 1 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.98, opacity: 0 }}
                            transition={{ duration: 0.18, ease: [0.22, 0.9, 0.3, 1] }}
                            style={{
                                zIndex: 3,
                                minWidth: "800px",
                                textAlign: "center",
                                pointerEvents: "none",
                                padding: "1rem 1.2rem",
                                borderRadius: 12,
                                backdropFilter: "blur(4px)",
                                color: "#fff",
                                fontSize: "4rem",
                                fontVariant:"petite-caps",
                                top: "15%",
                                left: "10%",

                                lineHeight: 1.4,
                                fontWeight: 500,
                            }}
                        >
                            <p style={{ margin: 0 }}>{renderTypedWords()}</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* If autoplay blocked, show clickable overlay */}
            {autoplayBlocked && (
                <div
                    className="apv-play-overlay"
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 4,
                        pointerEvents: "auto",
                    }}
                >
                    <button
                        onClick={handleManualPlay}
                        className="apv-play-btn"
                        style={{
                            width: 68,
                            height: 68,
                            borderRadius: 999,
                            border: "none",
                            background: "rgba(124,58,237,0.98)",
                            color: "#fff",
                            fontSize: 28,
                            cursor: "pointer",
                            boxShadow: "0 8px 30px rgba(124,58,237,0.28)",
                        }}
                    >
                        ▶
                    </button>
                </div>
            )}
        </div>
    );
}
