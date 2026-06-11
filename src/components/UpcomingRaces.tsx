import { horses } from '../data/mockData'
import { GradeBadge, StatusBadge } from './Dashboard'

export function UpcomingRaces() {
  const today = new Date('2026-06-11')

  const scheduled = horses
    .filter((h) => h.nextRace)
    .map((h) => ({ horse: h, race: h.nextRace! }))
    .sort((a, b) => new Date(a.race.date).getTime() - new Date(b.race.date).getTime())

  const getDaysUntil = (dateStr: string) =>
    Math.ceil((new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  const getUrgencyClass = (days: number) => {
    if (days <= 7) return 'border-l-4 border-orange-400 bg-orange-50'
    if (days <= 14) return 'border-l-4 border-yellow-400 bg-yellow-50'
    return 'border-l-4 border-blue-200 bg-white'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-1 rounded bg-orange-400" />
          7日以内
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-1 rounded bg-yellow-400" />
          14日以内
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-1 rounded bg-blue-300" />
          それ以降
        </span>
      </div>

      {scheduled.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center text-gray-400 shadow-sm ring-1 ring-gray-200">
          次走予定はありません
        </div>
      ) : (
        <div className="space-y-3">
          {scheduled.map(({ horse, race }) => {
            const days = getDaysUntil(race.date)
            return (
              <div
                key={horse.id}
                className={`rounded-xl shadow-sm ring-1 ring-gray-200 ${getUrgencyClass(days)}`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-800">{horse.name}</span>
                        <StatusBadge status={horse.status} />
                        {!race.confirmed && (
                          <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-600">
                            予定
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {horse.age}歳 {horse.sex} · {horse.stable} {horse.trainer}調教師
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${days <= 7 ? 'text-orange-500' : days <= 14 ? 'text-yellow-600' : 'text-blue-500'}`}
                      >
                        {days}日後
                      </div>
                      <div className="text-xs text-gray-400">{race.date}</div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg bg-white/70 p-4 ring-1 ring-gray-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <GradeBadge grade={race.grade} />
                      <span className="text-base font-semibold text-gray-800">{race.raceName}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400">競馬場</span>
                        <span className="font-medium">{race.venue}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400">距離</span>
                        <span className="font-medium">{race.distance}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400">馬場</span>
                        <span
                          className={`font-medium ${race.surface === '芝' ? 'text-green-600' : 'text-amber-600'}`}
                        >
                          {race.surface}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Horse Record */}
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                      戦績:{' '}
                      <span className="font-semibold text-gray-700">
                        {horse.record.starts}戦{horse.record.wins}勝
                      </span>{' '}
                      <span className="text-gray-400">
                        [{horse.record.wins}-{horse.record.second}-{horse.record.third}]
                      </span>
                    </span>
                    <span className="text-gray-500">
                      獲得賞金:{' '}
                      <span className="font-semibold text-gray-700">
                        ¥{horse.record.earnings.toLocaleString()}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Retired/resting horses info */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-bold text-gray-800">休養・引退馬</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {horses
            .filter((h) => h.status !== '現役')
            .map((h) => (
              <div key={h.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-white"
                    style={{ backgroundColor: h.imageColor }}
                  >
                    🐴
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{h.name}</span>
                      <StatusBadge status={h.status} />
                    </div>
                    <div className="text-xs text-gray-500">
                      {h.age}歳 {h.sex} · {h.stable} {h.trainer}調教師
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  {h.record.starts}戦{h.record.wins}勝
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
