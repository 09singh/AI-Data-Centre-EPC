import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function ProfileMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'O'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="relative group">
      <div className="flex items-center gap-2 cursor-pointer">
        <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-sm font-semibold">
          {initial}
        </div>
        <i className="ti ti-chevron-down text-xs text-[var(--muted)] group-hover:rotate-180 transition-transform" />
      </div>
      
      <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[var(--panel)] border border-[var(--border)] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
        <div className="p-3 border-b border-[var(--border)]">
          <p className="text-sm font-medium">{user?.name || 'User'}</p>
          <p className="text-xs text-[var(--muted)]">{user?.email || 'user@example.com'}</p>
          <p className="text-xs text-[var(--accent)] mt-1">{user?.role || 'Project Manager'}</p>
        </div>
        <div className="p-1">
          <button 
            onClick={() => navigate('/settings')}
            className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] transition-colors flex items-center gap-2"
          >
            <i className="ti ti-settings text-sm" />
            Settings
          </button>
          <button 
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] transition-colors flex items-center gap-2"
          >
            <i className="ti ti-logout text-sm" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}