import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const mainItems = [
  { to: '/dashboard', icon: 'ti-dashboard', label: 'Dashboard' },
]

const projectItems = [
  { to: '/project-hub', icon: 'ti-folder', label: 'Project Hub' },
  { to: '/project-hub/documents', icon: 'ti-file-text', label: 'Documents' },
  { to: '/project-hub/schedule', icon: 'ti-calendar', label: 'Schedule' },
  { to: '/project-hub/vendors', icon: 'ti-building', label: 'Vendors' },
  { to: '/project-hub/equipment', icon: 'ti-server', label: 'Equipment' },
]

const aiItems = [
  { to: '/ai-intelligence', icon: 'ti-brain', label: 'AI Intelligence' },
  { to: '/ai-intelligence/risk', icon: 'ti-alert-triangle', label: 'Risk Prediction' },
  { to: '/ai-intelligence/compliance', icon: 'ti-shield-check', label: 'Compliance Check' },
  { to: '/ai-intelligence/simulation', icon: 'ti-chart-bar', label: 'What-If Simulator' },
]

const bottomItems = [
  { to: '/commissioning', icon: 'ti-clipboard-check', label: 'Commissioning' },
  { to: '/reports', icon: 'ti-report', label: 'Reports' },
  { to: '/settings', icon: 'ti-settings', label: 'Settings' },
]

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true)

  const renderNavLink = (item) => (
    <NavLink
      key={item.to}
      to={item.to}
      className={({ isActive }) => `
        flex items-center gap-2.5 w-full px-3 py-2 rounded-lg no-underline text-sm transition-colors
        ${isActive 
          ? 'bg-[var(--accent-soft)] text-[var(--accent)]' 
          : 'text-[var(--muted)] hover:bg-[var(--panel)] hover:text-[var(--text)]'
        }
      `}
    >
      <i className={`ti ${item.icon} text-base w-5 text-center flex-shrink-0`} />
      {expanded && <span>{item.label}</span>}
    </NavLink>
  )

  const renderSection = (title, items) => (
    <div className="w-full mb-2">
      {expanded && title && (
        <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider px-3 py-1 mb-1">
          {title}
        </p>
      )}
      {items.map(renderNavLink)}
    </div>
  )

  return (
    <aside 
      className={`
        flex-shrink-0 border-l border-[var(--border)] bg-[var(--bg)] overflow-hidden transition-all duration-200
        ${expanded ? 'w-52' : 'w-12'}
      `}
    >
      <div className="flex flex-col h-full p-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex justify-center items-center py-2 mb-2 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          title={expanded ? 'Collapse' : 'Expand'}
        >
          <i className={`ti ${expanded ? 'ti-chevron-left' : 'ti-chevron-right'} text-base`} />
        </button>

        {renderSection(null, mainItems)}
        {renderSection('Project', projectItems)}
        {renderSection('AI', aiItems)}
        {renderSection(null, bottomItems)}
      </div>
    </aside>
  )
}