import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Loader from '../components/Loader'
import AlertCard from '../components/AlertCards'
import { Button } from '../components/Buttons'
import { getRiskAnalysis, getComplianceResults, getSimulationResults } from '../services/AIAPI'

export default function AIIntelligence() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const getActiveTab = () => {
    const path = location.pathname
    if (path.includes('/risk')) return 'risk'
    if (path.includes('/compliance')) return 'compliance'
    if (path.includes('/simulation')) return 'simulation'
    return 'risk'
  }

  const [activeTab, setActiveTab] = useState(getActiveTab())
  const [riskData, setRiskData] = useState(null)
  const [complianceData, setComplianceData] = useState(null)
  const [simulationData, setSimulationData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getRiskAnalysis(),
      getComplianceResults(),
      getSimulationResults()
    ]).then(([risk, compliance, simulation]) => {
      setRiskData(risk)
      setComplianceData(compliance)
      setSimulationData(simulation)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    setActiveTab(getActiveTab())
  }, [location.pathname])

  const handleTabChange = (tab) => {
    navigate(`/ai-intelligence/${tab}`)
  }

  if (loading) return (
    <Layout>
      <Loader />
    </Layout>
  )

  const tabs = [
    { id: 'risk', label: 'Risk Prediction', icon: 'ti-alert-triangle' },
    { id: 'compliance', label: 'Compliance Check', icon: 'ti-shield-check' },
    { id: 'simulation', label: 'What-If Simulator', icon: 'ti-chart-bar' }
  ]

  return (
    <Layout>
      <div className="mb-3.5">
        <p className="text-sm font-medium m-0">AI Intelligence</p>
        <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
          AI-powered risk analysis, compliance checking, and simulation
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border)] mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 text-xs font-medium capitalize rounded-t-lg transition-colors flex items-center gap-1.5 ${
              activeTab === tab.id 
                ? 'bg-[var(--accent-soft)] text-[var(--accent)]' 
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <i className={`ti ${tab.icon} text-sm`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Risk Tab */}
      {activeTab === 'risk' && riskData && (
        <div>
          <div className="flex gap-5 items-center mb-4">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg viewBox="0 0 100 100" width="80" height="80">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={riskData.riskScore > 70 ? 'var(--danger)' : riskData.riskScore > 40 ? 'var(--warning)' : 'var(--success)'}
                  strokeWidth="8"
                  strokeDasharray={`${(riskData.riskScore / 100) * (2 * Math.PI * 40)} ${2 * Math.PI * 40}`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-semibold">{riskData.riskScore}</span>
                <span className="text-[8px] text-[var(--muted)]">risk score</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)] m-0 mb-1">Predicted completion</p>
              <p className="text-lg font-semibold m-0">
                {riskData.predictedCompletion}
              </p>
              <p className="text-xs text-[var(--danger)] m-0 mt-0.5">
                {riskData.delayDays} days behind schedule
              </p>
            </div>
          </div>

          <p className="text-xs font-medium mb-2.5">Detected Risks</p>
          {riskData.risks.map((r, i) => (
            <AlertCard key={i} variant={r.variant} title={r.title} />
          ))}
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && complianceData && (
        <div>
          <div className="flex items-center gap-4 mb-4">
            <span
              className={`text-sm px-3.5 py-1 rounded-lg font-medium ${
                complianceData.passRate >= 80 ? 'bg-[var(--success-bg)] text-[var(--success)]' : 'bg-[var(--danger-bg)] text-[var(--danger)]'
              }`}
            >
              {complianceData.passRate}% Pass Rate
            </span>
            <span className="text-xs text-[var(--muted)]">
              {complianceData.passed} passed · {complianceData.failed} failed
            </span>
          </div>

          {complianceData.items.map((item, i) => (
            <div
              key={i}
              className="flex justify-between items-center p-2 border border-[var(--border)] rounded-lg mb-1.5"
            >
              <span className="text-sm">{item.name}</span>
              <span
                className={`text-[10px] px-2.5 py-1 rounded-full ${
                  item.status === 'passed' ? 'bg-[var(--success-bg)] text-[var(--success)]' : 'bg-[var(--danger-bg)] text-[var(--danger)]'
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Simulation Tab */}
      {activeTab === 'simulation' && simulationData && (
        <div>
          <p className="text-xs text-[var(--muted)] mb-2.5">
            Simulate different project scenarios and see their impact
          </p>

          {simulationData.scenarios.map((scenario, i) => (
            <div
              key={i}
              className="border border-[var(--border)] rounded-xl p-3 mb-2"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium m-0">{scenario.name}</p>
                  <p className="text-xs text-[var(--muted)] m-0 mt-0.5">{scenario.description}</p>
                </div>
                <Button variant="outline" className="text-[11px] px-3 py-1">
                  Simulate
                </Button>
              </div>
              {scenario.result && (
                <div className="mt-2 pt-2 border-t border-[var(--border)]">
                  <p className="text-xs m-0">
                    <span className="font-medium">Impact:</span> {scenario.result}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}