# ローンチキット

## いまの状態

- 公開 URL: https://icekun0704.github.io/jusho-lens/
- リポジトリ: https://github.com/icekun0704/jusho-lens
- 無料: 1件ずつの変換、逆引き、用途別フォーマット、氏名、検証
- Pro（¥2,980 買い切り）: CSV一括（1,000件）、一括検証、履歴、広告なし

## 収益化を有効にする（3ステップ）

1. **決済リンクを作る** — Stripe の Payment Link（¥2,980、商品名「住所レンズ Pro」）か、BOOTH / Gumroad の商品ページ。
2. **URL を入れる** — `src/config.ts` の `purchaseUrl` に貼る。`contactEmail` も入れる。AdSense 承認後は `adsenseClient` を入れる。
3. **キーを発行して送る** — 購入者のメールアドレスで:

   ```bash
   node tools/issue-license.mjs buyer@example.com
   ```

   出力された文字列をそのまま購入者に送る。購入者は料金ページの「ライセンスキー」欄に貼ると Pro が有効になる。サーバー不要、署名はブラウザ内で検証される。

> 秘密鍵 `secrets/license-private.pem` は Git 管理外。**必ずバックアップすること**。紛失すると、アプリに埋め込んだ公開鍵に対する新しいキーを発行できなくなる。

## 集客

### すでにある SEO 面

- `/` 住所の逆引き（メイン）
- `/guide/amazon` Amazonの英語住所を確認する
- `/guide/wise` Wiseに登録する住所
- `/guide/ds160` DS-160の住所欄
- `/pricing`

### 次に書く記事（検索意図が明確な順）

1. 「Amazon 住所 英語表記 なぜ」— 自動翻訳の仕組みと確認手順。ガイドへ送客。
2. 「英文住所 変換 一括」— CSV一括の使い方と越境ECの時短。Pro へ送客。
3. 「パスポート ローマ字 変換 注意」— 長音・促音・んのM化。氏名タブへ送客。
4. 「Wise 住所 英語 書き方 一致しない」— 本人確認で止まる原因。
5. 「京都 住所 英語 通り名」— ニッチだが競合が弱い。

### X 投稿案

**1. 問題提起型**

> Amazonで海外発送を頼むと「英語表記の住所を確認してください」って出るけど、あの自動翻訳が合ってるか確認する方法がなかったので作りました。
> 英語住所を貼ると、日本の住所に戻して一致度を出します。登録不要、入力は送信されません。
> https://icekun0704.github.io/jusho-lens/

**2. デモ型**

> 「4F Shibuya Building, 1-2-3 Jinnan, Shibuya-ku, Tokyo 150-0041, Japan」
> ↓ 貼る
> 「〒150-0041 東京都渋谷区神南1-2-3 4F Shibuya Building / 一致度 高」
> 住所の逆変換ツールを公開しました。日本郵便の公式ローマ字データで照合しています。
> https://icekun0704.github.io/jusho-lens/

**3. 用途型**

> DS-160やWiseの住所欄、どこに何を入れるか毎回迷うので、欄名のまま出力するツールにしました。
> Address Line 1 / City / State / Postal を分けて出して、日本語が残ってないかも検査します。
> https://icekun0704.github.io/jusho-lens/

### note 記事の構成

1. なぜ作ったか（Amazonの自動翻訳が崩れる実例）
2. 既存ツールとの違い（逆変換・用途別・公式ローマ字照合）
3. 使い方（3画面）
4. 注意点（建物名の漢字は手入力、最終確認は公式で）
5. ツールへのリンク

コミュニティ（Reddit 等）へ貼る場合は、各コミュニティの自己宣伝ルールを確認し、宣伝だけの投稿はしないこと。

## データ更新（月1回）

1. 次の2ファイルを `data/` に置く
   - `utf_ken_all.csv` — https://www.post.japanpost.jp/service/search/zipcode/download/utf-zip.html
   - `ken_all_rome.csv` — https://www.post.japanpost.jp/service/search/zipcode/download/roman-zip.html
2. `npx tsx tools/build-data.ts`
3. `npx tsx tools/test-parse.ts`
4. commit → push（GitHub Actions が自動デプロイ）

## 改善バックログ

- 京都の「通り名＋町名」を分けて表示する
- 建物名のカタカナ→英語をもう少し賢くする（Mansion / Heights 以外）
- 変換履歴とお気に入り（Pro）
- PWA 化（オフラインで使えるように）
- 英語 UI（訪日外国人・海外在住者向け）
- 郵便番号からの入力補完を前面に出す
