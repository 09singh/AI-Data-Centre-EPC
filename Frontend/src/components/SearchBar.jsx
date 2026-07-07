import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function SearchBar() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value.trim()) {
      navigate('/global-search')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '6px 12px',
          width: 220,
          transition: 'border-color 0.2s, width 0.2s'
        }}
        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <i className="ti ti-search" style={{ fontSize: 14, color: 'var(--muted)' }} />
        <input
          type="text"
          placeholder="Search documents, vendors, equipment..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{
            border: 'none',
            background: 'none',
            outline: 'none',
            fontSize: 12,
            color: 'var(--text)',
            width: '100%'
          }}
        />
        {value && (
          <i
            className="ti ti-x"
            style={{ fontSize: 14, color: 'var(--muted)', cursor: 'pointer' }}
            onClick={() => setValue('')}
          />
        )}
      </div>
    </form>
  )
}