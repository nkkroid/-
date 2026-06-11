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
          競馬サイトの馬の成績ページをブラウザで開き、ブックマークをタップするだけでレース結果を自動取り込みできます。
          netkeiba・JBIS など成績テーブルがあるページに対応しています。
        </p>

        {/* Step 1 */}
        <div className="space-y-2 rounded-xl bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f1f3d] text-xs font-bold text-white">
              1
            </span>
            <span className="font-semibold text-gray-700">ブックマークレットURLをコピー</span>
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

        {/* Step 2 - iPhone */}
        <div className="space-y-2 rounded-xl bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              2
            </span>
            <span className="font-semibold text-blue-800">Safariにブックマーク登録（iPhone）</span>
          </div>
          <ol className="space-y-1.5 pl-1 text-xs text-blue-700">
            <li className="flex gap-1.5"><span className="shrink-0 font-bold">①</span>Safariで任意のページを開く</li>
            <li className="flex gap-1.5"><span className="shrink-0 font-bold">②</span>画面下の共有ボタン（↑）→「ブックマークを追加」</li>
            <li className="flex gap-1.5"><span className="shrink-0 font-bold">③</span>名前を「競馬インポート」などにして保存</li>
            <li className="flex gap-1.5"><span className="shrink-0 font-bold">④</span>ブックマーク一覧を開いて追加したものを長押し→「編集」</li>
            <li className="flex gap-1.5"><span className="shrink-0 font-bold">⑤</span>URLの欄を全削除して、コピーしたURLを貼り付けて完了</li>
          </ol>
        </div>

        {/* Step 3 - Usage */}
        <div className="space-y-2 rounded-xl bg-emerald-50 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              3
            </span>
            <span className="font-semibold text-emerald-800">使い方</span>
          </div>
          <ol className="space-y-1.5 pl-1 text-xs text-emerald-700">
            <li className="flex gap-1.5"><span className="shrink-0 font-bold">①</span>Safariでnetkeibaなどの馬の成績ページを開く</li>
            <li className="flex gap-1.5"><span className="shrink-0 font-bold">②</span>ブックマークから「競馬インポート」をタップ</li>
            <li className="flex gap-1.5"><span className="shrink-0 font-bold">③</span>自動でこのアプリに戻り、結果を確認・選択してインポート</li>
          </ol>
          <div className="mt-2 rounded-lg bg-emerald-100 px-3 py-2 text-xs text-emerald-600">
            <span className="font-semibold">対応サイト例：</span>{' '}
            db.netkeiba.com / jbis.or.jp など<br />
            成績テーブル（着順・レース名の列）があるページならどこでも動作します
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
