# ツイート → LINE 通知システム

特定のX(Twitter)ユーザーが新しくツイートしたら、LINEにプッシュ通知を送るシステムです。
GitHub Actions で定期実行されるため、**サーバー不要**で動きます。

## 仕組み

```
GitHub Actions (定期実行)
   │
   ├─ X API v2 で対象ユーザーの新着ツイートを取得
   │    (前回チェック以降のツイートのみ)
   │
   └─ 新着があれば LINE Messaging API でプッシュ通知
```

- 最後に通知したツイートIDは `state.json` として GitHub Actions のキャッシュに保存されます
- 初回実行時は基準となるIDを記録するだけで、過去のツイートは通知しません

> **注意:** LINE Notify は2025年3月にサービス終了したため、LINE Messaging API(公式アカウントのbot)を使用しています。

## セットアップ手順

### 1. X (Twitter) API の準備

1. [X Developer Portal](https://developer.x.com/) でアプリを作成
2. **Bearer Token** を取得

> **重要(料金について):** X APIの**Freeプランは読み取りがほぼできない**(月100リクエスト程度)ため、
> 15分間隔のポーリングには **Basicプラン以上の有料プラン**が必要です。
> Freeプランのまま使う場合は、`.github/workflows/check-tweets.yml` の cron を
> 1日1〜2回程度(例: `0 0,12 * * *`)に減らしてください。

### 2. LINE Messaging API の準備

1. [LINE Developers](https://developers.line.biz/) でプロバイダーと **Messaging API チャネル**を作成
2. 「Messaging API設定」タブから **チャネルアクセストークン(長期)** を発行
3. 作成された公式アカウントを、通知を受け取りたいLINEアカウントで**友だち追加**
4. 通知先の指定方法は2通り:
   - **ブロードキャスト(簡単・推奨):** `LINE_USER_ID` を設定しなければ、botの友だち全員に配信されます
   - **特定ユーザーへのプッシュ:** 自分の **ユーザーID**(`U`で始まる文字列)を `LINE_USER_ID` に設定します
     (LINE Developersコンソールの「チャネル基本設定」→「あなたのユーザーID」で確認できます)

### 3. GitHub リポジトリの設定

リポジトリの **Settings → Secrets and variables → Actions** で以下を設定します。

**Secrets(機密情報):**

| 名前 | 内容 |
|---|---|
| `X_BEARER_TOKEN` | X API の Bearer Token |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE のチャネルアクセストークン |
| `LINE_USER_ID` | (任意)通知先のLINEユーザーID。未設定ならブロードキャスト配信 |

**Variables(公開しても問題ない設定):**

| 名前 | 内容 |
|---|---|
| `X_USERNAME` | 監視したいユーザー名(@なし。例: `nasa`) |

### 4. 動作確認

**Actions** タブ → 「ツイートをチェックしてLINEに通知」→ **Run workflow** で手動実行できます。

- 初回実行: 最新ツイートIDを記録するだけ(通知なし)
- 2回目以降: 前回以降の新着ツイートがあればLINEに通知

## カスタマイズ

- **チェック間隔:** `.github/workflows/check-tweets.yml` の `cron` を変更
- **リツイート・リプライも通知したい:** `check_tweets.py` の `exclude` パラメータを削除
- **ローカルで実行したい場合:**

  ```bash
  export X_BEARER_TOKEN="..."
  export X_USERNAME="nasa"
  export LINE_CHANNEL_ACCESS_TOKEN="..."
  export LINE_USER_ID="U..."   # 省略可
  python check_tweets.py
  ```

  依存ライブラリはなく、Python 3.10 以上の標準ライブラリのみで動きます。

## 制限事項

- GitHub Actions の `schedule` は負荷状況により数分〜数十分遅延することがあります(リアルタイム通知ではありません)
- X APIのプランによってはポーリング間隔を空ける必要があります(上記参照)
- 完全なリアルタイム性が必要な場合は、X APIの Filtered Stream(Pro プラン以上)+常駐サーバー構成への拡張が必要です
