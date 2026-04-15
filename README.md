# Aryaman Sharma — Portfolio

Interactive portfolio built with **React + Vite + Tailwind v3**, featuring a **Three.js** robotic arm (CCD IK) that follows the cursor on the home screen and targets the active timeline section when browsing content.

## Stack
- React 19, Vite
- Tailwind CSS **v3.4.10** (pinned to avoid v4 plugin changes)
- Three.js

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
  App.jsx          # App shell + nav + sections + robot section targeting
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
- Robotic arm background (Three.js) with **CCD IK** that follows the pointer on home and tracks the active section in timeline mode
- Magnetized top navigation with **scrollspy**
- Experience & Education vertical timelines
- Projects grid with tech badges and optional Demo / GitHub links
- Contact form with validation and mailto fallback

## Deploying
- **GitHub Pages (project site, e.g. `user.github.io/repo/`)**: set `base` in [`vite.config.js`](vite.config.js) to `'/repo-name/'` and ensure asset paths resolve.
- **Vercel/Netlify** (root URL): framework = Vite, build = `npm run build`, output = `dist`; set `VITE_SITE_URL` for social previews.

## License
Personal portfolio — all rights reserved.
