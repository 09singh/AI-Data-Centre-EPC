import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const menuItems = [
  { to: '/dashboard', icon: 'ti-dashboard', label: 'Dashboard' },
  { to: '/project-hub/documents', icon: 'ti-file-text', label: 'Documents' },
  { to: '/project-hub/schedule', icon: 'ti-calendar', label: 'Schedule' },
  { to: '/project-hub/vendors', icon: 'ti-building', label: 'Vendors' },
  { to: '/project-hub/equipment', icon: 'ti-server', label: 'Equipment' },
  { to: '/ai-intelligence/risk', icon: 'ti-alert-triangle', label: 'Risk Prediction' },
  { to: '/ai-intelligence/compliance', icon: 'ti-shield-check', label: 'Compliance Check' },
  { to: '/ai-intelligence/simulation', icon: 'ti-chart-bar', label: 'What-If Simulator' },
  { to: '/commissioning', icon: 'ti-clipboard-check', label: 'Commissioning' },
  { to: '/reports', icon: 'ti-report', label: 'Reports' },
  { to: '/settings', icon: 'ti-settings', label: 'Settings' },
]

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true)
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/project-hub/documents' || path === '/project-hub/schedule' || path === '/project-hub/vendors' || path === '/project-hub/equipment') {
      return location.pathname === path
    }
    if (path === '/ai-intelligence/risk' || path === '/ai-intelligence/compliance' || path === '/ai-intelligence/simulation') {
      return location.pathname === path
    }
    return location.pathname === path
  }

  return (
    <aside 
      className={`
        flex-shrink-0 border-l border-[var(--border)] bg-[var(--bg)] overflow-hidden transition-all duration-300 relative
        ${expanded ? 'w-52' : 'w-12'}
      `}
    >
      {/* Toggle Button - repositioned */}
      <div className="flex items-center justify-between px-2 py-3 border-b border-[var(--border)] mb-2">
        {expanded && (
          <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-medium">
            Menu
          </span>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-6 h-6 rounded-lg bg-[var(--accent-soft)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-all cursor-pointer flex-shrink-0 ${
            expanded ? 'ml-auto' : 'mx-auto'
          }`}
          title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <i className={`ti ${expanded ? 'ti-chevron-left' : 'ti-chevron-right'} text-xs`} />
        </button>
      </div>

      <div className="flex flex-col h-full px-2 pb-2 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg no-underline text-sm transition-colors mb-0.5 ${
                active 
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]' 
                  : 'text-[var(--muted)] hover:bg-[var(--panel)] hover:text-[var(--text)]'
              }`}
            >
              <i className={`ti ${item.icon} text-base w-5 text-center flex-shrink-0`} />
              {expanded && <span className="truncate">{item.label}</span>}
            </NavLink>
          )
        })}
      </div>
    </aside>
  )
}