import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Loader from '../components/Loader'
import { Button } from '../components/Buttons'
import { getComplianceResults, getRecommendations, getRiskAnalysis, getSimulationResults } from '../services/AIAPI'
import { useProject } from '../context/ProjectContext'

export default function AIIntelligence() {
  const location = useLocation()
  const navigate = useNavigate()
  const { selectedProject } = useProject()
  
  const getActiveTab = () => {
    const path = location.pathname
    if (path.includes('/risk')) return 'risk'
    if (path.includes('/compliance')) return 'compliance'
    if (path.includes('/simulation')) return 'simulation'
    return 'risk'
  }

  const [activeTab, setActiveTab] = useState(getActiveTab())
  const [selectedRisk, setSelectedRisk] = useState(null)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [selectedScenario, setSelectedScenario] = useState('delayGenerator')
  const [simulationResult, setSimulationResult] = useState(null)
  const [simulating, setSimulating] = useState(false)
  const [riskData, setRiskData] = useState(null)
  const [complianceData, setComplianceData] = useState(null)
  const [recommendationData, setRecommendationData] = useState([])

  useEffect(() => {
    setActiveTab(getActiveTab())
  }, [location.pathname])

  useEffect(() => {
    const loadAIData = async () => {
      if (!selectedProject?._id) return
      const [risksResponse, complianceResponse, recommendationsResponse] = await Promise.all([
        getRiskAnalysis(selectedProject._id, selectedProject),
        getComplianceResults(selectedProject._id, selectedProject),
        getRecommendations(selectedProject._id, selectedProject)
      ])
      setRiskData(risksResponse)
      setComplianceData(complianceResponse)
      setRecommendationData(recommendationsResponse || [])
    }
    loadAIData()
  }, [selectedProject?._id])

  const handleTabChange = (tab) => {
    navigate(`/ai-intelligence/${tab}`)
  }

  // Risk Data
  const risks = (riskData?.risks || [
    {
      id: 'R-001',
      title: 'Generator Delivery Delay',
      severity: 'Critical',
      riskScore: 85,
      affectedPhase: 'Procurement',
      description: 'Generator set G1 delivery is delayed by 15 days due to manufacturing issues.',
      affectedTasks: ['Generator Installation', 'Power System Testing', 'Commissioning'],
      mitigation: 'Contact alternate vendor PowerGen Solutions for expedited delivery. Consider renting temporary generator.',
      documents: ['generator_specs.pdf', 'vendor_submittal.pdf', 'delivery_schedule.xlsx'],
      status: 'Active'
    },
    {
      id: 'R-002',
      title: 'Cooling Installation Delay',
      severity: 'High',
      riskScore: 72,
      affectedPhase: 'Installation',
      description: 'Cooling tower installation is behind schedule due to foundation preparation delays.',
      affectedTasks: ['Cooling Tower Installation', 'Cooling System Testing', 'Integrated Testing'],
      mitigation: 'Accelerate foundation work by adding extra shift. Pre-assemble components off-site.',
      documents: ['cooling_specs.pdf', 'installation_schedule.pdf'],
      status: 'Active'
    },
    {
      id: 'R-003',
      title: 'Vendor Documentation Pending',
      severity: 'Medium',
      riskScore: 45,
      affectedPhase: 'Procurement',
      description: 'Vendor submittals for switchgear are pending review and approval.',
      affectedTasks: ['Switchgear Installation', 'Equipment Verification'],
      mitigation: 'Expedite vendor documentation review. Set up weekly follow-up meetings.',
      documents: ['vendor_submittals.pdf', 'procurement_tracker.xlsx'],
      status: 'Active'
    }
  ]).map((risk, index) => ({
    id: risk.id || `R-${index + 1}`,
    title: risk.title || risk.name || 'Project Risk',
    severity: risk.severity || 'Medium',
    riskScore: risk.riskScore || 60,
    affectedPhase: risk.affectedPhase || 'Project',
    description: risk.description || risk.summary || 'AI analysis completed.',
    affectedTasks: risk.affectedTasks || ['Project Execution'],
    mitigation: risk.mitigation || 'Review project controls.',
    documents: risk.documents || [],
    status: risk.status || 'Active'
  }))

  // Compliance Documents
  const complianceDocs = (complianceData?.items || [
    {
      id: 'C-001',
      name: 'UPS Specification.pdf',
      status: 'Passed',
      description: 'UPS system specification compliance check',
      originalSpec: 'UPS must provide 500kVA capacity with 10ms transfer time',
      submittedValue: '500kVA capacity with 8ms transfer time',
      mismatch: 'No mismatch found. Spec meets all requirements.',
      aiExplanation: 'The submitted UPS specification meets all requirements. Transfer time is better than specified.',
      actions: ['Accept', 'Mark Resolved']
    },
    {
      id: 'C-002',
      name: 'Generator Vendor.pdf',
      status: 'Failed',
      description: 'Generator vendor submittal compliance check',
      originalSpec: 'Generator must provide 3000kW with 15-second auto-start',
      submittedValue: 'Generator provides 2800kW with 25-second auto-start',
      mismatch: 'Generator capacity is 200kW below specification. Auto-start time exceeds limit by 10 seconds.',
      aiExplanation: 'The generator does not meet the minimum capacity and auto-start time requirements. Vendor needs to provide a compliant model.',
      actions: ['Reject', 'Request Revision']
    },
    {
      id: 'C-003',
      name: 'Cooling Layout.pdf',
      status: 'Warning',
      description: 'Cooling system layout compliance check',
      originalSpec: 'Cooling towers must maintain 1500 TR capacity with N+1 redundancy',
      submittedValue: 'Cooling towers provide 1500 TR capacity with N redundancy',
      mismatch: 'Missing N+1 redundancy requirement. Only N redundancy provided.',
      aiExplanation: 'The cooling layout meets capacity requirements but lacks N+1 redundancy. This may impact system reliability during maintenance.',
      actions: ['Accept with Condition', 'Request Revision']
    }
  ]).map((item, index) => ({
    id: item.id || `C-${index + 1}`,
    name: item.name || `Compliance Item ${index + 1}`,
    status: item.status === 'passed' ? 'Passed' : item.status === 'failed' ? 'Failed' : 'Warning',
    description: item.description || 'Compliance status updated by AI.',
    originalSpec: item.originalSpec || 'Project requirement',
    submittedValue: item.submittedValue || 'Submitted value',
    mismatch: item.mismatch || 'No mismatch detected',
    aiExplanation: item.aiExplanation || 'AI review completed.',
    actions: item.actions || ['Review', 'Accept']
  }))

  // Simulation Scenarios
  const scenarios = [
    { id: 'delayGenerator', label: 'Delay Generator by 5 days' },
    { id: 'changeVendor', label: 'Change Vendor for Switchgear' },
    { id: 'reduceWorkforce', label: 'Reduce Workforce by 20%' },
    { id: 'accelerateSteel', label: 'Accelerate Steel Erection' }
  ]

  const fallbackSimulationResults = {
    delayGenerator: {
      newCompletion: 'Mar 20, 2027',
      affectedMilestones: ['Equipment Installation', 'Commissioning'],
      criticalPathChanges: 'Generator installation becomes critical path. +5 days to project timeline.',
      costImpact: '+$150,000 (expedited shipping and overtime)',
      recoverySuggestions: [
        'Add night shift for generator installation',
        'Pre-assemble generator components off-site',
        'Expedite civil works for generator foundation'
      ],
      before: { completion: 'Mar 14, 2027', timeline: 'On Track' },
      after: { completion: 'Mar 20, 2027', timeline: 'Delayed by 6 days' }
    },
    changeVendor: {
      newCompletion: 'Mar 16, 2027',
      affectedMilestones: ['Procurement', 'Switchgear Installation'],
      criticalPathChanges: 'Switchgear procurement from new vendor adds 2 days but improves reliability.',
      costImpact: '+$50,000 (vendor change processing and requalification)',
      recoverySuggestions: [
        'Accelerate vendor qualification process',
        'Request expedited shipping from new vendor',
        'Start installation preparation in parallel'
      ],
      before: { completion: 'Mar 14, 2027', timeline: 'Vendor A - Active' },
      after: { completion: 'Mar 16, 2027', timeline: 'Vendor B - Pending Approval' }
    },
    reduceWorkforce: {
      newCompletion: 'Mar 28, 2027',
      affectedMilestones: ['Equipment Installation', 'Testing', 'Commissioning'],
      criticalPathChanges: 'Workforce reduction extends all installation phases by 14 days.',
      costImpact: '-$200,000 (labor cost savings)',
      recoverySuggestions: [
        'Extend project timeline by 14 days',
        'Prioritize critical path activities',
        'Implement overtime for key trades'
      ],
      before: { completion: 'Mar 14, 2027', timeline: 'Full Workforce' },
      after: { completion: 'Mar 28, 2027', timeline: 'Reduced Workforce - Extended Timeline' }
    },
    accelerateSteel: {
      newCompletion: 'Mar 10, 2027',
      affectedMilestones: ['Steel Erection', 'Structure Completion'],
      criticalPathChanges: 'Steel erection accelerates by 4 days, creating buffer for downstream activities.',
      costImpact: '+$80,000 (expedited steel delivery)',
      recoverySuggestions: [
        'Maintain acceleration momentum',
        'Allocate freed resources to critical path',
        'Update schedule dependencies'
      ],
      before: { completion: 'Mar 14, 2027', timeline: 'Steel on Critical Path' },
      after: { completion: 'Mar 10, 2027', timeline: 'Steel Accelerated - Buffer Created' }
    }
  }

  const normalizeSimulationResult = (result, scenarioId) => {
    const fallback = fallbackSimulationResults[scenarioId] || fallbackSimulationResults.delayGenerator
    const raw = result?.result || result?.data || result || fallback

    return {
      ...fallback,
      ...raw,
      projectName: raw.projectName || selectedProject?.name || 'Selected Project',
      affectedMilestones: raw.affectedMilestones?.length ? raw.affectedMilestones : fallback.affectedMilestones,
      recoverySuggestions: raw.recoverySuggestions?.length ? raw.recoverySuggestions : fallback.recoverySuggestions,
      before: raw.before || fallback.before || { completion: 'Current', timeline: 'Pending' },
      after: raw.after || fallback.after || { completion: raw.newCompletion || 'Projected', timeline: 'Pending' }
    }
  }

  const runSimulation = async (scenarioId) => {
    setSimulating(true)
    try {
      const result = await getSimulationResults(scenarioId, selectedProject?._id || null, selectedProject)
      setSimulationResult(normalizeSimulationResult(result, scenarioId))
    } catch (error) {
      console.error(error)
      setSimulationResult(normalizeSimulationResult(null, scenarioId))
    } finally {
      setSimulating(false)
    }
  }

  const getStatusBadge = (status) => {
    const configs = {
      'Passed': 'bg-[var(--success-bg)] text-[var(--success)]',
      'Failed': 'bg-[var(--danger-bg)] text-[var(--danger)]',
      'Warning': 'bg-[var(--warning-bg)] text-[var(--warning)]',
      'Active': 'bg-[var(--warning-bg)] text-[var(--warning)]',
      'Critical': 'bg-[var(--danger-bg)] text-[var(--danger)]',
      'High': 'bg-[var(--warning-bg)] text-[var(--warning)]',
      'Medium': 'bg-[var(--accent-soft)] text-[var(--accent)]'
    }
    return configs[status] || 'bg-[var(--border)] text-[var(--muted)]'
  }

  const getRiskColor = (score) => {
    if (score >= 70) return 'var(--danger)'
    if (score >= 40) return 'var(--warning)'
    return 'var(--success)'
  }

  const getStatusIcon = (status) => {
    const icons = {
      'Passed': 'ti-check-circle',
      'Failed': 'ti-x-circle',
      'Warning': 'ti-alert-triangle'
    }
    return icons[status] || 'ti-circle'
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-3.5">
          <p className="text-lg font-semibold m-0">AI Intelligence</p>
          <p className="text-sm text-[var(--muted)] m-0 mt-0.5">
            AI-powered risk analysis, compliance checking, and simulation
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[var(--border)] mb-4">
          {[
            { id: 'risk', label: 'Risk Prediction', icon: 'ti-alert-triangle' },
            { id: 'compliance', label: 'Compliance Check', icon: 'ti-shield-check' },
            { id: 'simulation', label: 'What-If Simulator', icon: 'ti-chart-bar' }
          ].map((tab) => (
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

        {/* Risk Prediction Tab */}
        {activeTab === 'risk' && (
          <div className="space-y-4">
            <p className="text-sm font-medium mb-3">Risk Cards</p>
            <div className="grid grid-cols-3 gap-4">
              {risks.map((risk) => (
                <div
                  key={risk.id}
                  className="card cursor-pointer hover:border-[var(--accent)] transition-all"
                  onClick={() => setSelectedRisk(risk.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: getRiskColor(risk.riskScore) }}
                      />
                      <p className="text-sm font-medium m-0">{risk.title}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusBadge(risk.severity)}`}>
                      {risk.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                    <span>Risk Score: {risk.riskScore}%</span>
                    <span>•</span>
                    <span>{risk.affectedPhase}</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-[var(--border)]">
                    <div 
                      className="h-1.5 rounded-full"
                      style={{ 
                        width: `${risk.riskScore}%`,
                        background: getRiskColor(risk.riskScore)
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Risk Details Popup Modal */}
            {selectedRisk && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="card max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <i className="ti ti-alert-triangle text-[var(--danger)]" />
                      <p className="text-base font-semibold m-0">Risk Details</p>
                    </div>
                    <button
                      onClick={() => setSelectedRisk(null)}
                      className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                    >
                      <i className="ti ti-x text-xl" />
                    </button>
                  </div>
                  {risks.find(r => r.id === selectedRisk) && (
                    <div className="space-y-4">
                      {(() => {
                        const risk = risks.find(r => r.id === selectedRisk)
                        return (
                          <>
                            <div className="bg-[var(--panel)] rounded-lg p-3 border border-[var(--border)]">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ background: getRiskColor(risk.riskScore) }}
                                />
                                <p className="text-sm font-medium m-0">{risk.title}</p>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-[var(--muted)]">
                                <span>Risk Score: {risk.riskScore}%</span>
                                <span>•</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusBadge(risk.severity)}`}>
                                  {risk.severity}
                                </span>
                                <span>•</span>
                                <span>{risk.affectedPhase}</span>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs text-[var(--muted)] m-0">Why AI predicted this risk</p>
                              <p className="text-sm m-0 mt-1">{risk.description}</p>
                            </div>

                            <div>
                              <p className="text-xs text-[var(--muted)] m-0">Affected Tasks</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {risk.affectedTasks.map((task, i) => (
                                  <span key={i} className="text-xs bg-[var(--panel)] px-2 py-0.5 rounded border border-[var(--border)]">
                                    {task}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="bg-[var(--warning-bg)] rounded-lg p-3 border border-[var(--warning)]">
                              <div className="flex items-center gap-2 mb-1">
                                <i className="ti ti-tools text-[var(--warning)]" />
                                <p className="text-xs text-[var(--warning)] m-0 font-medium">Suggested Mitigation</p>
                              </div>
                              <p className="text-sm m-0 mt-1">{risk.mitigation}</p>
                            </div>

                            <div>
                              <p className="text-xs text-[var(--muted)] m-0">Related Documents</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {risk.documents.map((doc, i) => (
                                  <span key={i} className="text-xs bg-[var(--panel)] px-2 py-0.5 rounded border border-[var(--border)]">
                                    {doc}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="bg-[var(--accent-soft)] rounded-lg p-3 border border-[var(--accent)]">
                              <div className="flex items-center gap-2 mb-1">
                                <i className="ti ti-shield-check text-[var(--accent)]" />
                                <p className="text-xs text-[var(--accent)] m-0 font-medium">Compliance Check</p>
                              </div>
                              <p className="text-sm m-0 mt-1">Compliance review in progress. 2 of 3 documents have been reviewed.</p>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button className="text-sm px-4 py-1.5" onClick={() => navigate('/reports')}>View Related Reports</Button>
                              <Button variant="outline" className="text-sm px-4 py-1.5" onClick={() => setSelectedRisk(null)}>
                                Close
                              </Button>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Compliance Check Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-4">
            <p className="text-sm font-medium mb-3">Uploaded Documents</p>
            <div className="space-y-2">
              {complianceDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg cursor-pointer hover:border-[var(--accent)] transition-all"
                  onClick={() => setSelectedDocument(doc.id)}
                >
                  <div>
                    <p className="text-sm font-medium m-0">{doc.name}</p>
                    <p className="text-xs text-[var(--muted)] m-0">{doc.description}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusBadge(doc.status)} flex items-center gap-1`}>
                    <i className={`ti ${getStatusIcon(doc.status)} text-xs`} />
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Compliance Document Details Modal */}
            {selectedDocument && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="card max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <i className="ti ti-shield-check text-[var(--accent)]" />
                      <p className="text-base font-semibold m-0">Compliance Details</p>
                    </div>
                    <button
                      onClick={() => setSelectedDocument(null)}
                      className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                    >
                      <i className="ti ti-x text-xl" />
                    </button>
                  </div>
                  {complianceDocs.find(d => d.id === selectedDocument) && (
                    <div className="space-y-4">
                      {(() => {
                        const doc = complianceDocs.find(d => d.id === selectedDocument)
                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium m-0">{doc.name}</p>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusBadge(doc.status)} flex items-center gap-1`}>
                                <i className={`ti ${getStatusIcon(doc.status)} text-xs`} />
                                {doc.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-[var(--panel)] rounded-lg p-3 border border-[var(--border)]">
                                <p className="text-xs text-[var(--muted)] m-0">Original Specification</p>
                                <p className="text-sm m-0 mt-1">{doc.originalSpec}</p>
                              </div>
                              <div className="bg-[var(--panel)] rounded-lg p-3 border border-[var(--border)]">
                                <p className="text-xs text-[var(--muted)] m-0">Submitted Value</p>
                                <p className="text-sm m-0 mt-1">{doc.submittedValue}</p>
                              </div>
                            </div>

                            <div className={`rounded-lg p-3 border ${
                              doc.status === 'Passed' ? 'bg-[var(--success-bg)] border-[var(--success)]' :
                              doc.status === 'Failed' ? 'bg-[var(--danger-bg)] border-[var(--danger)]' :
                              'bg-[var(--warning-bg)] border-[var(--warning)]'
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                <i className={`ti ${
                                  doc.status === 'Passed' ? 'ti-check-circle text-[var(--success)]' :
                                  doc.status === 'Failed' ? 'ti-x-circle text-[var(--danger)]' :
                                  'ti-alert-triangle text-[var(--warning)]'
                                }`} />
                                <p className="text-xs font-medium m-0">Highlighted Mismatch</p>
                              </div>
                              <p className="text-sm m-0 mt-1">{doc.mismatch}</p>
                            </div>

                            <div className="bg-[var(--accent-soft)] rounded-lg p-3 border border-[var(--accent)]">
                              <div className="flex items-center gap-2 mb-1">
                                <i className="ti ti-brain text-[var(--accent)]" />
                                <p className="text-xs text-[var(--accent)] m-0 font-medium">AI Explanation</p>
                              </div>
                              <p className="text-sm m-0 mt-1">{doc.aiExplanation}</p>
                            </div>

                            <div className="flex gap-2 pt-2">
                              {doc.actions.map((action, i) => (
                                <Button key={i} className="text-sm px-4 py-1.5">
                                  {action}
                                </Button>
                              ))}
                              <Button variant="outline" className="text-sm px-4 py-1.5" onClick={() => setSelectedDocument(null)}>
                                Close
                              </Button>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* What-If Simulator Tab */}
        {activeTab === 'simulation' && (
          <div className="space-y-4">
            <div className="card">
              <p className="text-sm font-medium mb-3">Select Scenario</p>
              <div className="flex flex-wrap gap-2">
                {scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                      selectedScenario === scenario.id
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                        : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]'
                    }`}
                    onClick={() => {
                      setSelectedScenario(scenario.id)
                      setSimulationResult(null)
                    }}
                  >
                    {scenario.label}
                  </button>
                ))}
              </div>

              <Button 
                className="mt-4 text-sm px-6 py-2 flex items-center gap-2"
                onClick={() => runSimulation(selectedScenario)}
                disabled={simulating}
              >
                {simulating ? (
                  <span className="flex items-center gap-2">
                    <div className="spinner w-4 h-4 border-2" />
                    Simulating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <i className="ti ti-robot" />
                    Run Simulation
                  </span>
                )}
              </Button>
            </div>

            {simulationResult && (
              <div className="space-y-4 animate-fade-in">
                {/* Before vs After Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="card border-l-4 border-l-[var(--muted)]">
                    <p className="text-xs text-[var(--muted)] font-medium mb-2">Before</p>
                    <p className="text-sm font-medium m-0">Completion: {simulationResult.before.completion}</p>
                    <p className="text-xs text-[var(--muted)] m-0 mt-1">{simulationResult.before.timeline}</p>
                  </div>
                  <div className="card border-l-4 border-l-[var(--accent)]">
                    <p className="text-xs text-[var(--muted)] font-medium mb-2">After</p>
                    <p className="text-sm font-medium m-0">Completion: {simulationResult.newCompletion}</p>
                    <p className="text-xs text-[var(--muted)] m-0 mt-1">{simulationResult.after.timeline}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="card">
                    <p className="text-xs text-[var(--muted)] m-0">Affected Milestones</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {simulationResult.affectedMilestones.map((milestone, i) => (
                        <span key={i} className="text-xs bg-[var(--panel)] px-2 py-0.5 rounded border border-[var(--border)]">
                          {milestone}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="card">
                    <p className="text-xs text-[var(--muted)] m-0">Cost Impact</p>
                    <p className="text-sm font-medium m-0 mt-1">{simulationResult.costImpact}</p>
                  </div>
                </div>

                <div className="card border-l-4 border-l-[var(--warning)]">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="ti ti-alert-triangle text-[var(--warning)]" />
                    <p className="text-xs text-[var(--warning)] font-medium m-0">Critical Path Changes</p>
                  </div>
                  <p className="text-sm m-0 mt-1">{simulationResult.criticalPathChanges}</p>
                </div>

                <div className="card border-l-4 border-l-[var(--accent)]">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="ti ti-brain text-[var(--accent)]" />
                    <p className="text-xs text-[var(--accent)] font-medium m-0">Recovery Suggestions</p>
                  </div>
                  <ul className="space-y-1 mt-1">
                    {simulationResult.recoverySuggestions.map((suggestion, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <i className="ti ti-checkbox text-[var(--accent)] mt-0.5" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" className="text-sm px-4 py-1.5" onClick={() => setSimulationResult(null)}>
                    Clear Results
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </Layout>
  )
}
