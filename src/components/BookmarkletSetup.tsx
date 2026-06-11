import { useState } from 'react'
import { Modal } from './Modal'

const BOOKMARKLET_URL = `javascript:(function(){var s=document.createElement('script');s.src='https://nkkroid.github.io/-/bookmarklet.js?t='+Date.now();document.head.appendChild(s)})();`

export function BookmarkletSetup({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(BOOKMARKLET_URL)
    } catch {
      const el = document.querySelector<HTMLTextAreaElement>('#bm-url')
      if (el) { el.select(); document.execCommand('copy') }
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <Modal title="📲 自動インポート設定" onClose={onClose} wide>
      <div className="space-y-4 text-sm">
        <p className="text-xs leading-relaxed text-gray-600">
          競馬サイトの馬の成績ページで実行するだけでレース結果を自動取り込みできます。
          Brave・Chrome（Android）に対応しています。
        </p>

        {/* Step 1 */}
        <div className="space-y-2 rounded-xl bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f1f3d] text-xs font-bold text-white">
              1
            </span>
            <span className="font-semibold text-gray-700">URLをコピー</span>
          </div>
          <textarea
            id="bm-url"
            readOnly
            value={BOOKMARKLET_URL}
            rows={3}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-xs leading-relaxed text-gray-500"
          />
          <button
            onClick={handleCopy}
            className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-colors ${
              copied ? 'bg-emerald-500 text-white' : 'bg-[#0f1f3d] text-white active:bg-[#1a3063]'
            }`}
          >
            {copied ? '✓ コピーしました！' : 'URLをコピー'}
          </button>
        </div>

        {/* Step 2 - Android Brave/Chrome */}
        <div className="space-y-2 rounded-xl bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              2
            </span>
            <span className="font-semibold text-blue-800">ブックマークに登録（Android / Brave・Chrome）</span>
          </div>
          <ol className="space-y-1.5 pl-1 text-xs text-blue-700">
            <li className="flex gap-1.5"><span className="shrink-0 font-bold">①</span>Braveで任意のページを開き、アドレスバー右の ☆ をタップしてブックマーク追加</li>
            <li className="flex gap-1.5"><span className="shrink-0 font-bold">②</span>右上の「…」メニュー → 「ブックマーク」を開く</li>
            <li className="flex gap-1.5"><span className="shrink-0 font-bold">③</span>追加したブックマークを長押し → 「編集」</li>
            <li className="flex gap-1.5"><span className="shrink-0 font-bold">④</span>名前を「競馬インポート」などに変更し、URLの欄を全削除して①でコピーしたURLを貼り付けて保存</li>
          </ol>
        </div>

        {/* Step 3 - Usage on Android */}
        <div className="space-y-2 rounded-xl bg-emerald-50 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              3
            </span>
            <span className="font-semibold text-emerald-800">使い方</span>
          </div>
          <ol className="space-y-1.5 pl-1 text-xs text-emerald-700">
            <li className="flex gap-1.5"><span className="shrink-0 font-bold">①</span>BraveでnetkeibaなどBraveで馬の成績ページを開く</li>
            <li className="flex gap-1.5"><span className="shrink-0 font-bold">②</span><span>アドレスバーをタップして「競馬インポート」と入力 → 候補に出てきたらタップ（ここで実行される）</span></li>
            <li className="flex gap-1.5"><span className="shrink-0 font-bold">③</span>自動でこのアプリに戻り、結果を確認・選択してインポート</li>
          </ol>
          <div className="mt-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <span className="font-semibold">⚠️ ポイント：</span>ブックマーク一覧からタップするのではなく、<br />
            <span className="font-semibold">アドレスバーに名前を入力して候補から選ぶ</span>のがAndroidでの実行方法です
          </div>
          <div className="mt-1 rounded-lg bg-emerald-100 px-3 py-2 text-xs text-emerald-600">
            <span className="font-semibold">対応サイト例：</span>{' '}
            db.netkeiba.com / jbis.or.jp など<br />
            着順・レース名の列があるページならどこでも動作します
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-lg bg-gray-100 py-3 text-sm font-semibold text-gray-600 active:bg-gray-200"
        >
          閉じる
        </button>
      </div>
    </Modal>
  )
}
