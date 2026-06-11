export type HorseStatus = '現役' | '休養中' | '引退'

export interface Horse {
  id: string
  name: string
  trainer: string
  stable: string
  sharesOwned: number
  totalShares: number
  investmentAmount: number
  monthlyFee: number
  status: HorseStatus
  age: number
  sex: '牡' | '牝' | 'セン'
  color: string
  sire: string
  dam: string
  record: {
    starts: number
    wins: number
    second: number
    third: number
    earnings: number
  }
  nextRace?: ScheduledRace
  imageColor: string
}

export interface RaceResult {
  id: string
  horseId: string
  horseName: string
  date: string
  raceName: string
  venue: string
  distance: string
  surface: '芝' | 'ダート'
  grade: 'G1' | 'G2' | 'G3' | 'OP' | '3勝' | '2勝' | '1勝' | '未勝利' | '新馬'
  position: number
  totalRunners: number
  jockey: string
  weight: number
  odds: number
  prizeMoney: number
  ownerDividend: number
  time: string
  margin: string
}

export interface ScheduledRace {
  date: string
  raceName: string
  venue: string
  distance: string
  surface: '芝' | 'ダート'
  grade: string
  confirmed: boolean
}

export interface MonthlySummary {
  month: string
  year: number
  fees: number
  dividends: number
  net: number
}

export interface FinancialRecord {
  id: string
  date: string
  horseId: string
  horseName: string
  type: '維持費' | '配当' | '出資金' | '一時費用'
  amount: number
  description: string
}
