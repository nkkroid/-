#!/usr/bin/env python3
"""特定のXユーザーの新着ツイートを検知してLINEに通知するスクリプト。

必要な環境変数:
    X_BEARER_TOKEN            X API v2 の Bearer Token
    X_USERNAME                監視対象のユーザー名(@なし)
    LINE_CHANNEL_ACCESS_TOKEN LINE Messaging API のチャネルアクセストークン
    LINE_USER_ID              通知先のLINEユーザーID(省略時はブロードキャスト配信)

状態(最後に通知したツイートID)は state.json に保存する。
"""

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

STATE_FILE = os.environ.get("STATE_FILE", "state.json")
X_API_BASE = "https://api.twitter.com/2"
LINE_API_BASE = "https://api.line.me/v2/bot/message"


def http_json(url: str, headers: dict, payload: dict | None = None) -> dict:
    data = json.dumps(payload).encode() if payload is not None else None
    if payload is not None:
        headers = {**headers, "Content-Type": "application/json"}
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            body = res.read().decode()
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        raise RuntimeError(f"HTTP {e.code} for {url}: {body}") from e


def load_state() -> dict:
    try:
        with open(STATE_FILE, encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_state(state: dict) -> None:
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


def resolve_user_id(bearer: str, username: str, state: dict) -> str:
    cached = state.get("users", {}).get(username)
    if cached:
        return cached
    res = http_json(
        f"{X_API_BASE}/users/by/username/{urllib.parse.quote(username)}",
        {"Authorization": f"Bearer {bearer}"},
    )
    user_id = res["data"]["id"]
    state.setdefault("users", {})[username] = user_id
    return user_id


def fetch_new_tweets(bearer: str, user_id: str, since_id: str | None) -> list[dict]:
    params = {
        "max_results": "5",
        "exclude": "retweets,replies",
        "tweet.fields": "created_at",
    }
    if since_id:
        params["since_id"] = since_id
    url = f"{X_API_BASE}/users/{user_id}/tweets?" + urllib.parse.urlencode(params)
    res = http_json(url, {"Authorization": f"Bearer {bearer}"})
    return res.get("data", [])


def send_line_message(token: str, text: str, to: str | None) -> None:
    message = {"type": "text", "text": text[:5000]}
    if to:
        url = f"{LINE_API_BASE}/push"
        payload = {"to": to, "messages": [message]}
    else:
        url = f"{LINE_API_BASE}/broadcast"
        payload = {"messages": [message]}
    http_json(url, {"Authorization": f"Bearer {token}"}, payload)


def main() -> int:
    bearer = os.environ.get("X_BEARER_TOKEN")
    username = os.environ.get("X_USERNAME", "").lstrip("@")
    line_token = os.environ.get("LINE_CHANNEL_ACCESS_TOKEN")
    line_to = os.environ.get("LINE_USER_ID") or None

    missing = [
        name
        for name, value in [
            ("X_BEARER_TOKEN", bearer),
            ("X_USERNAME", username),
            ("LINE_CHANNEL_ACCESS_TOKEN", line_token),
        ]
        if not value
    ]
    if missing:
        print(f"環境変数が未設定です: {', '.join(missing)}", file=sys.stderr)
        return 1

    state = load_state()
    user_id = resolve_user_id(bearer, username, state)
    since_id = state.get("last_tweet_id", {}).get(username)

    tweets = fetch_new_tweets(bearer, user_id, since_id)

    if tweets:
        newest_id = max(t["id"] for t in tweets)
        state.setdefault("last_tweet_id", {})[username] = newest_id

    save_state(state)

    if since_id is None:
        # 初回実行時は基準となるIDを記録するだけで通知しない(過去分の一斉通知を防ぐ)
        print(f"初回実行: @{username} の最新ツイートIDを記録しました。次回から通知します。")
        return 0

    if not tweets:
        print(f"@{username} の新着ツイートはありません。")
        return 0

    for tweet in sorted(tweets, key=lambda t: int(t["id"])):
        url = f"https://x.com/{username}/status/{tweet['id']}"
        text = f"@{username} が新しいツイートを投稿しました\n\n{tweet['text']}\n\n{url}"
        send_line_message(line_token, text, line_to)
        print(f"通知しました: {url}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
