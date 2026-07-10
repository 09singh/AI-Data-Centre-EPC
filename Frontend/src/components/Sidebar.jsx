import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  HomeIcon,
  DocumentTextIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

const menuItems = [
  { to: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
  { to: '/project-hub/documents', icon: DocumentTextIcon, label: 'Documents' },
  { to: '/project-hub/schedule', icon: CalendarIcon, label: 'Schedule' },
  { to: '/project-hub/vendors', icon: BuildingOfficeIcon, label: 'Vendors' },
  { to: '/project-hub/equipment', icon: ServerIcon, label: 'Equipment' },
  { to: '/ai-intelligence/risk', icon: ExclamationTriangleIcon, label: 'Risk Prediction' },
  { to: '/ai-intelligence/compliance', icon: ShieldCheckIcon, label: 'Compliance Check' },
  { to: '/ai-intelligence/simulation', icon: ChartBarIcon, label: 'What-If Simulator' },
  { to: '/commissioning', icon: ClipboardDocumentCheckIcon, label: 'Commissioning' },
  { to: '/reports', icon: DocumentTextIcon, label: 'Reports' },
  { to: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
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
          {expanded ? (
            <ChevronLeftIcon className="w-3.5 h-3.5" />
          ) : (
            <ChevronRightIcon className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      <div className="flex flex-col h-full px-2 pb-2 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.to)
          const Icon = item.icon
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
              <Icon className="w-5 h-5 flex-shrink-0" />
              {expanded && <span className="truncate">{item.label}</span>}
            </NavLink>
          )
        })}
      </div>
    </aside>
  )
}