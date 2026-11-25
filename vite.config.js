import fs from 'node:fs'
import path from 'node:path'
import { build, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { languageAt, languagePath, locales } from './site-locales.js'

function readSiteOrigin(value) {
  if (!value) return ''
  const origin = URL.canParse(value) ? new URL(value) : null
  if (!origin || !/^https?:\/\/[^/\\?#\s]+\/?$/i.test(value) || origin.username || origin.password) {
    throw new Error('SITE_ORIGIN must be a full HTTP or HTTPS origin without a path, query, fragment, or credentials.')
  }
  return origin.origin
}

const siteOrigin = readSiteOrigin(process.env.SITE_ORIGIN)

function localizeHtml(html, base, locale) {
  const home = siteOrigin + languagePath(base, 'en')
  const { title, description, imageAlt, socialLocale } = locales[locale]
  const alternates = [
    ...Object.keys(locales).map((language) => [language, siteOrigin + languagePath(base, language)]),
    ['x-default', home],
  ].map(([language, url]) => `<link rel="alternate" hreflang="${language}" href="${url}" />`)

  const values = {
    CANONICAL: siteOrigin + languagePath(base, locale),
    ENGLISH_URL: home,
    OG_IMAGE: home + 'og.jpg',
    LANGUAGE: locale,
    LANGUAGE_ALTERNATES: alternates.join('\n    '),
    TITLE: title,
    DESCRIPTION: description,
    IMAGE_ALT: imageAlt,
    SOCIAL_LOCALE: socialLocale,
  }
  return html.replace(/%([A-Z_]+)%/g, (token, key) => values[key] ?? token)
}

function seoOrigin() {
  let base
  let outDir = 'dist'

  return {
    name: 'seo-origin',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
      base = config.base
    },
    transformIndexHtml(html, { server, originalUrl }) {
      if (!server) return html
      const pathname = originalUrl?.split('?')[0]
      return localizeHtml(html, base, languageAt(base, pathname))
    },
    generateBundle() {
      if (!siteOrigin) return
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.keys(locales).map((locale) => `  <url>
    <loc>${siteOrigin}${languagePath(base, locale)}</loc>
  </url>`).join('\n')}
</urlset>
`,
      })
    },
    closeBundle() {
      if (!siteOrigin) return
      const robotsPath = path.join(outDir, 'robots.txt')
      const current = fs.existsSync(robotsPath)
        ? fs.readFileSync(robotsPath, 'utf8')
        : 'User-agent: *\nAllow: /\n'
      if (current.includes('Sitemap:')) return
      const existingRules = current.endsWith('\n') ? current : `${current}\n`
      fs.mkdirSync(path.dirname(robotsPath), { recursive: true })
      fs.writeFileSync(robotsPath, `${existingRules}\nSitemap: ${siteOrigin}${base}sitemap.xml\n`)
    },
  }
}

function prerenderHome() {
  let config

  return {
    name: 'prerender-home',
    apply: 'build',
    configResolved(resolved) {
      config = resolved
    },
    async closeBundle() {
      const result = await build({
        configFile: false,
        root: config.root,
        base: config.base,
        mode: config.mode,
        plugins: [react()],
        ssr: { noExternal: true },
        build: {
          ssr: 'src/entry-server.jsx',
          write: false,
          rollupOptions: { output: { inlineDynamicImports: true } },
        },
      })

      const entry = result.output.find((item) => item.type === 'chunk' && item.isEntry)
      const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(entry.code).toString('base64')
      const { render } = await import(moduleUrl)
      const htmlPath = path.resolve(config.root, config.build.outDir, 'index.html')
      const html = fs.readFileSync(htmlPath, 'utf8')
      const mount = '<div id="root"></div>'
      if (!html.includes(mount)) throw new Error('Homepage mount element is missing.')
      for (const [locale, page] of Object.entries(locales)) {
        const directory = path.resolve(path.dirname(htmlPath), page.path)
        const localized = localizeHtml(html, config.base, locale)
        fs.mkdirSync(directory, { recursive: true })
        fs.writeFileSync(
          path.join(directory, 'index.html'),
          localized.replace(mount, () => `<div id="root">${render(locale)}</div>`),
        )
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), seoOrigin(), prerenderHome()],
})
