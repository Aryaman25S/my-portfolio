/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lab: {
          canvas: "#07090c",
          bg2: "#0c1118",
          panel: "rgba(255,255,255,0.04)",
          line: "rgba(255,255,255,0.1)",
          accent: "#22d3ee",
          "accent-dim": "rgba(34, 211, 238, 0.12)",
          muted: "#94a3b8",
        },
      },
      fontFamily: {
        display: ['"Syne"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ['"DM Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["clamp(2.5rem,6vw+1rem,4.5rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "section-xl": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "section-lg": ["1.5rem", { lineHeight: "1.25" }],
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
