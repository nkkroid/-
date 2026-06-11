import { useState } from 'react'
import { StoreProvider, useStoreContext } from './context/StoreContext'
import { Dashboard } from './components/Dashboard'
import { HorseList } from './components/HorseList'
import { RaceResults } from './components/RaceResults'
import { FinancialSummary } from './components/FinancialSummary'
import { UpcomingRaces } from './components/UpcomingRaces'

type Tab = 'dashboard' | 'horses' | 'results' | 'financial' | 'upcoming'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'ダッシュボード', icon: '🏠' },
  { id: 'horses', label: '出資馬一覧', icon: '🐴' },
  { id: 'results', label: 'レース結果', icon: '🏆' },
  { id: 'financial', label: '収支管理', icon: '💴' },
  { id: 'upcoming', label: '次走予定', icon: '📅' },
]

function AppInner() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [showMenu, setShowMenu] = useState(false)
  const { isDemo, resetToDemo, clearAll } = useStoreContext()

  const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />
      case 'horses': return <HorseList />
      case 'results': return <RaceResults />
      case 'financial': return <FinancialSummary />
      case 'upcoming': return <UpcomingRaces />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0f1f3d] shadow-lg">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐎</span>
              <div>
                <h1 className="text-base font-bold leading-tight text-white">一口馬主ダッシュボード</h1>
                <p className="text-xs text-blue-300">Horse Investment Manager</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-xs text-blue-300 sm:block">{today}</div>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="rounded-full p-1.5 text-blue-300 hover:bg-white/10"
                  title="設定"
                >
                  ⚙️
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
                    <div className="p-1">
                      {isDemo && (
                        <div className="mb-1 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-600">
                          デモデータ表示中
                        </div>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('デモデータをリセットしますか？')) {
                            resetToDemo()
                            setShowMenu(false)
                          }
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        🔄 デモデータに戻す
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('全データを削除しますか？この操作は取り消せません。')) {
                            clearAll()
                            setShowMenu(false)
                          }
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        🗑 全データを削除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-14 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#0f1f3d] text-[#0f1f3d]'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-6" onClick={() => showMenu && setShowMenu(false)}>
        {renderContent()}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  )
}
