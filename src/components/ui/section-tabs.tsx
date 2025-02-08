import { ReactNode } from 'react'

interface Tab {
  id: string
  name: string
  icon: any
}

interface SectionTabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
}

export default function SectionTabs({ tabs, activeTab, onChange }: SectionTabsProps) {
  return (
    <div className="bg-white rounded-t-lg shadow">
      <div className="border-b border-gray-200">
        <nav className="flex" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`
                  relative min-w-0 flex-1 overflow-hidden py-3 px-4 text-center
                  ${isActive
                    ? 'text-blue-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                  first:rounded-tl-lg
                  focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="font-medium truncate">{tab.name}</span>
                </div>
                {isActive && (
                  <span
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}