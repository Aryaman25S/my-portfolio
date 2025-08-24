import { useEffect, useRef, useState } from "react";
import "./index.css";
import "./App.css";
import ThreeStage from "./ThreeStage.jsx";
import { experience, education } from "./timelineData.js"; // <-- NEW

export default function App() {
  const [mode, setMode] = useState("home");
  const [activeNav, setActiveNav] = useState("home");
  const [magnetKey, setMagnetKey] = useState(null);
  const timelineRef = useRef(null);

  const navKeys = ["home", "about", "career", "education", "projects", "contact"];
  const navRefs = useRef(Object.fromEntries(navKeys.map((k) => [k, { current: null }]))).current;

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  // --- Magnetization & hooks (unchanged from Commit 8) ---
  useEffect(() => {
    const lastKeyRef = { current: null };
    const ENTER_R = 28, EXIT_R = 40;
    const onEffPos = ({ x, y }) => {
      let bestKey = null, bestEl = null, bestDist = Infinity;
      for (const key of navKeys) {
        const el = navRefs[key]?.current; if (!el) continue;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const d = Math.hypot(x - cx, y - cy);
        if (d < bestDist) { bestDist = d; bestKey = key; bestEl = el; }
      }
      const thresh = (lastKeyRef.current && bestKey === lastKeyRef.current) ? EXIT_R : ENTER_R;
      if (bestDist < thresh) { setMagnetKey(bestKey); lastKeyRef.current = bestKey; try { window.robotAPI?.setTargetFromElement?.(bestEl); } catch {} }
      else { setMagnetKey(null); lastKeyRef.current = null; }
    };
    const attach = () => { if (window.robotAPI) window.robotAPI.onEffectorScreenPos = onEffPos; };
    attach(); const id = setInterval(attach, 300);
    return () => { clearInterval(id); if (window.robotAPI) window.robotAPI.onEffectorScreenPos = null; };
  }, [navRefs]);

  useEffect(() => {
    const onPointerDown = (e) => { if (!magnetKey) return; e.preventDefault(); navHandlers[magnetKey]?.(); };
    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () => window.removeEventListener("pointerdown", onPointerDown, { capture: true });
  }, [magnetKey]);

  // Scrollspy in timeline
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
      const list = sections(); const crect = container.getBoundingClientRect();
      const pivot = crect.top + crect.height * 0.35;
      let bestKey = null, bestEl = null, bestDist = Infinity;
      for (const [key, el] of list) { if (!el) continue; const r = el.getBoundingClientRect(); const d = Math.abs(r.top - pivot); if (d < bestDist) { bestDist = d; bestKey = key; bestEl = el; } }
      if (bestKey && bestKey !== activeNav && !magnetKey) {
        setActiveNav(bestKey);
        const navEl = navRefs[bestKey]?.current; if (navEl) try { window.robotAPI?.setTargetFromElement?.(navEl); } catch {}
      }
    };
    const onScroll = () => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(pickActive); };
    container.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll);
    pickActive();
    return () => { container.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [mode, magnetKey, activeNav, navRefs]);

  // Nav handlers
  const goHome = () => { setMode("home"); setActiveNav("home"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goAbout = () => { setMode("timeline"); setActiveNav("about"); scrollTo("about-section"); };
  const goCareer = () => { setMode("timeline"); setActiveNav("career"); scrollTo("experience-section"); };
  const goEducation = () => { setMode("timeline"); setActiveNav("education"); scrollTo("education-section"); };
  const goProjects = () => { setMode("timeline"); setActiveNav("projects"); scrollTo("projects-section"); };
  const goContact = () => { setMode("timeline"); setActiveNav("contact"); scrollTo("contact-section"); };
  const navHandlers = { home: goHome, about: goAbout, career: goCareer, education: goEducation, projects: goProjects, contact: goContact };

  const NavButton = ({ k, label }) => {
    const isActive = activeNav === k || magnetKey === k || (k === "home" && mode === "home");
    return (
      <button
        ref={(el) => (navRefs[k].current = el)}
        onMouseEnter={() => window.robotAPI?.setTargetFromElement?.(navRefs[k]?.current)}
        onFocus={() => window.robotAPI?.setTargetFromElement?.(navRefs[k]?.current)}
        onClick={(e) => { e.preventDefault(); navHandlers[k]?.(); }}
        className={`px-3 py-2 rounded-full text-sm md:text-base transition ${isActive ? "text-sky-400 ring-2 ring-sky-500/60" : "text-slate-300 hover:text-white hover:ring-2 hover:ring-sky-500/40"}`}
        aria-current={isActive ? "page" : undefined}
      >
        {label}
      </button>
    );
  };

  const TimelineList = ({ items }) => (
    <ul className="relative border-l border-white/10 pl-6">
      {items.map((item, idx) => (
        <li key={idx} className="relative pb-8">
          {/* dot */}
          <span className="absolute -left-[0.375rem] top-2 h-2.5 w-2.5 rounded-full bg-sky-400 ring-4 ring-sky-400/20" />
          <div className="pl-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-base md:text-lg font-semibold text-white">
                  {item.role || item.degree} {item.company && <span className="text-slate-300">— {item.company}</span>} {item.school && <span className="text-slate-300">— {item.school}</span>}
                </h4>
                {item.location && <div className="text-xs md:text-sm text-slate-400 mt-0.5">{item.location}</div>}
              </div>
              <div className="text-xs md:text-sm text-slate-400 whitespace-nowrap">{item.period}</div>
            </div>
            {item.bullets?.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-slate-300 text-sm space-y-1">
                {item.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ul>
  );

  const topNav = (
    <nav id="top-nav" aria-label="Primary" className="fixed left-1/2 -translate-x-1/2 top-3 z-50 pointer-events-auto">
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
          <summary className="rounded-lg border border-white/20 bg-zinc-900/70 text-white px-3 py-2 cursor-pointer">☰</summary>
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[92vw] max-w-sm rounded-2xl border border-white/10 bg-zinc-900/90 backdrop-blur p-3 shadow-xl">
            <div className="flex flex-col gap-2">
              <NavButton k="home" label="Home" />
              <NavButton k="about" label="About" />
              <NavButton k="career" label="Career" />
              <NavButton k="education" label="Education" />
              <NavButton k="projects" label="Projects" />
              <NavButton k="contact" label="Contact" />
            </div>
          </div>
        </details>
      </div>
    </nav>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0b0f14] text-white font-[Inter,ui-sans-serif,system-ui]">
      <ThreeStage />
      {topNav}

      {mode === "home" && (
        <div className="relative z-10 flex flex-col items-center pt-24 md:pt-28">
          <div className="h-32 w-32 md:h-36 md:w-36 rounded-full overflow-hidden ring-2 ring-white/20 shadow-lg bg-gradient-to-br from-sky-600 to-sky-500 flex items-center justify-center">
            <div className="h-full w-full flex items-center justify-center text-white font-semibold text-2xl">AS</div>
          </div>
          <h1 className="mt-5 text-center text-6xl md:text-7xl font-black tracking-tight">
            Hi, I'm <span className="text-sky-400">Aryaman</span> 👋
          </h1>
          <p className="mt-3 max-w-[48ch] text-center text-slate-300 text-lg md:text-xl">
            Move your mouse — the arm will glance at nav items. Scrollspy engages on the Timeline view.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="#timeline-top" onClick={(e)=>{e.preventDefault(); setMode("timeline");}} className="rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-3 font-semibold shadow">View Timeline</a>
            <a href="#projects-section" onClick={(e)=>{e.preventDefault(); setMode("timeline"); scrollTo("projects-section");}} className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-slate-200 hover:border-sky-500/40">Projects</a>
          </div>
        </div>
      )}

      {mode === "timeline" && (
        <div ref={timelineRef} id="timeline" className="absolute inset-0 overflow-y-auto z-10">
          <div className="pointer-events-none sticky top-0 z-0">
            <div className="h-[40vh] bg-gradient-to-b from-slate-950/60 via-slate-950/85 to-transparent" />
          </div>

          <div className="relative max-w-5xl mx-auto px-6 py-16" id="timeline-top">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold">Timeline</h2>
              <div className="flex items-center gap-3">
                <button onClick={() => setMode("home")} className="backdrop-blur bg-white/10 text-white border border-white/15 rounded-2xl px-4 py-2 shadow hover:border-sky-500/40">Back to Home</button>
              </div>
            </div>

            <section id="about-section" className="mt-10 backdrop-blur-md bg-white/[0.04] border border-white/10 shadow-xl rounded-2xl p-6 scroll-mt-28 md:scroll-mt-32">
              <h3 className="text-2xl font-semibold text-white mb-2">About</h3>
              <p className="text-slate-300">Short bio placeholder. (We'll replace this with your real copy later.)</p>
            </section>

            <section id="experience-section" className="relative mt-12 scroll-mt-28 md:scroll-mt-32">
              <h3 className="text-3xl font-bold text-white mb-6">Experience</h3>
              <div className="backdrop-blur-md bg-white/[0.04] border border-white/10 shadow-xl rounded-2xl p-5">
                <TimelineList items={experience} />
              </div>
            </section>

            <section id="education-section" className="relative mt-12 scroll-mt-28 md:scroll-mt-32">
              <h3 className="text-3xl font-bold text-white mb-6">Education</h3>
              <div className="backdrop-blur-md bg-white/[0.04] border border-white/10 shadow-xl rounded-2xl p-5">
                <TimelineList items={education} />
              </div>
            </section>

            <section id="projects-section" className="mt-14 scroll-mt-28 md:scroll-mt-32">
              <h3 className="text-2xl font-semibold text-white mb-4">Selected Projects</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="backdrop-blur-md bg-white/[0.05] border border-white/10 rounded-2xl p-5 shadow">Project A (placeholder)</div>
                <div className="backdrop-blur-md bg-white/[0.05] border border-white/10 rounded-2xl p-5 shadow">Project B (placeholder)</div>
              </div>
            </section>

            <section id="contact-section" className="mt-14 grid gap-6 md:grid-cols-3 bg-white/[0.05] backdrop-blur border border-white/10 rounded-2xl p-6 shadow-xl scroll-mt-28 md:scroll-mt-32">
              <div className="md:col-span-1 space-y-4">
                <h3 className="text-2xl font-semibold text-white">Contact</h3>
                <p className="text-slate-300">For now: <a className="text-sky-400 underline" href="mailto:aryaman.25.sharma@gmail.com">aryaman.25.sharma@gmail.com</a></p>
              </div>
              <div className="md:col-span-2">
                <div className="rounded-xl border border-white/15 bg-white/5 p-4 text-slate-300">Form placeholder</div>
              </div>
            </section>

            <div className="mt-16 text-center text-slate-400 text-sm">© {new Date().getFullYear()} Aryaman Sharma — All rights reserved.</div>
          </div>
        </div>
      )}

      <a href="#timeline-top" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-12 bg-zinc-900 text-white px-3 py-2 rounded-md shadow">Skip to Timeline</a>
      <a href="#top-nav" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-20 bg-zinc-900 text-white px-3 py-2 rounded-md shadow">Skip to Navigation</a>
    </div>
  );
}