import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Footer from '../components/Footer'
import AlertCard from '../components/AlertCards'
import Loader from '../components/Loader'
import Timeline from '../components/Timeline'
import { ProgressChart } from '../components/Charts'
import { Button } from '../components/Buttons'
import { getDashboardData } from '../services/DashboardAPI'

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)

  useEffect(() => {
    getDashboardData().then(setData)
  }, [])

  if (!data) return (
    <Layout>
      <Loader />
    </Layout>
  )

  // Risk trend data for mini chart
  const riskTrend = [4, 5, 3, 6, 4, 7, 5]

  // Milestone data for notebook chart
  const milestoneData = [
    { phase: 'Design', status: 'complete', progress: 100 },
    { phase: 'Procurement', status: 'complete', progress: 100 },
    { phase: 'Construction', status: 'active', progress: 65 },
    { phase: 'Commissioning', status: 'upcoming', progress: 15 }
  ]

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <p className="text-[11px] text-[var(--muted)] uppercase tracking-wider m-0">
            Mission Control
          </p>
          <p className="text-lg font-semibold m-0 mt-0.5">Riverbend Data Centre</p>
        </div>
        <Button 
          onClick={() => navigate('/ai-brain')}
          className="flex items-center gap-1.5"
        >
          <i className="ti ti-robot text-sm" />
          Ask AI
        </Button>
      </div>

      {/* Premium Executive Workspace - Upper Section */}
      {/* Row 1: Health Score (Notepad Chart) + Active Risks (with Trend) - 2 columns */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        
        {/* Health Score - Notepad Style with Milestone Tracker */}
        <div className="card relative overflow-hidden p-5">
          {/* Paper texture background */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(0,0,0,0.05) 23px, rgba(0,0,0,0.05) 24px)`,
            pointerEvents: 'none'
          }} />
          
          {/* Pin corner decoration */}
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[var(--accent)]/20 border-2 border-[var(--accent)]/40 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium m-0">Health Score</p>
              <span className="text-sm font-bold text-[var(--accent)]">{data.healthScore || 72}%</span>
            </div>
            
            {/* Milestone Tracker - Notebook Style */}
            <div className="space-y-2.5">
              {milestoneData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                    {item.status === 'complete' && (
                      <div className="w-5 h-5 rounded-full bg-[var(--success-bg)] border-2 border-[var(--success)] flex items-center justify-center">
                        <i className="ti ti-check text-[10px] text-[var(--success)]" />
                      </div>
                    )}
                    {item.status === 'active' && (
                      <div className="w-5 h-5 rounded-full bg-[var(--warning-bg)] border-2 border-[var(--warning)] flex items-center justify-center animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-[var(--warning)]" />
                      </div>
                    )}
                    {item.status === 'upcoming' && (
                      <div className="w-5 h-5 rounded-full bg-[var(--border)] border-2 border-[var(--border)] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${
                        item.status === 'complete' ? 'text-[var(--success)]' :
                        item.status === 'active' ? 'text-[var(--text)]' :
                        'text-[var(--muted)]'
                      }`}>
                        {item.phase}
                      </span>
                      <span className="text-[10px] text-[var(--muted)]">{item.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--border)] mt-0.5">
                      <div 
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${item.progress}%`,
                          background: item.status === 'complete' ? 'var(--success)' :
                                     item.status === 'active' ? 'var(--warning)' : 'var(--border)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Status Note */}
            <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[10px] text-[var(--accent)] border border-[var(--accent)]/20">
              <i className="ti ti-robot text-[10px]" />
              <span>AI Status: {data.healthScore >= 70 ? 'Stable' : 'Needs Attention'}</span>
            </div>
          </div>
        </div>

        {/* Active Risks - With Trend Chart */}
        <div className="card p-5 relative overflow-hidden">
          {/* Blueprint-style background */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            pointerEvents: 'none'
          }} />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium m-0">Active Risks</p>
              <span className="text-sm font-bold text-[var(--danger)]">{data.activeRisks || 4}</span>
            </div>
            
            {/* Priority Chips */}
            <div className="flex gap-2 flex-wrap mb-3">
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--danger-bg)] text-[var(--danger)] border border-[var(--danger)]/20 flex items-center gap-1">
                <i className="ti ti-alert-circle text-[10px]" />
                Critical (2)
              </span>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning)]/20 flex items-center gap-1">
                <i className="ti ti-alert-triangle text-[10px]" />
                High (3)
              </span>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20 flex items-center gap-1">
                <i className="ti ti-info-circle text-[10px]" />
                Medium (2)
              </span>
            </div>

            {/* Mini Trend Chart - Larger */}
            <div className="flex items-end gap-1.5 h-10 mb-2">
              {riskTrend.map((val, i) => (
                <div 
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{ 
                    height: `${(val / 8) * 100}%`,
                    background: val >= 6 ? 'var(--danger)' : val >= 4 ? 'var(--warning)' : 'var(--accent)',
                    opacity: 0.7,
                    minHeight: '4px'
                  }}
                />
              ))}
            </div>

            {/* Chart Labels */}
            <div className="flex justify-between text-[8px] text-[var(--muted)]">
              <span>Today</span>
              <span>7 days trend</span>
            </div>

            {/* AI Confidence */}
            <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--muted)]">
              <i className="ti ti-brain text-[10px] text-[var(--accent)]" />
              <span>AI Confidence: <span className="text-[var(--text)] font-medium">87%</span></span>
              <span className="text-[8px] text-[var(--muted)]">•</span>
              <span className="text-[10px] text-[var(--muted)]">{data.activeRisks || 4} active risks detected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Upcoming Milestones (1/3) + Project Progress (2/3) */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        
        {/* Upcoming Milestones - Sticky Note Stack */}
        <div className="card p-4 relative overflow-hidden">
          {/* Paper texture */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(0,0,0,0.03) 8px, rgba(0,0,0,0.03) 9px)`,
            pointerEvents: 'none'
          }} />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium m-0">Upcoming Milestones</p>
              <span className="text-xs font-bold text-[var(--accent)]">{data.upcomingMilestones || 3}</span>
            </div>
            
            {/* Milestone List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--warning)] animate-pulse" />
                  <span className="text-xs">Switchgear Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-[var(--danger)] font-medium">3 Days</span>
                  <span className="text-[9px] text-[var(--muted)]">Jul 20</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                  <span className="text-xs">Cooling Commissioning</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-[var(--muted)]">8 Days</span>
                  <span className="text-[9px] text-[var(--muted)]">Jul 25</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--muted)]" />
                  <span className="text-xs">Integrated Testing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-[var(--muted)]">15 Days</span>
                  <span className="text-[9px] text-[var(--muted)]">Aug 01</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--muted)]" />
                  <span className="text-xs">Final Handover</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-[var(--muted)]">22 Days</span>
                  <span className="text-[9px] text-[var(--muted)]">Aug 08</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Progress - Full Card (2/3 width) */}
        <div className="col-span-2 card p-5 relative overflow-hidden">
          {/* Grid paper background */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
            pointerEvents: 'none'
          }} />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium m-0">Project Progress</p>
                <p className="text-xs text-[var(--muted)] m-0">Overall completion across all phases</p>
              </div>
              <span className="text-2xl font-bold text-[var(--accent)]">{data.progress || 64}%</span>
            </div>
            
            {/* Full Progress Bar */}
            <div className="h-3 rounded-full bg-[var(--border)] overflow-hidden mb-3">
              <div 
                className="h-3 rounded-full transition-all duration-700"
                style={{ 
                  width: `${data.progress || 64}%`,
                  background: `linear-gradient(90deg, var(--accent), var(--warning))`
                }}
              />
            </div>
            
            {/* Phase Breakdown */}
            <div className="grid grid-cols-4 gap-3 mt-3">
              <div className="text-center p-2 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                <p className="text-[10px] text-[var(--muted)] m-0">Design</p>
                <p className="text-sm font-bold text-[var(--success)] m-0">100%</p>
                <span className="text-[8px] text-[var(--success)]">✓ Complete</span>
              </div>
              <div className="text-center p-2 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                <p className="text-[10px] text-[var(--muted)] m-0">Procurement</p>
                <p className="text-sm font-bold text-[var(--success)] m-0">100%</p>
                <span className="text-[8px] text-[var(--success)]">✓ Complete</span>
              </div>
              <div className="text-center p-2 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent)]/30">
                <p className="text-[10px] text-[var(--muted)] m-0">Construction</p>
                <p className="text-sm font-bold text-[var(--warning)] m-0">65%</p>
                <span className="text-[8px] text-[var(--warning)]">⏳ In Progress</span>
              </div>
              <div className="text-center p-2 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                <p className="text-[10px] text-[var(--muted)] m-0">Commissioning</p>
                <p className="text-sm font-bold text-[var(--muted)] m-0">15%</p>
                <span className="text-[8px] text-[var(--muted)]">⏳ Pending</span>
              </div>
            </div>

            {/* Current Phase Indicator */}
            <div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted)]">
              <i className="ti ti-flag text-[var(--accent)]" />
              <span>Current Phase: <span className="text-[var(--text)] font-medium">Construction</span></span>
              <span className="text-[8px] text-[var(--muted)]">•</span>
              <span className="text-[10px] text-[var(--muted)]">Next: Commissioning (starts Sep 2026)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      <div className="mb-5">
        <p className="text-sm font-medium mb-2">Critical Alerts</p>
        {data.alerts && data.alerts.map((alert, i) => (
          <AlertCard
            key={i}
            variant={alert.variant}
            icon={alert.icon}
            title={alert.title}
            subtitle={alert.subtitle}
          />
        ))}
        {(!data.alerts || data.alerts.length === 0) && (
          <p className="text-sm text-[var(--muted)]">No critical alerts. Everything is on track.</p>
        )}
      </div>

      {/* AI Recommendations */}
      <div className="mb-5">
        <p className="text-sm font-medium mb-2">AI Recommendations</p>
        {data.recommendations && data.recommendations.map((rec, i) => (
          <div
            key={i}
            className="flex justify-between items-center border border-[var(--border)] rounded-xl p-3 mb-1.5"
          >
            <div>
              <p className="text-sm m-0">{rec.title}</p>
              <p className="text-[11px] text-[var(--muted)] m-0 mt-0.5">{rec.description}</p>
            </div>
            <Button variant="outline" className="text-[11px] px-3 py-1">{rec.action}</Button>
          </div>
        ))}
      </div>

      {/* Recent Activity & Project Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-sm font-medium mb-2">Recent Activity</p>
          <div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-3">
            <Timeline events={data.timeline || []} />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Project Timeline</p>
          <div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-4">
            {data.milestones && data.milestones.map((m, i) => (
              <ProgressChart key={i} data={{ percent: m.progress, color: m.color }} label={m.label} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </Layout>
  )
}