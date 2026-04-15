export default function About() {
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-4 lg:border-r lg:border-white/10 lg:pr-8">
        <p className="font-display text-3xl sm:text-4xl font-bold leading-tight text-slate-100 tracking-tight">
          NYU MS · Computer Science
        </p>
        <p className="mt-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
          Vision · ML systems · Infra
        </p>
        <p className="mt-6 text-sm italic leading-relaxed text-slate-400 border-l-2 border-cyan-500/50 pl-4">
          “Turning cutting-edge research into tools people actually use.”
        </p>
      </div>
      <div className="lg:col-span-8 space-y-5 text-slate-300 leading-relaxed text-[15px]">
        <p className="text-base font-medium text-slate-100">
          I build AI products end-to-end: strategy, systems, and shipping. I love turning cutting-edge research into tools people actually use.
        </p>
        <p>
          I’m an MS Computer Science student at NYU, where I focus on computer vision, ML systems, and scalable infrastructure. My recent work blends product thinking with deep engineering: at Falkonry, I architected an OpenTelemetry–based observability pipeline for distributed Kubernetes clusters and helped cut investigation time with intelligent anomaly correlation across 140+ signals. Before that, I was a Software Development Engineer at Birdeye, shipping resilient microservices and building data products, including a generative-AI suite now powering workflows for 150,000+ businesses. Earlier, I worked on human-pose estimation for rehabilitation analytics, designing a marker-less system optimized for real-world conditions.
        </p>
        <p>
          What drives me is impact at the intersection of people and technology. During the pandemic I volunteered on last-mile delivery runs and competed in robotics challenges that tackled real logistics problems, experiences that shaped my interest in robust perception, automation, and practical, scalable AI. Today, I’m excited by problems that demand both architecture and empathy: building reliable platforms, improving user experience with data, and leading teams that ship thoughtfully.
        </p>
        <p>
          If you’re working on ML-powered products, or want to turn complex systems into simple, lovable experiences, let’s talk.
        </p>
      </div>
    </div>
  );
}
