interface TabConfig {
  label: string
  count?: number
}

interface TabsProps {
  tabs: TabConfig[]
  activeIndex?: number
}

// Presentational only — switching tabs is out of scope for this static milestone.
export function Tabs({ tabs, activeIndex = 0 }: TabsProps) {
  return (
    <div className="tabs">
      {tabs.map((tab, index) => (
        <div className={`tab${index === activeIndex ? ' active' : ''}`} key={tab.label}>
          <span>{tab.label}</span>
          {tab.count !== undefined ? <span className="tab-count">{tab.count}</span> : null}
        </div>
      ))}
    </div>
  )
}
