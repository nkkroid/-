import { useState } from 'react'
import { horses } from '../data/mockData'
import type { HorseStatus } from '../types'
import { GradeBadge, StatusBadge } from './Dashboard'

const STATUS_FILTERS: (HorseStatus | '全て')[] = ['全て', '現役', '休養中', '引退']

export function HorseList() {
  const [filter, setFilter] = useState<HorseStatus | '全て'>('全て')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = filter === '全て' ? horses : horses.filter((h) => h.status === filter)

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === s ? 'bg-navy-900 text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Horse Cards */}
      <div className="space-y-3">
        {filtered.map((horse) => (
          <div
            key={horse.id}
            className="cursor-pointer rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md"
            onClick={() => setSelected(selected === horse.id ? null : horse.id)}
          >
            <div className="flex items-center justify-between p-5">
              {/* Left: Horse info */}
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-2xl text-white"
                  style={{ backgroundColor: horse.imageColor }}
                >
                  🐴
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-800">{horse.name}</span>
                    <StatusBadge status={horse.status} />
                  </div>
                  <div className="mt-0.5 text-sm text-gray-500">
                    {horse.age}歳 {horse.sex} {horse.color} · {horse.stable} {horse.trainer}調教師
                  </div>
                </div>
              </div>

              {/* Right: Record */}
              <div className="hidden text-right sm:block">
                <div className="text-sm font-semibold text-gray-700">
                  {horse.record.starts}戦{horse.record.wins}勝
                </div>
                <div className="text-xs text-gray-400">
                  [{horse.record.wins}-{horse.record.second}-{horse.record.third}]
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="border-t border-gray-50 px-5 py-3">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat label="出資口数" value={`${horse.sharesOwned}口 / ${horse.totalShares}口`} />
                <Stat label="出資金" value={`¥${horse.investmentAmount.toLocaleString()}`} />
                <Stat
                  label="月会費"
                  value={horse.monthlyFee > 0 ? `¥${horse.monthlyFee.toLocaleString()}` : '—'}
                />
                <Stat label="獲得賞金" value={`¥${horse.record.earnings.toLocaleString()}`} />
              </div>
            </div>

            {/* Next Race */}
            {horse.nextRace && (
              <div className="border-t border-gray-50 bg-blue-50 px-5 py-3 last:rounded-b-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-blue-600">次走</span>
                    <GradeBadge grade={horse.nextRace.grade} />
                    <span className="text-sm font-medium text-gray-700">{horse.nextRace.raceName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-600">
                      {horse.nextRace.date} · {horse.nextRace.venue} {horse.nextRace.distance}({horse.nextRace.surface})
                    </span>
                    {!horse.nextRace.confirmed && (
                      <span className="ml-2 text-xs text-orange-500">（予定）</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Expanded Details */}
            {selected === horse.id && (
              <div className="border-t border-gray-100 px-5 py-4">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-4">
                  <DetailItem label="父" value={horse.sire} />
                  <DetailItem label="母" value={horse.dam} />
                  <DetailItem label="調教師" value={horse.trainer} />
                  <DetailItem label="所属" value={horse.stable} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-sm font-semibold text-gray-700">{value}</div>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-8 text-xs text-gray-400">{label}</span>
      <span className="text-sm text-gray-700">{value}</span>
    </div>
  )
}
