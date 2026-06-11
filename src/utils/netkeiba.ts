import type { RaceResult } from '../types'

// Try multiple CORS proxies in order until one works
const PROXIES: Array<{
  wrap: (url: string) => string
  parse: (text: string) => string
  name: string
}> = [
  {
    name: 'corsproxy.io',
    wrap: (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    parse: (text) => text,
  },
  {
    name: 'allorigins',
    wrap: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    parse: (text) => {
      try {
        return (JSON.parse(text) as { contents: string }).contents
      } catch {
        return text
      }
    },
  },
  {
    name: 'codetabs',
    wrap: (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    parse: (text) => text,
  },
]

async function fetchWithProxy(
  url: string,
  onProgress?: (msg: string) => void,
): Promise<string> {
  const errors: string[] = []

  for (const proxy of PROXIES) {
    onProgress?.(`${proxy.name} で取得中...`)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 22000)

    try {
      const res = await fetch(proxy.wrap(url), {
        signal: controller.signal,
        headers: { Accept: 'text/html,application/json,*/*' },
      })
      clearTimeout(timer)

      if (!res.ok) {
        errors.push(`${proxy.name}: HTTP ${res.status}`)
        continue
      }

      const text = await res.text()
      const content = proxy.parse(text)

      if (content && content.length > 200) return content
      errors.push(`${proxy.name}: レスポンスが空`)
    } catch (e) {
      clearTimeout(timer)
      const msg = e instanceof Error ? e.message : String(e)
      errors.push(`${proxy.name}: ${msg}`)
    }
  }

  throw new Error(errors.join(' → '))
}

export async function searchHorseId(
  name: string,
  onProgress?: (msg: string) => void,
): Promise<string | null> {
  const url = `https://db.netkeiba.com/?pid=horse_list&word=${encodeURIComponent(name)}`
  const html = await fetchWithProxy(url, onProgress)
  const doc = new DOMParser().parseFromString(html, 'text/html')

  // Horse links are like /horse/2022110134/
  for (const a of doc.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href') ?? ''
    const m = href.match(/\/horse\/(\d{8,10})(?:\/|$)/)
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

export async function fetchRaceHistory(
  horseId: string,
  onProgress?: (msg: string) => void,
): Promise<FetchedResult[]> {
  const url = `https://db.netkeiba.com/horse/${horseId}/`
  const html = await fetchWithProxy(url, onProgress)
  const doc = new DOMParser().parseFromString(html, 'text/html')

  // Find race results table - try multiple selectors
  const table =
    doc.querySelector('.db_h_race_results') ??
    doc.querySelector('table.nk_tb_common') ??
    doc.querySelector('#contents_liquid table') ??
    doc.querySelector('#contents table')

  if (!table) {
    // Debug: log what tables exist
    const tables = doc.querySelectorAll('table')
    if (tables.length === 0) throw new Error('HTML の取得に成功しましたが、レース成績テーブルが見つかりません（netkeiba のHTML構造が変わった可能性があります）')
    throw new Error(`テーブルは ${tables.length} 個見つかりましたが、成績テーブルが特定できませんでした`)
  }

  const results: FetchedResult[] = []

  for (const row of table.querySelectorAll('tbody tr')) {
    const cells = Array.from(row.querySelectorAll('td')).map((td) =>
      (td.textContent ?? '').trim().replace(/\s+/g, ' '),
    )
    if (cells.length < 18) continue

    // Date: "2025/12/01"
    const dateMatch = cells[0]?.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/)
    if (!dateMatch) continue
    const date = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`

    // Position
    const position = parseInt(cells[11] ?? '')
    if (!position || isNaN(position)) continue

    // Distance + surface
    const distRaw = cells[14] ?? ''
    const surface: '芝' | 'ダート' = distRaw.startsWith('ダ') || distRaw.startsWith('D') ? 'ダート' : '芝'
    const distM = distRaw.match(/\d+/)
    const distance = distM ? `${distM[0]}m` : distRaw

    // Prize in 万円 → yen
    const prizeRaw = (cells[27] ?? cells[cells.length - 1] ?? '').replace(/,/g, '')
    const prizeMoney = Math.round((parseFloat(prizeRaw) || 0) * 10000)

    const rawRaceName = cells[4] ?? ''
    const grade = parseGrade(rawRaceName)
    const raceName = rawRaceName.replace(/[（(][^）)]*[）)]/g, '').trim()

    results.push({
      date,
      raceName: raceName || rawRaceName,
      venue: cells[1] ?? '',
      position,
      totalRunners: parseInt(cells[6] ?? '0') || 0,
      jockey: cells[12] ?? '',
      weight: parseFloat(cells[13] ?? '55') || 55,
      distance,
      surface,
      grade,
      time: cells[17] ?? '',
      margin: cells[18] || '—',
      prizeMoney,
    })
  }

  return results.sort((a, b) => b.date.localeCompare(a.date))
}

function parseGrade(name: string): RaceResult['grade'] {
  if (/G1|ＧⅠ/i.test(name)) return 'G1'
  if (/G2|ＧⅡ/i.test(name)) return 'G2'
  if (/G3|ＧⅢ/i.test(name)) return 'G3'
  if (/オープン|（OP）|\(OP\)|（L）|\(L\)/i.test(name)) return 'OP'
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
