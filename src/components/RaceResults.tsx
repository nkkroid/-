import { useState } from 'react'
import { useStoreContext } from '../context/StoreContext'
import { PositionBadge, GradeBadge } from './Dashboard'
import { RaceResultForm } from './RaceResultForm'

export function RaceResults() {
  const { horses, raceResults, addRaceResult, deleteRaceResult } = useStoreContext()
  const [selectedHorse, setSelectedHorse] = useState<string>('全て')
  const [showAdd, setShowAdd] = useState(false)

  const horseOptions = ['全て', ...horses.map((h) => h.name)]
  const filtered =
    selectedHorse === '全て' ? raceResults : raceResults.filter((r) => r.horseName === selectedHorse)
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date))

  const totalDividend = sorted.reduce((s, r) => s + r.ownerDividend, 0)
  const wins = sorted.filter((r) => r.position === 1).length
  const placed = sorted.filter((r) => r.position <= 3).length

  return (
    <div className="space-y-3">
      {/* Filter */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex overflow-x-auto gap-1.5 pb-0.5">
          {horseOptions.slice(0, 6).map((name) => (
            <button
              key={name}
              onClick={() => setSelectedHorse(name)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedHorse === name
                  ? 'bg-[#0f1f3d] text-white'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200'
              }`}
            >
              {name === '全て' ? '全て' : name}
            </button>
          ))}
          {horseOptions.length > 6 && (
            <select
              value={horseOptions.includes(selectedHorse) && selectedHorse !== '全て' && horseOptions.indexOf(selectedHorse) >= 6 ? selectedHorse : ''}
              onChange={(e) => e.target.value && setSelectedHorse(e.target.value)}
              className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm"
            >
              <option value="">その他…</option>
              {horseOptions.slice(6).map((n) => <option key={n}>{n}</option>)}
            </select>
          )}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          disabled={horses.length === 0}
          className="shrink-0 rounded-lg bg-[#0f1f3d] px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          ＋ 登録
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard value={sorted.length} label="出走数" />
        <StatCard value={wins} label={`勝利 (${placed}連対)`} gold />
        <StatCard value={`¥${(totalDividend / 10000).toFixed(1)}万`} label="受取配当" green />
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl bg-white py-12 text-center shadow-sm ring-1 ring-gray-200">
          <div className="text-4xl">🏆</div>
          <p className="mt-3 text-sm text-gray-500">レース結果がありません</p>
          <p className="mt-1 text-xs text-gray-400">馬カードの「📥 成績を自動取得」で一括インポートできます</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((result) => (
            <div key={result.id} className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
              <div className="flex items-start gap-3 p-4">
                <PositionBadge position={result.position} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <GradeBadge grade={result.grade} />
                    <span className="font-semibold text-gray-800 text-sm">{result.raceName}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                    <span>{result.date}</span>
                    <span>{result.venue} {result.distance}({result.surface})</span>
                    <span>{result.horseName}</span>
                    {result.jockey && <span>{result.jockey}</span>}
                    {result.time && <span>{result.time}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {result.ownerDividend > 0 ? (
                    <div className="text-sm font-bold text-emerald-600">
                      +¥{result.ownerDividend.toLocaleString()}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-300">—</div>
                  )}
                  <div className="text-xs text-gray-400">{result.position}/{result.totalRunners}着</div>
                </div>
              </div>
              <div className="flex justify-end border-t border-gray-50 px-4 py-1.5">
                <button
                  onClick={() => {
                    if (confirm('削除しますか？')) deleteRaceResult(result.id)
                  }}
                  className="text-xs text-gray-300 hover:text-red-500"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <RaceResultForm
          horses={horses}
          onSave={(r) => addRaceResult(r, horses)}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}

function StatCard({ value, label, gold, green }: { value: string | number; label: string; gold?: boolean; green?: boolean }) {
  return (
    <div className="rounded-xl bg-white px-3 py-3 text-center shadow-sm ring-1 ring-gray-200">
      <div className={`text-xl font-bold ${gold ? 'text-yellow-500' : green ? 'text-emerald-600' : 'text-gray-800'}`}>
        {value}
      </div>
      <div className="mt-0.5 text-xs text-gray-500">{label}</div>
    </div>
  )
}
