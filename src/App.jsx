import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import "./App.css";
import ThreeStage from "./ThreeStage.jsx";
import { experience, education } from "./timelineData.js";
import { projects } from "./projectsData.js";
import ContactForm from "./ContactForm.jsx";
import About from "./About.jsx";
import TypingTitles from "./TypingTitles.jsx";

const sectionTitleClass = "font-display text-section-xl font-bold text-white tracking-tight";
const dividerClass = "h-px w-full bg-gradient-to-r from-transparent via-lab-line to-transparent my-10";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: (typeof i === "number" ? i : 0) * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function App() {
  const [mode, setMode] = useState("home");
  const [activeNav, setActiveNav] = useState("home");
  const timelineRef = useRef(null);
  /** Home → timeline: target section; applied in useLayoutEffect (no y-slide on panel so scroll math is stable). */
  const pendingTimelineScrollIdRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const heroCtaRef = useRef(null);
  const heroFocusRef = useRef(null);
  const pulseDebounceRef = useRef(null);

  const navKeys = ["home", "about", "career", "education", "projects", "contact"];
  const navLabels = {
    home: "Home",
    about: "About",
    career: "Experience",
    education: "Education",
    projects: "Projects",
    contact: "Contact",
  };

  const closeMobileMenu = () => {
    mobileMenuRef.current?.removeAttribute("open");
  };

  /**
   * Scroll the timeline panel so `id` sits just below the fixed nav.
   * Native scrollIntoView aligns to the scrollport top; it does not account for fixed overlays,
   * and scroll-padding is often ignored for nested overflow scrollers — so we measure the nav.
   */
  const scrollTimelineSectionIntoView = (id, options = {}) => {
    const behavior = options.behavior ?? "smooth";
    const container = timelineRef.current;
    const el = document.getElementById(id);
    if (!container || !el) return;
    const nav = document.getElementById("top-nav");
    const navBottom = nav ? nav.getBoundingClientRect().bottom : 0;
    const gapPx = 20;
    const targetTop = navBottom + gapPx;
    const eRect = el.getBoundingClientRect();
    const delta = eRect.top - targetTop;
    container.scrollTo({ top: Math.max(0, container.scrollTop + delta), behavior });
  };

  /**
   * From home: stash id for useLayoutEffect. Already on timeline: scroll next frame.
   */
  const scrollToSectionInTimeline = (id) => {
    if (mode === "home") {
      pendingTimelineScrollIdRef.current = id;
      return;
    }
    pendingTimelineScrollIdRef.current = null;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollTimelineSectionIntoView(id));
    });
  };

  useLayoutEffect(() => {
    if (mode !== "timeline") return;
    const id = pendingTimelineScrollIdRef.current;
    if (!id) return;
    pendingTimelineScrollIdRef.current = null;
    scrollTimelineSectionIntoView(id, { behavior: "auto" });
  }, [mode]);

  const clearRobotFocus = () => {
    window.robotAPI?.setFocusOverride?.(null);
  };

  useEffect(() => {
    if (mode === "timeline") clearRobotFocus();
    if (mode === "home") pendingTimelineScrollIdRef.current = null;
  }, [mode]);

  useEffect(() => {
    if (mode !== "timeline") return;
    const container = timelineRef.current;
    if (!container) return;
    const sections = () => [
      ["about", document.getElementById("about-section")],
      ["career", document.getElementById("experience-section")],
      ["education", document.getElementById("education-section")],
      ["projects", document.getElementById("projects-section")],
      ["contact", document.getElementById("contact-section")],
    ];
    let raf = 0;
    const pickActive = () => {
      const list = sections();
      const crect = container.getBoundingClientRect();
      const pivot = crect.top + crect.height * 0.35;
      let bestKey = null;
      let bestDist = Infinity;
      for (const [key, el] of list) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top - pivot);
        if (d < bestDist) {
          bestDist = d;
          bestKey = key;
        }
      }
      if (bestKey) setActiveNav((prev) => (bestKey !== prev ? bestKey : prev));
    };
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(pickActive);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    pickActive();
    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== "timeline") return;
    const idMap = {
      about: "about-section",
      career: "experience-section",
      education: "education-section",
      projects: "projects-section",
      contact: "contact-section",
    };
    const sectionId = idMap[activeNav];
    const el = sectionId ? document.getElementById(sectionId) : null;
    const api = typeof window !== "undefined" ? window.robotAPI : null;
    if (api?.setTargetFromElement && el) {
      api.setTargetFromElement(el);
      if (pulseDebounceRef.current) window.clearTimeout(pulseDebounceRef.current);
      pulseDebounceRef.current = window.setTimeout(() => {
        pulseDebounceRef.current = null;
        api.pulseAttention?.();
      }, 280);
      return () => {
        if (pulseDebounceRef.current) window.clearTimeout(pulseDebounceRef.current);
      };
    }
  }, [mode, activeNav]);

  const goHome = () => {
    setMode("home");
    setActiveNav("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goAbout = () => {
    setMode("timeline");
    setActiveNav("about");
    scrollToSectionInTimeline("about-section");
  };
  const goCareer = () => {
    setMode("timeline");
    setActiveNav("career");
    scrollToSectionInTimeline("experience-section");
  };
  const goEducation = () => {
    setMode("timeline");
    setActiveNav("education");
    scrollToSectionInTimeline("education-section");
  };
  const goProjects = () => {
    setMode("timeline");
    setActiveNav("projects");
    scrollToSectionInTimeline("projects-section");
  };
  const goContact = () => {
    setMode("timeline");
    setActiveNav("contact");
    scrollToSectionInTimeline("contact-section");
  };
  const navHandlers = { home: goHome, about: goAbout, career: goCareer, education: goEducation, projects: goProjects, contact: goContact };

  const NavButton = ({ k, label }) => {
    const isActive = activeNav === k || (k === "home" && mode === "home");
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          navHandlers[k]?.();
          closeMobileMenu();
        }}
        className={`relative rounded-full px-3 py-2 text-sm md:text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
          isActive ? "text-cyan-200" : "text-slate-400 hover:text-white"
        }`}
        aria-current={isActive ? "page" : undefined}
      >
        {isActive && (
          <Motion.span
            layoutId="navActivePill"
            className="absolute inset-0 rounded-full border border-cyan-400/35 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
        )}
        <span className="relative z-10">{label}</span>
      </button>
    );
  };

  const EventCard = ({ item, side, compact }) => (
    <div className={`w-full md:w-1/2 ${side === "left" ? "md:pr-8" : "md:pl-8"}`}>
      <div className="relative">
        <div
          className={`border border-white/10 bg-zinc-950/95 shadow-xl ${
            compact ? "rounded-xl p-4" : "rounded-2xl p-5"
          }`}
        >
          {item.period && (
            <div
              className={`inline-flex items-center rounded-lg font-medium text-cyan-200/95 ring-1 ring-cyan-400/25 bg-cyan-500/10 ${
                compact ? "px-2 py-0.5 text-[11px] font-mono uppercase tracking-wide" : "rounded-xl px-3 py-1 text-sm font-semibold"
              }`}
            >
              {item.period}
            </div>
          )}
          <h4 className={`mt-2 font-semibold text-white ${compact ? "text-base" : "text-xl"}`}>
            {item.role || item.degree}
            {item.company && <span className="text-slate-400 font-normal"> — {item.company}</span>}
            {item.school && <span className="text-slate-400 font-normal"> — {item.school}</span>}
          </h4>
          {item.location && (
            <div className={`text-slate-500 mt-0.5 ${compact ? "text-[11px] font-mono" : "text-xs md:text-sm"}`}>{item.location}</div>
          )}
          {item.bullets?.length > 0 && (
            <ul className={`mt-3 list-disc pl-5 text-slate-300 space-y-1 ${compact ? "text-xs" : "text-sm"}`}>
              {item.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
          {item.desc && !item.bullets && <p className="mt-2 text-slate-300 text-sm">{item.desc}</p>}
        </div>
      </div>
    </div>
  );

  const EventConnector = ({ side }) => (
    <>
      <span
        className="hidden md:block absolute left-1/2 -translate-x-1/2 top-8 h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-cyan-400/25"
        aria-hidden
      />
      <span
        className={`hidden md:block absolute top-[calc(2rem+2px)] h-[1px] w-8 bg-gradient-to-r from-transparent to-cyan-400/40 ${
          side === "left" ? "right-1/2" : "left-1/2"
        }`}
        aria-hidden
      />
    </>
  );

  const SectionTimeline = ({ id, title, items, railLabel, compact }) => (
    <section id={id} className="relative mt-14 scroll-mt-4 md:scroll-mt-6">
      <div className="md:flex md:gap-10 md:items-start">
        {railLabel && (
          <div className="hidden md:flex shrink-0 w-12 flex-col items-center pt-2">
            <div className="sticky top-36 md:top-40 flex flex-col items-center gap-3">
              <span className="font-mono text-[10px] tracking-[0.35em] text-cyan-500/80 [writing-mode:vertical-rl] rotate-180 uppercase">
                {railLabel}
              </span>
              <div className="w-px min-h-[4rem] bg-gradient-to-b from-cyan-500/50 to-transparent" aria-hidden />
            </div>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className={`${sectionTitleClass} mb-8`}>{title}</h3>
          <div className="relative">
            <div
              className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-white/[0.03] via-cyan-500/15 to-white/[0.03]"
              aria-hidden
            />
            <ul className="space-y-14">
              {items.map((item, idx) => {
                const side = idx % 2 === 0 ? "left" : "right";
                return (
                  <Motion.li
                    key={`${title}-${idx}`}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={fadeInUp}
                    custom={idx}
                    className={`relative flex ${side === "left" ? "justify-start" : "justify-end"}`}
                  >
                    <EventConnector side={side} />
                    <EventCard item={item} side={side} compact={compact} />
                  </Motion.li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );

  const ProjectLinkPill = ({ href, label, children, ariaLabel }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1.5 rounded-full border border-lab-line bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-cyan-100 shadow-sm transition hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-lab-canvas"
    >
      {children}
      <span>{label}</span>
    </a>
  );

  const IconExternal = () => (
    <svg className="h-3.5 w-3.5 shrink-0 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );

  const IconGitHub = () => (
    <svg className="h-3.5 w-3.5 shrink-0 opacity-90" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );

  const ProjectCard = ({ p, index, featured }) => {
    const hasLinks = p.links && (p.links.demo || p.links.github);
    const idx = String(index + 1).padStart(2, "0");
    /** In md 2-col grid, indices 2,4,6… sit in the right column; put # outside the right edge so it doesn’t sit on the neighbor’s border. */
    const numberOutsideRight = !featured && index > 0 && index % 2 === 0;
    return (
      <article
        className={`group relative border border-white/10 bg-zinc-950/95 p-5 shadow transition hover:border-cyan-400/25 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] ${
          featured ? "md:min-h-[200px] ring-1 ring-cyan-400/10" : "rounded-2xl"
        } ${featured ? "rounded-2xl md:rounded-3xl" : "rounded-2xl"}`}
      >
        <span
          className={`absolute top-5 font-mono text-[10px] text-cyan-500/50 tabular-nums ${
            numberOutsideRight
              ? "-left-1 md:left-auto md:right-0 md:translate-x-full md:pl-4 md:pr-0"
              : "-left-1 md:left-0 md:-translate-x-full md:pr-4"
          }`}
        >
          {idx}
        </span>
        <div className="flex flex-wrap items-start justify-between gap-3">
          {p.period && (
            <div className="inline-flex items-center rounded-lg bg-cyan-500/10 text-cyan-200/95 ring-1 ring-cyan-400/25 px-3 py-1 text-xs font-semibold">
              {p.period}
            </div>
          )}
          {hasLinks && (
            <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
              {p.links.demo && (
                <ProjectLinkPill href={p.links.demo} label="Live site" ariaLabel={`${p.title} — open live site in a new tab`}>
                  <IconExternal />
                </ProjectLinkPill>
              )}
              {p.links.github && (
                <ProjectLinkPill href={p.links.github} label="Source" ariaLabel={`${p.title} — view source on GitHub in a new tab`}>
                  <IconGitHub />
                </ProjectLinkPill>
              )}
            </div>
          )}
        </div>
        <header className="mt-3">
          <h4 className="font-display text-lg font-semibold text-white pr-1">{p.title}</h4>
        </header>
        <p className="mt-2 text-slate-400 text-sm leading-relaxed">{p.summary}</p>
        {p.tech?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {p.tech.map((t, i) => (
              <span key={i} className="px-2 py-1 rounded-md border border-lab-line bg-white/[0.03] text-[11px] font-medium text-slate-300">
                {t}
              </span>
            ))}
          </div>
        )}
      </article>
    );
  };

  const isTimeline = mode === "timeline";

  const projectGrid = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
  };
  const projectItem = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  };

  const topNav = (
    <header id="top-nav" aria-label="Primary" className="fixed left-1/2 -translate-x-1/2 top-3 z-[60] pointer-events-auto">
      <nav aria-label="Primary Navigation">
        <div className="hidden md:flex items-center gap-1 rounded-full border border-lab-line bg-zinc-950/70 backdrop-blur-md px-2 py-1.5 shadow-lg">
          <NavButton k="home" label={navLabels.home} />
          <NavButton k="about" label={navLabels.about} />
          <NavButton k="career" label={navLabels.career} />
          <NavButton k="education" label={navLabels.education} />
          <NavButton k="projects" label={navLabels.projects} />
          <NavButton k="contact" label={navLabels.contact} />
        </div>
        <div className="md:hidden flex items-center gap-2">
          <details ref={mobileMenuRef} className="[&_summary::-webkit-details-marker]:hidden">
            <summary
              aria-label="Open navigation menu"
              className="rounded-lg border border-lab-line bg-zinc-950/80 text-white px-3 py-2 cursor-pointer select-none"
            >
              ☰
            </summary>
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[92vw] max-w-sm rounded-2xl border border-lab-line bg-zinc-950/95 backdrop-blur p-3 shadow-xl">
              <div className="flex flex-col gap-2">
                {navKeys.map((k) => (
                  <NavButton key={k} k={k} label={navLabels[k]} />
                ))}
              </div>
            </div>
          </details>
        </div>
      </nav>
    </header>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-lab-canvas text-white font-sans">
      <ThreeStage />
      {/* Vignette: frames 3D scene */}
      <div
        className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_75%_65%_at_50%_42%,transparent_0%,rgba(7,9,12,0.5)_55%,#07090c_92%)]"
        aria-hidden
      />
      {topNav}

      <main id="main" role="main" className="relative z-10 min-h-[100dvh]">
        <AnimatePresence mode="wait">
          {mode === "home" && (
            <Motion.section
              key="home"
              id="home-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden={isTimeline}
              className="relative min-h-[100dvh] pt-20 md:pt-24 pb-16 md:pb-20 px-4 md:px-10"
            >
              <div className="mx-auto max-w-3xl md:max-w-6xl flex flex-col justify-center min-h-[calc(100dvh-7rem)]">
                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center md:text-left"
                >
                  <div className="flex justify-center md:justify-start mb-6">
                    <figure className="relative">
                      <img
                        src="/Me2.jpg"
                        alt="Portrait of Aryaman Sharma"
                        width="288"
                        height="288"
                        loading="eager"
                        decoding="async"
                        className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover ring-1 ring-white/20 shadow-lg"
                      />
                      <span className="pointer-events-none absolute inset-0 rounded-full ring-4 ring-cyan-500/10" aria-hidden />
                    </figure>
                  </div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-cyan-500/90 mb-3">Full-stack · ML · 3D</p>
                  <h1 className="font-display text-display font-extrabold text-white">
                    Hi, I&apos;m <span className="text-cyan-300">Aryaman</span>
                  </h1>
                  <div
                    ref={heroFocusRef}
                    onMouseEnter={() => window.robotAPI?.setFocusOverride?.(heroFocusRef.current)}
                    onMouseLeave={clearRobotFocus}
                    className="mt-5 max-w-xl mx-auto md:mx-0 min-w-0"
                  >
                    <p className="text-lg md:text-xl font-semibold leading-snug text-slate-200 overflow-x-auto [scrollbar-width:thin]">
                      I&apos;m a{" "}
                      <TypingTitles
                        words={["Software Developer", "Machine Learning Engineer", "Data Scientist"]}
                        typingSpeed={88}
                        deletingSpeed={42}
                        pauseMs={950}
                        className="inline-block align-baseline text-cyan-200/95"
                      />
                    </p>
                  </div>
                  <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start items-center">
                    <button
                      type="button"
                      ref={heroCtaRef}
                      onClick={() => {
                        setMode("timeline");
                        setActiveNav("about");
                        scrollToSectionInTimeline("about-section");
                      }}
                      onMouseEnter={() => window.robotAPI?.setFocusOverride?.(heroCtaRef.current)}
                      onMouseLeave={clearRobotFocus}
                      className="inline-flex items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/10 px-8 py-3 text-sm font-semibold text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)] transition hover:bg-cyan-500/20 hover:border-cyan-300/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                    >
                      View work
                    </button>
                  </div>
                  <p className="mt-8 text-xs text-slate-500 max-w-sm mx-auto md:mx-0 leading-relaxed">
                    Interactive lab scene: the arm follows your cursor. On smaller screens, explore the timeline for the full story.
                  </p>
                </Motion.div>
              </div>
            </Motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mode === "timeline" && (
            <Motion.section
              key="timeline"
              ref={timelineRef}
              id="timeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden={!isTimeline}
              className="absolute inset-0 overflow-y-auto z-20 bg-lab-canvas/58 backdrop-blur-[3px] scroll-pt-28 md:scroll-pt-32"
            >
              {/* Top fade over 3D — absolute so it does not consume scroll height */}
              <div
                className="pointer-events-none absolute top-0 left-0 right-0 z-10 h-28 bg-gradient-to-b from-lab-canvas via-lab-canvas/80 to-transparent"
                aria-hidden
              />

              <div className="relative z-[1] max-w-5xl mx-auto px-5 md:px-8 pt-24 pb-12 md:pt-28 md:pb-16" id="timeline-top">
                <section
                  id="about-section"
                  className="min-h-[calc(100dvh-7rem)] scroll-mt-2 md:scroll-mt-4"
                >
                  <h3 className={`${sectionTitleClass} mb-6 pt-1`}>About</h3>
                  <div className="relative rounded-2xl border border-white/[0.08] bg-zinc-950/95 p-6 md:p-8 shadow-xl overflow-hidden">
                    <span className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/[0.06] blur-3xl" aria-hidden />
                    <About />
                  </div>
                </section>

                <div className={dividerClass} aria-hidden />

                <SectionTimeline id="experience-section" title="Experience" items={experience} railLabel="EXP" />

                <div className={dividerClass} aria-hidden />

                <SectionTimeline id="education-section" title="Education" items={education} railLabel="EDU" compact />

                <div className={dividerClass} aria-hidden />

                <section id="projects-section" className="mt-14 scroll-mt-4 md:scroll-mt-6">
                  <h3 className={`${sectionTitleClass} mb-8`}>Selected projects</h3>
                  <Motion.div
                    variants={projectGrid}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-40px" }}
                    className="grid gap-5 md:grid-cols-2"
                  >
                    {projects.map((p, i) => (
                      <Motion.div key={i} variants={projectItem} className={i === 0 ? "md:col-span-2" : ""}>
                        <ProjectCard p={p} index={i} featured={i === 0} />
                      </Motion.div>
                    ))}
                  </Motion.div>
                </section>

                <Motion.section
                  id="contact-section"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                  className="mt-16 scroll-mt-4 md:scroll-mt-6 rounded-2xl border border-white/[0.08] bg-zinc-950/95 p-6 md:p-10"
                >
                  <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
                    <div className="min-w-0 lg:col-span-5 space-y-8">
                      <h3 className="font-display text-section-lg font-bold text-white">Contact</h3>
                      <div>
                        <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-2">Email</p>
                        <a
                          href="mailto:aryaman.25.sharma@gmail.com"
                          className="font-display text-sm sm:text-base md:text-lg font-semibold text-cyan-200 hover:text-cyan-100 transition break-words"
                        >
                          aryaman.25.sharma@gmail.com
                        </a>
                      </div>
                      <div className="flex flex-wrap gap-6 text-sm">
                        <a
                          href="tel:+16464185476"
                          className="text-slate-300 hover:text-cyan-200 transition border-b border-transparent hover:border-cyan-500/40 pb-0.5"
                        >
                          +1 (646) 418-5476
                        </a>
                        <a
                          href="https://linkedin.com/in/aryaman-sharma/"
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-slate-300 hover:text-cyan-200 transition border-b border-transparent hover:border-cyan-500/40 pb-0.5"
                        >
                          LinkedIn
                        </a>
                        <a
                          href="https://github.com/Aryaman25S"
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-slate-300 hover:text-cyan-200 transition border-b border-transparent hover:border-cyan-500/40 pb-0.5"
                        >
                          GitHub
                        </a>
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed">The form opens your mail client with your message pre-filled.</p>
                    </div>
                    <div className="lg:col-span-7 border-t border-lab-line pt-8 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-10 lg:border-lab-line">
                      <ContactForm />
                    </div>
                  </div>
                </Motion.section>

                <footer className="mt-16 pb-8 text-center font-mono text-xs text-slate-600">
                  © {new Date().getFullYear()} Aryaman Sharma — All rights reserved.
                </footer>
              </div>
            </Motion.section>
          )}
        </AnimatePresence>

        <a
          href="#timeline-top"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-12 bg-zinc-900 text-white px-3 py-2 rounded-md shadow z-[70]"
        >
          Skip to Timeline
        </a>
        <a
          href="#top-nav"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-20 bg-zinc-900 text-white px-3 py-2 rounded-md shadow z-[70]"
        >
          Skip to Navigation
        </a>
      </main>
    </div>
  );
}
