# ローンチキット（無料＋広告）

## いまの状態

- 本番: https://icekun.net/jusho/（Xserver）
- 予備: https://icekun0704.github.io/jusho-lens/（GitHub Pages）
- リポジトリ: https://github.com/icekun0704/jusho-lens
- 料金: すべて無料。有料プランはなし。
- 収益: ページ広告（Google AdSense）

## 広告（設定済み）

- パブリッシャーID `ca-pub-1870128904709930` を `src/config.ts` と `index.html` に設定済み
- `https://icekun.net/ads.txt` を設置済み（AdSense のサイト登録は `icekun.net`）
- サイト所有権の確認は ads.txt とメタタグの両方で満たしています

### 次にやること

1. AdSense 管理画面で「審査をリクエスト」
2. 承認後、どちらかを選ぶ
   - **自動広告**を ON（スクリプトは入っているので追加作業なし）
   - **ディスプレイ広告ユニット**を作成し、`data-ad-slot` の数字を `src/config.ts` の `adsenseSlot` に入れる（トップと記事下の枠が有効になる）
3. `bash tools/deploy-xserver.sh` で反映

> 審査には数日〜数週間かかります。「有用性の低いコンテンツ」で落ちることがあるので、ガイド記事を増やしてから再申請すると安全です。

## 収益の目安

日本のユーティリティ系サイトの RPM はおおむね ¥200〜350 / 1,000PV。金融・送金・越境ECの文脈で記事を書くと単価が上がりやすい。

| 月間PV | 目安 |
|---|---|
| 1万 | ¥2,000〜3,500 |
| 5万 | ¥10,000〜17,500 |
| 30万 | ¥60,000〜105,000 |

維持費は GitHub Pages と静的ファイルのみなので、PV が増えても原価はほぼ増えません。

## 集客

### すでにある SEO 面

- `/` 住所の逆引き（メイン）
- `/guide/amazon` Amazonの英語住所を確認する
- `/guide/wise` Wiseに登録する住所
- `/guide/ds160` DS-160の住所欄
- `/pricing` 料金（無料であることの説明）

### 次に書く記事（検索意図が明確な順）

1. 「Amazon 住所 英語表記 なぜ」— 自動翻訳の仕組みと確認手順
2. 「英文住所 変換 一括」— CSV一括の使い方
3. 「パスポート ローマ字 変換 注意」— 長音・促音・んのM化
4. 「Wise 住所 英語 書き方 一致しない」— 本人確認で止まる原因
5. 「郵便番号 英語 住所 変換」— 郵便番号タブへ送客
6. 「京都 住所 英語 通り名」— 競合が弱いニッチ

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

**3. 郵便番号型**

> 郵便番号を7桁入れるだけで、住所と英語表記が出るタブを追加しました。
> DS-160やWiseの住所欄を埋めるときにどうぞ。
> https://icekun0704.github.io/jusho-lens/

### note 記事の構成

1. なぜ作ったか（Amazonの自動翻訳が崩れる実例）
2. 既存ツールとの違い（逆変換・用途別・公式ローマ字照合）
3. 使い方（4タブ）
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
- 建物名のカタカナ→英語をもう少し賢くする
- PWA 化（オフラインで使えるように）
- 英語 UI（訪日外国人・海外在住者向け）
- 郵便番号の複数候補をより見やすく
