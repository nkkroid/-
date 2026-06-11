import { useState, useMemo } from 'react'
import { useStoreContext } from '../context/StoreContext'
import { Modal } from './Modal'
import type { RaceResult } from '../types'

type Grade = RaceResult['grade']
const VALID_GRADES: Grade[] = ['G1', 'G2', 'G3', 'OP', '3勝', '2勝', '1勝', '未勝利', '新馬']

export interface ImportedResult {
  date: string
  raceName: string
  venue: string
  distance: string
  surface: string
  grade: string
  position: number
  totalRunners: number
  jockey: string
  weight: number
  time: string
  margin: string
  prizeMoney: number
}

export interface ImportPayload {
  horseName: string
  source?: string
  results: ImportedResult[]
}

interface Props {
  data: ImportPayload
  onClose: () => void
}

function resultKey(r: { date: string; raceName: string }) {
  return `${r.date}__${r.raceName}`
}

export function ImportModal({ data, onClose }: Props) {
  const { horses, raceResults, addRaceResult } = useStoreContext()

  const defaultHorse = horses.find((h) => h.name === data.horseName) ?? horses[0]
  const [selectedHorseId, setSelectedHorseId] = useState(defaultHorse?.id ?? '')
  const [manualToggles, setManualToggles] = useState<Record<string, boolean>>({})
  const [selectAll, setSelectAll] = useState(true)

  const selectedHorse = horses.find((h) => h.id === selectedHorseId)
  const nameMatched = horses.some((h) => h.name === data.horseName)

  const resultsWithStatus = useMemo(() => {
    const sorted = [...data.results].sort((a, b) => b.date.localeCompare(a.date))
    return sorted.map((r) => ({
      ...r,
      isDuplicate: raceResults.some(
        (e) => e.horseId === selectedHorseId && e.date === r.date && e.raceName === r.raceName,
      ),
    }))
  }, [data.results, raceResults, selectedHorseId])

  const newCount = resultsWithStatus.filter((r) => !r.isDuplicate).length

  function isChecked(r: { date: string; raceName: string; isDuplicate: boolean }) {
    if (r.isDuplicate) return false
    const k = resultKey(r)
    return k in manualToggles ? manualToggles[k] : selectAll
  }

  function toggleItem(r: { date: string; raceName: string; isDuplicate: boolean }) {
    if (r.isDuplicate) return
    const k = resultKey(r)
    setManualToggles((prev) => ({ ...prev, [k]: !isChecked(r) }))
  }

  function handleToggleAll() {
    setSelectAll((prev) => !prev)
    setManualToggles({})
  }

  function handleHorseChange(id: string) {
    setSelectedHorseId(id)
    setManualToggles({})
    setSelectAll(true)
  }

  const selectedCount = resultsWithStatus.filter((r) => !r.isDuplicate && isChecked(r)).length

  function handleImport() {
    if (!selectedHorse) return
    const toImport = resultsWithStatus.filter((r) => !r.isDuplicate && isChecked(r))
    for (const r of toImport) {
      const grade = VALID_GRADES.includes(r.grade as Grade) ? (r.grade as Grade) : 'OP'
      const surface = r.surface === '芝' || r.surface === 'ダート' ? r.surface : '芝'
      const ownerDividend = Math.floor(
        r.prizeMoney * 0.8 * (selectedHorse.sharesOwned / selectedHorse.totalShares),
      )
      addRaceResult(
        {
          horseId: selectedHorse.id,
          horseName: selectedHorse.name,
          date: r.date,
          raceName: r.raceName,
          venue: r.venue,
          distance: r.distance,
          surface,
          grade,
          position: r.position,
          totalRunners: r.totalRunners,
          jockey: r.jockey,
          weight: r.weight,
          odds: 0,
          prizeMoney: r.prizeMoney,
          ownerDividend,
          time: r.time,
          margin: r.margin || '—',
        },
        horses,
      )
    }
    onClose()
  }

  return (
    <Modal title="レース結果インポート" onClose={onClose} wide>
      <div className="space-y-4">
        {data.source && (
          <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-600">
            取得元: {data.source}
          </div>
        )}

        {/* Horse mapping */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            馬を選択（ページ上の馬名: 「{data.horseName}」）
          </label>
          <select
            value={selectedHorseId}
            onChange={(e) => handleHorseChange(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
          >
            {horses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
          {!nameMatched && (
            <p className="mt-1 text-xs text-amber-600">
              ※ 名前が一致する馬が見つかりませんでした。正しい馬を選択してください。
            </p>
          )}
        </div>

        {/* Results list */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {resultsWithStatus.length}件取得 /{' '}
              <span className="font-semibold text-emerald-600">{newCount}件が新規</span>
            </span>
            {newCount > 0 && (
              <button onClick={handleToggleAll} className="text-xs text-blue-600 underline">
                {selectAll ? '全て解除' : '全て選択'}
              </button>
            )}
          </div>

          {resultsWithStatus.length === 0 ? (
            <div className="rounded-lg bg-gray-50 py-8 text-center text-xs text-gray-400">
              取得データがありません
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1 rounded-lg border border-gray-100 bg-gray-50 p-2">
              {resultsWithStatus.map((r) => (
                <label
                  key={resultKey(r)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg bg-white px-3 py-2 text-xs ${
                    r.isDuplicate ? 'cursor-default opacity-40' : 'active:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked(r)}
                    disabled={r.isDuplicate}
                    onChange={() => toggleItem(r)}
                    className="shrink-0 accent-[#0f1f3d]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`shrink-0 font-bold ${
                          r.position === 1
                            ? 'text-yellow-500'
                            : r.position <= 3
                              ? 'text-emerald-600'
                              : 'text-gray-500'
                        }`}
                      >
                        {r.position}着
                      </span>
                      <span className="truncate font-medium text-gray-800">{r.raceName}</span>
                      {r.prizeMoney > 0 && (
                        <span className="text-emerald-600">
                          ¥{(r.prizeMoney / 10000).toFixed(0)}万
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-gray-400">
                      {r.date} · {r.venue} {r.distance}({r.surface})
                    </div>
                  </div>
                  {r.isDuplicate && (
                    <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-gray-400">
                      登録済
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Dividend preview */}
        {selectedHorse && selectedCount > 0 && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            配当は賞金 × 80% × {selectedHorse.sharesOwned}/{selectedHorse.totalShares}口 で自動計算されます
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-100 py-3 text-sm font-semibold text-gray-600 active:bg-gray-200"
          >
            キャンセル
          </button>
          <button
            onClick={handleImport}
            disabled={selectedCount === 0 || !selectedHorse}
            className="flex-1 rounded-lg bg-[#0f1f3d] py-3 text-sm font-semibold text-white disabled:opacity-40 active:bg-[#1a3063]"
          >
            {selectedCount}件をインポート
          </button>
        </div>
      </div>
    </Modal>
  )
}
