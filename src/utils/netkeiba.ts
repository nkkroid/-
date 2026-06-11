import type { RaceResult } from '../types'

const PROXIES: Array<{
  name: string
  wrap: (url: string) => string
  parse: (text: string) => string
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
      try { return (JSON.parse(text) as { contents: string }).contents } catch { return text }
    },
  },
  {
    name: 'codetabs',
    wrap: (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    parse: (text) => text,
  },
]

async function fetchWithProxy(url: string, onProgress?: (msg: string) => void): Promise<string> {
  const errors: string[] = []
  for (const proxy of PROXIES) {
    onProgress?.(`${proxy.name} で取得中...`)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 22000)
    try {
      const res = await fetch(proxy.wrap(url), { signal: controller.signal })
      clearTimeout(timer)
      if (!res.ok) { errors.push(`${proxy.name}: HTTP ${res.status}`); continue }
      const text = await res.text()
      const content = proxy.parse(text)
      if (content && content.length > 200) return content
      errors.push(`${proxy.name}: レスポンスが空`)
    } catch (e) {
      clearTimeout(timer)
      errors.push(`${proxy.name}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }
  throw new Error(errors.join(' → '))
}

export async function searchHorseId(name: string, onProgress?: (msg: string) => void): Promise<string | null> {
  const html = await fetchWithProxy(
    `https://db.netkeiba.com/?pid=horse_list&word=${encodeURIComponent(name)}`,
    onProgress,
  )
  const doc = new DOMParser().parseFromString(html, 'text/html')
  for (const a of doc.querySelectorAll('a[href]')) {
    const m = (a.getAttribute('href') ?? '').match(/\/horse\/(\d{6,10})(?:\/|$)/)
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
  const html = await fetchWithProxy(`https://db.netkeiba.com/horse/${horseId}/`, onProgress)
  const doc = new DOMParser().parseFromString(html, 'text/html')

  // Find race results table - try multiple selectors
  const table =
    doc.querySelector('.db_h_race_results') ??
    doc.querySelector('table.nk_tb_common') ??
    doc.querySelector('#contents_liquid table') ??
    Array.from(doc.querySelectorAll('table')).find(
      (t) => t.querySelectorAll('tr').length > 3 && (t.textContent ?? '').includes('着順'),
    )

  if (!table) {
    const tableCount = doc.querySelectorAll('table').length
    const bodyText = doc.body?.textContent?.slice(0, 200) ?? ''
    throw new Error(
      `成績テーブルが見つかりません（テーブル数: ${tableCount}, 先頭テキスト: "${bodyText.replace(/\s+/g, ' ').slice(0, 80)}"）`,
    )
  }

  // === Dynamic column detection from header ===
  const colMap: Record<string, number> = {}
  for (const row of table.querySelectorAll('tr')) {
    const ths = row.querySelectorAll('th')
    if (ths.length === 0) continue
    Array.from(ths).forEach((th, i) => {
      const key = (th.textContent ?? '').trim().replace(/\s+/g, '')
      if (key) colMap[key] = i
    })
    if (Object.keys(colMap).length > 3) break // found the header row
  }

  // Column index lookup with fallbacks
  const col = (names: string[], fallback: number) =>
    names.map((n) => colMap[n]).find((v) => v !== undefined) ?? fallback

  const idxDate     = col(['日付'], 0)
  const idxVenue    = col(['開催'], 1)
  const idxRace     = col(['レース名'], 4)
  const idxRunners  = col(['頭数'], 6)
  const idxPos      = col(['着順'], 11)
  const idxJockey   = col(['騎手'], 12)
  const idxWeight   = col(['斤量'], 13)
  const idxDistance = col(['距離'], 14)
  const idxTime     = col(['タイム'], 17)
  const idxMargin   = col(['着差'], 18)
  const idxPrize    = col(['賞金'], 27)

  const results: FetchedResult[] = []

  // Accept both tr in tbody and tr in table directly
  const rows = Array.from(
    table.querySelectorAll('tbody tr').length > 0
      ? table.querySelectorAll('tbody tr')
      : table.querySelectorAll('tr'),
  )

  for (const row of rows) {
    const tds = row.querySelectorAll('td')
    if (tds.length < 5) continue // skip header/empty rows
    const cells = Array.from(tds).map((td) => (td.textContent ?? '').trim().replace(/\s+/g, ' '))

    // Date: accept "2024/12/01" or "2024年12月1日"
    const rawDate = cells[idxDate] ?? ''
    const dateMatch =
      rawDate.match(/(\d{4})[\/年](\d{1,2})[\/月](\d{1,2})/) ??
      rawDate.match(/(\d{4})(\d{2})(\d{2})/)
    if (!dateMatch) continue
    const date = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`

    // Position
    const posText = cells[idxPos] ?? ''
    const position = parseInt(posText.replace(/[^\d]/g, ''))
    if (!position || isNaN(position) || position > 99) continue

    // Distance + surface
    const distRaw = cells[idxDistance] ?? ''
    const surface: '芝' | 'ダート' =
      distRaw.startsWith('ダ') || distRaw.startsWith('D') || distRaw.includes('ダート')
        ? 'ダート'
        : '芝'
    const distMatch = distRaw.match(/\d+/)
    const distance = distMatch ? `${distMatch[0]}m` : distRaw

    // Prize (万円 → yen)
    const prizeRaw = (cells[idxPrize] ?? '').replace(/,/g, '')
    const prizeMoney = Math.round((parseFloat(prizeRaw) || 0) * 10000)

    const rawRaceName = cells[idxRace] ?? ''
    const grade = parseGrade(rawRaceName)
    const raceName = rawRaceName.replace(/[（(][^）)]*[）)]/g, '').trim() || rawRaceName

    results.push({
      date,
      raceName,
      venue: (cells[idxVenue] ?? '').replace(/\d/g, '').trim(), // remove race number
      position,
      totalRunners: parseInt(cells[idxRunners] ?? '0') || 0,
      jockey: cells[idxJockey] ?? '',
      weight: parseFloat(cells[idxWeight] ?? '55') || 55,
      distance,
      surface,
      grade,
      time: cells[idxTime] ?? '',
      margin: cells[idxMargin] || '—',
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

export function computeOwnerDividend(prizeMoney: number, sharesOwned: number, totalShares: number): number {
  return Math.floor(prizeMoney * 0.8 * (sharesOwned / totalShares))
}
