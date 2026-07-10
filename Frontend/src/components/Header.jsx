import { Link } from 'react-router-dom'
import { BellIcon } from '@heroicons/react/24/outline'
import { useTheme } from '../context/ThemeContext'
import ProfileMenu from './ProfileMenu'

export default function Header() {
  const { theme } = useTheme()

  // Map theme to logo file
  const getLogo = () => {
    switch(theme) {
      case 'light':
        return '/light-logo.png'
      case 'dark':
        return '/dark-logo.png'
      case 'blueprint':
        return '/blueprint-logo.png'
      default:
        return '/light-logo.png'
    }
  }

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)] bg-[var(--bg)] sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-3 no-underline">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center overflow-hidden">
            <img 
              src={getLogo()} 
              alt="EPC AI Manager" 
              className="w-7 h-7 object-contain"
            />
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
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--danger)] border-2 border-[var(--bg)]" />
        </Link>
        <div className="w-px h-6 bg-[var(--border)]" />
        <ProfileMenu />
      </div>
    </header>
  )
}