import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Landing() {
  const { isLoggedIn } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()

  function handleGetStarted() {
    if (isLoggedIn) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  const getLogo = () => {
    switch(theme) {
      case 'light': return '/light-logo.png'
      case 'dark': return '/dark-logo.png'
      case 'blueprint': return '/blueprint-logo.png'
      default: return '/light-logo.png'
    }
  }

  return (
    <div className="app-theme min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--accent-soft)] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--accent-soft)] rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[var(--border)] rounded-full opacity-5 animate-spin-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-[var(--border)] rounded-full opacity-10 animate-spin-slow-reverse" />
      </div>

      {/* Navigation */}
      <header className="relative z-10 flex justify-between items-center px-8 py-4 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center overflow-hidden">
            <img 
              src={getLogo()} 
              alt="EPC AI Manager" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <span className="text-base font-semibold">EPC AI Manager</span>
        </div>
        <button 
          onClick={handleGetStarted}
          className="btn px-6 py-2.5 text-sm font-medium"
        >
          Get Started
        </button>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-80px)] px-8 lg:px-16">
        <div className="flex-1 flex flex-col justify-center py-12 lg:pr-12">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-medium w-fit animate-bounce-slow">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            AI-Powered EPC Platform
          </div>

          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mt-4">
            AI Project Intelligence Platform for 
            <span className="text-[var(--accent)]"> Data Centre EPC Projects</span>
          </h1>

          <p className="text-base lg:text-lg text-[var(--muted)] max-w-xl mt-4 leading-relaxed">
            Upload your specs, schedules, and procurement data — the AI manager cross-compares everything, predicts delays, and recommends fixes in real time.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button 
              onClick={handleGetStarted}
              className="btn px-8 py-3 text-sm font-medium"
            >
              Start Now
            </button>
            <button className="btn-outline px-8 py-3 text-sm font-medium flex items-center gap-2">
              <i className="ti ti-player-play" />
              Watch Demo
            </button>
          </div>

          {/* Workflow with animation */}
          <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-[var(--border)]">
            {['Upload Documents', 'AI Analysis', 'Alerts', 'Recommendations'].map((step, i) => (
              <div key={i} className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <span className="text-sm text-[var(--muted)]">{step}</span>
                {i < 3 && (
                  <i className="ti ti-arrow-right text-[var(--border)] text-sm" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Dashboard Preview */}
        <div className="flex-1 flex items-center justify-center py-12 relative">
          <div className="w-full max-w-lg relative">
            {/* Floating cards animation */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl bg-[var(--accent-soft)] border border-[var(--border)] flex items-center justify-center animate-float">
              <i className="ti ti-file-text text-2xl text-[var(--accent)]" />
            </div>
            <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-2xl bg-[var(--accent-soft)] border border-[var(--border)] flex items-center justify-center animate-float-delay">
              <i className="ti ti-chart-bar text-xl text-[var(--accent)]" />
            </div>
            
            <div className="card shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center overflow-hidden">
                    <img 
                      src={getLogo()} 
                      alt="EPC AI Manager" 
                      className="w-7 h-7 object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">AI Project Brain</p>
                    <p className="text-xs text-[var(--muted)]">Active · Monitoring</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[var(--success-bg)] text-[var(--success)] text-xs font-medium">
                  Live
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--panel)] border border-[var(--border)] animate-pulse-slow">
                  <div className="flex items-center gap-2">
                    <i className="ti ti-alert-triangle text-[var(--warning)]" />
                    <span className="text-sm">Switchgear certification missing</span>
                  </div>
                  <span className="text-xs text-[var(--danger)]">Risk</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <i className="ti ti-checkbox text-[var(--success)]" />
                    <span className="text-sm">12 of 18 delay days recovered</span>
                  </div>
                  <span className="text-xs text-[var(--success)]">Resolved</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <i className="ti ti-brain text-[var(--accent)]" />
                    <span className="text-sm">AI recommending vendor follow-up</span>
                  </div>
                  <span className="text-xs text-[var(--accent)]">Recommendation</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-[var(--muted)]">Health Score</p>
                    <p className="text-lg font-bold">72%</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted)]">Progress</p>
                    <p className="text-lg font-bold">64%</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= 3 ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(12px); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-delay { animation: float-delay 3.5s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; opacity: 0; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-spin-slow-reverse { animation: spin-slow-reverse 25s linear infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  )
}