import { useState } from 'react'
import { useStoreContext } from '../context/StoreContext'
import type { Horse, HorseStatus } from '../types'
import { GradeBadge, StatusBadge } from './Dashboard'
import { HorseForm } from './HorseForm'
import { RaceResultForm } from './RaceResultForm'
import { NetkeibaImport } from './NetkeibaImport'

const STATUS_FILTERS: (HorseStatus | '全て')[] = ['全て', '現役', '休養中', '引退']

export function HorseList() {
  const { horses, addHorse, updateHorse, deleteHorse, addRaceResult } = useStoreContext()
  const [filter, setFilter] = useState<HorseStatus | '全て'>('全て')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Horse | null>(null)
  const [addResultFor, setAddResultFor] = useState<string | null>(null)
  const [importFor, setImportFor] = useState<Horse | null>(null)

  const filtered = filter === '全て' ? horses : horses.filter((h) => h.status === filter)

  const handleDelete = (horse: Horse) => {
    if (confirm(`「${horse.name}」を削除しますか？`)) deleteHorse(horse.id)
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex overflow-x-auto gap-1.5 pb-0.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === s ? 'bg-[#0f1f3d] text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="shrink-0 flex items-center gap-1 rounded-lg bg-[#0f1f3d] px-3 py-2 text-sm font-semibold text-white"
        >
          ＋ 追加
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl bg-white py-12 text-center shadow-sm ring-1 ring-gray-200">
          <div className="text-4xl">🐴</div>
          <p className="mt-3 text-sm text-gray-500">馬が登録されていません</p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 rounded-lg bg-[#0f1f3d] px-5 py-2 text-sm font-semibold text-white"
          >
            最初の馬を追加
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((horse) => (
            <HorseCard
              key={horse.id}
              horse={horse}
              expanded={expanded === horse.id}
              onToggle={() => setExpanded(expanded === horse.id ? null : horse.id)}
              onEdit={() => setEditing(horse)}
              onDelete={() => handleDelete(horse)}
              onAddResult={() => setAddResultFor(horse.id)}
              onImport={() => setImportFor(horse)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <HorseForm onSave={(d) => addHorse(d)} onClose={() => setShowAdd(false)} />
      )}
      {editing && (
        <HorseForm horse={editing} onSave={(d) => updateHorse(editing.id, d)} onClose={() => setEditing(null)} />
      )}
      {addResultFor && (
        <RaceResultForm
          horses={horses}
          defaultHorseId={addResultFor}
          onSave={(r) => addRaceResult(r, horses)}
          onClose={() => setAddResultFor(null)}
        />
      )}
      {importFor && (
        <NetkeibaImport
          horse={importFor}
          onClose={() => setImportFor(null)}
        />
      )}
    </div>
  )
}

function HorseCard({
  horse, expanded, onToggle, onEdit, onDelete, onAddResult, onImport,
}: {
  horse: Horse
  expanded: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  onAddResult: () => void
  onImport: () => void
}) {
  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
      {/* Main row */}
      <button
        className="flex w-full items-center gap-3 p-4 text-left active:bg-gray-50"
        onClick={onToggle}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl text-white"
          style={{ backgroundColor: horse.imageColor }}
        >
          🐴
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-gray-800">{horse.name}</span>
            <StatusBadge status={horse.status} />
          </div>
          <div className="mt-0.5 truncate text-xs text-gray-500">
            {horse.age}歳 {horse.sex}
            {horse.trainer ? ` · ${horse.trainer}調教師` : ''}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-semibold text-gray-700">{horse.record.starts}戦{horse.record.wins}勝</div>
          <div className="text-xs text-gray-400">[{horse.record.wins}-{horse.record.second}-{horse.record.third}]</div>
        </div>
        <span className={`ml-1 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {/* Next race strip */}
      {horse.nextRace && (
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 text-xs">
          <span className="font-semibold text-blue-600">次走</span>
          <GradeBadge grade={horse.nextRace.grade} />
          <span className="font-medium text-gray-700 truncate">{horse.nextRace.raceName}</span>
          <span className="ml-auto shrink-0 text-gray-500">{horse.nextRace.date}</span>
        </div>
      )}

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 px-4 py-3 sm:grid-cols-4">
            <Stat label="出資口数" value={`${horse.sharesOwned}/${horse.totalShares}口`} />
            <Stat label="出資金" value={horse.investmentAmount > 0 ? `¥${horse.investmentAmount.toLocaleString()}` : '未設定'} />
            <Stat label="月会費" value={horse.monthlyFee > 0 ? `¥${horse.monthlyFee.toLocaleString()}` : '未設定'} />
            <Stat label="獲得賞金" value={`¥${horse.record.earnings.toLocaleString()}`} />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 border-t border-gray-50 px-4 py-3">
            <ActionBtn
              emoji="📥"
              label="成績を自動取得"
              cls="bg-emerald-600 text-white"
              onClick={onImport}
            />
            <ActionBtn emoji="＋" label="結果を手入力" cls="bg-gray-100 text-gray-700" onClick={onAddResult} />
            <ActionBtn emoji="✏️" label="編集" cls="bg-blue-50 text-blue-700" onClick={onEdit} />
            <ActionBtn emoji="🗑" label="削除" cls="bg-red-50 text-red-600" onClick={onDelete} />
            <a
              href={`https://db.netkeiba.com/?pid=horse_list&word=${encodeURIComponent(horse.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600"
            >
              🔗 netkeiba
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

function ActionBtn({ emoji, label, cls, onClick }: { emoji: string; label: string; cls: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold ${cls}`}
    >
      {emoji} {label}
    </button>
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
