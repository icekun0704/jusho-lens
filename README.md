# 住所レンズ / Jusho Lens

英語の住所を日本語に戻して確認するツールです。Amazon の自動翻訳、Wise の登録住所、DS-160 の申請書など、海外フォームが生成した英語住所が本当に自分の住所を指しているかを確かめられます。

https://icekun0704.github.io/jusho-lens/

## できること

- **英語 → 日本語**：英語の住所を都道府県・市区町村・町名・番地・建物名に分解し、一致度を返す
- **日本語 → 英語**：国際郵便、Amazon US、Wise、DS-160、カード請求先の欄名で出力し、日本語の残りや文字数を検査
- **氏名 → ローマ字**：パスポート式（姓名とも大文字・んのM化）と公用文式
- **CSV 一括変換**（Pro）：1ファイル 1,000 件まで

## 仕組み

- **完全クライアントサイド**。住所・氏名・CSV はブラウザの外に出ません。読み込むのは静的辞書だけです。
- 辞書は日本郵便の **KEN_ALL**（漢字・カナ）と **KEN_ALL_ROME**（公式ローマ字）から生成しています。
- 逆引きでは公式ローマ字を第二の照合キーに使うため、`Marunouchi` と `Marunochi` のどちらでも丸の内に一致します。
- 表示は英語住所として自然な形に整えます（`Toukyou` → `Tokyo`、`Oosaka` → `Osaka`）。

## 開発

```bash
npm install
npm run dev          # http://localhost:5199/jusho-lens/
npm run build
npx tsx tools/build-data.ts   # 辞書の再生成（data/ に公式 CSV を置く）
npx tsx tools/test-parse.ts   # 住所変換の回帰テスト
node tools/test-romaji.ts     # ローマ字規則のテスト
node tools/issue-license.mjs you@example.com   # Pro ライセンスキーの発行
```

辞書を再生成するには、次の2ファイルを `data/` に置きます。

- `utf_ken_all.csv` — https://www.post.japanpost.jp/service/search/zipcode/download/utf-zip.html
- `ken_all_rome.csv` — https://www.post.japanpost.jp/service/search/zipcode/download/roman-zip.html

## 収益化の設定

`src/config.ts` に購入 URL・連絡先・AdSense の ID を入れると、料金ページの購入ボタンと広告枠が有効になります。ライセンスキーは Ed25519 署名でオフライン検証します（秘密鍵は `secrets/`、Git 管理外）。

## データ

日本郵便が公開する郵便番号データ（2026年10月30日更新）をもとにしています。本プロジェクトは日本郵便、Amazon、Wise、米国政府その他の第三者と提携・関係していません。

## ライセンス

- コード：MIT
- 住所データ：日本郵便の公開データに基づく派生データ
