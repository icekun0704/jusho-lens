const fs = require('node:fs')
const path = require('node:path')

const NAMES = [
  'add-circle-linear','arrow-right-linear','bill-list-linear','case-linear','chart-2-linear',
  'check-circle-linear','clock-circle-linear','close-circle-linear','copy-linear',
  'danger-triangle-linear','document-add-linear','document-text-linear','download-linear',
  'eye-linear','folder-linear','gallery-linear','info-circle-linear','layers-minimalistic-linear',
  'lock-keyhole-minimalistic-linear','magnifer-linear','moon-linear','printer-linear',
  'refresh-linear','scissors-linear','settings-linear','shield-check-linear','sun-linear',
  'trash-bin-minimalistic-linear','upload-linear','user-linear','wallet-linear',
]

const pascal = (s) => s.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('')

const CAMEL = {
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-dasharray': 'strokeDasharray',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'fill-opacity': 'fillOpacity',
  'stroke-opacity': 'strokeOpacity',
}

function toJsx(svg) {
  let body = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
  for (const [k, v] of Object.entries(CAMEL)) body = body.split(` ${k}=`).join(` ${v}=`)
  return body.trim()
}

async function main() {
  const outDir = path.resolve(__dirname, '../src/components/icons')
  fs.mkdirSync(outDir, { recursive: true })
  const exports = []
  for (const name of NAMES) {
    const res = await fetch(`https://api.iconify.design/solar/${name}.svg`)
    if (!res.ok) { console.error('FAIL', name, res.status); continue }
    const svg = await res.text()
    const comp = `${pascal(name)}Icon`
    const file = `${name}.tsx`
    const src = `// From Solar via Iconify (https://iconify.design)
import type { SVGProps } from "react";

export function ${comp}(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      ${toJsx(svg)}
    </svg>
  );
}
`
    fs.writeFileSync(path.join(outDir, file), src)
    exports.push({ comp, name })
  }
  const index = `// Icons from Solar (https://iconify.design/?prefix=solar). Generated locally; no runtime CDN.
${exports.map((e) => `export { ${e.comp} } from "./${e.name}";`).join('\n')}
`
  fs.writeFileSync(path.join(outDir, 'index.ts'), index)
  fs.writeFileSync(path.join(outDir, '.library.json'), JSON.stringify({ library: 'solar', prefix: 'solar', source: 'iconify', icons: NAMES }, null, 2))
  console.log('wrote', exports.length, 'icons')
}
main()
