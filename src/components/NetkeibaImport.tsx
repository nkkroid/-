import { useState } from 'react'
import type { Horse } from '../types'
import { searchHorseId, fetchRaceHistory, computeOwnerDividend, type FetchedResult } from '../utils/netkeiba'
import { useStoreContext } from '../context/StoreContext'
import { Modal } from './Modal'
import { PositionBadge, GradeBadge } from './Dashboard'

type Step = 'idle' | 'searching' | 'fetching' | 'done' | 'error'

interface Props {
  horse: Horse
  onClose: () => void
}

export function NetkeibaImport({ horse, onClose }: Props) {
  const { addRaceResult, updateHorse, raceResults } = useStoreContext()
  const [step, setStep] = useState<Step>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [fetched, setFetched] = useState<FetchedResult[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [horseIdOverride, setHorseIdOverride] = useState('')

  const existingDates = new Set(
    raceResults.filter((r) => r.horseId === horse.id).map((r) => r.date + r.raceName),
  )

  async function doFetch(horseId: string) {
    setStep('fetching')
    try {
      const results = await fetchRaceHistory(horseId)
      const newResults = results.filter((r) => !existingDates.has(r.date + r.raceName))
      setFetched(newResults)
      setSelected(new Set(newResults.map((_, i) => i)))
      setStep('done')
    } catch (e) {
      setErrorMsg(String(e))
      setStep('error')
    }
  }

  async function handleAuto() {
    setStep('searching')
    setErrorMsg('')
    try {
      const id = await searchHorseId(horse.name)
      if (!id) {
        setErrorMsg('netkeiba で馬が見つかりませんでした。馬IDを直接入力してください。')
        setStep('error')
        return
      }
      await doFetch(id)
    } catch (e) {
      setErrorMsg(`取得に失敗しました: ${String(e)}`)
      setStep('error')
    }
  }

  function handleImport() {
    let starts = 0, wins = 0, second = 0, third = 0, earnings = 0

    for (const [i, result] of fetched.entries()) {
      if (!selected.has(i)) continue
      const dividend = computeOwnerDividend(result.prizeMoney, horse.sharesOwned, horse.totalShares)
      addRaceResult(
        {
          horseId: horse.id,
          horseName: horse.name,
          date: result.date,
          raceName: result.raceName,
          venue: result.venue,
          distance: result.distance,
          surface: result.surface,
          grade: result.grade as import('../types').RaceResult['grade'],
          position: result.position,
          totalRunners: result.totalRunners,
          jockey: result.jockey,
          weight: result.weight,
          odds: 0,
          prizeMoney: result.prizeMoney,
          ownerDividend: dividend,
          time: result.time,
          margin: result.margin,
        },
        [],
      )
      starts += 1
      if (result.position === 1) wins += 1
      if (result.position === 2) second += 1
      if (result.position === 3) third += 1
      earnings += result.prizeMoney
    }

    // Update horse record totals
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

  function toggleAll() {
    if (selected.size === fetched.length) setSelected(new Set())
    else setSelected(new Set(fetched.map((_, i) => i)))
  }

  return (
    <Modal title={`📥 ${horse.name} の成績を取得`} onClose={onClose} wide>
      <div className="space-y-4">
        {/* Explanation */}
        <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
          netkeiba からレース結果を自動取得します。通信に10〜20秒かかる場合があります。
        </div>

        {/* Idle / Error: show fetch button */}
        {(step === 'idle' || step === 'error') && (
          <div className="space-y-3">
            <button
              onClick={handleAuto}
              className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700"
            >
              🔍 「{horse.name}」で自動検索して取得
            </button>

            <div className="flex items-center gap-2">
              <hr className="flex-1 border-gray-200" />
              <span className="text-xs text-gray-400">または馬IDを直接入力</span>
              <hr className="flex-1 border-gray-200" />
            </div>

            <div className="flex gap-2">
              <input
                value={horseIdOverride}
                onChange={(e) => setHorseIdOverride(e.target.value)}
                placeholder="例：2022105737"
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
              />
              <button
                onClick={() => horseIdOverride && doFetch(horseIdOverride)}
                disabled={!horseIdOverride}
                className="rounded-lg bg-[#0f1f3d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                取得
              </button>
            </div>

            {step === 'error' && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
                ⚠️ {errorMsg}
                <div className="mt-1 text-gray-500">
                  netkeiba の馬IDは
                  <a
                    href={`https://db.netkeiba.com/?pid=horse_list&word=${encodeURIComponent(horse.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-blue-600 underline"
                  >
                    こちら
                  </a>
                  から確認できます（URLの /horse/XXXXXXXXXX/ の部分）
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {(step === 'searching' || step === 'fetching') && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <p className="text-sm text-gray-600">
              {step === 'searching' ? '🔍 馬を検索中...' : '📊 レース成績を取得中...'}
            </p>
          </div>
        )}

        {/* Done: show results to import */}
        {step === 'done' && (
          <>
            {fetched.length === 0 ? (
              <div className="rounded-lg bg-gray-50 py-8 text-center text-sm text-gray-500">
                新しいレース結果はありませんでした
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    {fetched.length}件のレース結果が見つかりました
                  </span>
                  <button onClick={toggleAll} className="text-xs text-blue-600">
                    {selected.size === fetched.length ? 'すべて解除' : 'すべて選択'}
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 rounded-lg border border-gray-100">
                  {fetched.map((r, i) => (
                    <label
                      key={i}
                      className={`flex cursor-pointer items-start gap-3 px-3 py-2.5 transition-colors ${
                        selected.has(i) ? 'bg-emerald-50' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(i)}
                        onChange={() => {
                          const s = new Set(selected)
                          if (s.has(i)) s.delete(i)
                          else s.add(i)
                          setSelected(s)
                        }}
                        className="mt-0.5 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <PositionBadge position={r.position} />
                          <GradeBadge grade={r.grade} />
                          <span className="text-sm font-medium text-gray-800 truncate">{r.raceName}</span>
                        </div>
                        <div className="mt-0.5 text-xs text-gray-500">
                          {r.date} · {r.venue} {r.distance}({r.surface}) · {r.jockey}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {r.prizeMoney > 0 ? (
                          <div className="text-xs font-semibold text-emerald-600">
                            ¥{computeOwnerDividend(r.prizeMoney, horse.sharesOwned, horse.totalShares).toLocaleString()}
                          </div>
                        ) : null}
                        <div className="text-xs text-gray-400">{r.time}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-lg bg-gray-100 py-3 text-sm font-semibold text-gray-600"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={selected.size === 0}
                    className="flex-1 rounded-lg bg-emerald-600 py-3 text-sm font-bold text-white disabled:opacity-40"
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
