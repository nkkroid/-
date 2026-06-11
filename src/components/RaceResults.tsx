import { useState } from 'react'
import { raceResults } from '../data/mockData'
import { horses } from '../data/mockData'
import { PositionBadge, GradeBadge } from './Dashboard'

export function RaceResults() {
  const [selectedHorse, setSelectedHorse] = useState<string>('全て')

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
      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {horseOptions.map((name) => (
          <button
            key={name}
            onClick={() => setSelectedHorse(name)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedHorse === name
                ? 'bg-navy-900 text-white'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
          >
            {name}
          </button>
        ))}
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
          <div className="text-2xl font-bold text-emerald-600">¥{totalDividend.toLocaleString()}</div>
          <div className="text-xs text-gray-500">受取配当合計</div>
        </div>
      </div>

      {/* Table */}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
