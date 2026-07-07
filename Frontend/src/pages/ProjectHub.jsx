import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Loader from '../components/Loader'
import UploadBox from '../components/UploadBox'
import { Button } from '../components/Buttons'
import { getDocuments, uploadDocument } from '../services/DocumentAPI'
import { getProjectSummary } from '../services/ProjectAPI'

export default function ProjectHub() {
  const [documents, setDocuments] = useState(null)
  const [projectData, setProjectData] = useState(null)
  const [activeTab, setActiveTab] = useState('documents')

  useEffect(() => {
    getDocuments().then(setDocuments)
    getProjectSummary().then(setProjectData)
  }, [])

  const handleUpload = async (file) => {
    const result = await uploadDocument(file)
    // Refresh documents after upload
    getDocuments().then(setDocuments)
    return result
  }

  const tabs = ['documents', 'schedule', 'vendors', 'equipment']

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>Project Hub</p>
        <Button variant="outline" style={{ fontSize: 11, padding: '4px 14px' }}>
          <i className="ti ti-plus" style={{ marginRight: 4, verticalAlign: -2 }} />
          Add
        </Button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              border: 'none',
              background: activeTab === tab ? 'var(--accent-soft)' : 'none',
              color: activeTab === tab ? 'var(--accent)' : 'var(--muted)',
              padding: '8px 16px',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: activeTab === tab ? 500 : 400,
              textTransform: 'capitalize',
              transition: 'background 0.15s, color 0.15s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div>
          <UploadBox onUpload={handleUpload} label="Upload project document" />

          <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.03em', margin: '16px 0 10px' }}>
            Uploaded Documents
          </p>

          {!documents && <Loader />}

          {documents && documents.map((doc) => (
            <div
              key={doc.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                border: '1px solid var(--border)',
                borderRadius: 8,
                marginBottom: 6
              }}
            >
              <div>
                <p style={{ fontSize: 13, margin: 0, color: doc.variant === 'danger' ? 'var(--danger)' : 'var(--text)' }}>
                  <i className="ti ti-file-text" style={{ marginRight: 8, color: 'var(--muted)' }} />
                  {doc.name}
                </p>
                <p style={{ fontSize: 11, margin: '2px 0 0', color: `var(--${doc.variant === 'default' ? 'muted' : doc.variant})` }}>
                  {doc.detail}
                </p>
              </div>
              <span
                style={{
                  fontSize: 10,
                  padding: '2px 10px',
                  borderRadius: 12,
                  background: doc.variant === 'success' ? 'var(--success-bg)' :
                            doc.variant === 'warning' ? 'var(--warning-bg)' :
                            doc.variant === 'danger' ? 'var(--danger-bg)' : 'var(--border)',
                  color: doc.variant === 'success' ? 'var(--success)' :
                         doc.variant === 'warning' ? 'var(--warning)' :
                         doc.variant === 'danger' ? 'var(--danger)' : 'var(--muted)'
                }}
              >
                {doc.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div>
          {!projectData && <Loader />}
          {projectData && projectData.schedule && (
            <div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>Project Timeline</p>
              {projectData.schedule.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--border)'
                  }}
                >
                  <span style={{ fontSize: 13 }}>{item.task}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{item.date}</span>
                    <span
                      style={{
                        fontSize: 10,
                        padding: '2px 10px',
                        borderRadius: 12,
                        background: item.status === 'completed' ? 'var(--success-bg)' :
                                  item.status === 'in-progress' ? 'var(--warning-bg)' : 'var(--border)',
                        color: item.status === 'completed' ? 'var(--success)' :
                               item.status === 'in-progress' ? 'var(--warning)' : 'var(--muted)'
                      }}
                    >
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
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>Active Vendors</p>
              {projectData.vendors.map((vendor, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    marginBottom: 6
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, margin: 0 }}>{vendor.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0' }}>{vendor.category}</p>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      padding: '2px 10px',
                      borderRadius: 12,
                      background: vendor.status === 'Active' ? 'var(--success-bg)' :
                                vendor.status === 'Delayed' ? 'var(--danger-bg)' : 'var(--warning-bg)',
                      color: vendor.status === 'Active' ? 'var(--success)' :
                             vendor.status === 'Delayed' ? 'var(--danger)' : 'var(--warning)'
                    }}
                  >
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
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>Equipment Status</p>
              {projectData.equipment.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    marginBottom: 6
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, margin: 0 }}>{item.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0' }}>{item.category}</p>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      padding: '2px 10px',
                      borderRadius: 12,
                      background: item.status === 'On track' ? 'var(--success-bg)' :
                                item.status === 'Delayed' ? 'var(--danger-bg)' : 'var(--warning-bg)',
                      color: item.status === 'On track' ? 'var(--success)' :
                             item.status === 'Delayed' ? 'var(--danger)' : 'var(--warning)'
                    }}
                  >
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