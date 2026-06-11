import { useMemo } from 'react'
import { useStoreContext } from '../context/StoreContext'
import type { MonthlySummary } from '../types'

export function Dashboard() {
  const { horses, raceResults, financialRecords } = useStoreContext()

  const activeHorses = horses.filter((h) => h.status === '現役')
  const totalInvestment = horses.reduce((s, h) => s + h.investmentAmount, 0)

  const monthlySummaries = useMemo(
    () => computeMonthlySummaries(financialRecords),
    [financialRecords],
  )

  const totalFees = monthlySummaries.reduce((s, m) => s + m.fees, 0)
  const totalDividends = monthlySummaries.reduce((s, m) => s + m.dividends, 0)
  const totalNet = totalDividends - totalFees

  const currentMonth = monthlySummaries[monthlySummaries.length - 1]
  const currentMonthNet = currentMonth ? currentMonth.net : 0

  const recentResults = [...raceResults]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  const upcomingRaces = horses
    .filter((h) => h.nextRace)
    .sort((a, b) => new Date(a.nextRace!.date).getTime() - new Date(b.nextRace!.date).getTime())

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          label="出資馬数"
          value={`${horses.length}頭`}
          sub={`現役 ${activeHorses.length}頭`}
          color="blue"
          icon="🐴"
        />
        <SummaryCard
          label="総出資額"
          value={`¥${totalInvestment.toLocaleString()}`}
          sub={`${horses.reduce((s, h) => s + h.sharesOwned, 0)}口`}
          color="purple"
          icon="💰"
        />
        <SummaryCard
          label="累計収支"
          value={`¥${Math.abs(totalNet).toLocaleString()}`}
          sub={totalNet >= 0 ? '累計黒字' : '累計赤字'}
          color={totalNet >= 0 ? 'green' : 'red'}
          icon={totalNet >= 0 ? '📈' : '📉'}
          negative={totalNet < 0}
        />
        <SummaryCard
          label="今月の収支"
          value={`¥${Math.abs(currentMonthNet).toLocaleString()}`}
          sub={currentMonthNet >= 0 ? '今月黒字' : '今月赤字'}
          color={currentMonthNet >= 0 ? 'green' : 'red'}
          icon="📅"
          negative={currentMonthNet < 0}
        />
      </div>

      {horses.length === 0 && (
        <div className="rounded-xl bg-blue-50 p-8 text-center ring-1 ring-blue-100">
          <div className="text-3xl">🐴</div>
          <p className="mt-2 text-sm font-medium text-blue-700">「出資馬一覧」タブから馬を追加してスタート！</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Results */}
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-bold text-gray-800">直近のレース結果</h2>
          </div>
          {recentResults.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">結果なし</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <PositionBadge position={result.position} />
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{result.horseName}</div>
                      <div className="text-xs text-gray-500">
                        {result.date} {result.raceName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {result.ownerDividend > 0 ? (
                      <span className="text-sm font-bold text-emerald-600">
                        +¥{result.ownerDividend.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Races */}
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-bold text-gray-800">次走予定</h2>
          </div>
          {upcomingRaces.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">次走予定なし</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {upcomingRaces.map((horse) => {
                const race = horse.nextRace!
                const today = new Date()
                const daysUntil = Math.ceil(
                  (new Date(race.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
                )
                return (
                  <div key={horse.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">{horse.name}</span>
                        <GradeBadge grade={race.grade} />
                      </div>
                      <div className="text-xs text-gray-500">
                        {race.venue} {race.distance}({race.surface}) · {race.raceName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">{race.date}</div>
                      <div
                        className={`text-xs font-semibold ${daysUntil <= 7 ? 'text-orange-500' : 'text-gray-400'}`}
                      >
                        あと{daysUntil}日
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Horse Status Grid */}
      {horses.length > 0 && (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-bold text-gray-800">出資馬ステータス</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
            {horses.map((horse) => (
              <div
                key={horse.id}
                className="relative overflow-hidden rounded-lg p-4"
                style={{
                  backgroundColor: horse.imageColor + '15',
                  borderLeft: `4px solid ${horse.imageColor}`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-800">{horse.name}</div>
                    <div className="mt-0.5 text-xs text-gray-500">
                      {horse.age}歳 {horse.sex} / {horse.trainer}
                    </div>
                  </div>
                  <StatusBadge status={horse.status} />
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  {horse.record.starts}戦{horse.record.wins}勝 [{horse.record.wins}-{horse.record.second}-{horse.record.third}]
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  label, value, sub, color, icon, negative = false,
}: {
  label: string; value: string; sub: string; color: string; icon: string; negative?: boolean
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className={`w-fit rounded-lg p-2 text-xl ${colorMap[color]}`}>{icon}</div>
      <div className="mt-3">
        <div className={`text-xl font-bold ${negative ? 'text-red-600' : 'text-gray-800'}`}>
          {negative && '−'}{value}
        </div>
        <div className="mt-0.5 text-xs text-gray-500">{label}</div>
        <div className={`mt-1 text-xs font-medium ${negative ? 'text-red-500' : 'text-gray-400'}`}>{sub}</div>
      </div>
    </div>
  )
}

export function PositionBadge({ position }: { position: number }) {
  if (position === 1)
    return <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-white">1</span>
  if (position === 2)
    return <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-400 text-xs font-bold text-white">2</span>
  if (position === 3)
    return <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-700 text-xs font-bold text-white">3</span>
  return <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">{position}</span>
}

export function GradeBadge({ grade }: { grade: string }) {
  const isG1 = grade.includes('G1')
  const isG2 = grade.includes('G2')
  const isG3 = grade.includes('G3')
  const cls = isG1 ? 'bg-yellow-100 text-yellow-700' : isG2 ? 'bg-purple-100 text-purple-700' : isG3 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
  return <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${cls}`}>{grade.includes('G') ? grade.slice(0, 2) : grade}</span>
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    現役: 'bg-green-100 text-green-700',
    休養中: 'bg-orange-100 text-orange-700',
    引退: 'bg-gray-100 text-gray-500',
  }
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>{status}</span>
}

export function computeMonthlySummaries(
  records: { date: string; amount: number }[],
): MonthlySummary[] {
  const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
  const map = new Map<string, MonthlySummary>()

  records.forEach((rec) => {
    const d = new Date(rec.date)
    const year = d.getFullYear()
    const mi = d.getMonth()
    const key = `${year}-${mi}`
    if (!map.has(key)) map.set(key, { year, month: MONTH_NAMES[mi], fees: 0, dividends: 0, net: 0 })
    const entry = map.get(key)!
    if (rec.amount < 0) entry.fees += Math.abs(rec.amount)
    else entry.dividends += rec.amount
    entry.net = entry.dividends - entry.fees
  })

  return Array.from(map.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return parseInt(a.month) - parseInt(b.month)
  })
}
