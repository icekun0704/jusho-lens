# Xserver への配置

## いまの状態

- 公開先: https://icekun.net/jusho/
- `public_html/jusho/` に配置。ルートの `index.html` は `/jusho/` へリダイレクト
- `https://icekun.net/ads.txt` に AdSense の ads.txt を設置済み
- WordPress は削除済み（ルートは空。`index.html` と `ads.txt` のみ）
- SSH: `ssh xserver`（`iceserver@iceserver.xsrv.jp:10022`、`~/.ssh/id_xserver_rsa`）。root は使わない
- ビルドは相対パス（`base: './'`）なので、ルートでもサブディレクトリでも動く

## 更新する

```bash
bash tools/deploy-xserver.sh
```

内部の流れ:

1. `npm run build`
2. `dist/` を tar で転送し、`~/icekun.net/public_html/jusho.tmp` に展開
3. `jusho` → `jusho.old`、`jusho.tmp` → `jusho`、`jusho.old` を削除（ほぼ無停止の入れ替え）

`XSERVER_HOST` / `XSERVER_DIR` で上書きできます。

## ads.txt（設置済み）

AdSense の `ads.txt` は **ドメイン直下** に置く必要があります。

- 置き場所: `~/icekun.net/public_html/ads.txt`（`/jusho/` の中ではない）
- 公開 URL: https://icekun.net/ads.txt
- 中身:

```
google.com, pub-1870128904709930, DIRECT, f08c47fec0942fa0
```

AdSense のサイト登録は `icekun.net`（サブディレクトリやサブドメインを含めない）。

## お問い合わせフォーム

ルートの「お問い合わせ」は `contact.php` が受けます。メールアドレスはページに出ません。

- 配置: `~/icekun.net/public_html/contact.php`（`bash tools/deploy-hub.sh` で送信）
- 保存: `~/icekun.net/contact-submissions.jsonl`（Web ルートの外。1行1件の JSON）
- 転送: `~/icekun.net/contact-recipient.txt` にメールアドレスを1行書くと、同じ内容を `mail()` で転送
- 制限: 同一IPから10分に3件まで（Cloudflare の `CF-Connecting-IP` を使用）
- 確認: `ssh xserver 'tail -n 20 ~/icekun.net/contact-submissions.jsonl'`

```
でんわ 03-0000-0000
```
のように書くと届きます。

## サブドメインに移す場合

`jusho.icekun.net` にするなら:

1. Xserver サーバーパネル → サブドメイン設定 → 追加
2. SSL 設定 → 無料 SSL を有効化
3. ドキュメントルート（例 `~/jusho.icekun.net/public_html`）に向けて配置

```bash
XSERVER_DIR=jusho.icekun.net/public_html bash tools/deploy-xserver.sh
```

`index.html` の `canonical` と `og:url` を新しい URL に更新してください。

## 注意

- ユーザー `iceserver` の `~` 配下だけを触る。`sudo` は使わない
- 入れ替えるのは `/jusho/` のみ。WordPress のファイルには触れない
- 転送量は約 12MB（辞書データを含む）
