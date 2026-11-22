/** Generate sitemap.xml from the deployed tool and guide directories. */
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..', 'deploy')
const urls = ['https://icekun.net/', 'https://icekun.net/jusho/', 'https://icekun.net/guide/']
for (const base of ['tools', 'guide']) {
  const dir = path.join(root, base)
  if (!fs.existsSync(dir)) continue
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('_') || name === 'assets' || name === 'vendor') continue
    if (!fs.existsSync(path.join(dir, name, 'index.html'))) continue
    const prefix = base === 'guide' ? '/guide/' : '/'
    urls.push('https://icekun.net' + prefix + name + '/')
  }
}
const today = new Date().toISOString().slice(0, 10)
const body = ['<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`),
  '</urlset>', ''].join('\n')
fs.writeFileSync(path.join(root, 'sitemap.xml'), body)
console.log(`sitemap: ${urls.length} URLs`)
