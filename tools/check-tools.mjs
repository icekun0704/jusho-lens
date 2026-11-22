/**
 * Static checks for deploy/tools/<slug>/index.html.
 *   node tools/check-tools.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = path.resolve(import.meta.dirname, '..', 'deploy', 'tools')
const dirs = fs
  .readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_') && d.name !== 'assets')
  .map((d) => d.name)
  .sort()

let problems = 0
const rows = []

for (const slug of dirs) {
  const file = path.join(ROOT, slug, 'index.html')
  const issues = []
  if (!fs.existsSync(file)) {
    rows.push({ slug, status: 'MISSING', issues: ['index.html がない'] })
    problems++
    continue
  }
  const html = fs.readFileSync(file, 'utf8')

  if (html.includes('{{')) issues.push('未置換のプレースホルダ')
  if (!/<title>[^<]+<\/title>/.test(html)) issues.push('title なし')
  if (!html.includes(`rel="canonical" href="https://icekun.net/${slug}/"`)) issues.push('canonical 不一致')
  if (!html.includes('google-adsense-account')) issues.push('AdSense メタなし')
  if (!html.includes('adsbygoogle.js')) issues.push('AdSense スクリプトなし')
  if (!html.includes('/assets/tools.css')) issues.push('共通CSSなし')
  if (!html.includes('class="brand"')) issues.push('ヘッダーなし')
  if (!html.includes('class="tool-nav"')) issues.push('ツールナビなし')
  if (!html.includes('class="prose"')) issues.push('説明文なし')

  const external = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1])
  for (const src of external) {
    // Root-relative and relative files are served by the site itself.
    if (/^(\/|\.\/|\.\.\/|data:)/.test(src)) continue
    if (!src.includes('pagead2.googlesyndication.com')) issues.push(`外部スクリプト: ${src}`)
  }

  const blocks = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1])
  for (const block of blocks) {
    if (!block.trim()) continue
    const tmp = path.join(ROOT, `.check-${slug}.mjs`)
    fs.writeFileSync(tmp, block)
    try {
      execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' })
    } catch (error) {
      issues.push(`JS構文: ${String(error.stderr || error.message).split('\n')[0].slice(0, 120)}`)
    } finally {
      fs.unlinkSync(tmp)
    }
  }

  if (issues.length) problems++
  rows.push({ slug, status: issues.length ? 'NG' : 'OK', issues })
}

for (const row of rows) {
  console.log(`${row.status.padEnd(8)} ${row.slug}`)
  for (const issue of row.issues) console.log(`         - ${issue}`)
}
console.log(`\n${rows.length} tools, ${problems} with problems`)
process.exit(problems ? 1 : 0)
