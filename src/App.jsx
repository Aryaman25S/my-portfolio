import { useEffect, useRef, useState } from "react";
import "./index.css";
import "./App.css";
import ThreeStage from "./ThreeStage.jsx";
import { experience, education } from "./timelineData.js";
import { projects } from "./projectsData.js";
import ContactForm from "./ContactForm.jsx";
import About from "./About.jsx";

export default function App() {
  const [mode, setMode] = useState("home"); // 'home' | 'timeline'
  const [activeNav, setActiveNav] = useState("home");
  const timelineRef = useRef(null);

  // Simple list for mobile menu mapping
  const navKeys = ["home", "about", "career", "education", "projects", "contact"];

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  // =====================
  // Scrollspy (timeline only)
  // =====================
  useEffect(() => {
    if (mode !== "timeline") return; const container = timelineRef.current; if (!container) return;
    const sections = () => ([
      ["about", document.getElementById("about-section")],
      ["career", document.getElementById("experience-section")],
      ["education", document.getElementById("education-section")],
      ["projects", document.getElementById("projects-section")],
      ["contact", document.getElementById("contact-section")],
    ]);
    let raf = 0;
    const pickActive = () => {
      const list = sections(); const crect = container.getBoundingClientRect(); const pivot = crect.top + crect.height * 0.35;
      let bestKey = null, bestDist = Infinity;
      for (const [key, el] of list) { if (!el) continue; const r = el.getBoundingClientRect(); const d = Math.abs(r.top - pivot); if (d < bestDist) { bestDist = d; bestKey = key; } }
      if (bestKey && bestKey !== activeNav) setActiveNav(bestKey);
    };
    const onScroll = () => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(pickActive); };
    container.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll);
    pickActive();
    return () => { container.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [mode, activeNav]);

  // =====================
  // Nav handlers
  // =====================
  const goHome = () => { setMode("home"); setActiveNav("home"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goAbout = () => { setMode("timeline"); setActiveNav("about"); scrollTo("about-section"); };
  const goCareer = () => { setMode("timeline"); setActiveNav("career"); scrollTo("experience-section"); };
  const goEducation = () => { setMode("timeline"); setActiveNav("education"); scrollTo("education-section"); };
  const goProjects = () => { setMode("timeline"); setActiveNav("projects"); scrollTo("projects-section"); };
  const goContact = () => { setMode("timeline"); setActiveNav("contact"); scrollTo("contact-section"); };
  const navHandlers = { home: goHome, about: goAbout, career: goCareer, education: goEducation, projects: goProjects, contact: goContact };

  // =====================
  // Nav UI (no magnetization, no robot hooks)
  // =====================
  const NavButton = ({ k, label }) => {
    const isActive = activeNav === k || (k === "home" && mode === "home");
    return (
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); navHandlers[k]?.(); }}
        className={`px-3 py-2 rounded-full text-sm md:text-base transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 ${isActive ? "text-sky-400 ring-2 ring-sky-500/60" : "text-slate-300 hover:text-white hover:ring-2 hover:ring-sky-500/40"}`}
        aria-current={isActive ? "page" : undefined}
      >
        {label}
      </button>
    );
  };

  // =====================
  // Timeline UI (center spine + alternating cards)
  // =====================
  const EventCard = ({ item, side }) => (
    <div className={`w-full md:w-1/2 ${side === "left" ? "md:pr-8" : "md:pl-8"}`}>
      <div className="relative">
        <div className="backdrop-blur-md bg-white/[0.04] border border-white/10 shadow-xl rounded-2xl p-5">
          {item.period && (
            <div className="inline-flex items-center rounded-xl bg-sky-500/10 text-sky-200 ring-1 ring-sky-400/30 px-3 py-1 text-sm font-semibold">
              {item.period}
            </div>
          )}
          <h4 className="mt-2 text-xl font-semibold text-white">
            {item.role || item.degree}
            {item.company && <span className="text-slate-300"> — {item.company}</span>}
            {item.school && <span className="text-slate-300"> — {item.school}</span>}
          </h4>
          {item.location && <div className="text-xs md:text-sm text-slate-400 mt-0.5">{item.location}</div>}
          {item.bullets?.length > 0 && (
            <ul className="mt-3 list-disc pl-5 text-slate-300 text-sm space-y-1">
              {item.bullets.map((b, i) => (<li key={i}>{b}</li>))}
            </ul>
          )}
          {item.desc && !item.bullets && (
            <p className="mt-2 text-slate-300 text-sm">{item.desc}</p>
          )}
        </div>
      </div>
    </div>
  );

  const EventConnector = ({ side }) => (
    <>
      {/* dot centered on the spine */}
      <span
        className="hidden md:block absolute left-1/2 -translate-x-1/2 top-8 h-2.5 w-2.5 rounded-full bg-sky-400 ring-4 ring-sky-400/20"
        aria-hidden
      />
      {/* connector aligned to the dot's center (2rem + 4px => 36px) */}
      <span
        className={`hidden md:block absolute top-[calc(2rem+4px)] h-[2px] w-8 bg-white/15 ${
          side === "left" ? "right-1/2" : "left-1/2"
        }`}
        aria-hidden
      />
    </>
  );

  const SectionTimeline = ({ id, title, items }) => (
    <section id={id} className="relative mt-12 scroll-mt-28 md:scroll-mt-32">
      <h3 className="text-3xl font-bold text-white mb-6">{title}</h3>
      <div className="relative">
        {/* center spine */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-white/5 via-white/10 to-white/5" aria-hidden />
        <ul className="space-y-14">
          {items.map((item, idx) => {
            const side = idx % 2 === 0 ? "left" : "right"; // alternate sides
            return (
              <li key={`${title}-${idx}`} className={`relative flex ${side === "left" ? "justify-start" : "justify-end"}`}>
                <EventConnector side={side} />
                <EventCard item={item} side={side} />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );

  const ProjectCard = ({ p }) => (
    <article className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur p-5 shadow hover:shadow-lg transition">
      {p.period && (
        <div className="inline-flex items-center rounded-xl bg-sky-500/10 text-sky-200 ring-1 ring-sky-400/30 px-3 py-1 text-sm font-semibold">
          {p.period}
        </div>
      )}
      <header className="mt-2 flex items-start justify-between gap-4">
        <h4 className="text-lg font-semibold text-white">{p.title}</h4>
        <div className="flex gap-2 text-sm">
          {p.links?.demo && (<a href={p.links.demo} className="underline text-sky-400 hover:text-sky-300" target="_blank" rel="noreferrer noopener" aria-label={`${p.title} demo (opens in a new tab)`}>Demo</a>)}
          {p.links?.github && (<a href={p.links.github} className="underline text-sky-400 hover:text-sky-300" target="_blank" rel="noreferrer noopener" aria-label={`${p.title} source on GitHub (opens in a new tab)`}>GitHub</a>)}
        </div>
      </header>
      <p className="mt-2 text-slate-300 text-sm">{p.summary}</p>
      {p.tech?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {p.tech.map((t, i) => (<span key={i} className="px-2 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-slate-200">{t}</span>))}
        </div>
      )}
    </article>
  );

  const topNav = (
    <header id="top-nav" aria-label="Primary" className="fixed left-1/2 -translate-x-1/2 top-3 z-50 pointer-events-auto">
      <nav aria-label="Primary Navigation">
        <div className="hidden md:flex items-center gap-6 rounded-full border border-white/10 bg-zinc-900/60 backdrop-blur px-4 py-2 shadow-lg">
          <NavButton k="home" label="Home" />
          <NavButton k="about" label="About" />
          <NavButton k="career" label="Career" />
          <NavButton k="education" label="Education" />
          <NavButton k="projects" label="Projects" />
          <NavButton k="contact" label="Contact" />
        </div>
        <div className="md:hidden flex items-center gap-2">
          <details className="[&_summary::-webkit-details-marker]:hidden">
            <summary aria-label="Open navigation menu" className="rounded-lg border border-white/20 bg-zinc-900/70 text-white px-3 py-2 cursor-pointer select-none">☰</summary>
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[92vw] max-w-sm rounded-2xl border border-white/10 bg-zinc-900/90 backdrop-blur p-3 shadow-xl">
              <div className="flex flex-col gap-2">
                {navKeys.map((k) => (
                  <NavButton key={k} k={k} label={k[0].toUpperCase() + k.slice(1)} />
                ))}
              </div>
            </div>
          </details>
        </div>
      </nav>
    </header>
  );

  const isTimeline = mode === "timeline";

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0b0f14] text-white font-[Inter,ui-sans-serif,system-ui]">
      <ThreeStage />
      {topNav}

      <main id="main" role="main">
        {/* HOME - remains mounted; CSS fade/translate */}
        <section
          id="home-screen"
          aria-hidden={isTimeline}
          className={`relative z-10 flex flex-col items-center pt-24 md:pt-28 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isTimeline ? "opacity-0 -translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
          }`}
        >
          <figure className="relative">
            <img src="/Me2.jpg" alt="Portrait of Aryaman Sharma" width="288" height="288" loading="eager" decoding="async" className="h-32 w-32 md:h-36 md:w-36 rounded-full object-cover ring-2 ring-white/20 shadow-xl" />
            <span className="pointer-events-none absolute inset-0 rounded-full ring-8 ring-sky-500/10 blur-[2px]" aria-hidden="true" />
          </figure>
          <h1 className="mt-5 text-center text-6xl md:text-7xl font-black tracking-tight">Hi, I'm <span className="text-sky-400">Aryaman</span> 👋</h1>
          <p className="mt-3 max-w-[56ch] text-center text-slate-300 text-lg md:text-xl">Full‑stack engineer with a soft spot for ML + 3D. I build reliable systems and playful interfaces.</p>
        </section>

        {/* TIMELINE - slides from bottom */}
        <section
          ref={timelineRef}
          id="timeline"
          aria-hidden={!isTimeline}
          className={`absolute inset-0 overflow-y-auto z-10 transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isTimeline ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          {/* viewport top gradient cap */}
          <div className="pointer-events-none sticky top-0 z-0"><div className="h-[40vh] bg-gradient-to-b from-slate-950/60 via-slate-950/85 to-transparent" /></div>

          <div className="relative max-w-5xl mx-auto px-6 py-16" id="timeline-top">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold">Timeline</h2>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setMode("home")} className="backdrop-blur bg-white/10 text-white border border-white/15 rounded-2xl px-4 py-2 shadow hover:border-sky-500/40">Back to Home</button>
              </div>
            </div>

            {/* About */}
            <section id="about-section" className="mt-10 scroll-mt-28 md:scroll-mt-32">
              <h3 className="text-3xl font-bold text-white mb-4">About</h3>
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-6 shadow-xl">
                <span className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" aria-hidden />
                <About />
              </div>
            </section>

            {/* Experience timeline */}
            <SectionTimeline id="experience-section" title="Experience" items={experience} />

            {/* Education timeline */}
            <SectionTimeline id="education-section" title="Education" items={education} />

            {/* Projects */}
            <section id="projects-section" className="mt-14 scroll-mt-28 md:scroll-mt-32">
              <h3 className="text-2xl font-semibold text-white mb-4">Selected Projects</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((p, i) => (<ProjectCard key={i} p={p} />))}
              </div>
            </section>

            {/* Contact */}
            <section id="contact-section" className="mt-14 grid gap-6 md:grid-cols-3 bg-white/[0.05] backdrop-blur border border-white/10 rounded-2xl p-6 shadow-xl scroll-mt-28 md:scroll-mt-32">
              <div className="md:col-span-1 space-y-5">
                <h3 className="text-2xl font-semibold text-white">Contact</h3>
                <p className="text-slate-300">
                  Prefer email? Reach me at {" "}
                  <a className="text-sky-400 underline" href="mailto:aryaman.25.sharma@gmail.com">aryaman.25.sharma@gmail.com</a>.
                </p>
                <div>
                  <div className="text-xs font-semibold tracking-wider text-slate-400">PHONE</div>
                  <a href="tel:+16464185476" className="text-sky-400 hover:text-sky-300">+1 (646) 418-5476</a>
                </div>
                <div>
                  <div className="text-xs font-semibold tracking-wider text-slate-400">LINKEDIN</div>
                  <a href="https://linkedin.com/in/aryaman-sharma/" target="_blank" rel="noreferrer noopener" className="text-sky-400 hover:text-sky-300">linkedin.com/in/aryaman-sharma/</a>
                </div>
                <p className="text-slate-400 text-sm">This form opens your default mail app and pre‑fills the message.</p>
              </div>
              <div className="md:col-span-2">
                <ContactForm />
              </div>
            </section>

            <footer className="mt-16 text-center text-slate-400 text-sm">© {new Date().getFullYear()} Aryaman Sharma — All rights reserved.</footer>
          </div>
        </section>

        {/* Skip links */}
        <a href="#timeline-top" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-12 bg-zinc-900 text-white px-3 py-2 rounded-md shadow">Skip to Timeline</a>
        <a href="#top-nav" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-20 bg-zinc-900 text-white px-3 py-2 rounded-md shadow">Skip to Navigation</a>
      </main>
    </div>
  );
}
