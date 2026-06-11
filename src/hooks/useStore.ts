import { useState, useCallback } from 'react'
import type { Horse, RaceResult, FinancialRecord } from '../types'
import {
  horses as demoHorses,
  raceResults as demoResults,
  financialRecords as demoRecords,
} from '../data/mockData'

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    if (v !== null) return JSON.parse(v) as T
  } catch {}
  return fallback
}

function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data))
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function useStore() {
  const [horses, setHorses] = useState<Horse[]>(() => load('hm_horses', demoHorses))
  const [raceResults, setRaceResults] = useState<RaceResult[]>(() =>
    load('hm_results', demoResults),
  )
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>(() =>
    load('hm_financials', demoRecords),
  )
  const [isDemo] = useState<boolean>(() => !localStorage.getItem('hm_horses'))

  const addHorse = useCallback((horse: Omit<Horse, 'id'>) => {
    const next_horse = { ...horse, id: uid() }
    setHorses((prev) => {
      const next = [...prev, next_horse]
      save('hm_horses', next)
      return next
    })
  }, [])

  const updateHorse = useCallback((id: string, updates: Partial<Horse>) => {
    setHorses((prev) => {
      const next = prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
      save('hm_horses', next)
      return next
    })
  }, [])

  const deleteHorse = useCallback((id: string) => {
    setHorses((prev) => {
      const next = prev.filter((h) => h.id !== id)
      save('hm_horses', next)
      return next
    })
    setRaceResults((prev) => {
      const next = prev.filter((r) => r.horseId !== id)
      save('hm_results', next)
      return next
    })
    setFinancialRecords((prev) => {
      const next = prev.filter((r) => r.horseId !== id)
      save('hm_financials', next)
      return next
    })
  }, [])

  const addRaceResult = useCallback(
    (result: Omit<RaceResult, 'id'>, horsesSnapshot: Horse[]) => {
      const newResult = { ...result, id: uid() }
      setRaceResults((prev) => {
        const next = [...prev, newResult]
        save('hm_results', next)
        return next
      })

      // Auto-update horse record stats
      setHorses((prev) => {
        const next = prev.map((h) => {
          if (h.id !== result.horseId) return h
          const rec = { ...h.record }
          rec.starts += 1
          if (result.position === 1) rec.wins += 1
          if (result.position === 2) rec.second += 1
          if (result.position === 3) rec.third += 1
          rec.earnings += result.prizeMoney
          return { ...h, record: rec }
        })
        save('hm_horses', next)
        return next
      })

      // Auto-add dividend financial record
      if (result.ownerDividend > 0) {
        const fin: FinancialRecord = {
          id: uid(),
          date: result.date,
          horseId: result.horseId,
          horseName: result.horseName,
          type: '配当',
          amount: result.ownerDividend,
          description: `${result.raceName} ${result.position}着配当`,
        }
        setFinancialRecords((prev) => {
          const next = [...prev, fin]
          save('hm_financials', next)
          return next
        })
      }
      void horsesSnapshot
    },
    [],
  )

  const deleteRaceResult = useCallback((id: string) => {
    setRaceResults((prev) => {
      const next = prev.filter((r) => r.id !== id)
      save('hm_results', next)
      return next
    })
  }, [])

  const addFinancialRecord = useCallback((record: Omit<FinancialRecord, 'id'>) => {
    const newRec = { ...record, id: uid() }
    setFinancialRecords((prev) => {
      const next = [...prev, newRec]
      save('hm_financials', next)
      return next
    })
  }, [])

  const deleteFinancialRecord = useCallback((id: string) => {
    setFinancialRecords((prev) => {
      const next = prev.filter((r) => r.id !== id)
      save('hm_financials', next)
      return next
    })
  }, [])

  const addMonthlyFees = useCallback((month: string, year: number, activeHorses: Horse[]) => {
    const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
    const monthIdx = monthNames.indexOf(month)
    const paddedMonth = String(monthIdx + 1).padStart(2, '0')
    const dateStr = `${year}-${paddedMonth}-01`

    activeHorses
      .filter((h) => h.status === '現役' && h.monthlyFee > 0)
      .forEach((h) => {
        const rec: FinancialRecord = {
          id: uid(),
          date: dateStr,
          horseId: h.id,
          horseName: h.name,
          type: '維持費',
          amount: -h.monthlyFee,
          description: `${year}年${month}分月会費`,
        }
        setFinancialRecords((prev) => {
          const next = [...prev, rec]
          save('hm_financials', next)
          return next
        })
      })
  }, [])

  const resetToDemo = useCallback(() => {
    setHorses(demoHorses)
    setRaceResults(demoResults)
    setFinancialRecords(demoRecords)
    save('hm_horses', demoHorses)
    save('hm_results', demoResults)
    save('hm_financials', demoRecords)
  }, [])

  const clearAll = useCallback(() => {
    setHorses([])
    setRaceResults([])
    setFinancialRecords([])
    save('hm_horses', [])
    save('hm_results', [])
    save('hm_financials', [])
  }, [])

  return {
    horses,
    raceResults,
    financialRecords,
    isDemo,
    addHorse,
    updateHorse,
    deleteHorse,
    addRaceResult,
    deleteRaceResult,
    addFinancialRecord,
    deleteFinancialRecord,
    addMonthlyFees,
    resetToDemo,
    clearAll,
  }
}

export type Store = ReturnType<typeof useStore>
