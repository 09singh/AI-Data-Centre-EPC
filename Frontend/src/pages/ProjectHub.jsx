import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Loader from '../components/Loader'
import UploadBox from '../components/UploadBox'
import { getDocuments, uploadDocument } from '../services/DocumentAPI'
import { getProjectSummary } from '../services/ProjectAPI'

export default function ProjectHub() {
  const location = useLocation()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState(null)
  const [projectData, setProjectData] = useState(null)
  const [selectedDoc, setSelectedDoc] = useState(null)

  // Get active tab from URL
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
    getDocuments().then(setDocuments)
    getProjectSummary().then(setProjectData)
  }, [])

  useEffect(() => {
    setActiveTab(getActiveTab())
  }, [location.pathname])

  const handleUpload = async (file) => {
    const result = await uploadDocument(file)
    getDocuments().then(setDocuments)
    return result
  }

  const handleTabChange = (tab) => {
    navigate(`/project-hub/${tab}`)
  }

  const tabs = ['documents', 'schedule', 'vendors', 'equipment']

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

      {/* Documents Tab - Split View */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-2 gap-4">
          {/* Left: Upload & Documents */}
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

          {/* Right: AI Document Intelligence */}
          <div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <i className="ti ti-brain text-[var(--accent)] text-lg" />
              <p className="text-sm font-medium m-0">AI Document Intelligence</p>
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
                    <p className="text-sm m-0 mt-1">Document processed successfully. No critical issues detected.</p>
                  </div>
                  
                  <div className="bg-[var(--bg)] rounded-lg p-3 border border-[var(--border)]">
                    <p className="text-xs text-[var(--muted)] m-0">Key Extracted Data</p>
                    <div className="text-sm m-0 mt-1 space-y-0.5">
                      <p className="m-0">• Project: Riverbend Data Centre</p>
                      <p className="m-0">• Type: {selectedDoc.name.split('.').pop().toUpperCase()}</p>
                      <p className="m-0">• Status: {selectedDoc.status}</p>
                    </div>
                  </div>

                  <button className="btn w-full text-sm py-2 flex items-center justify-center gap-2">
                    <i className="ti ti-message-2 text-sm" />
                    Ask AI about this document
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--muted)]">
                <i className="ti ti-file-text text-3xl block mb-3 opacity-50" />
                <p className="text-sm m-0">Select a document to analyze</p>
                <p className="text-xs m-0 mt-1">Click on any document to view AI insights</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div>
          {!projectData && <Loader />}
          {projectData && projectData.schedule && (
            <div>
              <p className="text-xs text-[var(--muted)] mb-2.5">Project Timeline</p>
              {projectData.schedule.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                  <span className="text-sm">{item.task}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[var(--muted)]">{item.date}</span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full ${
                      item.status === 'completed' ? 'bg-[var(--success-bg)] text-[var(--success)]' :
                      item.status === 'in-progress' ? 'bg-[var(--warning-bg)] text-[var(--warning)]' : 
                      'bg-[var(--border)] text-[var(--muted)]'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vendors Tab */}
      {activeTab === 'vendors' && (
        <div>
          {!projectData && <Loader />}
          {projectData && projectData.vendors && (
            <div>
              <p className="text-xs text-[var(--muted)] mb-2.5">Active Vendors</p>
              {projectData.vendors.map((vendor, i) => (
                <div key={i} className="flex justify-between items-center p-2.5 border border-[var(--border)] rounded-lg mb-1.5">
                  <div>
                    <p className="text-sm m-0">{vendor.name}</p>
                    <p className="text-[11px] text-[var(--muted)] m-0 mt-0.5">{vendor.category}</p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full ${
                    vendor.status === 'Active' ? 'bg-[var(--success-bg)] text-[var(--success)]' :
                    vendor.status === 'Delayed' ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : 
                    'bg-[var(--warning-bg)] text-[var(--warning)]'
                  }`}>
                    {vendor.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Equipment Tab */}
      {activeTab === 'equipment' && (
        <div>
          {!projectData && <Loader />}
          {projectData && projectData.equipment && (
            <div>
              <p className="text-xs text-[var(--muted)] mb-2.5">Equipment Status</p>
              {projectData.equipment.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2.5 border border-[var(--border)] rounded-lg mb-1.5">
                  <div>
                    <p className="text-sm m-0">{item.name}</p>
                    <p className="text-[11px] text-[var(--muted)] m-0 mt-0.5">{item.category}</p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full ${
                    item.status === 'On track' ? 'bg-[var(--success-bg)] text-[var(--success)]' :
                    item.status === 'Delayed' ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : 
                    'bg-[var(--warning-bg)] text-[var(--warning)]'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}