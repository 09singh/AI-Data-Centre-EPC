import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUser } from '../services/AuthAPI'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ 
    company: '', 
    email: '', 
    password: '', 
    role: 'Project Manager', 
    project: '' 
  })
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const user = await loginUser(form)
    login(user)
    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--accent-soft)] rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--accent-soft)] rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Back button */}
        <button 
          onClick={() => navigate('/')}
          className="absolute -top-16 left-0 text-[var(--muted)] hover:text-[var(--text)] transition-colors flex items-center gap-2"
        >
          <i className="ti ti-arrow-left text-lg" />
          <span className="text-sm">Back to home</span>
        </button>

        <form onSubmit={handleSubmit} className="card shadow-2xl relative z-10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mx-auto mb-4">
              <i className="ti ti-robot text-3xl text-[var(--accent)]" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text)]">Welcome Back</h2>
            <p className="text-sm text-[var(--muted)] mt-1">Access your EPC project dashboard</p>
          </div>

          <div className="space-y-3">
            <input 
              className="input" 
              name="company" 
              placeholder="Company Name" 
              onChange={handleChange} 
              required 
            />
            <input 
              className="input" 
              name="email" 
              type="email" 
              placeholder="Work Email" 
              onChange={handleChange} 
              required 
            />
            <input 
              className="input" 
              name="password" 
              type="password" 
              placeholder="Password" 
              onChange={handleChange} 
              required 
            />
            <select 
              className="input appearance-none" 
              name="role" 
              onChange={handleChange}
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
              onChange={handleChange} 
              required 
            />
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