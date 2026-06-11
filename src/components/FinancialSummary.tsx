import { useMemo, useState } from 'react'
import { useStoreContext } from '../context/StoreContext'
import type { FinancialRecord, Horse } from '../types'
import { computeMonthlySummaries } from './Dashboard'

const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
const FIN_TYPES = ['維持費', '配当', '出資金', '一時費用'] as const

export function FinancialSummary() {
  const { horses, financialRecords, addFinancialRecord, deleteFinancialRecord, addMonthlyFees } =
    useStoreContext()

  const monthlySummaries = useMemo(
    () => computeMonthlySummaries(financialRecords),
    [financialRecords],
  )

  const [showFeeForm, setShowFeeForm] = useState(false)
  const [feeYear, setFeeYear] = useState(new Date().getFullYear())
  const [feeMonth, setFeeMonth] = useState(MONTH_NAMES[new Date().getMonth()])

  const totalFees = monthlySummaries.reduce((s, m) => s + m.fees, 0)
  const totalDividends = monthlySummaries.reduce((s, m) => s + m.dividends, 0)
  const totalNet = totalDividends - totalFees

  const maxAbs = Math.max(...monthlySummaries.map((m) => Math.max(m.fees, m.dividends)), 1)

  const activeHorses = horses.filter((h) => h.status === '現役' && h.monthlyFee > 0)
  const totalMonthlyFee = activeHorses.reduce((s, h) => s + h.monthlyFee, 0)

  return (
    <div className="space-y-6">
      {/* Totals */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <div className="text-xs text-gray-400">総維持費</div>
          <div className="mt-1 text-xl font-bold text-red-500">−¥{totalFees.toLocaleString()}</div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <div className="text-xs text-gray-400">総配当収入</div>
          <div className="mt-1 text-xl font-bold text-emerald-600">+¥{totalDividends.toLocaleString()}</div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <div className="text-xs text-gray-400">累計収支</div>
          <div className={`mt-1 text-xl font-bold ${totalNet >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {totalNet >= 0 ? '+' : '−'}¥{Math.abs(totalNet).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Quick: Add monthly fees */}
      {activeHorses.length > 0 && (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-gray-800">月会費を一括登録</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                現役馬 {activeHorses.length}頭 合計 ¥{totalMonthlyFee.toLocaleString()}/月
              </p>
            </div>
            {!showFeeForm && (
              <button
                onClick={() => setShowFeeForm(true)}
                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                ＋ 月会費を登録
              </button>
            )}
          </div>
          {showFeeForm && (
            <div className="p-5">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">年</label>
                  <input
                    type="number"
                    value={feeYear}
                    onChange={(e) => setFeeYear(Number(e.target.value))}
                    className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">月</label>
                  <select
                    value={feeMonth}
                    onChange={(e) => setFeeMonth(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  >
                    {MONTH_NAMES.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      addMonthlyFees(feeMonth, feeYear, activeHorses)
                      setShowFeeForm(false)
                    }}
                    className="rounded-lg bg-[#0f1f3d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a3063]"
                  >
                    登録する
                  </button>
                  <button
                    onClick={() => setShowFeeForm(false)}
                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {activeHorses.map((h) => (
                  <div key={h.id} className="flex justify-between text-xs text-gray-500">
                    <span>{h.name}</span>
                    <span>−¥{h.monthlyFee.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monthly Chart */}
      {monthlySummaries.length > 0 && (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-bold text-gray-800">月次収支グラフ</h2>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {monthlySummaries.map((m) => (
                <div key={`${m.year}-${m.month}`} className="flex items-center gap-3">
                  <div className="w-14 shrink-0 text-right text-xs text-gray-500">
                    {m.year % 100}年{m.month}
                  </div>
                  <div className="flex flex-1 gap-1">
                    <div className="relative h-5 flex-1">
                      <div
                        className="absolute right-0 h-full rounded-l bg-red-200"
                        style={{ width: `${(m.fees / maxAbs) * 100}%` }}
                      />
                    </div>
                    <div className="relative h-5 flex-1">
                      <div
                        className="absolute left-0 h-full rounded-r bg-emerald-200"
                        style={{ width: `${(m.dividends / maxAbs) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className={`w-32 shrink-0 text-right text-sm font-semibold ${m.net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {m.net >= 0 ? '+' : '−'}¥{Math.abs(m.net).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded bg-red-200" />維持費
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded bg-emerald-200" />配当収入
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Monthly table */}
      {monthlySummaries.length > 0 && (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-bold text-gray-800">月次明細</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">月</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">維持費</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">配当収入</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">収支</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...monthlySummaries].reverse().map((m) => (
                  <tr key={`${m.year}-${m.month}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">{m.year}年{m.month}</td>
                    <td className="px-4 py-3 text-right text-red-500">−¥{m.fees.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-emerald-600">
                      {m.dividends > 0 ? `+¥${m.dividends.toLocaleString()}` : '—'}
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${m.net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {m.net >= 0 ? '+' : '−'}¥{Math.abs(m.net).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction log */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-bold text-gray-800">入出金履歴</h2>
          <AddFinancialButton horses={horses} onSave={addFinancialRecord} />
        </div>
        {financialRecords.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">履歴なし</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {[...financialRecords]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((rec) => (
                <div key={rec.id} className="group flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                          rec.type === '配当' ? 'bg-emerald-100 text-emerald-700'
                          : rec.type === '維持費' ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {rec.type}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{rec.horseName}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-gray-400">{rec.date} · {rec.description}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${rec.amount >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {rec.amount >= 0 ? '+' : ''}¥{rec.amount.toLocaleString()}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm('この記録を削除しますか？')) deleteFinancialRecord(rec.id)
                      }}
                      className="hidden text-gray-300 hover:text-red-500 group-hover:block"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

type FinType = typeof FIN_TYPES[number]

function AddFinancialButton({
  horses,
  onSave,
}: {
  horses: Horse[]
  onSave: (rec: Omit<FinancialRecord, 'id'>) => void
}) {
  const [open, setOpen] = useState(false)
  const [horseId, setHorseId] = useState(horses[0]?.id ?? '')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [type, setType] = useState<FinType>('一時費用')
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200"
      >
        ＋ 手動で追加
      </button>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const horse = horses.find((h) => h.id === horseId)
        if (!horse || !amount) return
        const sign = type === '配当' ? 1 : -1
        onSave({
          date,
          horseId,
          horseName: horse.name,
          type,
          amount: sign * Math.abs(Number(amount)),
          description: desc,
        })
        setOpen(false)
        setAmount('')
        setDesc('')
      }}
      className="flex flex-wrap items-end gap-2"
    >
      <select value={horseId} onChange={(e) => setHorseId(e.target.value)} className={inputCls}>
        {horses.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
      </select>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
      <select value={type} onChange={(e) => setType(e.target.value as FinType)} className={inputCls}>
        {FIN_TYPES.map((t) => <option key={t}>{t}</option>)}
      </select>
      <input
        type="number"
        placeholder="金額"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className={`${inputCls} w-28`}
      />
      <input
        placeholder="メモ"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className={`${inputCls} w-40`}
      />
      <button type="submit" className="rounded-lg bg-[#0f1f3d] px-3 py-1.5 text-xs font-semibold text-white">登録</button>
      <button type="button" onClick={() => setOpen(false)} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">取消</button>
    </form>
  )
}

const inputCls = 'rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:border-blue-400 focus:outline-none'
