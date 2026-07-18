import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Loader from '../components/Loader'
import UploadBox from '../components/UploadBox'
import { Button } from '../components/Buttons'
import { getDocuments, uploadDocument } from '../services/DocumentAPI'
import { getProjectSummary, getProjectSchedule, getProjectVendors, getProjectEquipment } from '../services/ProjectAPI'
import { useProject } from '../context/ProjectContext'

export default function ProjectHub() {
  const location = useLocation()
  const navigate = useNavigate()
  const { selectedProject, setSelectedProject } = useProject()
  const [documents, setDocuments] = useState(null)
  const [projectData, setProjectData] = useState(null)
  const [selectedDoc, setSelectedDoc] = useState(null)

  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)

  const getActiveTab = () => {
    const path = location.pathname
    if (path.includes('/documents')) return 'documents'
    if (path.includes('/schedule')) return 'schedule'
    if (path.includes('/vendors')) return 'vendors'
    if (path.includes('/equipment')) return 'equipment'
    return 'documents'
  }

  const [activeTab, setActiveTab] = useState(getActiveTab())

  useEffect(() => {
    const loadProjectData = async () => {
      const summary = await getProjectSummary(selectedProject?._id || null)
      setProjectData(summary)
      if (selectedProject?._id) {
        const [schedule, vendors, equipment] = await Promise.all([
          getProjectSchedule(selectedProject._id),
          getProjectVendors(selectedProject._id),
          getProjectEquipment(selectedProject._id)
        ])
        setTasks(schedule || [])
        setVendorsData(vendors || [])
        setEquipmentData(equipment || [])
      }
    }
    getDocuments().then(setDocuments)
    loadProjectData()
  }, [selectedProject?._id])

  useEffect(() => {
    setActiveTab(getActiveTab())
  }, [location.pathname])

  const handleUpload = async (file) => {
    try {
      // Get project ID from project data
      let projectId = projectData?._id;
      
      if (!projectId) {
        // Try to create a project first
        try {
          const { createProject } = await import('../services/ProjectAPI');
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const newProject = await createProject({
            name: 'Riverbend Data Centre',
            company: 'EPC Solutions',
            location: 'Mumbai, India',
            status: 'In Progress',
            description: 'Default project',
            createdBy: user.id || null
          });
          projectId = newProject._id;
          // Refresh project data
          const updatedProject = await getProjectSummary();
          setProjectData(updatedProject);
          console.log('Created new project with ID:', projectId);
        } catch (err) {
          console.error('Failed to create project:', err);
          alert('Please create a project first.');
          return;
        }
      }
      
      console.log('Uploading document with projectId:', projectId);
      
      const result = await uploadDocument(file, projectId);
      
      // Refresh documents after upload
      const updatedDocs = await getDocuments();
      setDocuments(updatedDocs);
      return result;
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error.response?.data?.message || 'Failed to upload document');
    }
  }

  const handleTabChange = (tab) => {
    navigate(`/project-hub/${tab}`)
  }

  const tabs = ['documents', 'schedule', 'vendors', 'equipment']

  // Schedule Tasks Data - Kanban Board
  const [tasks, setTasks] = useState([])
  const [vendorsData, setVendorsData] = useState([])
  const [equipmentData, setEquipmentData] = useState([])

  // Get status columns
  const getStatusColumns = () => {
    const columns = {
      'Upcoming': [],
      'In Progress': [],
      'At Risk': [],
      'Delayed': [],
      'Completed': []
    }
    tasks.forEach(task => {
      if (columns[task.status]) {
        columns[task.status].push(task)
      }
    })
    return columns
  }

  const columns = getStatusColumns()

  const getPriorityColor = (priority) => {
    const colors = {
      'Critical': 'bg-[var(--danger-bg)] text-[var(--danger)]',
      'High': 'bg-[var(--warning-bg)] text-[var(--warning)]',
      'Medium': 'bg-[var(--accent-soft)] text-[var(--accent)]',
      'Low': 'bg-[var(--border)] text-[var(--muted)]'
    }
    return colors[priority] || 'bg-[var(--border)] text-[var(--muted)]'
  }

  const getStatusIcon = (status) => {
    const icons = {
      'Upcoming': 'ti-clock',
      'In Progress': 'ti-loader',
      'At Risk': 'ti-alert-triangle',
      'Delayed': 'ti-alert-circle',
      'Completed': 'ti-check-circle'
    }
    return icons[status] || 'ti-circle'
  }

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-[var(--success-bg)] text-[var(--success)]',
      'In Progress': 'bg-[var(--warning-bg)] text-[var(--warning)]',
      'Pending': 'bg-[var(--border)] text-[var(--muted)]',
      'Not Installed': 'bg-[var(--border)] text-[var(--muted)]',
      'Installed': 'bg-[var(--success-bg)] text-[var(--success)]',
      'Commissioned': 'bg-[var(--success-bg)] text-[var(--success)]',
      'Passed': 'bg-[var(--success-bg)] text-[var(--success)]',
      'Failed': 'bg-[var(--danger-bg)] text-[var(--danger)]',
      'Active': 'bg-[var(--success-bg)] text-[var(--success)]',
      'On Track': 'bg-[var(--success-bg)] text-[var(--success)]',
      'Delayed': 'bg-[var(--danger-bg)] text-[var(--danger)]',
      'Delivered': 'bg-[var(--success-bg)] text-[var(--success)]',
      'At Risk': 'bg-[var(--danger-bg)] text-[var(--danger)]',
      'Upcoming': 'bg-[var(--border)] text-[var(--muted)]'
    }
    return colors[status] || 'bg-[var(--border)] text-[var(--muted)]'
  }

  const getColumnHeaderColor = (status) => {
    const colors = {
      'Upcoming': 'text-[var(--muted)]',
      'In Progress': 'text-[var(--warning)]',
      'At Risk': 'text-[var(--danger)]',
      'Delayed': 'text-[var(--danger)]',
      'Completed': 'text-[var(--success)]'
    }
    return colors[status] || 'text-[var(--muted)]'
  }

  const getColumnBgColor = (status) => {
    const colors = {
      'Upcoming': 'bg-[var(--bg)]',
      'In Progress': 'bg-[var(--panel)]',
      'At Risk': 'bg-[var(--danger-bg)]/50',
      'Delayed': 'bg-[var(--danger-bg)]/50',
      'Completed': 'bg-[var(--success-bg)]/30'
    }
    return colors[status] || 'bg-[var(--bg)]'
  }

  const getProgressColor = (progress, status) => {
    if (status === 'Completed') return 'var(--success)'
    if (status === 'Delayed' || status === 'At Risk') return 'var(--danger)'
    if (status === 'In Progress') return 'var(--warning)'
    return 'var(--border)'
  }

  return (
    <Layout>
      <p className="text-sm font-medium mb-3.5">Project Hub</p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border)] mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 text-xs font-medium capitalize rounded-t-lg transition-colors ${
              activeTab === tab 
                ? 'bg-[var(--accent-soft)] text-[var(--accent)]' 
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <UploadBox onUpload={handleUpload} label="Upload project document" />

            <p className="text-[11px] text-[var(--muted)] uppercase tracking-wide mt-4 mb-2.5">
              Uploaded Documents
            </p>

            {!documents && <Loader />}

            {documents && documents.map((doc) => (
              <div
                key={doc.name}
                onClick={() => setSelectedDoc(doc)}
                className={`flex justify-between items-center p-2.5 border rounded-lg mb-1.5 cursor-pointer transition-colors ${
                  selectedDoc?.name === doc.name 
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)]' 
                    : 'border-[var(--border)] hover:bg-[var(--panel)]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-sm m-0 truncate ${doc.variant === 'danger' ? 'text-[var(--danger)]' : 'text-[var(--text)]'}`}>
                    <i className="ti ti-file-text mr-2 text-[var(--muted)]" />
                    {doc.name}
                  </p>
                  <p className={`text-[11px] m-0 mt-0.5 text-[var(--${doc.variant === 'default' ? 'muted' : doc.variant})]`}>
                    {doc.detail}
                  </p>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${
                  doc.variant === 'success' ? 'bg-[var(--success-bg)] text-[var(--success)]' :
                  doc.variant === 'warning' ? 'bg-[var(--warning-bg)] text-[var(--warning)]' :
                  doc.variant === 'danger' ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : 
                  'bg-[var(--border)] text-[var(--muted)]'
                }`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>

          {/* AI Document Intelligence */}
          <div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <i className="ti ti-brain text-[var(--accent)] text-lg" />
              <p className="m-0 text-sm font-medium">AI Document Intelligence</p>
            </div>
            
            {selectedDoc ? (
              <div>
                <div className="bg-[var(--accent-soft)] rounded-lg p-3 mb-3">
                  <p className="text-xs text-[var(--muted)] m-0">Selected Document</p>
                  <p className="text-sm font-medium m-0 mt-0.5">{selectedDoc.name}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="bg-[var(--bg)] rounded-lg p-3 border border-[var(--border)]">
                    <p className="text-xs text-[var(--muted)] m-0">AI Summary</p>
                    <p className="m-0 mt-1 text-sm">Document processed successfully. No critical issues detected.</p>
                  </div>
                  
                  <div className="bg-[var(--bg)] rounded-lg p-3 border border-[var(--border)]">
                    <p className="text-xs text-[var(--muted)] m-0">Key Extracted Data</p>
                    <div className="text-sm m-0 mt-1 space-y-0.5">
                      <p className="m-0">• Project: Riverbend Data Centre</p>
                      <p className="m-0">• Type: {selectedDoc.name.split('.').pop().toUpperCase()}</p>
                      <p className="m-0">• Status: {selectedDoc.status}</p>
                    </div>
                  </div>

                  <button 
                    className="flex items-center justify-center w-full gap-2 py-2 text-sm btn"
                    onClick={() => {
                      if (!selectedDoc) return
                      navigate('/ai-brain', { 
                        state: { 
                          documentId: selectedDoc.aiDocumentId || selectedDoc.documentId,  // ← Use aiDocumentId first
                          documentName: selectedDoc.name,
                          initialQuestion: `Tell me about ${selectedDoc.name}`
                        }
                      })
                    }}
                  >
                    <i className="text-sm ti ti-message-2" />
                    Ask AI about this document
                  </button>
                  
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--muted)]">
                <i className="block mb-3 text-3xl opacity-50 ti ti-file-text" />
                <p className="m-0 text-sm">Select a document to analyze</p>
                <p className="m-0 mt-1 text-xs">Click on any document to view AI insights</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Tab - Interactive Kanban Board */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-5 gap-3">
            <div className="py-2 text-center card">
              <p className="text-xs text-[var(--muted)] m-0">Total Tasks</p>
              <p className="m-0 text-lg font-bold">{tasks.length}</p>
            </div>
            <div className="card text-center py-2 border-l-4 border-l-[var(--success)]">
              <p className="text-xs text-[var(--muted)] m-0">Completed</p>
              <p className="text-lg font-bold text-[var(--success)] m-0">{tasks.filter(t => t.status === 'Completed').length}</p>
            </div>
            <div className="card text-center py-2 border-l-4 border-l-[var(--warning)]">
              <p className="text-xs text-[var(--muted)] m-0">In Progress</p>
              <p className="text-lg font-bold text-[var(--warning)] m-0">{tasks.filter(t => t.status === 'In Progress').length}</p>
            </div>
            <div className="card text-center py-2 border-l-4 border-l-[var(--danger)]">
              <p className="text-xs text-[var(--muted)] m-0">At Risk / Delayed</p>
              <p className="text-lg font-bold text-[var(--danger)] m-0">{tasks.filter(t => t.status === 'At Risk' || t.status === 'Delayed').length}</p>
            </div>
            <div className="card text-center py-2 border-l-4 border-l-[var(--muted)]">
              <p className="text-xs text-[var(--muted)] m-0">Upcoming</p>
              <p className="text-lg font-bold text-[var(--muted)] m-0">{tasks.filter(t => t.status === 'Upcoming').length}</p>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-5 gap-3 overflow-x-auto">
            {Object.keys(columns).map((status) => (
              <div key={status} className="flex-shrink-0 min-w-[200px]">
                <div className={`rounded-t-lg p-2 ${getColumnBgColor(status)} border border-[var(--border)]`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <i className={`ti ${getStatusIcon(status)} ${getColumnHeaderColor(status)}`} />
                      <p className={`text-sm font-medium m-0 ${getColumnHeaderColor(status)}`}>{status}</p>
                    </div>
                    <span className="text-xs text-[var(--muted)]">{columns[status].length}</span>
                  </div>
                </div>
                <div className={`${getColumnBgColor(status)} border border-t-0 border-[var(--border)] rounded-b-lg p-2 min-h-[200px]`}>
                  {columns[status].length === 0 ? (
                    <p className="text-xs text-[var(--muted)] text-center py-4">No tasks</p>
                  ) : (
                    columns[status].map((task) => (
                      <div
                        key={task.id}
                        className="card mb-2 cursor-pointer hover:border-[var(--accent)] transition-all"
                        onClick={() => setSelectedTask(task.id)}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="flex-1 m-0 text-sm font-medium">{task.title}</p>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0 ml-1`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted)] m-0 truncate">{task.description}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-[var(--muted)]">
                          <i className="ti ti-calendar" />
                          <span>{task.dueDate}</span>
                          <span>•</span>
                          <i className="ti ti-users" />
                          <span className="truncate">{task.assignedTeam}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 rounded-full bg-[var(--border)]">
                            <div 
                              className="h-1 rounded-full" 
                              style={{ 
                                width: `${task.progress}%`,
                                background: getProgressColor(task.progress, task.status)
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-[var(--muted)]">{task.progress}%</span>
                        </div>
                        {task.status === 'Delayed' && (
                          <div className="mt-1 text-[10px] text-[var(--danger)] flex items-center gap-1">
                            <i className="ti ti-alert-circle" />
                            <span>Delayed - Action Required</span>
                          </div>
                        )}
                        {task.status === 'At Risk' && (
                          <div className="mt-1 text-[10px] text-[var(--danger)] flex items-center gap-1">
                            <i className="ti ti-alert-triangle" />
                            <span>At Risk - Monitor Closely</span>
                          </div>
                        )}
                        {task.dependencies && task.dependencies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {task.dependencies.map((dep, i) => (
                              <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-[var(--panel)] border border-[var(--border)] text-[var(--muted)]">
                                {dep}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Task Details Modal */}
          {selectedTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="card max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <i className={`ti ${getStatusIcon(tasks.find(t => t.id === selectedTask)?.status)} text-[var(--accent)]`} />
                    <p className="m-0 text-base font-semibold">{tasks.find(t => t.id === selectedTask)?.title}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                  >
                    <i className="text-xl ti ti-x" />
                  </button>
                </div>

                {(() => {
                  const task = tasks.find(t => t.id === selectedTask)
                  if (!task) return null

                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-[var(--muted)] m-0">Status</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--muted)] m-0">Priority</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--muted)] m-0">Due Date</p>
                          <p className="m-0 text-sm">{task.dueDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--muted)] m-0">Progress</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-[var(--border)]">
                              <div 
                                className="h-2 rounded-full" 
                                style={{ 
                                  width: `${task.progress}%`,
                                  background: getProgressColor(task.progress, task.status)
                                }}
                              />
                            </div>
                            <span className="text-sm">{task.progress}%</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-[var(--muted)] m-0">Description</p>
                        <p className="text-sm m-0 mt-0.5">{task.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-[var(--muted)] m-0">Assigned Team</p>
                          <p className="m-0 text-sm">{task.assignedTeam}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--muted)] m-0">Category</p>
                          <p className="m-0 text-sm">{task.category}</p>
                        </div>
                      </div>

                      {task.vendor && (
                        <div>
                          <p className="text-xs text-[var(--muted)] m-0">Vendor</p>
                          <p className="m-0 text-sm">{task.vendor}</p>
                        </div>
                      )}

                      {task.equipment && task.equipment.length > 0 && (
                        <div>
                          <p className="text-xs text-[var(--muted)] m-0">Equipment</p>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {task.equipment.map((eq, i) => (
                              <span key={i} className="text-xs bg-[var(--panel)] px-2 py-0.5 rounded border border-[var(--border)]">
                                {eq}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {task.dependencies && task.dependencies.length > 0 && (
                        <div>
                          <p className="text-xs text-[var(--muted)] m-0">Dependencies</p>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {task.dependencies.map((dep, i) => (
                              <span key={i} className="text-xs bg-[var(--panel)] px-2 py-0.5 rounded border border-[var(--border)]">
                                {dep}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {task.documents && task.documents.length > 0 && (
                        <div>
                          <p className="text-xs text-[var(--muted)] m-0">Related Documents</p>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {task.documents.map((doc, i) => (
                              <span key={i} className="text-xs bg-[var(--panel)] px-2 py-0.5 rounded border border-[var(--border)]">
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Insights */}
                      {task.aiInsight && (
                        <div className="bg-[var(--accent-soft)] rounded-lg p-3 border border-[var(--accent)]">
                          <div className="flex items-center gap-2 mb-1">
                            <i className="ti ti-brain text-[var(--accent)]" />
                            <p className="m-0 text-xs font-medium">AI Schedule Insight</p>
                          </div>
                          <p className="m-0 text-sm">{task.aiInsight}</p>
                        </div>
                      )}

                      {/* Recovery Suggestion */}
                      {task.recoverySuggestion && (
                        <div className="bg-[var(--warning-bg)] rounded-lg p-3 border border-[var(--warning)]">
                          <div className="flex items-center gap-2 mb-1">
                            <i className="ti ti-tools text-[var(--warning)]" />
                            <p className="m-0 text-xs font-medium">Recovery Suggestion</p>
                          </div>
                          <p className="m-0 text-sm">{task.recoverySuggestion}</p>
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <Button className="flex-1 py-2 text-sm">Update Status</Button>
                        <Button variant="outline" className="flex-1 py-2 text-sm" onClick={() => setSelectedTask(null)}>
                          Close
                        </Button>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vendors Tab */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          {/* Vendor Directory */}
          <div className="card">
            <p className="mb-3 text-sm font-medium">Vendor Directory</p>
            <div className="grid grid-cols-2 gap-3">
              {vendorsData.map((vendor) => (
                <div
                  key={vendor.id}
                  className="border border-[var(--border)] rounded-lg p-3 cursor-pointer hover:border-[var(--accent)] transition-all"
                  onClick={() => setSelectedVendor(vendor.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="m-0 text-sm font-medium">{vendor.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(vendor.status)}`}>
                      {vendor.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] m-0">{vendor.equipment.join(', ')}</p>
                  <p className="text-xs text-[var(--muted)] m-0 mt-1">{vendor.contact}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Procurement Status */}
          <div className="card">
            <p className="mb-3 text-sm font-medium">Delivery & Procurement Status</p>
            <div className="space-y-2">
              {vendorsData.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <div>
                    <p className="m-0 text-sm">{vendor.name}</p>
                    <p className="text-xs text-[var(--muted)] m-0">Expected: {vendor.expectedDelivery}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(vendor.deliveryStatus)}`}>
                      {vendor.deliveryStatus}
                    </span>
                    <span className="text-xs text-[var(--muted)]">{vendor.equipment.length} items</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Performance */}
          <div className="card">
            <p className="mb-3 text-sm font-medium">Vendor Performance</p>
            <div className="grid grid-cols-3 gap-4">
              {vendorsData.map((vendor) => (
                <div key={vendor.id} className="border border-[var(--border)] rounded-lg p-3 text-center">
                  <p className="m-0 text-sm font-medium">{vendor.name}</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold">{vendor.reliabilityScore}%</span>
                      <span className="text-xs text-[var(--muted)]">Reliability</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-1 text-xs text-[var(--muted)]">
                      <span>{vendor.completedOrders} orders</span>
                      <span>{vendor.issues} issues</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Equipment Tab */}
      {activeTab === 'equipment' && (
        <div className="space-y-4">
          {/* Equipment Inventory */}
          <div className="card">
            <p className="mb-3 text-sm font-medium">Equipment Inventory</p>
            <div className="grid grid-cols-2 gap-3">
              {equipmentData.map((equipment) => (
                <div
                  key={equipment.id}
                  className="border border-[var(--border)] rounded-lg p-3 cursor-pointer hover:border-[var(--accent)] transition-all"
                  onClick={() => setSelectedEquipment(equipment.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <i className={`ti ${
                        equipment.type === 'Electrical' ? 'ti-bolt' :
                        equipment.type === 'Mechanical' ? 'ti-snowflake' :
                        equipment.type === 'Power' ? 'ti-device-floppy' :
                        'ti-shield'
                      } text-[var(--accent)]`} />
                      <p className="m-0 text-sm font-medium">{equipment.name}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(equipment.status)}`}>
                      {equipment.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-[var(--muted)]">
                    <span>Model: {equipment.model}</span>
                    <span>Qty: {equipment.quantity}</span>
                    <span>Vendor: {equipment.vendor}</span>
                    <span>Testing: {equipment.testingStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Installation & Testing Status */}
          <div className="card">
            <p className="mb-3 text-sm font-medium">Installation & Testing Status</p>
            <div className="space-y-2">
              {equipmentData.map((equipment) => (
                <div key={equipment.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <div>
                    <p className="m-0 text-sm">{equipment.name}</p>
                    <p className="text-xs text-[var(--muted)] m-0">{equipment.type} · {equipment.model}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(equipment.installationStatus)}`}>
                      {equipment.installationStatus}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(equipment.testingStatus)}`}>
                      {equipment.testingStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment Details */}
          {selectedEquipment && (
            <div className="card border-[var(--accent)]">
              <div className="flex items-center justify-between mb-3">
                <p className="m-0 text-sm font-medium">Equipment Details</p>
                <button 
                  onClick={() => setSelectedEquipment(null)}
                  className="text-[var(--muted)] hover:text-[var(--text)]"
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              {equipmentData.find(e => e.id === selectedEquipment) && (
                <div>
                  {(() => {
                    const eq = equipmentData.find(e => e.id === selectedEquipment)
                    return (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs text-[var(--muted)] m-0">Specifications</p>
                          <p className="m-0 text-sm">{eq.specifications}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-[var(--muted)] m-0">Vendor</p>
                          <p className="m-0 text-sm">{eq.vendor}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-[var(--muted)] m-0">Related Documents</p>
                          <div className="flex flex-wrap gap-1">
                            {eq.documents.map((doc, i) => (
                              <span key={i} className="text-xs bg-[var(--panel)] px-2 py-0.5 rounded border border-[var(--border)]">
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-[var(--muted)] m-0">Maintenance History</p>
                          <p className="m-0 text-sm">{eq.maintenanceHistory}</p>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}

