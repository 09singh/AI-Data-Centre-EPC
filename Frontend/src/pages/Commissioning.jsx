import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Button } from '../components/Buttons'
import { getProjectCommissioning } from '../services/ProjectAPI'
import { useProject } from '../context/ProjectContext'

export default function Commissioning() {
  const { selectedProject } = useProject()
  const [selectedSystem, setSelectedSystem] = useState(null)
  const [showNCRModal, setShowNCRModal] = useState(null)
  const [data, setData] = useState({ readinessScore: 0, systems: [], ncrData: [], timeline: [], aiRecommendations: [] })

  useEffect(() => {
    const loadData = async () => {
      if (!selectedProject?._id) return
      const commissioning = await getProjectCommissioning(selectedProject._id)
      setData(commissioning || { readinessScore: 0, systems: [], ncrData: [], timeline: [], aiRecommendations: [] })
    }
    loadData()
  }, [selectedProject?._id])

  const readinessData = {
    score: data.readinessScore || 0,
    readyForHandover: data.readyForHandover || false,
    overallCompletion: data.overallCompletion || 0,
    remainingCriticalTests: data.remainingCriticalTests || 0
  }

  const systems = (data.systems || []).map((system) => ({ ...system, icon: system.id === 'power' ? 'ti-bolt' : system.id === 'cooling' ? 'ti-snowflake' : system.id === 'network' ? 'ti-network' : 'ti-device-floppy', color: 'var(--warning)' }))
  const ncrData = data.ncrData || []
  const timeline = data.timeline || []
  const aiRecommendations = data.aiRecommendations || []

  const getStatusBadge = (status) => {
    const configs = {
      'Completed': 'bg-[var(--success-bg)] text-[var(--success)]',
      'In Progress': 'bg-[var(--warning-bg)] text-[var(--warning)]',
      'Pending': 'bg-[var(--border)] text-[var(--muted)]',
      'Failed': 'bg-[var(--danger-bg)] text-[var(--danger)]',
      'Open': 'bg-[var(--danger-bg)] text-[var(--danger)]',
      'Resolved': 'bg-[var(--success-bg)] text-[var(--success)]',
      'Pass': 'bg-[var(--success-bg)] text-[var(--success)]',
      'Fail': 'bg-[var(--danger-bg)] text-[var(--danger)]',
      'Critical': 'bg-[var(--danger-bg)] text-[var(--danger)]',
      'High': 'bg-[var(--warning-bg)] text-[var(--warning)]',
      'Medium': 'bg-[var(--accent-soft)] text-[var(--accent)]',
      'Low': 'bg-[var(--border)] text-[var(--muted)]'
    }
    return configs[status] || 'bg-[var(--border)] text-[var(--muted)]'
  }

  const getTimelineIcon = (status) => {
    const icons = {
      'completed': 'ti-check-circle text-[var(--success)]',
      'in-progress': 'ti-loader text-[var(--warning)]',
      'pending': 'ti-clock text-[var(--muted)]'
    }
    return icons[status] || 'ti-clock text-[var(--muted)]'
  }

  const getTimelineLabel = (status) => {
    const labels = {
      'completed': 'Done',
      'in-progress': 'In Progress',
      'pending': 'Pending'
    }
    return labels[status] || 'Pending'
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-lg font-semibold mb-1">Commissioning</p>
            <p className="text-sm text-[var(--muted)]">Final testing and quality assurance for project handover</p>
          </div>
        </div>

        {/* Commissioning Readiness Score */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="card col-span-1 flex flex-col items-center justify-center py-6">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-32 h-32">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="8"
                  strokeDasharray={`${(readinessData.score / 100) * (2 * Math.PI * 50)} ${2 * Math.PI * 50}`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{readinessData.score}</span>
                <span className="text-[10px] text-[var(--muted)]">Readiness Score</span>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className={`text-sm font-medium ${readinessData.readyForHandover ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {readinessData.readyForHandover ? 'Ready for Handover' : 'Not Ready for Handover'}
              </span>
            </div>
          </div>

          <div className="card col-span-3">
            <div className="grid grid-cols-3 gap-4 h-full">
              <div className="flex flex-col justify-center border-r border-[var(--border)] pr-4">
                <p className="text-sm text-[var(--muted)] mb-1">Overall Test Completion</p>
                <p className="text-2xl font-bold">{readinessData.overallCompletion}%</p>
                <div className="h-2 rounded-full bg-[var(--border)] mt-2">
                  <div className="h-2 rounded-full bg-[var(--accent)]" style={{ width: `${readinessData.overallCompletion}%` }} />
                </div>
              </div>
              <div className="flex flex-col justify-center border-r border-[var(--border)] pr-4">
                <p className="text-sm text-[var(--muted)] mb-1">Remaining Critical Tests</p>
                <p className="text-2xl font-bold text-[var(--danger)]">{readinessData.remainingCriticalTests}</p>
                <p className="text-xs text-[var(--muted)] mt-1">Must pass before handover</p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm text-[var(--muted)] mb-1">Estimated Handover</p>
                <p className="text-2xl font-bold">Jul 15, 2026</p>
                <p className="text-xs text-[var(--muted)] mt-1">5 days remaining</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Testing Status */}
        <p className="text-sm font-semibold mb-3">System Testing Status</p>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {systems.map((system) => {
            const progress = Math.round((system.passed / system.total) * 100)
            return (
              <div
                key={system.id}
                className="card cursor-pointer hover:border-[var(--accent)] transition-all"
                onClick={() => setSelectedSystem(system.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <i className={`ti ${system.icon} text-[var(--accent)] text-lg`} />
                    <p className="text-sm font-medium m-0">{system.name}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusBadge(system.status)}`}>
                    {system.status}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center mb-2">
                  <div>
                    <p className="text-xs text-[var(--muted)] m-0">Total</p>
                    <p className="text-sm font-medium m-0">{system.total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted)] m-0">Passed</p>
                    <p className="text-sm font-medium text-[var(--success)] m-0">{system.passed}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted)] m-0">Failed</p>
                    <p className="text-sm font-medium text-[var(--danger)] m-0">{system.failed}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted)] m-0">Pending</p>
                    <p className="text-sm font-medium text-[var(--warning)] m-0">{system.pending}</p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--border)]">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${progress}%`,
                      background: system.failed > 0 ? 'var(--danger)' : 'var(--accent)'
                    }}
                  />
                </div>
                <p className="text-[10px] text-[var(--muted)] mt-1 text-right">{progress}% complete</p>
              </div>
            )
          })}
        </div>

        {/* Non-Conformance (NCR) */}
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-semibold m-0">Non-Conformance (NCR)</p>
        </div>
        <div className="card mb-6">
          {ncrData.map((ncr) => (
            <div key={ncr.id} className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium m-0">{ncr.issue}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusBadge(ncr.severity)}`}>
                    {ncr.severity}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-[var(--muted)]">
                  <span>Engineer: {ncr.engineer}</span>
                  <span>•</span>
                  <span>{ncr.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusBadge(ncr.status)}`}>
                  {ncr.status}
                </span>
                <button 
                  className="text-xs text-[var(--accent)] hover:underline"
                  onClick={() => setShowNCRModal(ncr.id)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Commissioning Timeline */}
        <p className="text-sm font-semibold mb-3">Commissioning Timeline</p>
        <div className="card mb-6">
          <div className="flex items-center justify-between relative">
            {timeline.map((item, index) => (
              <div key={index} className="flex-1 text-center relative">
                {index < timeline.length - 1 && (
                  <div className="absolute top-4 left-[60%] w-[80%] h-0.5 bg-[var(--border)]" />
                )}
                <div className="relative z-10">
                  <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${item.status === 'completed' ? 'bg-[var(--success-bg)]' : item.status === 'in-progress' ? 'bg-[var(--warning-bg)]' : 'bg-[var(--border)]'}`}>
                    <i className={`ti ${getTimelineIcon(item.status)} text-sm`} />
                  </div>
                  <p className="text-xs font-medium mt-2 m-0">{item.phase}</p>
                  <p className="text-[10px] text-[var(--muted)] m-0">{item.date}</p>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full mt-1 inline-block ${item.status === 'completed' ? 'bg-[var(--success-bg)] text-[var(--success)]' : item.status === 'in-progress' ? 'bg-[var(--warning-bg)] text-[var(--warning)]' : 'bg-[var(--border)] text-[var(--muted)]'}`}>
                    {getTimelineLabel(item.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="card border-l-4 border-l-[var(--accent)]">
          <div className="flex items-center gap-2 mb-3">
            <i className="ti ti-robot text-[var(--accent)] text-lg" />
            <p className="text-sm font-semibold m-0">AI Recommendations</p>
          </div>
          <div className="space-y-2">
            {aiRecommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusBadge(rec.priority)} flex-shrink-0 mt-0.5`}>
                  {rec.priority}
                </span>
                <div>
                  <p className="text-sm font-medium m-0">{rec.title}</p>
                  <p className="text-xs text-[var(--muted)] m-0 mt-0.5">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NCR Details Modal */}
      {showNCRModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="card max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-semibold m-0">NCR Details</p>
              <button
                onClick={() => setShowNCRModal(null)}
                className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                <i className="ti ti-x text-xl" />
              </button>
            </div>
            {ncrData.find(n => n.id === showNCRModal) && (
              <div className="space-y-3">
                <div className="bg-[var(--panel)] rounded-lg p-3">
                  <p className="text-sm font-medium m-0">Issue</p>
                  <p className="text-sm m-0">{ncrData.find(n => n.id === showNCRModal)?.issue}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-[var(--muted)] m-0">Severity</p>
                    <p className="text-sm font-medium m-0">{ncrData.find(n => n.id === showNCRModal)?.severity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted)] m-0">Status</p>
                    <p className="text-sm font-medium m-0">{ncrData.find(n => n.id === showNCRModal)?.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted)] m-0">Assigned Engineer</p>
                    <p className="text-sm m-0">{ncrData.find(n => n.id === showNCRModal)?.engineer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted)] m-0">Date Reported</p>
                    <p className="text-sm m-0">{ncrData.find(n => n.id === showNCRModal)?.date}</p>
                  </div>
                </div>
                <div className="border-t border-[var(--border)] pt-3">
                  <p className="text-xs text-[var(--muted)] m-0">Description</p>
                  <p className="text-sm m-0 mt-1">Detailed description of the non-conformance issue and its impact on project quality.</p>
                </div>
                <div className="flex gap-3 mt-2">
                  <Button className="flex-1 text-sm py-2">Update Status</Button>
                  <Button variant="outline" className="flex-1 text-sm py-2" onClick={() => setShowNCRModal(null)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}