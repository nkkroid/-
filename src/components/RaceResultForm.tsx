import { useState } from 'react'
import type { Horse, RaceResult } from '../types'
import { Modal } from './Modal'

const VENUES = ['東京', '中山', '阪神', '京都', '中京', '小倉', '新潟', '福島', '札幌', '函館', '海外']
const GRADES = ['G1', 'G2', 'G3', 'OP', '3勝', '2勝', '1勝', '未勝利', '新馬'] as const

interface Props {
  horses: Horse[]
  defaultHorseId?: string
  onSave: (result: Omit<RaceResult, 'id'>) => void
  onClose: () => void
}

export function RaceResultForm({ horses, defaultHorseId, onSave, onClose }: Props) {
  const activeHorses = horses.filter((h) => h.status !== '引退')

  const [horseId, setHorseId] = useState(defaultHorseId ?? activeHorses[0]?.id ?? '')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [raceName, setRaceName] = useState('')
  const [venue, setVenue] = useState('東京')
  const [distance, setDistance] = useState('2000m')
  const [surface, setSurface] = useState<'芝' | 'ダート'>('芝')
  const [grade, setGrade] = useState<typeof GRADES[number]>('OP')
  const [position, setPosition] = useState('1')
  const [totalRunners, setTotalRunners] = useState('16')
  const [jockey, setJockey] = useState('')
  const [weight, setWeight] = useState('55')
  const [odds, setOdds] = useState('')
  const [prizeMoney, setPrizeMoney] = useState('')
  const [dividendOverride, setDividendOverride] = useState('')
  const [time, setTime] = useState('')
  const [margin, setMargin] = useState('—')

  const selectedHorse = horses.find((h) => h.id === horseId)

  const computedDividend = selectedHorse && prizeMoney
    ? Math.floor(
        Number(prizeMoney) *
          0.8 *
          (selectedHorse.sharesOwned / selectedHorse.totalShares),
      )
    : 0

  const ownerDividend = dividendOverride !== '' ? Number(dividendOverride) : computedDividend

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!horseId || !raceName.trim()) return
    const horse = horses.find((h) => h.id === horseId)!

    onSave({
      horseId,
      horseName: horse.name,
      date,
      raceName: raceName.trim(),
      venue,
      distance,
      surface,
      grade,
      position: Number(position) || 1,
      totalRunners: Number(totalRunners) || 16,
      jockey: jockey.trim(),
      weight: Number(weight) || 55,
      odds: Number(odds) || 0,
      prizeMoney: Number(prizeMoney) || 0,
      ownerDividend,
      time: time.trim(),
      margin: margin.trim() || '—',
    })
    onClose()
  }

  return (
    <Modal title="レース結果を登録" onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {activeHorses.length === 0 ? (
          <p className="text-center text-sm text-gray-500">先に馬を登録してください</p>
        ) : (
          <>
            {/* Horse select */}
            <Field label="馬">
              <select
                value={horseId}
                onChange={(e) => {
                  setHorseId(e.target.value)
                  setDividendOverride('')
                }}
                className={inputCls}
              >
                {activeHorses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}（{h.sharesOwned}/{h.totalShares}口）
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="日付">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="競馬場">
                <select value={venue} onChange={(e) => setVenue(e.target.value)} className={inputCls}>
                  {VENUES.map((v) => <option key={v}>{v}</option>)}
                </select>
              </Field>
            </div>

            <Field label="レース名 *">
              <input
                required
                value={raceName}
                onChange={(e) => setRaceName(e.target.value)}
                placeholder="例：宝塚記念"
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-3 gap-4">
              <Field label="距離">
                <input
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="例：2000m"
                  className={inputCls}
                />
              </Field>
              <Field label="馬場">
                <select
                  value={surface}
                  onChange={(e) => setSurface(e.target.value as '芝' | 'ダート')}
                  className={inputCls}
                >
                  <option>芝</option>
                  <option>ダート</option>
                </select>
              </Field>
              <Field label="グレード">
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as typeof GRADES[number])}
                  className={inputCls}
                >
                  {GRADES.map((g) => <option key={g}>{g}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field label="着順">
                <input
                  type="number"
                  min={1}
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="頭数">
                <input
                  type="number"
                  min={1}
                  value={totalRunners}
                  onChange={(e) => setTotalRunners(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="単勝オッズ">
                <input
                  type="number"
                  step="0.1"
                  min={1}
                  value={odds}
                  onChange={(e) => setOdds(e.target.value)}
                  placeholder="例：3.5"
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field label="騎手">
                <input
                  value={jockey}
                  onChange={(e) => setJockey(e.target.value)}
                  placeholder="例：川田将雅"
                  className={inputCls}
                />
              </Field>
              <Field label="斤量">
                <input
                  type="number"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="タイム">
                <input
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="例：2:01.5"
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="着差">
                <input
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  placeholder="例：クビ / 0.5"
                  className={inputCls}
                />
              </Field>
              <Field label="賞金（円）">
                <input
                  type="number"
                  min={0}
                  value={prizeMoney}
                  onChange={(e) => {
                    setPrizeMoney(e.target.value)
                    setDividendOverride('')
                  }}
                  placeholder="例：30000000"
                  className={inputCls}
                />
              </Field>
            </div>

            {/* Dividend */}
            <div className="rounded-lg bg-emerald-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700">受取配当額（円）</span>
                {computedDividend > 0 && dividendOverride === '' && (
                  <span className="text-xs text-emerald-600">
                    自動計算：賞金 × 80% × {selectedHorse?.sharesOwned}/{selectedHorse?.totalShares}口
                  </span>
                )}
              </div>
              <input
                type="number"
                min={0}
                value={dividendOverride !== '' ? dividendOverride : computedDividend || ''}
                onChange={(e) => setDividendOverride(e.target.value)}
                placeholder={computedDividend > 0 ? String(computedDividend) : '例：16000'}
                className={inputCls}
              />
              {computedDividend > 0 && dividendOverride === '' && (
                <p className="mt-1.5 text-xs text-emerald-600">
                  自動計算値 ¥{computedDividend.toLocaleString()}（手動で上書き可）
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className={`flex-1 ${cancelBtnCls}`}>
                キャンセル
              </button>
              <button type="submit" className={`flex-1 ${submitBtnCls}`}>
                登録する
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400'
const submitBtnCls =
  'rounded-lg bg-[#0f1f3d] py-2.5 text-sm font-semibold text-white hover:bg-[#1a3063] transition-colors'
const cancelBtnCls =
  'rounded-lg bg-gray-100 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors'
