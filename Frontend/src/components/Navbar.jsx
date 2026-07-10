import { NavLink } from 'react-router-dom'
import { HomeIcon, MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline'

const navItemStyle = ({ isActive }) => ({
  fontSize: 13,
  padding: '8px 4px',
  textDecoration: 'none',
  color: isActive ? 'var(--text)' : 'var(--muted)',
  fontWeight: isActive ? 500 : 400,
  borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
  transition: 'color 0.15s, border-color 0.15s',
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
})

export default function Navbar() {
  return (
    <nav className="flex gap-6 px-6 border-b border-[var(--border)] bg-[var(--bg)]">
      <NavLink to="/dashboard" style={navItemStyle}>
        <HomeIcon className="w-4 h-4" />
        Dashboard
      </NavLink>
      <NavLink to="/ai-brain" style={navItemStyle}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        AI Project Brain
      </NavLink>
      <NavLink to="/global-search" style={navItemStyle}>
        <MagnifyingGlassIcon className="w-4 h-4" />
        Global Search
      </NavLink>
      <NavLink to="/notifications" style={navItemStyle}>
        <BellIcon className="w-4 h-4" />
        Notifications
      </NavLink>
    </nav>
  )
}