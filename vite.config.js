import fs from 'node:fs'
import path from 'node:path'
import { build, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const siteOrigin = (process.env.SITE_ORIGIN || '').replace(/\/$/, '')

function seoOrigin() {
  const canonical = siteOrigin ? `${siteOrigin}/` : '/'
  const image = siteOrigin ? `${siteOrigin}/og.jpg` : '/og.jpg'
  let outDir = 'dist'

  return {
    name: 'seo-origin',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    transformIndexHtml(html) {
      return html.replaceAll('%CANONICAL%', canonical).replaceAll('%OG_IMAGE%', image)
    },
    generateBundle() {
      if (!siteOrigin) return
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${canonical}</loc>
  </url>
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
      const base = current.endsWith('\n') ? current : `${current}\n`
      fs.mkdirSync(path.dirname(robotsPath), { recursive: true })
      fs.writeFileSync(robotsPath, `${base}\nSitemap: ${siteOrigin}/sitemap.xml\n`)
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
      fs.writeFileSync(htmlPath, html.replace(mount, () => `<div id="root">${render()}</div>`))
    },
  }
}

export default defineConfig({
  plugins: [react(), seoOrigin(), prerenderHome()],
})
