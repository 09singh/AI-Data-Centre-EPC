import { NavLink } from 'react-router-dom'

const navItemStyle = ({ isActive }) => ({
  fontSize: 13,
  padding: '8px 4px',
  textDecoration: 'none',
  color: isActive ? 'var(--text)' : 'var(--muted)',
  fontWeight: isActive ? 500 : 400,
  borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
  transition: 'color 0.15s, border-color 0.15s'
})

export default function Navbar() {
  return (
    <nav className="flex gap-6 px-6 border-b border-[var(--border)] bg-[var(--bg)]">
      <NavLink to="/dashboard" style={navItemStyle}>Dashboard</NavLink>
      <NavLink to="/ai-brain" style={navItemStyle}>AI Project Brain</NavLink>
      <NavLink to="/global-search" style={navItemStyle}>Global Search</NavLink>
      <NavLink to="/notifications" style={navItemStyle}>Notifications</NavLink>
    </nav>
  )
}