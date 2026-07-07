import { Link } from 'react-router-dom'
import ProfileMenu from './ProfileMenu'

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)] bg-[var(--bg)] sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center">
            <i className="ti ti-robot text-lg text-[var(--accent)]" />
          </div>
          <span className="text-base font-semibold text-[var(--text)]">EPC AI Manager</span>
        </Link>
        <span className="text-xs text-[var(--muted)] pl-3 border-l border-[var(--border)]">
          Riverbend Data Centre
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link 
          to="/notifications" 
          className="relative p-2 rounded-lg hover:bg-[var(--panel)] transition-colors text-[var(--muted)] hover:text-[var(--text)]"
          title="Notifications"
        >
          <i className="ti ti-bell text-xl" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--danger)] border-2 border-[var(--bg)]" />
        </Link>
        <div className="w-px h-6 bg-[var(--border)]" />
        <ProfileMenu />
      </div>
    </header>
  )
}