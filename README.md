# Aryaman Sharma — Portfolio

Interactive portfolio built with **React + Vite + Tailwind v3**, featuring a **Three.js** robotic arm (CCD IK) that follows the cursor on the home screen and targets the active timeline section when browsing content.

## Stack
- React 19, Vite 7
- Tailwind CSS **v3.4.10** (pinned to avoid v4 plugin changes)
- Three.js
- **Framer Motion** — page transitions, staggered section motion, nav active pill

## Getting Started
```bash
# install deps
npm install

# run dev server
npm run dev

# build for production
npm run build
npm run preview
```

> **Tailwind note**: This project intentionally pins `tailwindcss@3.4.10`. If you upgrade to v4, switch your PostCSS plugin to `@tailwindcss/postcss` and migrate the config.

## Production URL (SEO / Open Graph)

Canonical links and absolute `og:image` / `og:url` are injected at **build time** when `VITE_SITE_URL` is set (see [`.env.example`](.env.example)). Copy to `.env` or configure the variable in your host’s build settings, e.g. `VITE_SITE_URL=https://yourdomain.com` (no trailing slash).

## Project Structure
```
src/
  App.jsx           # Shell: home vs timeline mode, nav, scroll alignment, robot section hooks
  ThreeStage.jsx    # Three.js stage + CCD IK, cursor + robotAPI (focus / pulse)
  TypingTitles.jsx  # Hero rotating role titles
  About.jsx         # About copy
  ContactForm.jsx   # Validated contact form (mailto fallback)
  timelineData.js   # Experience & Education entries
  projectsData.js   # Projects grid data
  main.jsx          # Entry
public/
  Me2.jpg           # Hero/avatar + OG image
  favicon.svg
  site.webmanifest  # PWA meta (minimal)
```

## Features
- **Home vs timeline**: Full-viewport hero with the 3D scene; **timeline** is a scrollable overlay (`#timeline`) with frosted backdrop. Enter uses a short **opacity** fade (not a full-height slide) so scroll position stays aligned with the **fixed** top nav.
- Robotic arm (**CCD IK**) follows the pointer on home; **`window.robotAPI`** ties focus/pulse to hero CTAs and the active section.
- **Magnetized** top navigation with **scrollspy** on the timeline; labels include **Experience** (maps to the experience timeline), Education, Projects, Contact.
- Experience & Education vertical timelines; projects grid with tech badges and optional **Live** / **GitHub** links; numbered cards with column-aware placement on wide layouts.
- Contact: email, phone, **LinkedIn** + **GitHub**, plus validated form with mailto fallback.

## Deploying
- **GitHub Pages (project site, e.g. `user.github.io/repo/`)**: set `base` in [`vite.config.js`](vite.config.js) to `'/repo-name/'` and ensure asset paths resolve.
- **Vercel/Netlify** (root URL): framework = Vite, build = `npm run build`, output = `dist`; set `VITE_SITE_URL` for social previews.

## License
Personal portfolio — all rights reserved.
