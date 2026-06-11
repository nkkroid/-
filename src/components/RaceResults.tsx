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
    selectedHorse === '全て'
      ? raceResults
      : raceResults.filter((r) => r.horseName === selectedHorse)

  const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalDividend = sorted.reduce((s, r) => s + r.ownerDividend, 0)
  const wins = sorted.filter((r) => r.position === 1).length
  const placed = sorted.filter((r) => r.position <= 3).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {horseOptions.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedHorse(name)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedHorse === name
                  ? 'bg-[#0f1f3d] text-white'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          disabled={horses.length === 0}
          className="flex items-center gap-1.5 rounded-lg bg-[#0f1f3d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a3063] disabled:opacity-40"
        >
          ＋ 結果を登録
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-white px-4 py-3 text-center shadow-sm ring-1 ring-gray-200">
          <div className="text-2xl font-bold text-gray-800">{sorted.length}</div>
          <div className="text-xs text-gray-500">出走数</div>
        </div>
        <div className="rounded-lg bg-white px-4 py-3 text-center shadow-sm ring-1 ring-gray-200">
          <div className="text-2xl font-bold text-yellow-500">{wins}</div>
          <div className="text-xs text-gray-500">勝利 ({placed}回連対)</div>
        </div>
        <div className="rounded-lg bg-white px-4 py-3 text-center shadow-sm ring-1 ring-gray-200">
          <div className="text-xl font-bold text-emerald-600">¥{totalDividend.toLocaleString()}</div>
          <div className="text-xs text-gray-500">受取配当合計</div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-200">
          <div className="text-4xl">🏆</div>
          <p className="mt-3 text-sm text-gray-500">レース結果がありません</p>
          {horses.length > 0 && (
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 rounded-lg bg-[#0f1f3d] px-5 py-2 text-sm font-semibold text-white"
            >
              最初の結果を登録する
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">着順</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">日付</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">馬名</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">レース名</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">競馬場</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">コース</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">タイム</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">配当</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map((result) => (
                  <tr key={result.id} className="group hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <PositionBadge position={result.position} />
                        <span className="text-xs text-gray-400">/{result.totalRunners}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">{result.date}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{result.horseName}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <GradeBadge grade={result.grade} />
                        <span className="text-gray-700">{result.raceName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{result.venue}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {result.distance} {result.surface}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-700">{result.time}</td>
                    <td className="px-4 py-3 text-right">
                      {result.ownerDividend > 0 ? (
                        <span className="font-bold text-emerald-600">
                          +¥{result.ownerDividend.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          if (confirm('このレース結果を削除しますか？')) deleteRaceResult(result.id)
                        }}
                        className="hidden text-gray-300 hover:text-red-500 group-hover:block"
                        title="削除"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && (
        <RaceResultForm
          horses={horses}
          onSave={(result) => addRaceResult(result, horses)}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}
