# Xserver への配置

## いまの状態

- 公開先: https://icekun.net/jusho/
- `icekun.net` のルートは WordPress。**既存サイトには触れず**、`public_html/jusho/` だけを使う
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

## ads.txt（AdSense 承認後）

AdSense の `ads.txt` は **ドメイン直下** に置く必要があります。

- 置き場所: `~/icekun.net/public_html/ads.txt`（WordPress と同じ階層。`/jusho/` の中ではない）
- 公開 URL: `https://icekun.net/ads.txt`
- 中身: AdSense 管理画面 →「サイト」→ ads.txt スニペットをそのままコピー

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

GitHub Pages ではドメイン直下に置けないため、AdSense を使うなら icekun.net 側が本番になります。

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
