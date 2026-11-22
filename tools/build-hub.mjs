/** Regenerate the tools section of deploy/hub/index.html. */
import fs from 'node:fs'
import path from 'node:path'

const GROUPS = [
  ['住所・書類', [
    ['/jusho/', '住所レンズ', '英語の住所を日本語に戻して、元の住所と一致するかを確かめる。', ['住所', '郵便番号', 'ローマ字']],
  ]],
  ['テキスト', [
    ['/text/', '文字数カウント', '文字・行・単語・原稿用紙換算・SNS上限をまとめて数える。', ['文章', '原稿', 'SNS']],
    ['/case/', '文字種変換', 'camelCase、snake_case、全角半角、ひらがなカタカナを一括変換。', ['命名', '全角', 'かな']],
    ['/urlcode/', 'URLエンコード', 'URL用とフォーム用のエンコード・デコード。', ['URL', 'エンコード']],
    ['/regex/', '正規表現テスター', 'パターンを試して、マッチとキャプチャを確認する。', ['正規表現', '開発']],
    ['/diff/', 'テキスト差分', '2つのテキストを行単位で比較する。', ['差分', '校正']],
    ['/csv/', 'CSV⇔JSON', '表形式のデータを相互に変換する。', ['CSV', 'JSON', '表']],
    ['/json/', 'JSON整形', 'JSONの整形・圧縮・検証。', ['JSON', '開発']],
    ['/base64/', 'Base64変換', 'テキストとファイルをBase64にする。', ['Base64', '変換']],
  ]],
  ['画像・ファイル', [
    ['/image/', '画像変換・圧縮', 'WebP/JPEG/PNGへの変換、リサイズ、一括ダウンロード。', ['画像', '圧縮', 'WebP']],
    ['/gzip/', 'gzip圧縮・解凍', 'テキストやファイルをgzipで圧縮・解凍する。', ['gzip', '圧縮']],
    ['/hash/', 'ハッシュ生成', 'SHA-1/256/384/512をテキストとファイルから。', ['ハッシュ', 'SHA']],
    ['/rsa/', 'RSA暗号化・復号', '鍵生成から暗号化・復号までブラウザで体験する。', ['暗号', 'RSA', '学習']],
  ]],
  ['計算・暮らし', [
    ['/unit/', '単位変換', '長さ・重さ・温度・面積・体積・速度。', ['単位', '換算']],
    ['/bmi/', 'BMI・基礎代謝', '体格と消費カロリーの目安を計算する。', ['健康', 'BMI']],
    ['/date/', '日付計算・和暦', '年齢、期間、加算、和暦変換。', ['日付', '和暦', '年齢']],
    ['/timezone/', 'タイムゾーン変換', '2つの地域の時刻を換算する。', ['時差', '海外']],
    ['/split/', '割り勘・消費税', '税込・税抜と1人あたりの金額。', ['割り勘', '消費税']],
    ['/color/', 'カラー・コントラスト', 'HEX/RGB/HSL変換とWCAG判定。', ['色', 'デザイン', 'WCAG']],
    ['/password/', 'パスワード生成', '端末内で強度のある文字列を作る。', ['パスワード', '安全']],
    ['/ip/', 'IPチェック', '接続元のIP・地域・ブラウザ情報。', ['IP', '接続']],
  ]],
]

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
let html = ''
for (const [label, tools] of GROUPS) {
  html += `    <div class="tool-group">\n      <h3 class="group-label">${label}</h3>\n      <div class="tools">\n`
  tools.forEach(([href, name, desc, tags], i) => {
    html += `        <a class="tool" href="${href}">\n`
    html += `          <span class="no">${String(i + 1).padStart(2, '0')}</span>\n`
    html += `          <span>\n            <strong>${esc(name)}</strong>\n`
    html += `            <span class="desc">${esc(desc)}</span>\n`
    html += `            <span class="tags">${tags.map((t) => `<i>${esc(t)}</i>`).join('')}</span>\n`
    html += `          </span>\n          <span class="arrow" aria-hidden="true">→</span>\n        </a>\n`
  })
  html += `      </div>\n    </div>\n`
}
html += `    <p class="soon">新しい道具は、できたものからここに並べます。</p>\n`

const file = path.resolve(import.meta.dirname, '..', 'deploy', 'hub', 'index.html')
const source = fs.readFileSync(file, 'utf8')
const out = source.replace(/<!-- TOOLS_START -->[\s\S]*?<!-- TOOLS_END -->/, `<!-- TOOLS_START -->\n${html}    <!-- TOOLS_END -->`)
if (out === source) throw new Error('TOOLS markers not found')
fs.writeFileSync(file, out)
const count = GROUPS.reduce((n, g) => n + g[1].length, 0)
console.log(`hub updated: ${count} tools in ${GROUPS.length} groups`)
