import { useState } from 'react'
import { useStoreContext } from '../context/StoreContext'
import type { Horse, HorseStatus } from '../types'
import { GradeBadge, StatusBadge } from './Dashboard'
import { HorseForm } from './HorseForm'
import { RaceResultForm } from './RaceResultForm'

const STATUS_FILTERS: (HorseStatus | '全て')[] = ['全て', '現役', '休養中', '引退']

export function HorseList() {
  const { horses, addHorse, updateHorse, deleteHorse, addRaceResult } = useStoreContext()
  const [filter, setFilter] = useState<HorseStatus | '全て'>('全て')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Horse | null>(null)
  const [addResultFor, setAddResultFor] = useState<string | null>(null)

  const filtered = filter === '全て' ? horses : horses.filter((h) => h.status === filter)

  const handleDelete = (horse: Horse) => {
    if (confirm(`「${horse.name}」を削除しますか？関連するレース結果・収支データも削除されます。`)) {
      deleteHorse(horse.id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === s ? 'bg-[#0f1f3d] text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[#0f1f3d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a3063]"
        >
          ＋ 馬を追加
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl bg-white py-16 text-center shadow-sm ring-1 ring-gray-200">
          <div className="text-4xl">🐴</div>
          <p className="mt-3 text-sm text-gray-500">
            {filter === '全て' ? '馬が登録されていません' : `${filter}の馬はいません`}
          </p>
          {filter === '全て' && (
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 rounded-lg bg-[#0f1f3d] px-5 py-2 text-sm font-semibold text-white"
            >
              最初の馬を追加する
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((horse) => (
            <div
              key={horse.id}
              className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
            >
              {/* Header row */}
              <div
                className="flex cursor-pointer items-center justify-between p-5"
                onClick={() => setExpanded(expanded === horse.id ? null : horse.id)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-2xl text-white shrink-0"
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
                      {horse.age}歳 {horse.sex} {horse.color && `(${horse.color})`} · {horse.stable} {horse.trainer}調教師
                    </div>
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-semibold text-gray-700">
                    {horse.record.starts}戦{horse.record.wins}勝
                  </div>
                  <div className="text-xs text-gray-400">
                    [{horse.record.wins}-{horse.record.second}-{horse.record.third}]
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="border-t border-gray-50 px-5 py-3">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Stat label="出資口数" value={`${horse.sharesOwned}口 / ${horse.totalShares}口`} />
                  <Stat label="出資金" value={`¥${horse.investmentAmount.toLocaleString()}`} />
                  <Stat label="月会費" value={horse.monthlyFee > 0 ? `¥${horse.monthlyFee.toLocaleString()}` : '—'} />
                  <Stat label="獲得賞金" value={`¥${horse.record.earnings.toLocaleString()}`} />
                </div>
              </div>

              {/* Next Race */}
              {horse.nextRace && (
                <div className="border-t border-gray-50 bg-blue-50 px-5 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-blue-600">次走</span>
                      <GradeBadge grade={horse.nextRace.grade} />
                      <span className="text-sm font-medium text-gray-700">{horse.nextRace.raceName}</span>
                      {!horse.nextRace.confirmed && (
                        <span className="text-xs text-orange-500">（予定）</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">
                      {horse.nextRace.date} · {horse.nextRace.venue} {horse.nextRace.distance}({horse.nextRace.surface})
                    </span>
                  </div>
                </div>
              )}

              {/* Expanded + Actions */}
              {expanded === horse.id && (
                <div className="border-t border-gray-100 px-5 py-4">
                  {(horse.sire || horse.dam) && (
                    <div className="mb-4 flex flex-wrap gap-x-8 gap-y-1">
                      {horse.sire && <DetailItem label="父" value={horse.sire} />}
                      {horse.dam && <DetailItem label="母" value={horse.dam} />}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`https://db.netkeiba.com/?pid=horse_list&word=${encodeURIComponent(horse.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
                    >
                      📊 netkeibaで検索
                    </a>
                    <button
                      onClick={(e) => { e.stopPropagation(); setAddResultFor(horse.id) }}
                      className="flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-200"
                    >
                      ＋ レース結果を登録
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditing(horse) }}
                      className="flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200"
                    >
                      ✏️ 編集
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(horse) }}
                      className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                    >
                      🗑 削除
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <HorseForm
          onSave={(data) => addHorse(data)}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editing && (
        <HorseForm
          horse={editing}
          onSave={(data) => updateHorse(editing.id, data)}
          onClose={() => setEditing(null)}
        />
      )}
      {addResultFor && (
        <RaceResultForm
          horses={horses}
          defaultHorseId={addResultFor}
          onSave={(result) => addRaceResult(result, horses)}
          onClose={() => setAddResultFor(null)}
        />
      )}
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
      <span className="w-6 text-xs text-gray-400">{label}</span>
      <span className="text-sm text-gray-700">{value}</span>
    </div>
  )
}
