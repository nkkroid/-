import { monthlySummaries, financialRecords } from '../data/mockData'

export function FinancialSummary() {
  const totalFees = monthlySummaries.reduce((s, m) => s + m.fees, 0)
  const totalDividends = monthlySummaries.reduce((s, m) => s + m.dividends, 0)
  const totalNet = totalDividends - totalFees

  const maxAbs = Math.max(...monthlySummaries.map((m) => Math.abs(m.net)))

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

      {/* Monthly Chart */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-bold text-gray-800">月次収支グラフ</h2>
        </div>
        <div className="p-5">
          <div className="space-y-3">
            {monthlySummaries.map((m) => (
              <div key={`${m.year}-${m.month}`} className="flex items-center gap-3">
                <div className="w-8 text-right text-xs text-gray-500">{m.month}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    {/* Fees bar (red, left aligned) */}
                    <div className="relative h-5 flex-1">
                      <div
                        className="absolute right-0 h-full rounded-l bg-red-200"
                        style={{ width: `${(m.fees / (maxAbs * 1.2)) * 100}%` }}
                      />
                    </div>
                    {/* Dividends bar (green, right aligned) */}
                    <div className="relative h-5 flex-1">
                      <div
                        className="absolute left-0 h-full rounded-r bg-emerald-200"
                        style={{ width: `${(m.dividends / (maxAbs * 1.2)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className={`w-28 text-right text-sm font-semibold ${m.net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {m.net >= 0 ? '+' : '−'}¥{Math.abs(m.net).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded bg-red-200" />
              維持費
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded bg-emerald-200" />
              配当収入
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
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
                  <td className="px-4 py-3 font-medium text-gray-700">
                    {m.year}年{m.month}
                  </td>
                  <td className="px-4 py-3 text-right text-red-500">
                    −¥{m.fees.toLocaleString()}
                  </td>
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

      {/* Recent Transactions */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-bold text-gray-800">入出金履歴</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {financialRecords.map((rec) => (
            <div key={rec.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                      rec.type === '配当'
                        ? 'bg-emerald-100 text-emerald-700'
                        : rec.type === '維持費'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {rec.type}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{rec.horseName}</span>
                </div>
                <div className="mt-0.5 text-xs text-gray-400">
                  {rec.date} · {rec.description}
                </div>
              </div>
              <div className={`text-sm font-bold ${rec.amount >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {rec.amount >= 0 ? '+' : ''}¥{rec.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
