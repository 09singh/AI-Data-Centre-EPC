import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { registerUser } from '../services/AuthAPI'

export default function Register() {
  const { login } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Project Manager',
    companyName: '',
    projectName: ''
  })

  const getLogo = () => {
    switch(theme) {
      case 'light': return '/light-logo.png'
      case 'dark': return '/dark-logo.png'
      case 'blueprint': return '/blueprint-logo.png'
      default: return '/light-logo.png'
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    // Validation
    if (!form.name || !form.email || !form.password || !form.companyName || !form.projectName) {
      setError('Please fill in all required fields')
      return
    }
    
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const userData = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        companyName: form.companyName,
        projectName: form.projectName
      }
      
      const response = await registerUser(userData)
      login(response.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
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
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--accent-soft)] rounded-full blur-3xl " />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--accent-soft)] rounded-full blur-3xl delay-1000" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        <form onSubmit={handleSubmit} className="card shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto">
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
            <h2 className="text-xl font-semibold text-[var(--text)]">Create Account</h2>
            <p className="text-sm text-[var(--muted)] mt-1">Join the EPC AI Platform</p>
          </div>

          {error && (
            <div className="mb-3 p-2 rounded-lg bg-[var(--danger-bg)] text-[var(--danger)] text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <input 
              className="input" 
              name="name" 
              placeholder="Full Name" 
              value={form.name}
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
              placeholder="Password (min 6 characters)" 
              value={form.password}
              onChange={handleChange} 
              onKeyDown={handleKeyDown}
              required 
            />
            <input 
              className="input" 
              name="confirmPassword" 
              type="password" 
              placeholder="Confirm Password" 
              value={form.confirmPassword}
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
              name="companyName" 
              placeholder="Company Name" 
              value={form.companyName}
              onChange={handleChange} 
              onKeyDown={handleKeyDown}
              required 
            />
            <input 
              className="input" 
              name="projectName" 
              placeholder="Project Name" 
              value={form.projectName}
              onChange={handleChange} 
              onKeyDown={handleKeyDown}
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
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          <p className="text-xs text-[var(--muted)] text-center mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--accent)] hover:underline">
              Sign in
            </Link>
          </p>

          <p className="text-xs text-[var(--muted)] text-center mt-2">
            By signing up, you agree to our Terms of Service
          </p>
        </form>
      </div>
    </div>
  )
}