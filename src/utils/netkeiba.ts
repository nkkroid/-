import type { RaceResult } from '../types'

const PROXY = 'https://api.allorigins.win/get?url='

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(PROXY + encodeURIComponent(url), { signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = (await res.json()) as { contents: string }
  return data.contents
}

export async function searchHorseId(name: string): Promise<string | null> {
  const html = await fetchHtml(
    `https://db.netkeiba.com/?pid=horse_list&word=${encodeURIComponent(name)}`,
  )
  const doc = new DOMParser().parseFromString(html, 'text/html')
  // Horse links are like /horse/2023104567/
  for (const a of doc.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href') ?? ''
    const m = href.match(/\/horse\/(\d{10})/)
    if (m) return m[1]
  }
  return null
}

export interface FetchedResult {
  date: string
  raceName: string
  venue: string
  position: number
  totalRunners: number
  jockey: string
  weight: number
  distance: string
  surface: '芝' | 'ダート'
  grade: string
  time: string
  margin: string
  prizeMoney: number
}

export async function fetchRaceHistory(horseId: string): Promise<FetchedResult[]> {
  const html = await fetchHtml(`https://db.netkeiba.com/horse/${horseId}/`)
  const doc = new DOMParser().parseFromString(html, 'text/html')

  // Try to find the race results table
  const table =
    doc.querySelector('.db_h_race_results') ??
    doc.querySelector('table.nk_tb_common') ??
    doc.querySelector('#contents table')
  if (!table) return []

  const results: FetchedResult[] = []

  for (const row of table.querySelectorAll('tbody tr')) {
    const cells = Array.from(row.querySelectorAll('td')).map((td) =>
      td.textContent?.trim().replace(/\s+/g, ' ') ?? '',
    )
    if (cells.length < 18) continue

    // --- Date: "2025/12/01" → "2025-12-01"
    const rawDate = cells[0] ?? ''
    const dateMatch = rawDate.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/)
    if (!dateMatch) continue
    const date = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`

    // --- Venue (cells[1])
    const venue = cells[1] ?? ''

    // --- Race name (cells[4])
    const rawRaceName = cells[4] ?? ''

    // --- Position (cells[11])
    const posText = cells[11] ?? ''
    const position = parseInt(posText)
    if (!position || isNaN(position)) continue

    // --- Total runners (cells[6])
    const totalRunners = parseInt(cells[6] ?? '0') || 0

    // --- Jockey (cells[12])
    const jockey = cells[12] ?? ''

    // --- Weight / 斤量 (cells[13])
    const weight = parseFloat(cells[13] ?? '55') || 55

    // --- Distance and surface (cells[14]) e.g. "芝2000" "ダ1800"
    const distRaw = cells[14] ?? ''
    const surface: '芝' | 'ダート' = distRaw.startsWith('ダ') ? 'ダート' : '芝'
    const distMatch = distRaw.match(/\d+/)
    const distance = distMatch ? `${distMatch[0]}m` : distRaw

    // --- Time (cells[17])
    const time = cells[17] ?? ''

    // --- Margin / 着差 (cells[18])
    const margin = cells[18] || '—'

    // --- Prize (cells[27]) in 万円
    const prizeRaw = (cells[27] ?? '').replace(/,/g, '')
    const prizeMoney = Math.round((parseFloat(prizeRaw) || 0) * 10000)

    const grade = parseGrade(rawRaceName)
    const raceName = rawRaceName.replace(/[（(][^）)]*[）)]/g, '').trim()

    results.push({
      date,
      raceName,
      venue,
      position,
      totalRunners: totalRunners || 16,
      jockey,
      weight,
      distance,
      surface,
      grade,
      time,
      margin,
      prizeMoney,
    })
  }

  return results.sort((a, b) => b.date.localeCompare(a.date))
}

function parseGrade(name: string): RaceResult['grade'] {
  if (/G1|ＧⅠ/i.test(name)) return 'G1'
  if (/G2|ＧⅡ/i.test(name)) return 'G2'
  if (/G3|ＧⅢ/i.test(name)) return 'G3'
  if (/オープン|OP|（L）|\(L\)/i.test(name)) return 'OP'
  if (/3勝/.test(name)) return '3勝'
  if (/2勝/.test(name)) return '2勝'
  if (/1勝/.test(name)) return '1勝'
  if (/未勝利/.test(name)) return '未勝利'
  if (/新馬/.test(name)) return '新馬'
  return 'OP'
}

export function computeOwnerDividend(
  prizeMoney: number,
  sharesOwned: number,
  totalShares: number,
): number {
  return Math.floor(prizeMoney * 0.8 * (sharesOwned / totalShares))
}
