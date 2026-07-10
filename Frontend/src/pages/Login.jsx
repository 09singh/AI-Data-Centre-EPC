import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { loginUser } from '../services/AuthAPI'

export default function Login() {
  const { login } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [form, setForm] = useState({ 
    company: '', 
    email: '', 
    password: '', 
    role: 'Project Manager', 
    project: '' 
  })
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const getLogo = () => {
    switch(theme) {
      case 'light': return '/light-logo.png'
      case 'dark': return '/dark-logo.png'
      case 'blueprint': return '/blueprint-logo.png'
      default: return '/light-logo.png'
    }
  }

  // Load saved user details from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('savedUserDetails')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        const savedDate = new Date(parsed.timestamp)
        const now = new Date()
        const diffTime = Math.abs(now - savedDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays <= 7) {
          setForm({
            company: parsed.company || '',
            email: parsed.email || '',
            password: parsed.password || '',
            role: parsed.role || 'Project Manager',
            project: parsed.project || ''
          })
          setRememberMe(true)
        } else {
          localStorage.removeItem('savedUserDetails')
        }
      } catch (e) {
        localStorage.removeItem('savedUserDetails')
      }
    }
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.company || !form.email || !form.password || !form.project) {
      return
    }
    setLoading(true)
    const user = await loginUser(form)
    login(user)
    
    if (rememberMe) {
      localStorage.setItem('savedUserDetails', JSON.stringify({
        ...form,
        timestamp: new Date().toISOString()
      }))
    } else {
      localStorage.removeItem('savedUserDetails')
    }
    
    setLoading(false)
    navigate('/dashboard')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      const form = e.target.form
      const index = Array.prototype.indexOf.call(form, e.target)
      if (form.elements[index + 1]) {
        e.preventDefault()
        form.elements[index + 1].focus()
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--accent-soft)] rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--accent-soft)] rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        <form onSubmit={handleSubmit} className="card shadow-2xl relative z-10">
          <button 
            onClick={() => navigate('/')}
            type="button"
            className="absolute -top-8 left-0 text-[var(--muted)] hover:text-[var(--text)] transition-colors flex items-center gap-1.5 text-sm"
          >
            <i className="ti ti-arrow-left text-base" />
            <span>Back to home</span>
          </button>

          <div className="text-center mt-2 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mx-auto mb-4 overflow-hidden">
              <img 
                src={getLogo()} 
                alt="EPC AI Manager" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text)]">Welcome Back</h2>
            <p className="text-sm text-[var(--muted)] mt-1">Access your EPC project dashboard</p>
          </div>

          <div className="space-y-3">
            <input 
              className="input" 
              name="company" 
              placeholder="Company Name" 
              value={form.company}
              onChange={handleChange} 
              onKeyDown={handleKeyDown}
              required 
            />
            <input 
              className="input" 
              name="email" 
              type="email" 
              placeholder="Work Email" 
              value={form.email}
              onChange={handleChange} 
              onKeyDown={handleKeyDown}
              required 
            />
            <input 
              className="input" 
              name="password" 
              type="password" 
              placeholder="Password" 
              value={form.password}
              onChange={handleChange} 
              onKeyDown={handleKeyDown}
              required 
            />
            <select 
              className="input appearance-none" 
              name="role" 
              value={form.role}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            >
              <option>Project Manager</option>
              <option>Engineer</option>
              <option>QA</option>
              <option>Admin</option>
            </select>
            <input 
              className="input" 
              name="project" 
              placeholder="Project Name" 
              value={form.project}
              onChange={handleChange} 
              onKeyDown={handleKeyDown}
              required 
            />
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between mt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] accent-[var(--accent)] cursor-pointer"
              />
              <span className="text-xs text-[var(--muted)]">Remember me for 7 days</span>
            </label>
            <button
              type="button"
              className="text-xs text-[var(--accent)] hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button 
            className="btn w-full mt-4 py-2.5" 
            type="submit" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="spinner w-4 h-4 border-2" />
                Signing in...
              </span>
            ) : (
              'Sign in to Dashboard'
            )}
          </button>

          <p className="text-xs text-[var(--muted)] text-center mt-4">
            By signing in, you agree to our Terms of Service
          </p>
        </form>
      </div>
    </div>
  )
}