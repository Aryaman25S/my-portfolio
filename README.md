# Aryaman Sharma — Portfolio

Interactive portfolio built with **React + Vite + Tailwind v3**, featuring a **Three.js** robotic arm (CCD IK) that glances at UI targets.

## Stack
- React 18, Vite
- Tailwind CSS **v3.4.10** (pinned to avoid v4 plugin changes)
- Three.js, Framer Motion

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

## Project Structure
```
src/
  App.jsx          # App shell + magnetized nav + sections
  ThreeStage.jsx   # Three.js stage + CCD IK, cursor targeting
  timelineData.js  # Experience & Education entries
  projectsData.js  # Projects grid data
  ContactForm.jsx  # Validated contact form (mailto fallback)
public/
  Me2.jpg          # Hero/avatar + OG image
  favicon.svg      # Favicon
  site.webmanifest # PWA meta (minimal)
```

## Features
- Robotic arm background (Three.js) with **CCD IK** that follows cursor or UI elements
- Magnetized top navigation with **scrollspy**
- Experience & Education vertical timelines
- Projects grid with tech badges and external links
- Contact form with validation and mailto fallback

## Deploying
- **GitHub Pages**: build with `npm run build` and serve `dist/` via your preferred action or a static host.
- **Vercel/Netlify**: framework = Vite, build = `npm run build`, output = `dist`.

## License
Personal portfolio — all rights reserved.
