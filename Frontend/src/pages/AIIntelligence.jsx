import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Loader from '../components/Loader'
import AlertCard from '../components/AlertCards'
import { Button } from '../components/Buttons'
import { getRiskAnalysis, getComplianceResults, getSimulationResults } from '../services/AIAPI'

export default function AIIntelligence() {
  const [activeTab, setActiveTab] = useState('risk')
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
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>AI Intelligence</p>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '2px 0 0' }}>
          AI-powered risk analysis, compliance checking, and simulation
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              border: 'none',
              background: activeTab === tab.id ? 'var(--accent-soft)' : 'none',
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--muted)',
              padding: '8px 16px',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: activeTab === tab.id ? 500 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background 0.15s, color 0.15s'
            }}
          >
            <i className={`ti ${tab.icon}`} style={{ fontSize: 14 }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Risk Tab */}
      {activeTab === 'risk' && riskData && (
        <div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16 }}>
            <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
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
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 600 }}>{riskData.riskScore}</span>
                <span style={{ fontSize: 8, color: 'var(--muted)' }}>risk score</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 4px' }}>Predicted completion</p>
              <p style={{ fontSize: 17, fontWeight: 500, margin: 0 }}>
                {riskData.predictedCompletion}
              </p>
              <p style={{ fontSize: 12, color: 'var(--danger)', margin: '2px 0 0' }}>
                {riskData.delayDays} days behind schedule
              </p>
            </div>
          </div>

          <p style={{ fontSize: 12, fontWeight: 500, marginBottom: 10 }}>Detected Risks</p>
          {riskData.risks.map((r, i) => (
            <AlertCard key={i} variant={r.variant} title={r.title} />
          ))}
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && complianceData && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <span
              style={{
                fontSize: 14,
                padding: '4px 14px',
                borderRadius: 8,
                background: complianceData.passRate >= 80 ? 'var(--success-bg)' : 'var(--danger-bg)',
                color: complianceData.passRate >= 80 ? 'var(--success)' : 'var(--danger)',
                fontWeight: 500
              }}
            >
              {complianceData.passRate}% Pass Rate
            </span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              {complianceData.passed} passed · {complianceData.failed} failed
            </span>
          </div>

          {complianceData.items.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: 8,
                marginBottom: 6
              }}
            >
              <span style={{ fontSize: 13 }}>{item.name}</span>
              <span
                style={{
                  fontSize: 10,
                  padding: '2px 10px',
                  borderRadius: 12,
                  background: item.status === 'passed' ? 'var(--success-bg)' : 'var(--danger-bg)',
                  color: item.status === 'passed' ? 'var(--success)' : 'var(--danger)'
                }}
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
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
            Simulate different project scenarios and see their impact
          </p>

          {simulationData.scenarios.map((scenario, i) => (
            <div
              key={i}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 8
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 13, margin: 0, fontWeight: 500 }}>{scenario.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', margin: '2px 0 0' }}>{scenario.description}</p>
                </div>
                <Button variant="outline" style={{ fontSize: 11, padding: '4px 12px' }}>
                  Simulate
                </Button>
              </div>
              {scenario.result && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 12, margin: 0 }}>
                    <span style={{ fontWeight: 500 }}>Impact:</span> {scenario.result}
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