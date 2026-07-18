import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Button } from '../components/Buttons'
import { getProjectReports } from '../services/ProjectAPI'
import { getSimulationResults } from '../services/AIAPI'
import { useProject } from '../context/ProjectContext'

export default function Reports() {
  const { selectedProject } = useProject()
  const [reports, setReports] = useState([])
  const [filters, setFilters] = useState({
    dateRange: 'last30days',
    project: 'all',
    reportType: 'all',
    status: 'all'
  })

  const [selectedReport, setSelectedReport] = useState(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [aiReport, setAiReport] = useState(null)
  const [actionMessage, setActionMessage] = useState('')

  useEffect(() => {
    const loadReports = async () => {
      if (!selectedProject?._id) return
      const data = await getProjectReports(selectedProject._id)
      setReports(data || [])
    }
    loadReports()
  }, [selectedProject?._id])

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value })
  }

  const filteredReports = reports.filter(report => {
    if (filters.reportType !== 'all' && report.type !== filters.reportType) return false
    if (filters.status !== 'all' && report.status.toLowerCase() !== filters.status.toLowerCase()) return false
    return true
  })

  const handleGenerateAIReport = async () => {
    setGeneratingReport(true)
    setActionMessage('')
    try {
      const response = await getSimulationResults('delayGenerator', selectedProject?._id || null, selectedProject)
      const report = response?.report || response?.data?.report || response?.result || null
      setAiReport(report || {
        title: 'AI Executive Summary',
        projectName: selectedProject?.name || 'Selected Project',
        generatedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        summary: 'Project health is being monitored actively and needs supplier follow-up and readiness tracking.',
        healthScore: 74,
        status: selectedProject?.status || 'In Progress',
        topRisks: ['Supplier delivery variability', 'Testing readiness gaps', 'Documentation completeness'],
        compliance: { passRate: 84, passed: 4, failed: 1 },
        delayDays: 8,
        recommendations: ['Escalate critical suppliers', 'Close readiness gaps', 'Re-sequence urgent tasks'],
        nextActions: ['Review open procurement items', 'Reconfirm commissioning readiness']
      })
      setShowAIModal(true)
    } catch (error) {
      console.error(error)
    } finally {
      setGeneratingReport(false)
    }
  }

  const handleReportAction = (action) => {
    setActionMessage(`${action} action triggered for ${selectedProject?.name || 'the selected project'}.`)
    setTimeout(() => setActionMessage(''), 1800)
  }

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-[var(--warning-bg)] text-[var(--warning)]',
      'Closed': 'bg-[var(--border)] text-[var(--muted)]',
      'Resolved': 'bg-[var(--success-bg)] text-[var(--success)]'
    }
    return colors[status] || 'bg-[var(--border)] text-[var(--muted)]'
  }

  const getStatusDot = (status) => {
    const colors = {
      'Open': 'bg-[var(--warning)]',
      'Closed': 'bg-[var(--muted)]',
      'Resolved': 'bg-[var(--success)]'
    }
    return colors[status] || 'bg-[var(--muted)]'
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {selectedProject && (
          <div className="mb-4 rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--accent)]">
            Active project: <span className="font-semibold">{selectedProject.name}</span>
          </div>
        )}
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-lg font-semibold mb-1">Reports</p>
            <p className="text-sm text-[var(--muted)]">Centralized reporting hub for all project reports</p>
          </div>
          <Button 
            className="flex items-center gap-2 px-4 py-2.5"
            onClick={handleGenerateAIReport}
            disabled={generatingReport}
          >
            <i className={`ti ${generatingReport ? 'ti-loader spin' : 'ti-robot'}`} />
            {generatingReport ? 'Generating...' : 'Generate AI Report'}
          </Button>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Date Range</label>
              <select 
                className="input text-sm"
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Project</label>
              <select 
                className="input text-sm"
                value={filters.project}
                onChange={(e) => handleFilterChange('project', e.target.value)}
              >
                <option value="all">All Projects</option>
                <option value="riverbend">Riverbend Data Centre</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Report Type</label>
              <select 
                className="input text-sm"
                value={filters.reportType}
                onChange={(e) => handleFilterChange('reportType', e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="summary">Project Summary</option>
                <option value="risk">Risk Analysis</option>
                <option value="compliance">Compliance</option>
                <option value="commissioning">Commissioning</option>
                <option value="procurement">Procurement</option>
                <option value="ai">AI Recommendations</option>
                <option value="activity">Activity Log</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Status</label>
              <select 
                className="input text-sm"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <div 
              key={report.id} 
              className="card hover:border-[var(--accent)] transition-all cursor-pointer"
              onMouseEnter={() => setSelectedReport(report.id)}
              onMouseLeave={() => setSelectedReport(null)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0">
                  <i className={`ti ${report.icon} text-[var(--accent)] text-lg`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium m-0">{report.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(report.status)}`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${getStatusDot(report.status)} mr-1 align-middle`} />
                      {report.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] m-0">{report.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-[var(--muted)]">{report.category}</span>
                    <span className="text-[10px] text-[var(--muted)]">•</span>
                    <span className="text-[10px] text-[var(--muted)]">{report.date}</span>
                  </div>
                </div>
              </div>

              {/* Actions - visible on hover */}
              {selectedReport === report.id && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                  <button className="text-xs text-[var(--muted)] hover:text-[var(--text)] px-2 py-1 rounded-lg hover:bg-[var(--panel)] transition-colors flex items-center gap-1" onClick={() => handleReportAction('Preview')}>
                    <i className="ti ti-eye text-sm" />
                    Preview
                  </button>
                  <button className="text-xs text-[var(--muted)] hover:text-[var(--text)] px-2 py-1 rounded-lg hover:bg-[var(--panel)] transition-colors flex items-center gap-1" onClick={() => handleReportAction('PDF')}>
                    <i className="ti ti-file-pdf text-sm" />
                    PDF
                  </button>
                  <button className="text-xs text-[var(--muted)] hover:text-[var(--text)] px-2 py-1 rounded-lg hover:bg-[var(--panel)] transition-colors flex items-center gap-1" onClick={() => handleReportAction('Excel')}>
                    <i className="ti ti-file-spreadsheet text-sm" />
                    Excel
                  </button>
                  <button 
                    className="text-xs text-[var(--muted)] hover:text-[var(--text)] px-2 py-1 rounded-lg hover:bg-[var(--panel)] transition-colors flex items-center gap-1 ml-auto"
                    onClick={() => setShowShareModal(true)}
                  >
                    <i className="ti ti-share text-sm" />
                    Share
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12 text-[var(--muted)]">
            <i className="ti ti-file-off text-4xl block mb-3 opacity-50" />
            <p className="text-sm m-0">No reports found matching your filters</p>
          </div>
        )}
      </div>

      {actionMessage && (
        <div className="mb-4 rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--accent)]">
          {actionMessage}
        </div>
      )}

      {/* AI Report Modal */}
      {showAIModal && aiReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="card max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <i className="ti ti-robot text-[var(--accent)] text-xl" />
                <p className="text-base font-semibold m-0">{aiReport.title || 'AI Executive Summary'}</p>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                <i className="ti ti-x text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[var(--accent-soft)] rounded-lg p-4">
                <p className="text-xs text-[var(--muted)] mb-1">Generated</p>
                <p className="text-sm m-0">{aiReport.generatedAt || `${new Date().toLocaleDateString('en-IN')} · ${new Date().toLocaleTimeString('en-IN')}`}</p>
              </div>

              {/* Project Health */}
              <div className="border border-[var(--border)] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="ti ti-heart text-[var(--accent)]" />
                  <p className="text-sm font-medium m-0">{aiReport.projectName ? `${aiReport.projectName} Health` : 'Project Health'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Health Score</span>
                      <span className="font-medium">{aiReport.healthScore || 74}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--border)]">
                      <div className="h-2 rounded-full bg-[var(--warning)]" style={{ width: `${aiReport.healthScore || 74}%` }} />
                    </div>
                  </div>
                  <span className="text-sm text-[var(--warning)]">{(aiReport.healthScore || 74) >= 80 ? 'Healthy' : 'At Risk'}</span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-2">{aiReport.summary || 'Project is progressing but facing critical risks that need immediate attention.'}</p>
              </div>

              {/* Top Risks */}
              <div className="border border-[var(--border)] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="ti ti-alert-triangle text-[var(--danger)]" />
                  <p className="text-sm font-medium m-0">Top Risks</p>
                </div>
                <ul className="space-y-1.5">
                  {(aiReport.topRisks || []).map((risk, index) => (
                    <li key={`${risk}-${index}`} className="flex items-center gap-2 text-sm">
                      <span className={`w-1.5 h-1.5 rounded-full ${index === 0 ? 'bg-[var(--danger)]' : 'bg-[var(--warning)]'}`} />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Compliance Status */}
              <div className="border border-[var(--border)] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="ti ti-shield-check text-[var(--success)]" />
                  <p className="text-sm font-medium m-0">Compliance Status</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold text-[var(--success)]">{aiReport.compliance?.passRate || 84}%</span>
                  <span className="text-sm text-[var(--muted)]">Pass Rate</span>
                  <span className="text-sm text-[var(--muted)]">•</span>
                  <span className="text-sm text-[var(--success)]">{aiReport.compliance?.passed || 4} Passed</span>
                  <span className="text-sm text-[var(--danger)]">{aiReport.compliance?.failed || 1} Failed</span>
                </div>
              </div>

              {/* Major Delays */}
              <div className="border border-[var(--border)] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="ti ti-clock text-[var(--warning)]" />
                  <p className="text-sm font-medium m-0">Major Delays</p>
                </div>
                <p className="text-sm m-0">{aiReport.delayDays || 8} days behind schedule</p>
                <p className="text-xs text-[var(--muted)] mt-1">Predicted completion: {aiReport.predictedCompletion || 'Projected completion in the next review window'}</p>
              </div>

              {/* AI Recommendations */}
              <div className="border border-[var(--border)] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="ti ti-brain text-[var(--accent)]" />
                  <p className="text-sm font-medium m-0">AI Recommendations</p>
                </div>
                <ul className="space-y-1.5">
                  {(aiReport.recommendations || []).map((recommendation, index) => (
                    <li key={`${recommendation}-${index}`} className="flex items-start gap-2 text-sm">
                      <i className="ti ti-checkbox text-[var(--success)] mt-0.5" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Priority Actions */}
              <div className="border border-[var(--border)] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="ti ti-list-check text-[var(--accent)]" />
                  <p className="text-sm font-medium m-0">Next Priority Actions</p>
                </div>
                <ol className="space-y-1.5 text-sm list-decimal list-inside">
                  {(aiReport.nextActions || []).map((action, index) => (
                    <li key={`${action}-${index}`}>{action}</li>
                  ))}
                </ol>
              </div>

              <div className="flex gap-3 pt-2">
                <Button className="flex-1 text-sm py-2 flex items-center justify-center gap-2" onClick={() => handleReportAction('PDF')}>
                  <i className="ti ti-file-pdf" />
                  Download PDF
                </Button>
                <Button variant="outline" className="flex-1 text-sm py-2 flex items-center justify-center gap-2" onClick={() => handleReportAction('Share')}>
                  <i className="ti ti-share" />
                  Share Report
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 text-sm py-2 flex items-center justify-center gap-2"
                  onClick={() => setShowAIModal(false)}
                >
                  <i className="ti ti-x" />
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="card max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-semibold m-0">Share Report</p>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                <i className="ti ti-x text-xl" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--muted)] block mb-1">Share with</label>
                <input
                  className="input"
                  placeholder="Enter email addresses"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] block mb-1">Message (optional)</label>
                <textarea
                  className="input"
                  rows="2"
                  placeholder="Add a message..."
                />
              </div>
              <div className="flex gap-2">
                <button className="text-xs text-[var(--muted)] hover:text-[var(--text)] px-3 py-1.5 rounded-lg hover:bg-[var(--panel)] transition-colors flex items-center gap-1">
                  <i className="ti ti-mail" />
                  Email
                </button>
                <button className="text-xs text-[var(--muted)] hover:text-[var(--text)] px-3 py-1.5 rounded-lg hover:bg-[var(--panel)] transition-colors flex items-center gap-1">
                  <i className="ti ti-link" />
                  Copy Link
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button className="flex-1 text-sm py-2">Send</Button>
              <Button variant="outline" className="flex-1 text-sm py-2" onClick={() => setShowShareModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Spinner animation for generating report */}
      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Layout>
  )
}