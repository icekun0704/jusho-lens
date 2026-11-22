/** Regenerate the tool directory of deploy/hub/index.html. */
import fs from 'node:fs'
import path from 'node:path'

// [id, label, tools] — the id is written to data-cat and must match the chip buttons in index.html.
const GROUPS = [
  ['jusho', '住所・書類', [
    ['/jusho/', '住所レンズ', '英語の住所を日本語に戻して、元の住所と照合する。', ['住所', '郵便番号', 'ローマ字']],
    ['/inshi/', '印紙税計算', '文書の種類と金額から印紙税を調べる。', ['印紙', '契約書', '税']],
    ['/denshi/', '電子帳簿のファイル名', '取引日・取引先・金額から保存用のファイル名を作る。', ['電子帳簿保存法', 'ファイル名', '保存']],
    ['/envelope/', '宛名印刷', '郵便番号から住所を補い、封筒やラベルの宛名を印刷する。', ['宛名', '封筒', '年賀状']],
  ]],
  ['text', 'テキスト', [
    ['/text/', '文字数カウント', '文字数と原稿用紙換算、SNSの上限を数える。', ['文章', '原稿', 'SNS']],
    ['/case/', '文字種変換', 'camelCase、全角半角、ひらがなカタカナを変換。', ['命名', '全角', 'かな']],
    ['/kanji-number/', '漢数字・大字変換', '金額を漢数字と大字に変換。領収書に。', ['漢数字', '大字', '領収書']],
    ['/urlcode/', 'URLエンコード', 'URL用とフォーム用のエンコード・デコード。', ['URL', 'エンコード']],
    ['/diff/', 'テキスト差分', '2つのテキストを行単位で比較する。', ['差分', '校正']],
  ]],
  ['file', '画像・ファイル', [
    ['/image/', '画像変換・圧縮', 'WebP/JPEG/PNG変換、リサイズ、一括保存。', ['画像', '圧縮', 'WebP']],
    ['/photo/', '証明写真作成', '写真を規格の枠に合わせて証明写真にする。', ['証明写真', '履歴書', 'L判']],
    ['/pdf/', 'PDF結合・分割', 'PDFの結合・分割・回転・ページ番号をブラウザで。', ['PDF', '結合', '分割']],
    ['/qr/', 'QRコード作成', 'URLやテキストからQRコードを作って保存する。', ['QR', '画像', 'URL']],
  ]],
  ['money', '仕事・お金', [
    ['/worktime/', '勤務時間・残業代', '開始・終了・休憩から勤務時間と残業代を出す。', ['勤務', '残業', '時給']],
    ['/wage/', '時給・年収換算', '時給・月収・年収を相互に換算する。', ['時給', '年収', '月収']],
    ['/tedori/', '手取り給与の概算', '額面の給与から手取りを概算する。', ['手取り', '給与', '概算']],
    ['/loan/', '住宅ローン返済', '毎月の返済額と総返済額を計算する。', ['ローン', '住宅', '返済']],
    ['/split/', '割り勘・消費税', '税込・税抜と1人あたりの金額を出す。', ['割り勘', '消費税']],
    ['/business-days/', '営業日・締切日', '祝日を除いた営業日で納期を数える。', ['営業日', '納期', '締切']],
    ['/nenshu-kabe/', '年収の壁', '扶養内で働ける時間を逆算する。', ['年収', '扶養', 'パート']],
    ['/taishokukin/', '退職金の手取り', '退職所得控除から受取額の目安を出す。', ['退職金', '控除', '手取り']],
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
    ['/fuel/', '燃費・ガソリン代', '走行距離と給油量から実燃費とガソリン代を出す。', ['燃費', 'ガソリン', '車']],
    ['/iryohi/', '医療費控除の集計', '1年の医療費を集計して控除額を出す。', ['医療費', '確定申告', '控除']],
  ]],
  ['dev', '開発・データ', [
    ['/regex/', '正規表現テスター', 'パターンのマッチとキャプチャを確認する。', ['正規表現', '開発']],
    ['/cron/', 'cron式の読み方', 'cron式を日本語に読み解き、次回の実行時刻を出す。', ['cron', '定期実行', '開発']],
    ['/json/', 'JSON整形', 'JSONを整形・圧縮して検証する。', ['JSON', '開発']],
    ['/base64/', 'Base64変換', 'テキストとファイルをBase64にする。', ['Base64', '変換']],
    ['/csv/', 'CSV⇔JSON', 'CSVとJSONを相互に変換する。', ['CSV', 'JSON', '表']],
    ['/csv-dedupe/', 'CSV名寄せ', '重複した顧客リストをまとめる。', ['CSV', '名寄せ', '重複']],
    ['/csv-merge/', 'CSV結合', '複数のCSVを見出しを確かめて1つにまとめる。', ['CSV', '結合', '表']],
    ['/excel-column/', 'Excel列番号変換', '列番号と列字母を変換。範囲の列数も出す。', ['Excel', '列', '表計算']],
    ['/gzip/', 'gzip圧縮・解凍', 'テキストやファイルをgzipで圧縮・解凍する。', ['gzip', '圧縮']],
    ['/hash/', 'ハッシュ生成', 'SHA-1/256/384/512をテキストとファイルから。', ['ハッシュ', 'SHA']],
    ['/rsa/', 'RSA暗号化・復号', '鍵生成・暗号化・復号をブラウザで試す。', ['暗号', 'RSA', '学習']],
    ['/color/', 'カラー・コントラスト', 'HEX/RGB/HSL変換とコントラスト判定。', ['色', 'デザイン', 'WCAG']],
    ['/color-blind/', '色覚シミュレーション', '2色がP型・D型・T型の色覚でどう見えるかを比べる。', ['色覚', '配色', 'アクセシビリティ']],
    ['/password/', 'パスワード生成', '端末内で強いパスワードを作る。', ['パスワード', '安全']],
    ['/ip/', 'IPチェック', '接続元のIP・地域・ブラウザを確認する。', ['IP', '接続']],
    ['/useragent/', 'User-Agent判定', 'UA文字列から端末・OS・ブラウザを判定する。', ['ブラウザ', '端末', '開発']],
    ['/timezone/', 'タイムゾーン変換', '2つの地域の時刻を換算する。', ['時差', '海外']],
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

// Articles linked from the 使い方 band: [href, short label]
const GUIDES = [
  ['/guide/amazon/', 'Amazonの英語住所'],
  ['/guide/denshi/', '電子帳簿保存法のファイル名'],
  ['/guide/invoice/', '適格請求書の必須項目'],
  ['/guide/inshi/', '収入印紙が要るか'],
  ['/guide/tedori/', '額面と手取りの差'],
  ['/guide/tsubo/', '坪・平米・畳を比べる'],
  ['/guide/photo/', '証明写真の規格と余白'],
]

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

// --- Kana and romaji search aliases (logic mirrors src/lib/romaji.ts) ---
const KATAKANA_TO_HIRAGANA = (() => {
  const map = {}
  for (let c = 0x30a1; c <= 0x30f6; c++) map[String.fromCharCode(c)] = String.fromCharCode(c - 0x60)
  return map
})()

const FULLWIDTH_ALNUM = (() => {
  const map = {}
  for (let c = 0xff10; c <= 0xff19; c++) map[String.fromCharCode(c)] = String.fromCharCode(c - 0xfee0)
  for (let c = 0xff21; c <= 0xff3a; c++) map[String.fromCharCode(c)] = String.fromCharCode(c - 0xfee0)
  for (let c = 0xff41; c <= 0xff5a; c++) map[String.fromCharCode(c)] = String.fromCharCode(c - 0xfee0)
  return map
})()

const toHiragana = (input) => {
  let out = ''
  for (const ch of input) out += KATAKANA_TO_HIRAGANA[ch] ?? FULLWIDTH_ALNUM[ch] ?? ch
  return out
}

const SYLLABLES = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', ゐ: 'i', ゑ: 'e', を: 'o', ん: 'n',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
  ゔ: 'vu',
  ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o',
  ゕ: 'ka', ゖ: 'ke',
  きゃ: 'kya', きゅ: 'kyu', きょ: 'kyo', きぇ: 'kye',
  しゃ: 'sha', しゅ: 'shu', しょ: 'sho', しぇ: 'she',
  ちゃ: 'cha', ちゅ: 'chu', ちょ: 'cho', ちぇ: 'che',
  にゃ: 'nya', にゅ: 'nyu', にょ: 'nyo',
  ひゃ: 'hya', ひゅ: 'hyu', ひょ: 'hyo',
  みゃ: 'mya', みゅ: 'myu', みょ: 'myo',
  りゃ: 'rya', りゅ: 'ryu', りょ: 'ryo',
  ぎゃ: 'gya', ぎゅ: 'gyu', ぎょ: 'gyo',
  じゃ: 'ja', じゅ: 'ju', じょ: 'jo', じぇ: 'je',
  ぢゃ: 'ja', ぢゅ: 'ju', ぢょ: 'jo',
  びゃ: 'bya', びゅ: 'byu', びょ: 'byo',
  ぴゃ: 'pya', ぴゅ: 'pyu', ぴょ: 'pyo',
  ふぁ: 'fa', ふぃ: 'fi', ふぇ: 'fe', ふぉ: 'fo', ふゅ: 'fyu',
  てぃ: 'ti', てゅ: 'tyu', でぃ: 'di', でゅ: 'dyu',
  とぅ: 'tu', どぅ: 'du',
  うぃ: 'wi', うぇ: 'we', うぉ: 'wo',
  ゔぁ: 'va', ゔぃ: 'vi', ゔぇ: 've', ゔぉ: 'vo', ゔゅ: 'vyu',
  くぁ: 'kwa', くぃ: 'kwi', くぇ: 'kwe', くぉ: 'kwo',
  ぐぁ: 'gwa', ぐぃ: 'gwi', ぐぇ: 'gwe', ぐぉ: 'gwo',
  つぁ: 'tsa', つぃ: 'tsi', つぇ: 'tse', つぉ: 'tso',
  ずぃ: 'zi', すぃ: 'si',
}

const VOWELS = new Set(['a', 'i', 'u', 'e', 'o'])

const collapseVowels = (romaji) =>
  romaji.replace(/oo/g, 'o').replace(/uu/g, 'u').replace(/ou(?![aiueo])/g, 'o')

const readSyllable = (s, index) => {
  const two = s.slice(index, index + 2)
  if (SYLLABLES[two] !== undefined) return { romaji: SYLLABLES[two], end: index + 2 }
  const one = s[index]
  if (SYLLABLES[one] !== undefined) return { romaji: SYLLABLES[one], end: index + 1 }
  return null
}

const kanaToRomaji = (input, { collapse = true, longVowelMark = 'drop' } = {}) => {
  const hira = toHiragana(input)
  let out = ''
  let i = 0
  while (i < hira.length) {
    const ch = hira[i]
    if (ch === 'っ') {
      const next = readSyllable(hira, i + 1)
      if (next) {
        const r = next.romaji
        out += r.startsWith('ch') ? 't' + r : r[0] + r
        i = next.end
        continue
      }
      i += 1
      continue
    }
    if (ch === 'ー' || ch === '−' || ch === '—') {
      if (longVowelMark === 'repeat') {
        const last = out.match(/[aiueo](?!.*[aiueo])/)
        out += last ? last[0] : ''
      }
      i += 1
      continue
    }
    const syl = readSyllable(hira, i)
    if (syl) {
      if (syl.romaji === 'n') {
        const after = readSyllable(hira, syl.end)
        out += after && (VOWELS.has(after.romaji[0]) || after.romaji[0] === 'y') ? "n'" : 'n'
      } else {
        out += syl.romaji
      }
      i = syl.end
      continue
    }
    if (ch === ' ' || ch === '　') out += ' '
    else if (/[A-Za-z0-9]/.test(ch)) out += ch
    else if (ch === '・' || ch === '･' || ch === '=' || ch === '＝') out += ' '
    i += 1
  }
  const cleaned = out.replace(/\s+/g, ' ').trim()
  return collapse ? collapseVowels(cleaned) : cleaned
}

const searchAliases = (reading, href) => {
  const aliases = new Set()
  if (reading) {
    aliases.add(reading)
    for (const options of [
      { collapse: false, longVowelMark: 'drop' },
      { collapse: false, longVowelMark: 'repeat' },
      { collapse: true, longVowelMark: 'repeat' },
    ]) {
      const romaji = kanaToRomaji(reading, options)
      if (!romaji) continue
      aliases.add(romaji)
      aliases.add(romaji.replace(/'/g, ''))
      aliases.add(romaji.replace(/[^a-z0-9]/g, ''))
    }
  }
  const slug = href.replace(/^\/|\/$/g, '')
  aliases.add(slug)
  aliases.add(slug.replace(/-/g, ''))
  return [...aliases].filter(Boolean)
}

// Hiragana readings of the category names, so じゅうしょ / くらし also find a group.
const CATEGORY_READINGS = {
  jusho: 'じゅうしょしょるい',
  text: 'てきすと',
  file: 'がぞうふぁいる',
  money: 'しごとおかね',
  life: 'くらしかんこう',
  dev: 'かいはつでーた',
}

// Hiragana reading of each tool name.
const READINGS = {
  '/jusho/': 'じゅうしょれんず',
  '/iryohi/': 'いりょうひこうじょのしゅうけい',
  '/inshi/': 'いんしぜいけいさん',
  '/denshi/': 'でんしちょうぼのふぁいるめい',
  '/envelope/': 'あてないんさつ',
  '/text/': 'もじすうかうんと',
  '/case/': 'もじしゅへんかん',
  '/kanji-number/': 'かんすうじだいじへんかん',
  '/urlcode/': 'ゆーあーるえるえんこーど',
  '/diff/': 'てきすとさぶん',
  '/image/': 'がぞうへんかんあっしゅく',
  '/photo/': 'しょうめいしゃしんさくせい',
  '/pdf/': 'ぴーでぃーえふけつごうぶんかつ',
  '/qr/': 'きゅーあーるこーどさくせい',
  '/worktime/': 'きんむじかんざんぎょうだい',
  '/wage/': 'じきゅうねんしゅうかんさん',
  '/tedori/': 'てどりきゅうよのがいさん',
  '/loan/': 'じゅうたくろーんへんさい',
  '/split/': 'わりかんしょうひぜい',
  '/business-days/': 'えいぎょうびしめきりび',
  '/nenshu-kabe/': 'ねんしゅうのかべ',
  '/taishokukin/': 'たいしょくきんのてどり',
  '/percent/': 'わりびきかかくのけいさん',
  '/invoice-check/': 'てきかくせいきゅうしょばんごうちぇっく',
  '/unit/': 'たんいへんかん',
  '/tsubo/': 'つぼへいべいじょう',
  '/date/': 'ひづけけいさんわれき',
  '/age/': 'ねんれいがくねんえと',
  '/holiday/': 'しゅくじつかれんだー',
  '/sleep/': 'すいみんじかんけいさん',
  '/birth/': 'しゅっさんよていびけいさん',
  '/bmi/': 'びーえむあいきそたいしゃ',
  '/fuel/': 'ねんぴがそりんだい',
  '/regex/': 'せいきひょうげんてすたー',
  '/cron/': 'くろんしきのよみかた',
  '/json/': 'じぇいそんせいけい',
  '/base64/': 'べーすろくじゅうよんへんかん',
  '/csv/': 'しーえすぶいじぇいそん',
  '/csv-dedupe/': 'しーえすぶいなよせじゅうふく',
  '/csv-merge/': 'しーえすぶいけつごう',
  '/excel-column/': 'えくせるれつばんごうへんかん',
  '/gzip/': 'じーじっぷあっしゅくかいとう',
  '/hash/': 'はっしゅせいせい',
  '/rsa/': 'あーるえすえーあんごうかふくごう',
  '/color/': 'からーこんとらすと',
  '/color-blind/': 'しかくしみゅれーしょん',
  '/password/': 'ぱすわーどせいせい',
  '/ip/': 'あいぴーちぇっく',
  '/useragent/': 'ゆーざーえーじぇんとはんてい',
  '/timezone/': 'たいむぞーんへんかん',
}

const keyFor = (tool) => [
  tool.name,
  tool.desc,
  tool.label,
  ...tool.tags,
  ...searchAliases(READINGS[tool.href] || '', tool.href),
  ...searchAliases(CATEGORY_READINGS[tool.id] || '', ''),
].join(' ')

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

let guideHtml = ''
for (const [href, label] of GUIDES) {
  guideHtml += `      <li>\n        <a href="${href}">${esc(label)}<span class="go" aria-hidden="true">→</span></a>\n      </li>\n`
}

const missingReadings = [...tools.values()].filter((tool) => !READINGS[tool.href])
if (missingReadings.length) console.warn(`no kana reading for: ${missingReadings.map((tool) => tool.href).join(', ')}`)

let gridHtml = ''
for (const [id, label, list] of GROUPS) {
  for (const [href, name, desc, tags] of list) {
    const key = keyFor(tools.get(href))
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

const guideRoot = path.resolve(import.meta.dirname, '..', 'deploy', 'guide')
for (const [href] of GUIDES) {
  const slug = href.replace(/^\/guide\//, '').replace(/\/$/, '')
  if (!fs.existsSync(path.join(guideRoot, slug, 'index.html'))) throw new Error(`guide page not found: ${href}`)
}
if (new Set(GUIDES.map(([href]) => href)).size !== GUIDES.length) throw new Error('guides should be distinct')

const file = path.resolve(import.meta.dirname, '..', 'deploy', 'hub', 'index.html')
const source = fs.readFileSync(file, 'utf8')

const replaceBlock = (html, name, content) => {
  const pattern = new RegExp(`([ \\t]*)<!--\\s*${name}_START\\s*-->[\\s\\S]*?<!--\\s*${name}_END\\s*-->`)
  if (!pattern.test(html)) throw new Error(`${name} markers not found`)
  return html.replace(pattern, (match, indent) => `${indent}<!-- ${name}_START -->\n${content}${indent}<!-- ${name}_END -->`)
}

let out = replaceBlock(source, 'FEATURED', favHtml)
out = replaceBlock(out, 'TOOLS', gridHtml)
out = replaceBlock(out, 'GUIDES', guideHtml)
if (!out.includes('data-count>')) throw new Error('data-count marker not found')
out = out.replace(/(<p class="result-count"[^>]*data-count>)[^<]*(<\/p>)/, `$1${tools.size}の道具$2`)

if (out === source) {
  console.log(`hub unchanged: ${tools.size} tools in ${GROUPS.length} groups, ${FEATURED.length} shortcuts, ${GUIDES.length} guides`)
} else {
  fs.writeFileSync(file, out)
  console.log(`hub updated: ${tools.size} tools in ${GROUPS.length} groups, ${FEATURED.length} shortcuts, ${GUIDES.length} guides`)
}
