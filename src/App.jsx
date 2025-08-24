import { useState, useRef, useEffect } from "react";
import "./index.css";
import "./App.css";
import ThreeStage from "./ThreeStage.jsx";

export default function App() {
  const [mode, setMode] = useState("home"); // 'home' | 'timeline'
  const timelineRef = useRef(null);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (mode !== "timeline") return;
    timelineRef.current?.scrollTo({ top: 0 });
  }, [mode]);

  const NavLink = ({ onClick, children, active }) => (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-full text-sm md:text-base transition ${
        active
          ? "text-sky-400 ring-2 ring-sky-500/60"
          : "text-slate-300 hover:text-white hover:ring-2 hover:ring-sky-500/40"
      }`}
    >
      {children}
    </button>
  );

  const topNav = (
    <nav id="top-nav" aria-label="Primary" className="fixed left-1/2 -translate-x-1/2 top-3 z-50">
      <div className="hidden md:flex items-center gap-6 rounded-full border border-white/10 bg-zinc-900/60 backdrop-blur px-4 py-2 shadow-lg">
        <NavLink onClick={() => setMode("home")} active={mode === "home"}>Home</NavLink>
        <NavLink onClick={() => { setMode("timeline"); scrollTo("about-section"); }}>About</NavLink>
        <NavLink onClick={() => { setMode("timeline"); scrollTo("experience-section"); }}>Career</NavLink>
        <NavLink onClick={() => { setMode("timeline"); scrollTo("education-section"); }}>Education</NavLink>
        <NavLink onClick={() => { setMode("timeline"); scrollTo("projects-section"); }}>Projects</NavLink>
        <NavLink onClick={() => { setMode("timeline"); scrollTo("contact-section"); }}>Contact</NavLink>
      </div>
      {/* Mobile */}
      <div className="md:hidden flex items-center gap-2">
        <details className="[&_summary::-webkit-details-marker]:hidden">
          <summary className="rounded-lg border border-white/20 bg-zinc-900/70 text-white px-3 py-2 cursor-pointer">☰</summary>
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[92vw] max-w-sm rounded-2xl border border-white/10 bg-zinc-900/90 backdrop-blur p-3 shadow-xl">
            <div className="flex flex-col gap-2">
              <NavLink onClick={() => setMode("home")} active={mode === "home"}>Home</NavLink>
              <NavLink onClick={() => { setMode("timeline"); scrollTo("about-section"); }}>About</NavLink>
              <NavLink onClick={() => { setMode("timeline"); scrollTo("experience-section"); }}>Career</NavLink>
              <NavLink onClick={() => { setMode("timeline"); scrollTo("education-section"); }}>Education</NavLink>
              <NavLink onClick={() => { setMode("timeline"); scrollTo("projects-section"); }}>Projects</NavLink>
              <NavLink onClick={() => { setMode("timeline"); scrollTo("contact-section"); }}>Contact</NavLink>
            </div>
          </div>
        </details>
      </div>
    </nav>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0b0f14] text-white font-[Inter,ui-sans-serif,system-ui]">
      {/* Three.js background */}
      <ThreeStage />

      {/* Top center nav */}
      {topNav}

      {/* Home screen */}
      {mode === "home" && (
        <div className="relative z-10 flex flex-col items-center pt-24 md:pt-28">
          <div className="h-32 w-32 md:h-36 md:w-36 rounded-full overflow-hidden ring-2 ring-white/20 shadow-lg bg-gradient-to-br from-sky-600 to-sky-500 flex items-center justify-center">
            <div className="h-full w-full flex items-center justify-center text-white font-semibold text-2xl">AS</div>
          </div>
          <h1 className="mt-5 text-center text-6xl md:text-7xl font-black tracking-tight">
            Hi, I'm <span className="text-sky-400">Aryaman</span> 👋
          </h1>
          <p className="mt-3 max-w-[48ch] text-center text-slate-300 text-lg md:text-xl">
            Background Three.js is live. Will morph this into the robotic arm.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="#timeline-top" onClick={(e)=>{e.preventDefault(); setMode("timeline");}} className="rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-3 font-semibold shadow">View Timeline</a>
            <a href="#projects-section" onClick={(e)=>{e.preventDefault(); setMode("timeline"); scrollTo("projects-section");}} className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-slate-200 hover:border-sky-500/40">Projects</a>
          </div>
        </div>
      )}

      {/* Timeline screen */}
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
              <p className="text-slate-300">Plug in real data later, the robot will glance at the active section.</p>
            </section>

            <section id="experience-section" className="relative mt-12 scroll-mt-28 md:scroll-mt-32">
              <h3 className="text-3xl font-bold text-white mb-6">Experience</h3>
              <ul className="space-y-6 text-slate-300">
                <li className="backdrop-blur-md bg-white/[0.04] border border-white/10 shadow-xl rounded-2xl p-5">Role 1 — Company (year)</li>
                <li className="backdrop-blur-md bg-white/[0.04] border border-white/10 shadow-xl rounded-2xl p-5">Role 2 — Company (year)</li>
              </ul>
            </section>

            <section id="education-section" className="relative mt-12 scroll-mt-28 md:scroll-mt-32">
              <h3 className="text-3xl font-bold text-white mb-6">Education</h3>
              <ul className="space-y-6 text-slate-300">
                <li className="backdrop-blur-md bg-white/[0.04] border border-white/10 shadow-xl rounded-2xl p-5">NYU — M.S. Computer Science</li>
                <li className="backdrop-blur-md bg-white/[0.04] border border-white/10 shadow-xl rounded-2xl p-5">GGSIPU — B.Tech ECE</li>
              </ul>
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

      {/* Skip links for accessibility */}
      <a href="#timeline-top" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-12 bg-zinc-900 text-white px-3 py-2 rounded-md shadow">Skip to Timeline</a>
      <a href="#top-nav" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-20 bg-zinc-900 text-white px-3 py-2 rounded-md shadow">Skip to Navigation</a>
    </div>
  );
}
