import { apiGet, apiPost, API_BASE_URL } from './request'

// Real backend integration (no mock)
// Backend routes:
//  - GET  /api/documents
//  - POST /api/documents (multipart/form-data; field name: `file` + body field `projectId`)

function getAuthToken() {
  // This app currently stores only `userDetails` in AuthContext (no token persistence).
  // To avoid route failures, we read token from localStorage if present.
  return localStorage.getItem('token') || ''
}

export async function getDocuments() {
  const token = getAuthToken()
  const res = await apiGet('/api/documents', token ? { Authorization: `Bearer ${token}` } : undefined)

  // backend returns { success: true, data: documents }
  const docs = res?.data ?? res

  // Normalize fields for existing ProjectHub UI.
  // UI expects doc.name, doc.status, doc.detail, doc.variant
  return (docs || []).map((d) => {
    const aiStatus = d.aiStatus || d.status || 'unknown'
    let variant = 'default'
    if (aiStatus === 'indexed' || aiStatus === 'synced') variant = 'success'
    else if (aiStatus === 'processing') variant = 'warning'
    else if (aiStatus === 'failed' || aiStatus === 'error') variant = 'danger'

    return {
      name: d.originalName || d.fileName || d.fileName || d.documentId || 'document',
      status: aiStatus,
      detail: d.aiStatus === 'processing' ? 'processing…' : (d.updatedAt || d.aiUpdatedAt || d.uploadedAt || ''),
      variant,
      raw: d
    }
  })
}

export async function uploadDocument(file, { projectId } = {}) {
  if (!file) throw new Error('Missing file')
  if (!projectId) throw new Error('Missing projectId for document upload')

  const token = getAuthToken()

  const form = new FormData()
  form.append('file', file)
  form.append('projectId', projectId)

  const url = API_BASE_URL ? `${API_BASE_URL.replace(/\/$/, '')}/api/documents` : '/api/documents'

  const res = await fetch(url, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form
  })

  const payload = await res.json().catch(() => null)
  if (!res.ok) {
    const message = (payload && (payload.message || payload.error)) || `Request failed with status ${res.status}`
    throw new Error(message)
  }

  // backend returns { success: true, data: document }
  return payload?.data || payload
}

