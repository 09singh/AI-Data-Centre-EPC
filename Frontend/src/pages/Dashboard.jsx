import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Footer from '../components/Footer'
import AlertCard from '../components/AlertCards'
import Loader from '../components/Loader'
import Timeline from '../components/Timeline'
import { CircleProgress, MetricCard, ProgressChart } from '../components/Charts'
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

      {/* Health Score & Metrics */}
      <div className="flex flex-wrap gap-4 mb-5">
        <div className="flex items-center gap-5 bg-[var(--panel)] border border-[var(--border)] rounded-xl p-4 flex-1 min-w-[200px]">
          <CircleProgress value={data.healthScore || 72} label="Health Score" size={70} />
          <div>
            <p className="text-sm font-medium m-0">{data.healthScore >= 70 ? 'On Track' : 'At Risk'}</p>
            <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
              {data.healthScore >= 70 ? 'Project is progressing well' : 'Multiple risks detected'}
            </p>
          </div>
        </div>

        <MetricCard label="Progress" value={`${data.progress || 64}%`} icon="ti-progress" />
        <MetricCard
          label="Active Risks"
          value={data.activeRisks || 4}
          subValue="2 critical"
          icon="ti-alert-triangle"
          trend={{ direction: 'up', value: '2 new today' }}
        />
        <MetricCard
          label="Upcoming Milestones"
          value={data.upcomingMilestones || 3}
          subValue="Next: Switchgear delivery"
          icon="ti-flag"
        />
      </div>

      {/* Today's AI Insights */}
      {data.aiInsights && (
        <div className="bg-[var(--accent-soft)] border border-[var(--accent)] rounded-xl p-3 mb-5">
          <p className="text-[11px] text-[var(--accent)] uppercase tracking-wider m-0 flex items-center gap-1">
            <i className="ti ti-brain" /> Today's AI Insights
          </p>
          <p className="text-sm m-0 mt-1">{data.aiInsights}</p>
        </div>
      )}

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

      {/* Recent Activity */}
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