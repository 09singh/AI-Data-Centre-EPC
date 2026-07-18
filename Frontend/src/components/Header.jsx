import { Link } from 'react-router-dom'
import { BellIcon } from '@heroicons/react/24/outline'
import { useTheme } from '../context/ThemeContext'
import { useProject } from '../context/ProjectContext'
import ProfileMenu from './ProfileMenu'

export default function Header() {
  const { theme } = useTheme()
  const { selectedProject, projects, setSelectedProject } = useProject()

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
        <div className="pl-3 border-l border-[var(--border)]">
          <select
            value={selectedProject?._id || ''}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="max-w-[240px] truncate rounded-md border border-[var(--border)] bg-[var(--panel)] px-2 py-1 text-xs text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)]"
            aria-label="Select active project"
            title={selectedProject?.name || 'Select active project'}
          >
            {projects.length === 0 ? (
              <option value="">No projects</option>
            ) : (
              projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))
            )}
          </select>
        </div>
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
