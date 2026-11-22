/** Regenerate the tool directory of deploy/hub/index.html. */
import fs from 'node:fs'
import path from 'node:path'

// [id, label, tools] — the id is written to data-cat and must match the chip buttons in index.html.
const GROUPS = [
  ['jusho', '住所・書類', [
    ['/jusho/', '住所レンズ', '英語の住所を日本語に戻して、元の住所と照合する。', ['住所', '郵便番号', 'ローマ字']],
    ['/inshi/', '印紙税計算', '文書の種類と金額から印紙税を調べる。', ['印紙', '契約書', '税']],
    ['/denshi/', '電子帳簿のファイル名', '取引日・取引先・金額から保存用のファイル名を作る。', ['電子帳簿保存法', 'ファイル名', '保存']],
  ]],
  ['text', 'テキスト', [
    ['/text/', '文字数カウント', '文字数と原稿用紙換算、SNSの上限を数える。', ['文章', '原稿', 'SNS']],
    ['/case/', '文字種変換', 'camelCase、全角半角、ひらがなカタカナを変換。', ['命名', '全角', 'かな']],
    ['/kanji-number/', '漢数字・大字変換', '金額を漢数字と大字に変換。領収書に。', ['漢数字', '大字', '領収書']],
    ['/urlcode/', 'URLエンコード', 'URL用とフォーム用のエンコード・デコード。', ['URL', 'エンコード']],
    ['/regex/', '正規表現テスター', 'パターンのマッチとキャプチャを確認する。', ['正規表現', '開発']],
    ['/cron/', 'cron式の読み方', 'cron式を日本語に読み解き、次回の実行時刻を出す。', ['cron', '定期実行', '開発']],
    ['/diff/', 'テキスト差分', '2つのテキストを行単位で比較する。', ['差分', '校正']],
    ['/csv/', 'CSV⇔JSON', 'CSVとJSONを相互に変換する。', ['CSV', 'JSON', '表']],
    ['/csv-merge/', 'CSV結合', '複数のCSVを見出しを確かめて1つにまとめる。', ['CSV', '結合', '表']],
    ['/excel-column/', 'Excel列番号変換', '列番号と列字母を変換。範囲の列数も出す。', ['Excel', '列', '表計算']],
    ['/json/', 'JSON整形', 'JSONを整形・圧縮して検証する。', ['JSON', '開発']],
    ['/base64/', 'Base64変換', 'テキストとファイルをBase64にする。', ['Base64', '変換']],
  ]],
  ['file', '画像・ファイル', [
    ['/image/', '画像変換・圧縮', 'WebP/JPEG/PNG変換、リサイズ、一括保存。', ['画像', '圧縮', 'WebP']],
    ['/photo/', '証明写真作成', '写真を規格の枠に合わせて証明写真にする。', ['証明写真', '履歴書', 'L判']],
    ['/pdf/', 'PDF結合・分割', 'PDFの結合・分割・回転・ページ番号をブラウザで。', ['PDF', '結合', '分割']],
    ['/qr/', 'QRコード作成', 'URLやテキストからQRコードを作って保存する。', ['QR', '画像', 'URL']],
    ['/gzip/', 'gzip圧縮・解凍', 'テキストやファイルをgzipで圧縮・解凍する。', ['gzip', '圧縮']],
    ['/hash/', 'ハッシュ生成', 'SHA-1/256/384/512をテキストとファイルから。', ['ハッシュ', 'SHA']],
    ['/rsa/', 'RSA暗号化・復号', '鍵生成・暗号化・復号をブラウザで試す。', ['暗号', 'RSA', '学習']],
  ]],
  ['money', '仕事・お金', [
    ['/worktime/', '勤務時間・残業代', '開始・終了・休憩から勤務時間と残業代を出す。', ['勤務', '残業', '時給']],
    ['/wage/', '時給・年収換算', '時給・月収・年収を相互に換算する。', ['時給', '年収', '月収']],
    ['/tedori/', '手取り給与の概算', '額面の給与から手取りを概算する。', ['手取り', '給与', '概算']],
    ['/loan/', '住宅ローン返済', '毎月の返済額と総返済額を計算する。', ['ローン', '住宅', '返済']],
    ['/split/', '割り勘・消費税', '税込・税抜と1人あたりの金額を出す。', ['割り勘', '消費税']],
    ['/percent/', '割引価格の計算', '定価と割引率からセール価格と値引き額を出す。', ['割引', 'セール', '税込']],
    ['/invoice-check/', '適格請求書番号チェック', '登録番号の形式と検査用数字をまとめて確認する。', ['インボイス', '登録番号', '税']],
  ]],
  ['life', '暮らし・健康', [
    ['/unit/', '単位変換', '長さ・重さ・温度・面積・体積を換算する。', ['単位', '換算']],
    ['/tsubo/', '坪・平米・畳', '住まいの広さを坪・平米・畳で換算する。', ['坪', '平米', '畳']],
    ['/date/', '日付計算・和暦', '年齢・期間・加算・和暦をまとめて計算する。', ['日付', '和暦', '年齢']],
    ['/age/', '年齢・学年・干支', '生年月日から満年齢・学年・干支を出す。', ['年齢', '学年', '干支']],
    ['/holiday/', '祝日カレンダー', '2024年から2030年までの祝日を年間で見る。', ['祝日', 'カレンダー', '休み']],
    ['/sleep/', '睡眠時間計算', '就寝・起床から睡眠時間と90分周期を出す。', ['睡眠', '就寝', '時間']],
    ['/birth/', '出産予定日計算', '最終月経日から出産予定日と週数を出す。', ['出産', '予定日', '産休']],
    ['/bmi/', 'BMI・基礎代謝', 'BMIと1日の消費カロリーの目安を出す。', ['健康', 'BMI']],
    ['/timezone/', 'タイムゾーン変換', '2つの地域の時刻を換算する。', ['時差', '海外']],
    ['/fuel/', '燃費・ガソリン代', '走行距離と給油量から実燃費とガソリン代を出す。', ['燃費', 'ガソリン', '車']],
    ['/color/', 'カラー・コントラスト', 'HEX/RGB/HSL変換とコントラスト判定。', ['色', 'デザイン', 'WCAG']],
    ['/color-blind/', '色覚シミュレーション', '2色がP型・D型・T型の色覚でどう見えるかを比べる。', ['色覚', '配色', 'アクセシビリティ']],
    ['/password/', 'パスワード生成', '端末内で強いパスワードを作る。', ['パスワード', '安全']],
    ['/ip/', 'IPチェック', '接続元のIP・地域・ブラウザを確認する。', ['IP', '接続']],
    ['/useragent/', 'User-Agent判定', 'UA文字列から端末・OS・ブラウザを判定する。', ['ブラウザ', '端末', '開発']],
  ]],
]

