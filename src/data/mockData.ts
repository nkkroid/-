import type { Horse, RaceResult, FinancialRecord } from '../types'

const COLORS = [
  '#1e3a5f','#7c3aed','#b45309','#be185d',
  '#065f46','#7f1d1d','#1e40af','#0e7490',
  '#92400e','#4d7c0f','#6b21a8','#374151',
  '#9a3412','#1d4ed8','#047857','#7e22ce',
  '#b91c1c','#0369a1',
]

export const horses: Horse[] = [
  { id: 'h1',  name: 'マリブオレンジ',    sex: '牝', age: 4, status: '現役', stable: '栗東', trainer: '',  sharesOwned: 1, totalShares: 500, investmentAmount: 0, monthlyFee: 0, color: '', sire: '', dam: '', imageColor: COLORS[0],  record: { starts: 0, wins: 0, second: 0, third: 0, earnings: 0 } },
  { id: 'h2',  name: 'ヴァストマーレ',    sex: '牡', age: 2, status: '現役', stable: '栗東', trainer: '',  sharesOwned: 1, totalShares: 500, investmentAmount: 0, monthlyFee: 0, color: '', sire: '', dam: '', imageColor: COLORS[1],  record: { starts: 0, wins: 0, second: 0, third: 0, earnings: 0 } },
  { id: 'h3',  name: 'サヴマ',            sex: '牡', age: 3, status: '現役', stable: '栗東', trainer: '',  sharesOwned: 1, totalShares: 500, investmentAmount: 0, monthlyFee: 0, color: '', sire: '', dam: '', imageColor: COLORS[2],  record: { starts: 0, wins: 0, second: 0, third: 0, earnings: 0 } },
  { id: 'h4',  name: 'リリックラヴ',      sex: '牝', age: 2, status: '現役', stable: '栗東', trainer: '',  sharesOwned: 1, totalShares: 500, investmentAmount: 0, monthlyFee: 0, color: '', sire: '', dam: '', imageColor: COLORS[3],  record: { starts: 0, wins: 0, second: 0, third: 0, earnings: 0 } },
  { id: 'h5',  name: 'フライトコール',    sex: '牡', age: 2, status: '現役', stable: '栗東', trainer: '',  sharesOwned: 1, totalShares: 500, investmentAmount: 0, monthlyFee: 0, color: '', sire: '', dam: '', imageColor: COLORS[4],  record: { starts: 0, wins: 0, second: 0, third: 0, earnings: 0 } },
  { id: 'h6',  name: 'シェーンリヒト',    sex: '牡', age: 2, status: '現役', stable: '美浦', trainer: '',  sharesOwned: 1, totalShares: 500, investmentAmount: 0, monthlyFee: 0, color: '', sire: '', dam: '', imageColor: COLORS[5],  record: { starts: 0, wins: 0, second: 0, third: 0, earnings: 0 } },
  { id: 'h7',  name: 'ヴァロアーク',      sex: '牡', age: 3, status: '現役', stable: '栗東', trainer: '',  sharesOwned: 1, totalShares: 500, investmentAmount: 0, monthlyFee: 0, color: '', sire: '', dam: '', imageColor: COLORS[6],  record: { starts: 0, wins: 0, second: 0, third: 0, earnings: 0 } },
  { id: 'h8',  name: 'ラヴィールルクール', sex: '牡', age: 1, status: '現役', stable: '栗東', trainer: '',  sharesOwned: 1, totalShares: 500, investmentAmount: 0, monthlyFee: 0, color: '', sire: '', dam: '', imageColor: COLORS[7],  record: { starts: 0, wins: 0, second: 0, third: 0, earnings: 0 } },
  { id: 'h9',  name: 'ブルーリュバン',    sex: '牡', age: 3, status: '現役', stable: '栗東', trainer: '',  sharesOwned: 1, totalShares: 500, investmentAmount: 0, monthlyFee: 0, color: '', sire: '', dam: '', imageColor: COLORS[8],  record: { starts: 0, wins: 0, second: 0, third: 0, earnings: 0 } },
  { id: 'h10', name: 'ティンクルバレット', sex: '牝', age: 3, status: '現役', stable: '美浦', trainer: '',  sharesOwned: 1, totalShares: 500, investmentAmount: 0, monthlyFee: 0, color: '', sire: '', dam: '', imageColor: COLORS[9],  record: { starts: 0, wins: 0, second: 0, third: 0, earnings: 0 } },
  { id: 'h11', name: 'バルディリオ',      sex: '牡', age: 2, status: '現役', stable: '栗東', trainer: '',  sharesOwned: 1, totalShares: 500, investmentAmount: 0, monthlyFee: 0, color: '', sire: '', dam: '', imageColor: COLORS[10], record: { starts: 0, wins: 0, second: 0, third: 0, earnings: 0 } },
  { id: 'h12', name: 'ヴェロキタス',      sex: '牡', age: 2, status: '現役', stable: '栗東', trainer: '',  sharesOwned: 1, totalShares: 500, investmentAmount: 0, monthlyFee: 0, color: '', sire: '', dam: '', imageColor: COLORS[11], record: { starts: 0, wins: 0, second: 0, third: 0, earnings: 0 } },
  { id: 'h13', name: 'チャームドウイング', sex: 'セン', age: 3, status: '現役', stable: '栗東', trainer: '', sharesOwned: 1, totalShares: 500, investmentAmount: 0, monthlyFee: 0, color: '', sire: '', dam: '', imageColor: COLORS[12], record: { starts: 0, wins: 0, second: 0, third: 0, earnings: 0 } },
  { id: 'h14', name: 'セラサイト',        sex: '牝', age: 3, status: '現役', stable: '美浦', trainer: '',  sharesOwned: 1, totalShares: 500, investmentAmount: 0, monthlyFee: 0, color: '', sire: '', dam: '', imageColor: COLORS[13], record: { starts: 0, wins: 0, second: 0, third: 0, earnings: 0 } },
  { id: 'h15', name: 'マーズエクレール',  sex: '牡', age: 2, status: '現役', stable: '栗東', trainer: '',  sharesOwned: 1, totalShares: 500, investmentAmount: 0, monthlyFee: 0, color: '', sire: '', dam: '', imageColor: COLORS[14], record: { starts: 0, wins: 0, second: 0, third: 0, earnings: 0 } },
  { id: 'h16', name: 'エピッククイーン',  sex: '牝', age: 3, status: '現役', stable: '栗東', trainer: '',  sharesOwned: 1, totalShares: 500, investmentAmount: 0, monthlyFee: 0, color: '', sire: '', dam: '', imageColor: COLORS[15], record: { starts: 0, wins: 0, second: 0, third: 0, earnings: 0 } },
  { id: 'h17', name: 'リントヴルム',      sex: '牡', age: 2, status: '現役', stable: '栗東', trainer: '',  sharesOwned: 1, totalShares: 500, investmentAmount: 0, monthlyFee: 0, color: '', sire: '', dam: '', imageColor: COLORS[16], record: { starts: 0, wins: 0, second: 0, third: 0, earnings: 0 } },
  { id: 'h18', name: 'ダブルホールド',    sex: '牡', age: 2, status: '現役', stable: '栗東', trainer: '',  sharesOwned: 1, totalShares: 500, investmentAmount: 0, monthlyFee: 0, color: '', sire: '', dam: '', imageColor: COLORS[17], record: { starts: 0, wins: 0, second: 0, third: 0, earnings: 0 } },
]

export const raceResults: RaceResult[] = []
export const financialRecords: FinancialRecord[] = []
