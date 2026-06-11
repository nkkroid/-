import { useState } from 'react'
import type { Horse } from '../types'
import { searchHorseId, fetchRaceHistory, computeOwnerDividend, type FetchedResult } from '../utils/netkeiba'
import { useStoreContext } from '../context/StoreContext'
import { Modal } from './Modal'
import { PositionBadge, GradeBadge } from './Dashboard'

type Step = 'idle' | 'loading' | 'done' | 'error'

interface Props {
  horse: Horse
  onClose: () => void
}

export function NetkeibaImport({ horse, onClose }: Props) {
  const { addRaceResult, updateHorse, raceResults } = useStoreContext()
  const [step, setStep] = useState<Step>('idle')
  const [progressMsg, setProgressMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [fetched, setFetched] = useState<FetchedResult[]>([])
  const [allFetched, setAllFetched] = useState<FetchedResult[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [horseIdInput, setHorseIdInput] = useState('')
  const [detectedHorseId, setDetectedHorseId] = useState('')

  const existingKeys = new Set(
    raceResults.filter((r) => r.horseId === horse.id).map((r) => r.date + r.raceName),
  )

  const progress = (msg: string) => setProgressMsg(msg)

  async function runFetch(horseId: string) {
    setStep('loading')
    setErrorMsg('')
    setDetectedHorseId(horseId)
    try {
      progress('成績ページを取得中...')
      const results = await fetchRaceHistory(horseId, progress)
      setAllFetched(results)
      const newOnes = results.filter((r) => !existingKeys.has(r.date + r.raceName))
      setFetched(newOnes)
      setSelected(new Set(newOnes.map((_, i) => i)))
      setStep('done')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : String(e))
      setStep('error')
    }
  }

  async function handleAutoSearch() {
    setStep('loading')
    setErrorMsg('')
    try {
      progress('馬を検索中...')
      const id = await searchHorseId(horse.name, progress)
      if (!id) {
        setErrorMsg(`「${horse.name}」が netkeiba で見つかりませんでした。馬IDを直接入力してください。`)
        setStep('error')
        return
      }
      progress(`馬ID: ${id} を確認、成績を取得中...`)
      await runFetch(id)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : String(e))
      setStep('error')
    }
  }

  function handleImport() {
    let starts = 0, wins = 0, second = 0, third = 0, earnings = 0
    for (const [i, r] of fetched.entries()) {
      if (!selected.has(i)) continue
      addRaceResult(
        {
          horseId: horse.id,
          horseName: horse.name,
          date: r.date,
          raceName: r.raceName,
          venue: r.venue,
          distance: r.distance,
          surface: r.surface,
          grade: r.grade as import('../types').RaceResult['grade'],
          position: r.position,
          totalRunners: r.totalRunners || 16,
          jockey: r.jockey,
          weight: r.weight,
          odds: 0,
          prizeMoney: r.prizeMoney,
          ownerDividend: computeOwnerDividend(r.prizeMoney, horse.sharesOwned, horse.totalShares),
          time: r.time,
          margin: r.margin,
        },
        [],
      )
      starts++
      if (r.position === 1) wins++
      if (r.position === 2) second++
      if (r.position === 3) third++
      earnings += r.prizeMoney
    }
    updateHorse(horse.id, {
      record: {
        starts: horse.record.starts + starts,
        wins: horse.record.wins + wins,
        second: horse.record.second + second,
        third: horse.record.third + third,
        earnings: horse.record.earnings + earnings,
      },
    })
    onClose()
  }

  const isLoading = step === 'loading'
  const canRetry = step === 'error'

  return (
    <Modal title={`📥 ${horse.name} の成績を取得`} onClose={onClose} wide>
      <div className="space-y-4">
        {/* Info */}
        <div className="rounded-lg bg-blue-50 px-3 py-2.5 text-xs text-blue-700">
          複数のプロキシを順番に試します。20〜40秒かかる場合があります。
        </div>

        {/* Idle / Error */}
        {!isLoading && step !== 'done' && (
          <div className="space-y-3">
            <button
              onClick={handleAutoSearch}
              className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white active:bg-emerald-700"
            >
              🔍 「{horse.name}」で自動検索
            </button>

            <div className="flex items-center gap-2">
              <hr className="flex-1 border-gray-200" />
              <span className="text-xs text-gray-400">または馬IDを直接入力</span>
              <hr className="flex-1 border-gray-200" />
            </div>

            <div className="flex gap-2">
              <input
                value={horseIdInput}
                onChange={(e) => setHorseIdInput(e.target.value.trim())}
                placeholder="例：2022110134"
                inputMode="numeric"
                className="flex-1 rounded-xl border border-gray-200 px-3 py-3 text-sm focus:border-blue-400 focus:outline-none"
              />
              <button
                onClick={() => horseIdInput && runFetch(horseIdInput)}
                disabled={!horseIdInput}
                className="rounded-xl bg-[#0f1f3d] px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
              >
                取得
              </button>
            </div>

            {canRetry && (
              <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 space-y-1.5">
                <div className="font-semibold">⚠️ 取得に失敗しました</div>
                <div className="text-red-600 break-all">{errorMsg}</div>
                <div className="text-gray-500 pt-1 space-y-1">
                  <div>【対処法】</div>
                  <div>① もう一度「自動検索」を試す（プロキシが混雑している場合は時間をおくと改善します）</div>
                  <div>② <a href={`https://db.netkeiba.com/?pid=horse_list&word=${encodeURIComponent(horse.name)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">こちら</a>で馬IDを確認して直接入力（URLの /horse/<b>XXXXXXXXXX</b>/ の部分）</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-10">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500" />
            <p className="text-center text-sm text-gray-600">{progressMsg || '取得中...'}</p>
            <p className="text-xs text-gray-400">失敗した場合は自動で別のサーバーに切り替えます</p>
          </div>
        )}

        {/* Done */}
        {step === 'done' && (
          <>
            {fetched.length === 0 ? (
              <div className="rounded-xl bg-orange-50 p-4 text-sm space-y-2">
                <div className="font-semibold text-orange-700">
                  {allFetched.length > 0
                    ? `${allFetched.length}件取得しましたが、すでに登録済みです`
                    : 'レース結果が取得できませんでした'}
                </div>
                <div className="text-xs text-orange-600 space-y-1">
                  {allFetched.length === 0 && (
                    <>
                      <div>• 別の馬と混同している可能性があります（同名馬が複数存在する場合）</div>
                      <div>• 馬IDを直接入力すると正確に取得できます</div>
                    </>
                  )}
                  <div>
                    <a
                      href={`https://db.netkeiba.com/?pid=horse_list&word=${encodeURIComponent(horse.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      netkeibaで「{horse.name}」を検索して確認 →
                    </a>
                  </div>
                  {detectedHorseId && (
                    <div className="text-gray-500">
                      使用した馬ID: {detectedHorseId}（
                      <a
                        href={`https://db.netkeiba.com/horse/${detectedHorseId}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        馬ページを確認
                      </a>
                      ）
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setStep('idle')}
                  className="mt-2 w-full rounded-xl bg-orange-100 py-2 text-sm font-semibold text-orange-700"
                >
                  別のIDで再試行
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    {fetched.length}件の新しい結果
                  </span>
                  <button
                    onClick={() =>
                      setSelected(
                        selected.size === fetched.length
                          ? new Set()
                          : new Set(fetched.map((_, i) => i)),
                      )
                    }
                    className="text-xs text-blue-600"
                  >
                    {selected.size === fetched.length ? 'すべて解除' : 'すべて選択'}
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-100">
                  {fetched.map((r, i) => (
                    <label
                      key={i}
                      className={`flex cursor-pointer items-start gap-3 px-3 py-3 transition-colors ${
                        i > 0 ? 'border-t border-gray-50' : ''
                      } ${selected.has(i) ? 'bg-emerald-50' : 'bg-white'}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(i)}
                        onChange={() => {
                          const s = new Set(selected)
                          s.has(i) ? s.delete(i) : s.add(i)
                          setSelected(s)
                        }}
                        className="mt-0.5 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <PositionBadge position={r.position} />
                          <GradeBadge grade={r.grade} />
                          <span className="text-sm font-medium text-gray-800 truncate">{r.raceName}</span>
                        </div>
                        <div className="mt-0.5 text-xs text-gray-500">
                          {r.date} · {r.venue} {r.distance}({r.surface})
                          {r.jockey ? ` · ${r.jockey}` : ''}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {r.prizeMoney > 0 && (
                          <div className="text-xs font-semibold text-emerald-600">
                            ¥{computeOwnerDividend(r.prizeMoney, horse.sharesOwned, horse.totalShares).toLocaleString()}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">{r.time}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-600"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={selected.size === 0}
                    className="flex-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-40"
                  >
                    {selected.size}件をインポート
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}
