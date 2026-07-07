import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

const searchData = [
  { type: 'document', title: 'specifications.pdf', section: 'Project Hub', path: '/project-hub/documents', icon: 'ti-file-text' },
  { type: 'document', title: 'vendor_submittals.pdf', section: 'Project Hub', path: '/project-hub/documents', icon: 'ti-file-text' },
  { type: 'document', title: 'schedule.csv', section: 'Project Hub', path: '/project-hub/documents', icon: 'ti-file-text' },
  { type: 'document', title: 'procurement.xlsx', section: 'Project Hub', path: '/project-hub/documents', icon: 'ti-file-text' },
  { type: 'vendor', title: 'Voltage Systems Inc.', section: 'Project Hub', path: '/project-hub/vendors', icon: 'ti-building' },
  { type: 'vendor', title: 'CoolFlow Engineering', section: 'Project Hub', path: '/project-hub/vendors', icon: 'ti-building' },
  { type: 'vendor', title: 'SteelCore Industries', section: 'Project Hub', path: '/project-hub/vendors', icon: 'ti-building' },
  { type: 'equipment', title: 'Switchgear unit A', section: 'Project Hub', path: '/project-hub/equipment', icon: 'ti-server' },
  { type: 'equipment', title: 'Cooling tower 1', section: 'Project Hub', path: '/project-hub/equipment', icon: 'ti-server' },
  { type: 'equipment', title: 'Generator set G1', section: 'Project Hub', path: '/project-hub/equipment', icon: 'ti-server' },
  { type: 'task', title: 'Switchgear certification follow-up', section: 'Dashboard', path: '/dashboard', icon: 'ti-checklist' },
  { type: 'task', title: 'Steel delivery status check', section: 'Dashboard', path: '/dashboard', icon: 'ti-checklist' },
  { type: 'ai-insight', title: 'Steel delivery trending 6 days late', section: 'AI Intelligence', path: '/ai-intelligence/risk', icon: 'ti-brain' },
  { type: 'ai-insight', title: 'Switchgear certification missing', section: 'AI Intelligence', path: '/ai-intelligence/compliance', icon: 'ti-brain' },
  { type: 'testing', title: 'Switchgear integration test', section: 'Commissioning', path: '/commissioning', icon: 'ti-clipboard-check' },
  { type: 'testing', title: 'Cooling system commissioning', section: 'Commissioning', path: '/commissioning', icon: 'ti-clipboard-check' },
  { type: 'testing', title: 'Generator load testing', section: 'Commissioning', path: '/commissioning', icon: 'ti-clipboard-check' },
  { type: 'testing', title: 'UPS system testing', section: 'Commissioning', path: '/commissioning', icon: 'ti-clipboard-check' },
]

export default function GlobalSearch() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = (e) => {
    const term = e.target.value
    setSearchTerm(term)
    
    if (term.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    // Simulate search delay
    setTimeout(() => {
      const filtered = searchData.filter(item =>
        item.title.toLowerCase().includes(term.toLowerCase()) ||
        item.type.toLowerCase().includes(term.toLowerCase()) ||
        item.section.toLowerCase().includes(term.toLowerCase())
      )
      setResults(filtered)
      setLoading(false)
    }, 200)
  }

  const handleResultClick = (path) => {
    navigate(path)
  }

  const getResultIcon = (type) => {
    const icons = {
      document: 'ti-file-text',
      vendor: 'ti-building',
      equipment: 'ti-server',
      task: 'ti-checklist',
      'ai-insight': 'ti-brain',
      testing: 'ti-clipboard-check'
    }
    return icons[type] || 'ti-search'
  }

  const getResultColor = (type) => {
    const colors = {
      document: 'text-[var(--accent)]',
      vendor: 'text-[var(--success)]',
      equipment: 'text-[var(--warning)]',
      task: 'text-[var(--muted)]',
      'ai-insight': 'text-[var(--accent)]',
      testing: 'text-[var(--success)]'
    }
    return colors[type] || 'text-[var(--muted)]'
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <p className="text-sm font-medium mb-1">Global Search</p>
        <p className="text-xs text-[var(--muted)] mb-4">
          Search documents, vendors, equipment, tasks, or AI insights
        </p>

        <div className="flex items-center gap-2.5 bg-[var(--panel)] border-2 border-[var(--border)] rounded-xl p-2.5 mb-5 transition-colors focus-within:border-[var(--accent)]">
          <i className="ti ti-search text-lg text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search for anything..."
            value={searchTerm}
            onChange={handleSearch}
            className="border-none bg-transparent outline-none text-sm text-[var(--text)] w-full"
            autoFocus
          />
          {loading && <div className="spinner w-4 h-4 border-2" />}
        </div>

        {results.length > 0 && (
          <div>
            <p className="text-[11px] text-[var(--muted)] uppercase tracking-wider mb-2.5">
              {results.length} result{results.length > 1 ? 's' : ''} found
            </p>
            {results.map((result, i) => (
              <div
                key={i}
                onClick={() => handleResultClick(result.path)}
                className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-xl mb-1.5 cursor-pointer transition-colors hover:bg-[var(--accent-soft)]"
              >
                <div className={`w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0 ${getResultColor(result.type)}`}>
                  <i className={`ti ${getResultIcon(result.type)} text-sm`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium m-0 truncate">{result.title}</p>
                  <p className="text-[11px] text-[var(--muted)] m-0 mt-0.5 capitalize">
                    {result.type} · {result.section}
                  </p>
                </div>
                <i className="ti ti-chevron-right text-sm text-[var(--muted)] flex-shrink-0" />
              </div>
            ))}
          </div>
        )}

        {searchTerm.length >= 2 && results.length === 0 && !loading && (
          <div className="text-center py-10 text-[var(--muted)]">
            <i className="ti ti-search-off text-3xl block mb-2.5" />
            <p className="m-0">No results found for "{searchTerm}"</p>
            <p className="text-xs mt-1">Try searching for documents, vendors, equipment, or testing</p>
          </div>
        )}
      </div>
    </Layout>
  )
}