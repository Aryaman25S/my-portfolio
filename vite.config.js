import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || '').replace(/\/$/, '')

  return {
    plugins: [
      react(),
      {
        name: 'html-site-url',
        transformIndexHtml(html) {
          const ogImage = siteUrl ? `${siteUrl}/Me2.jpg` : '/Me2.jpg'
          const canonicalLink = siteUrl
            ? `<link rel="canonical" href="${siteUrl}/" />`
            : ''
          const ogUrlMeta = siteUrl
            ? `<meta property="og:url" content="${siteUrl}/" />`
            : ''
          return html
            .replace('__CANONICAL_LINK__', canonicalLink)
            .replace('__OG_URL_META__', ogUrlMeta)
            .replace(/__OG_IMAGE__/g, ogImage)
        },
      },
    ],
  }
})
