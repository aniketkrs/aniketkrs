"use client";

import React, {
    CSSProperties,
    ReactNode,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export type Section = {
    id?: string;
    background: string;
    leftLabel?: ReactNode;
    title: string | ReactNode;
    rightLabel?: ReactNode;
    renderBackground?: (active: boolean, previous: boolean) => ReactNode;
};

type Colors = Partial<{
    text: string;
    overlay: string;
    pageBg: string;
    stageBg: string;
}>;

type Durations = Partial<{
    change: number; // section change animation
    snap: number;   // programmatic scroll duration (ms)
}>;

export type FullScreenFXAPI = {
    next: () => void;
    prev: () => void;
    goTo: (index: number) => void;
    getIndex: () => number;
    refresh: () => void;
};

export type FullScreenFXProps = {
    sections: Section[];
    className?: string;
    style?: CSSProperties;

    // Layout
    fontFamily?: string;
    header?: ReactNode;
    footer?: ReactNode;
    gap?: number;           // rem
    gridPaddingX?: number;  // rem

    showProgress?: boolean;
    debug?: boolean;

    // Motion
    durations?: Durations;
    reduceMotion?: boolean;
    smoothScroll?: boolean; // if you use Lenis, set to true and install lenis

    // Background transition
    bgTransition?: "fade" | "wipe"; // default "fade"
    parallaxAmount?: number;        // % for outgoing bg (fade mode uses a tiny y drift)

    // Controlled index
    currentIndex?: number;
    onIndexChange?: (index: number) => void;
    initialIndex?: number;

    // Colors
    colors?: Colors;

    // Imperative API
    apiRef?: React.Ref<FullScreenFXAPI>;
    ariaLabel?: string;
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const FullScreenScrollFX = forwardRef<HTMLDivElement, FullScreenFXProps>(
    (
        {
            sections,
            className,
            style,

            fontFamily = '"Rubik Wide", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
            header,
            footer,
            gap = 1,
            gridPaddingX = 2,

            showProgress = true,
            debug = false,

            durations = { change: 0.7, snap: 800 },
            reduceMotion,
            smoothScroll = false, // enable if you install Lenis

            bgTransition = "fade",
            parallaxAmount = 4,

            currentIndex,
            onIndexChange,
            initialIndex = 0,

            colors = {
                text: "rgba(245,245,245,0.92)",
                overlay: "rgba(0,0,0,0.35)",
                pageBg: "#09090b",
                stageBg: "#09090b",
            },

            apiRef,
            ariaLabel = "Full screen scroll slideshow",
        },
        ref
    ) => {
        const total = sections.length;
        const [localIndex, setLocalIndex] = useState(clamp(initialIndex, 0, Math.max(0, total - 1)));
        const isControlled = typeof currentIndex === "number";
        const index = isControlled ? clamp(currentIndex!, 0, Math.max(0, total - 1)) : localIndex;

        const rootRef = useRef<HTMLDivElement | null>(null);
        const fixedRef = useRef<HTMLDivElement | null>(null);
        const fixedSectionRef = useRef<HTMLDivElement | null>(null);

        const bgRefs = useRef<HTMLImageElement[]>([]);
        const wordRefs = useRef<HTMLSpanElement[][]>([]);

        const leftTrackRef = useRef<HTMLDivElement | null>(null);
        const rightTrackRef = useRef<HTMLDivElement | null>(null);
        const leftItemRefs = useRef<HTMLDivElement[]>([]);
        const rightItemRefs = useRef<HTMLDivElement[]>([]);

        const progressFillRef = useRef<HTMLDivElement | null>(null);
        const currentNumberRef = useRef<HTMLSpanElement | null>(null);

        const stRef = useRef<ScrollTrigger | null>(null);
        const lastIndexRef = useRef(index);
        const isAnimatingRef = useRef(false);
        const isSnappingRef = useRef(false);
        const sectionTopRef = useRef<number[]>([]);

        // prefers-reduced-motion
        const prefersReduced = useMemo(() => {
            if (typeof window === "undefined") return false;
            return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        }, []);
        const motionOff = reduceMotion ?? prefersReduced;

        // Split words for center title
        const tempWordBucket = useRef<HTMLSpanElement[]>([]);
        const splitWords = (text: string) => {
            const words = text.split(/\s+/).filter(Boolean);
            return words.map((w, i) => (
                <span className="fx-word-mask inline-block overflow-hidden align-middle" key={i}>
                    <span className="fx-word inline-block align-middle" ref={(el) => { if (el) tempWordBucket.current.push(el); }}>{w}</span>
                    {i < words.length - 1 ? " " : null}
                </span>
            ));
        };
        const WordsCollector = ({ onReady }: { onReady: () => void }) => {
            useEffect(() => onReady(), []); // eslint-disable-line
            return null;
        };

        // Compute scroll snap positions
        const computePositions = () => {
            const el = fixedSectionRef.current;
            if (!el) return;
            const top = el.offsetTop;
            const h = el.offsetHeight;
            const arr: number[] = [];
            for (let i = 0; i < total; i++) arr.push(top + (h * i) / total);
            sectionTopRef.current = arr;
        };

        // Align lists: center active row
        const measureAndCenterLists = (toIndex = index, animate = true) => {
            const centerTrack = (
                container: HTMLDivElement | null,
                items: HTMLDivElement[],
                isRight: boolean
            ) => {
                if (!container || items.length === 0 || !items[0]) return;
                const first = items[0];
                const second = items[1];
                const contRect = container.getBoundingClientRect();
                let rowH = first.getBoundingClientRect().height;
                if (second) {
                    // more accurate: distance between rows includes gap
                    rowH = second.getBoundingClientRect().top - first.getBoundingClientRect().top;
                }
                // center math
                const targetY = contRect.height / 2 - rowH / 2 - toIndex * rowH;
                const prop = isRight ? rightTrackRef : leftTrackRef;
                if (!prop.current) return;
                if (animate) {
                    gsap.to(prop.current, {
                        y: targetY,
                        duration: (durations.change ?? 0.7) * 0.9,
                        ease: "power3.out",
                    });
                } else {
                    gsap.set(prop.current, { y: targetY });
                }
            };

            measureRAF(() => {
                measureRAF(() => {
                    centerTrack(leftTrackRef.current, leftItemRefs.current, false);
                    centerTrack(rightTrackRef.current, rightItemRefs.current, true);
                });
            });
        };

        const measureRAF = (fn: () => void) => {
            if (typeof window === "undefined") return;
            requestAnimationFrame(() => requestAnimationFrame(fn));
        };

        // ScrollTrigger for pinning + index step detection
        useLayoutEffect(() => {
            if (typeof window === "undefined") return;
            const fixed = fixedRef.current;
            const fs = fixedSectionRef.current;
            if (!fixed || !fs || total === 0) return;

            // initial bg states
            gsap.set(bgRefs.current, { opacity: 0, scale: 1.04, yPercent: 0 });
            if (bgRefs.current[0]) gsap.set(bgRefs.current[0], { opacity: 1, scale: 1 });

            // initial center words
            wordRefs.current.forEach((words, sIdx) => {
                words.forEach((w) => {
                    gsap.set(w, {
                        yPercent: sIdx === index ? 0 : 100,
                        opacity: sIdx === index ? 1 : 0,
                    });
                });
            });

            computePositions();
            measureAndCenterLists(index, false);

            const st = ScrollTrigger.create({
                trigger: fs,
                start: "top top",
                end: "bottom bottom",
                pin: fixed,
                pinSpacing: true,
                onUpdate: (self) => {
                    if (motionOff || isSnappingRef.current) return;
                    const prog = self.progress;
                    const target = Math.min(total - 1, Math.floor(prog * total));
                    if (target !== lastIndexRef.current && !isAnimatingRef.current) {
                        const nextIndexVal = lastIndexRef.current + (target > lastIndexRef.current ? 1 : -1);
                        // programmatic one-step snap without extra sound
                        goTo(nextIndexVal, false);
                    }
                    if (progressFillRef.current) {
                        const p = (lastIndexRef.current / (total - 1 || 1)) * 100;
                        progressFillRef.current.style.width = `${p}%`;
                    }
                },
            });

            stRef.current = st;

            // initial jump if needed
            if (initialIndex && initialIndex > 0 && initialIndex < total) {
                requestAnimationFrame(() => goTo(initialIndex, false));
            }

            // handle resize
            const ro = new ResizeObserver(() => {
                computePositions();
                measureAndCenterLists(lastIndexRef.current, false);
                ScrollTrigger.refresh();
            });
            ro.observe(fs);

            return () => {
                ro.disconnect();
                st.kill();
                stRef.current = null;
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [total, initialIndex, motionOff, bgTransition, parallaxAmount]);

        // Section change visuals
        const changeSection = (to: number) => {
            if (to === lastIndexRef.current || isAnimatingRef.current) return;
            const from = lastIndexRef.current;
            const down = to > from;
            isAnimatingRef.current = true;

            if (!isControlled) setLocalIndex(to);
            onIndexChange?.(to);

            // progress numbers
            if (currentNumberRef.current) {
                currentNumberRef.current.textContent = String(to + 1).padStart(2, "0");
            }
            if (progressFillRef.current) {
                const p = (to / (total - 1 || 1)) * 100;
                progressFillRef.current.style.width = `${p}%`;
            }

            const D = durations.change ?? 0.7;

            // center title word animation (mask slide)
            const outWords = wordRefs.current[from] || [];
            const inWords = wordRefs.current[to] || [];
            if (outWords.length) {
                gsap.to(outWords, {
                    yPercent: down ? -100 : 100,
                    opacity: 0,
                    duration: D * 0.6,
                    stagger: down ? 0.03 : -0.03,
                    ease: "power3.out",
                });
            }
            if (inWords.length) {
                gsap.set(inWords, { yPercent: down ? 100 : -100, opacity: 0 });
                gsap.to(inWords, {
                    yPercent: 0,
                    opacity: 1,
                    duration: D,
                    stagger: down ? 0.05 : -0.05,
                    ease: "power3.out",
                });
            }

            // backgrounds — FADE mode (requested)
            const prevBg = bgRefs.current[from];
            const newBg = bgRefs.current[to];
            if (bgTransition === "fade") {
                if (newBg) {
                    gsap.set(newBg, { opacity: 0, scale: 1.04, yPercent: down ? 1 : -1 });
                    gsap.to(newBg, { opacity: 1, scale: 1, yPercent: 0, duration: D, ease: "power2.out" });
                }
                if (prevBg) {
                    gsap.to(prevBg, {
                        opacity: 0,
                        yPercent: down ? -parallaxAmount : parallaxAmount,
                        duration: D,
                        ease: "power2.out",
                    });
                }
            } else {
                // optional wipe mode
                if (newBg) {
                    gsap.set(newBg, {
                        opacity: 1,
                        clipPath: down ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)",
                        scale: 1,
                        yPercent: 0,
                    });
                    gsap.to(newBg, { clipPath: "inset(0 0 0 0)", duration: D, ease: "power3.out" });
                }
                if (prevBg) {
                    gsap.to(prevBg, { opacity: 0, duration: D * 0.8, ease: "power2.out" });
                }
            }

            // lists — center active row and animate active state
            measureAndCenterLists(to, true);

            leftItemRefs.current.forEach((el, i) => {
                if (!el) return;
                el.classList.toggle("opacity-100", i === to);
                el.classList.toggle("opacity-40", i !== to);
                gsap.to(el, {
                    x: i === to ? 10 : 0,
                    duration: D * 0.6,
                    ease: "power3.out",
                });
            });
            rightItemRefs.current.forEach((el, i) => {
                if (!el) return;
                el.classList.toggle("opacity-100", i === to);
                el.classList.toggle("opacity-40", i !== to);
                gsap.to(el, {
                    x: i === to ? -10 : 0,
                    duration: D * 0.6,
                    ease: "power3.out",
                });
            });

            gsap.delayedCall(D, () => {
                lastIndexRef.current = to;
                isAnimatingRef.current = false;
            });
        };

        // programmatic navigation
        const goTo = (to: number, withScroll = true) => {
            const clamped = clamp(to, 0, total - 1);
            isSnappingRef.current = true;
            changeSection(clamped);

            const pos = sectionTopRef.current[clamped];
            const snapMs = durations.snap ?? 800;

            if (withScroll && typeof window !== "undefined") {
                // If you installed Lenis, you can integrate here
                window.scrollTo({ top: pos, behavior: "smooth" });
                setTimeout(() => (isSnappingRef.current = false), snapMs);
            } else {
                setTimeout(() => (isSnappingRef.current = false), 10);
            }
        };

        const next = () => goTo(index + 1);
        const prev = () => goTo(index - 1);

        useImperativeHandle(apiRef, () => ({
            next,
            prev,
            goTo,
            getIndex: () => index,
            refresh: () => ScrollTrigger.refresh(),
        }));

        // click/hover on list items
        const handleJump = (i: number) => goTo(i);
        const handleLoadedStagger = () => {
            // soft entrance for lists at mount
            leftItemRefs.current.forEach((el, i) => {
                if (!el) return;
                gsap.fromTo(
                    el,
                    { opacity: 0, y: 20 },
                    { opacity: i === index ? 1 : 0.40, y: 0, duration: 0.5, delay: i * 0.06, ease: "power3.out" }
                );
            });
            rightItemRefs.current.forEach((el, i) => {
                if (!el) return;
                gsap.fromTo(
                    el,
                    { opacity: 0, y: 20 },
                    { opacity: i === index ? 1 : 0.40, y: 0, duration: 0.5, delay: 0.2 + i * 0.06, ease: "power3.out" }
                );
            });
        };

        // mount entrance
        useEffect(() => {
            handleLoadedStagger();
            measureAndCenterLists(index, false);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        // CSS vars
        const cssVars: CSSProperties = {
            ["--fx-font" as any]: fontFamily,
            ["--fx-text" as any]: colors.text ?? "rgba(245,245,245,0.92)",
            ["--fx-overlay" as any]: colors.overlay ?? "rgba(0,0,0,0.65)",
            ["--fx-page-bg" as any]: colors.pageBg ?? "#09090b",
            ["--fx-stage-bg" as any]: colors.stageBg ?? "#09090b",
            ["--fx-row-gap" as any]: "10px",
        };

        return (
            <div
                ref={(node) => {
                    (rootRef as any).current = node;
                    if (typeof ref === "function") ref(node);
                    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
                }}
                className={["w-full overflow-hidden bg-[var(--fx-page-bg)] text-black", className].filter(Boolean).join(" ")}
                style={{ ...cssVars, ...style, fontFamily: "var(--fx-font)", textTransform: "uppercase", letterSpacing: "-0.02em" } as CSSProperties}
                aria-label={ariaLabel}
            >
                {debug && <div className="fixed bottom-[10px] right-[10px] z-[9999] bg-white/80 text-black px-2 py-1.5 font-mono text-xs rounded">Section: {index}</div>}

                <div className="w-full">
                    <div className="relative" style={{ height: `${Math.max(1, total + 1)}00vh` }} ref={fixedSectionRef}>
                        <div className="sticky top-0 h-screen w-full overflow-hidden bg-[var(--fx-page-bg)]" ref={fixedRef}>

                            {/* Backgrounds */}
                            <div className="absolute inset-0 z-[1] bg-[var(--fx-stage-bg)]" aria-hidden="true">
                                {sections.map((s, i) => (
                                    <div className="absolute inset-0" key={s.id ?? i}>
                                        {s.renderBackground ? (
                                            s.renderBackground(index === i, lastIndexRef.current === i)
                                        ) : (
                                            <>
                                                <img
                                                    ref={(el) => { if (el) bgRefs.current[i] = el; }}
                                                    src={s.background}
                                                    alt=""
                                                    className="absolute -inset-y-[10%] inset-x-0 w-full h-[120%] object-cover opacity-0 [will-change:transform,opacity]"
                                                />
                                                <div className="absolute inset-0 bg-[var(--fx-overlay)] backdrop-blur-[2px]" />
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Grid */}
                            <div className="relative z-[2] grid grid-cols-12 h-full px-4 md:px-8" style={{ gap: `${gap}rem` }}>

                                {/* Header */}
                                {header && (
                                    <div className="col-span-12 self-start pt-[6vh] text-center text-white" style={{ fontSize: "clamp(2rem, 9vw, 9rem)", lineHeight: 0.86 }}>
                                        {header}
                                    </div>
                                )}

                                {/* Content (lists + center) */}
                                <div className="absolute inset-0 col-span-12 grid md:grid-cols-[1fr_1.3fr_1fr] items-center h-full px-4 md:px-8 grid-cols-1 gap-y-[3vh] place-items-center md:place-items-stretch">

                                    {/* Left list */}
                                    <div className="md:h-[60vh] h-auto overflow-hidden grid md:justify-items-start justify-items-center content-center relative" role="list">
                                        <div className="[will-change:transform]" ref={leftTrackRef}>
                                            {sections.map((s, i) => (
                                                <div
                                                    key={`L-${s.id ?? i}`}
                                                    className={`flex items-center text-[var(--fx-text)] font-extrabold leading-none my-[5px] opacity-40 transition-all duration-300 relative text-[clamp(1rem,2.4vw,1.8rem)] select-none cursor-pointer ${i === index ? "opacity-100 pl-4 translate-x-[10px]" : ""}`}
                                                    ref={(el) => { if (el) leftItemRefs.current[i] = el; }}
                                                    onClick={() => handleJump(i)}
                                                    role="button"
                                                    tabIndex={0}
                                                    aria-pressed={i === index}
                                                >
                                                    {i === index && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-500"></div>}
                                                    {s.leftLabel}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Center title (masked words if string) */}
                                    <div className="grid place-items-center text-center md:h-[60vh] h-auto overflow-hidden relative">
                                        {sections.map((s, sIdx) => {
                                            tempWordBucket.current = [];
                                            const isString = typeof s.title === "string";
                                            return (
                                                <div key={`C-${s.id ?? sIdx}`} className={`absolute opacity-0 invisible transition-all duration-300 ${sIdx === index ? "opacity-100 !visible" : ""}`}>
                                                    <h3 className="m-0 text-white font-black tracking-[-0.01em] text-[clamp(2rem,7.5vw,6rem)]">
                                                        {isString ? splitWords(s.title as string) : s.title}
                                                    </h3>
                                                    <WordsCollector
                                                        onReady={() => {
                                                            if (tempWordBucket.current.length) {
                                                                wordRefs.current[sIdx] = [...tempWordBucket.current];
                                                            }
                                                            tempWordBucket.current = [];
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Right list */}
                                    <div className="md:h-[60vh] h-auto overflow-hidden grid md:justify-items-end justify-items-center content-center relative" role="list">
                                        <div className="[will-change:transform]" ref={rightTrackRef}>
                                            {sections.map((s, i) => (
                                                <div
                                                    key={`R-${s.id ?? i}`}
                                                    className={`flex items-center justify-end text-[var(--fx-text)] font-extrabold leading-none my-[5px] opacity-40 transition-all duration-300 relative text-[clamp(1rem,2.4vw,1.8rem)] select-none cursor-pointer ${i === index ? "opacity-100 pr-4 -translate-x-[10px]" : ""}`}
                                                    ref={(el) => { if (el) rightItemRefs.current[i] = el; }}
                                                    onClick={() => handleJump(i)}
                                                    role="button"
                                                    tabIndex={0}
                                                    aria-pressed={i === index}
                                                >
                                                    {s.rightLabel}
                                                    {i === index && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer + progress */}
                                <div className="col-span-12 self-end pb-[5vh] text-center w-full z-10 relative">
                                    {footer && (
                                        <div className="text-white font-black tracking-[-0.01em] leading-[0.9] text-[clamp(1.6rem,7vw,7rem)]">
                                            {footer}
                                        </div>
                                    )}
                                    {showProgress && (
                                        <div className="w-[200px] h-[2px] mx-auto mt-4 bg-white/20 relative">
                                            <div className="absolute bottom-full left-0 w-full flex justify-between text-[0.8rem] text-white/80 mb-2">
                                                <span ref={currentNumberRef}>{String(index + 1).padStart(2, "0")}</span>
                                                <span>{String(total).padStart(2, "0")}</span>
                                            </div>
                                            <div className="w-full h-full relative">
                                                <div className="absolute top-0 left-0 bottom-0 w-0 bg-violet-500 transition-[width] duration-300" ref={progressFillRef} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* End spacer */}
                    <div className="h-screen w-full grid place-items-center bg-[#09090b]">
                        <p className="rotate-90 text-zinc-800 text-sm font-bold tracking-widest uppercase">fin</p>
                    </div>
                </div>
            </div>
        );
    }
);

FullScreenScrollFX.displayName = "FullScreenScrollFX";
