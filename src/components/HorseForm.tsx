import { useState } from 'react'
import type { Horse, HorseStatus, ScheduledRace } from '../types'
import { Modal } from './Modal'

const HORSE_COLORS = [
  '#1e3a5f', '#7c3aed', '#b45309', '#be185d',
  '#374151', '#065f46', '#7f1d1d', '#1e40af',
  '#0e7490', '#92400e', '#4d7c0f', '#6b21a8',
]

const VENUES = ['東京', '中山', '阪神', '京都', '中京', '小倉', '新潟', '福島', '札幌', '函館', '海外']
const GRADES = ['G1', 'G2', 'G3', 'OP', '3勝', '2勝', '1勝', '未勝利', '新馬']
const SURFACES: ('芝' | 'ダート')[] = ['芝', 'ダート']

type FormData = {
  name: string
  trainer: string
  stable: '栗東' | '美浦'
  sharesOwned: string
  totalShares: string
  investmentAmount: string
  monthlyFee: string
  status: HorseStatus
  age: string
  sex: '牡' | '牝' | 'セン'
  color: string
  sire: string
  dam: string
  imageColor: string
  hasNextRace: boolean
  nextRaceDate: string
  nextRaceName: string
  nextRaceVenue: string
  nextRaceDistance: string
  nextRaceSurface: '芝' | 'ダート'
  nextRaceGrade: string
  nextRaceConfirmed: boolean
}

const DEFAULT_FORM: FormData = {
  name: '',
  trainer: '',
  stable: '栗東',
  sharesOwned: '1',
  totalShares: '500',
  investmentAmount: '',
  monthlyFee: '',
  status: '現役',
  age: '3',
  sex: '牡',
  color: '',
  sire: '',
  dam: '',
  imageColor: HORSE_COLORS[0],
  hasNextRace: false,
  nextRaceDate: '',
  nextRaceName: '',
  nextRaceVenue: '東京',
  nextRaceDistance: '2000m',
  nextRaceSurface: '芝',
  nextRaceGrade: 'OP',
  nextRaceConfirmed: true,
}

interface Props {
  horse?: Horse
  onSave: (data: Omit<Horse, 'id'>) => void
  onClose: () => void
}