// Shortcuts shown above the directory: [href, one-line label]
const FEATURED = [
  ['/jusho/', '英語の住所を照合'],
  ['/text/', '文字数とSNS上限'],
  ['/image/', 'WebP・JPEG・PNG'],
  ['/tedori/', '額面から手取り'],
  ['/date/', '年齢・期間・和暦'],
  ['/password/', '強い文字列を作る'],
]

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

const tools = new Map()
for (const [id, label, list] of GROUPS) {
  for (const [href, name, desc, tags] of list) tools.set(href, { id, label, href, name, desc, tags })
}

let favHtml = ''
for (const [href, short] of FEATURED) {
  const tool = tools.get(href)
  if (!tool) throw new Error(`featured tool not found: ${href}`)
  favHtml += `        <li>\n`
  favHtml += `          <a class="fav" href="${tool.href}">\n`
  favHtml += `            <span class="fav-name">${esc(tool.name)}</span>\n`
  favHtml += `            <span class="fav-desc">${esc(short)}</span>\n`
  favHtml += `          </a>\n        </li>\n`
}

let gridHtml = ''
for (const [id, label, list] of GROUPS) {
  for (const [href, name, desc, tags] of list) {
    const key = [name, desc, label, ...tags].join(' ')
    gridHtml += `      <li class="cell" data-cat="${id}" data-key="${esc(key)}">\n`
    gridHtml += `        <a class="card" href="${href}">\n`
    gridHtml += `          <span class="card-cat">${esc(label)}</span>\n`
    gridHtml += `          <strong class="card-name">${esc(name)}</strong>\n`
    gridHtml += `          <span class="card-desc">${esc(desc)}</span>\n`
    gridHtml += `          <span class="card-tags">${tags.map((t) => `<i>${esc(t)}</i>`).join('')}</span>\n`
    gridHtml += `        </a>\n      </li>\n`
  }
}

const featuredHrefs = FEATURED.map(([href]) => href)
if (new Set(featuredHrefs).size !== FEATURED.length) throw new Error('featured shortcuts should point at distinct tools')

const file = path.resolve(import.meta.dirname, '..', 'deploy', 'hub', 'index.html')
const source = fs.readFileSync(file, 'utf8')

const replaceBlock = (html, name, content) => {
  const pattern = new RegExp(`([ \\t]*)<!--\\s*${name}_START\\s*-->[\\s\\S]*?<!--\\s*${name}_END\\s*-->`)
  if (!pattern.test(html)) throw new Error(`${name} markers not found`)
  return html.replace(pattern, (match, indent) => `${indent}<!-- ${name}_START -->\n${content}${indent}<!-- ${name}_END -->`)
}

let out = replaceBlock(source, 'FEATURED', favHtml)
out = replaceBlock(out, 'TOOLS', gridHtml)
if (!out.includes('data-count>')) throw new Error('data-count marker not found')
out = out.replace(/(<p class="result-count"[^>]*data-count>)[^<]*(<\/p>)/, `$1${tools.size}の道具$2`)

if (out === source) {
  console.log(`hub unchanged: ${tools.size} tools in ${GROUPS.length} groups, ${FEATURED.length} shortcuts`)
} else {
  fs.writeFileSync(file, out)
  console.log(`hub updated: ${tools.size} tools in ${GROUPS.length} groups, ${FEATURED.length} shortcuts`)
}