export function HorseForm({ horse, onSave, onClose }: Props) {
  const [form, setForm] = useState<FormData>(() => {
    if (!horse) return DEFAULT_FORM
    return {
      name: horse.name,
      trainer: horse.trainer,
      stable: horse.stable as '栗東' | '美浦',
      sharesOwned: String(horse.sharesOwned),
      totalShares: String(horse.totalShares),
      investmentAmount: String(horse.investmentAmount),
      monthlyFee: String(horse.monthlyFee),
      status: horse.status,
      age: String(horse.age),
      sex: horse.sex,
      color: horse.color,
      sire: horse.sire,
      dam: horse.dam,
      imageColor: horse.imageColor,
      hasNextRace: !!horse.nextRace,
      nextRaceDate: horse.nextRace?.date ?? '',
      nextRaceName: horse.nextRace?.raceName ?? '',
      nextRaceVenue: horse.nextRace?.venue ?? '東京',
      nextRaceDistance: horse.nextRace?.distance ?? '2000m',
      nextRaceSurface: (horse.nextRace?.surface ?? '芝') as '芝' | 'ダート',
      nextRaceGrade: horse.nextRace?.grade ?? 'OP',
      nextRaceConfirmed: horse.nextRace?.confirmed ?? true,
    }
  })

  const set = (k: keyof FormData, v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return

    let nextRace: ScheduledRace | undefined
    if (form.hasNextRace && form.nextRaceDate && form.nextRaceName) {
      nextRace = {
        date: form.nextRaceDate,
        raceName: form.nextRaceName,
        venue: form.nextRaceVenue,
        distance: form.nextRaceDistance,
        surface: form.nextRaceSurface,
        grade: form.nextRaceGrade,
        confirmed: form.nextRaceConfirmed,
      }
    }

    onSave({
      name: form.name.trim(),
      trainer: form.trainer.trim(),
      stable: form.stable,
      sharesOwned: Number(form.sharesOwned) || 1,
      totalShares: Number(form.totalShares) || 500,
      investmentAmount: Number(form.investmentAmount) || 0,
      monthlyFee: Number(form.monthlyFee) || 0,
      status: form.status,
      age: Number(form.age) || 3,
      sex: form.sex,
      color: form.color,
      sire: form.sire,
      dam: form.dam,
      imageColor: form.imageColor,
      record: horse?.record ?? { starts: 0, wins: 0, second: 0, third: 0, earnings: 0 },
      nextRace,
    })
    onClose()
  }

  return (
    <Modal title={horse ? '馬を編集' : '馬を追加'} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="馬名 *" colSpan={2}>
            <input
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="例：サンライズアーク"
              className={inputCls}
            />
          </Field>
          <Field label="調教師">
            <input
              value={form.trainer}
              onChange={(e) => set('trainer', e.target.value)}
              placeholder="例：藤原英昭"
              className={inputCls}
            />
          </Field>
          <Field label="所属">
            <select value={form.stable} onChange={(e) => set('stable', e.target.value)} className={inputCls}>
              <option>栗東</option>
              <option>美浦</option>
            </select>
          </Field>
        </div>

        {/* Investment info */}
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="mb-3 text-xs font-semibold text-blue-700">出資情報</div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="出資口数">
              <input
                type="number"
                min={1}
                value={form.sharesOwned}
                onChange={(e) => set('sharesOwned', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="総口数">
              <input
                type="number"
                min={1}
                value={form.totalShares}
                onChange={(e) => set('totalShares', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="出資金額（円）">
              <input
                type="number"
                min={0}
                value={form.investmentAmount}
                onChange={(e) => set('investmentAmount', e.target.value)}
                placeholder="例：100000"
                className={inputCls}
              />
            </Field>
            <Field label="月会費（円）">
              <input
                type="number"
                min={0}
                value={form.monthlyFee}
                onChange={(e) => set('monthlyFee', e.target.value)}
                placeholder="例：50000"
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        {/* Horse profile */}
        <div className="grid grid-cols-3 gap-4">
          <Field label="状態">
            <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls}>
              <option>現役</option>
              <option>休養中</option>
              <option>引退</option>
            </select>
          </Field>
          <Field label="年齢">
            <input
              type="number"
              min={2}
              max={12}
              value={form.age}
              onChange={(e) => set('age', e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="性別">
            <select value={form.sex} onChange={(e) => set('sex', e.target.value)} className={inputCls}>
              <option>牡</option>
              <option>牝</option>
              <option>セン</option>
            </select>
          </Field>
          <Field label="毛色">
            <input
              value={form.color}
              onChange={(e) => set('color', e.target.value)}
              placeholder="例：鹿毛"
              className={inputCls}
            />
          </Field>
          <Field label="父">
            <input
              value={form.sire}
              onChange={(e) => set('sire', e.target.value)}
              placeholder="例：エピファネイア"
              className={inputCls}
            />
          </Field>
          <Field label="母">
            <input
              value={form.dam}
              onChange={(e) => set('dam', e.target.value)}
              placeholder="例：サニーデイズ"
              className={inputCls}
            />
          </Field>
        </div>

        {/* Color picker */}
        <div>
          <div className="mb-2 text-xs font-medium text-gray-600">アイコンカラー</div>
          <div className="flex flex-wrap gap-2">
            {HORSE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set('imageColor', c)}
                className="h-7 w-7 rounded-full ring-2 ring-offset-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  outline: form.imageColor === c ? `3px solid ${c}` : '2px solid transparent',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>
        </div>

        {/* Next race */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={form.hasNextRace}
              onChange={(e) => set('hasNextRace', e.target.checked)}
              className="rounded"
            />
            次走予定を登録する
          </label>
          {form.hasNextRace && (
            <div className="mt-3 rounded-lg bg-gray-50 p-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="レース名" colSpan={2}>
                  <input
                    value={form.nextRaceName}
                    onChange={(e) => set('nextRaceName', e.target.value)}
                    placeholder="例：宝塚記念（G1）"
                    className={inputCls}
                  />
                </Field>
                <Field label="開催日">
                  <input
                    type="date"
                    value={form.nextRaceDate}
                    onChange={(e) => set('nextRaceDate', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="競馬場">
                  <select
                    value={form.nextRaceVenue}
                    onChange={(e) => set('nextRaceVenue', e.target.value)}
                    className={inputCls}
                  >
                    {VENUES.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="距離">
                  <input
                    value={form.nextRaceDistance}
                    onChange={(e) => set('nextRaceDistance', e.target.value)}
                    placeholder="例：2000m"
                    className={inputCls}
                  />
                </Field>
                <Field label="馬場">
                  <select
                    value={form.nextRaceSurface}
                    onChange={(e) => set('nextRaceSurface', e.target.value as '芝' | 'ダート')}
                    className={inputCls}
                  >
                    {SURFACES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="グレード">
                  <select
                    value={form.nextRaceGrade}
                    onChange={(e) => set('nextRaceGrade', e.target.value)}
                    className={inputCls}
                  >
                    {GRADES.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label="確定状況">
                  <select
                    value={form.nextRaceConfirmed ? 'confirmed' : 'tentative'}
                    onChange={(e) => set('nextRaceConfirmed', e.target.value === 'confirmed')}
                    className={inputCls}
                  >
                    <option value="confirmed">確定</option>
                    <option value="tentative">予定</option>
                  </select>
                </Field>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className={`flex-1 ${cancelBtnCls}`}>
            キャンセル
          </button>
          <button type="submit" className={`flex-1 ${submitBtnCls}`}>
            {horse ? '保存する' : '追加する'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function Field({
  label,
  children,
  colSpan,
}: {
  label: string
  children: React.ReactNode
  colSpan?: number
}) {
  return (
    <div className={colSpan === 2 ? 'col-span-2' : ''}>
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
