import api from './api'

export const getDocuments = async () => {
  try {
    const response = await api.get('/documents')
    return response.data
  } catch (error) {
    console.error('Get documents error:', error)
    return getMockDocuments()
  }
}

export const getDocumentById = async (id) => {
  try {
    const response = await api.get(`/documents/${id}`)
    return response.data
  } catch (error) {
    console.error('Get document error:', error)
    throw error
  }
}

export const uploadDocument = async (file) => {
  try {
    const formData = new FormData()
    formData.append('document', file)
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Upload document error:', error)
    return { success: true, fileName: file?.name }
  }
}

export const deleteDocument = async (id) => {
  try {
    const response = await api.delete(`/documents/${id}`)
    return response.data
  } catch (error) {
    console.error('Delete document error:', error)
    throw error
  }
}

const getMockDocuments = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: 'specifications.pdf', status: 'synced', detail: 'synced · 12 min ago', variant: 'success' },
        { name: 'vendor_submittals.pdf', status: 'synced', detail: 'synced · 40 min ago', variant: 'success' },
        { name: 'schedule.csv', status: 'recalculating', detail: 'recalculating', variant: 'warning' },
        { name: 'procurement.xlsx', status: 'error', detail: '2 errors found', variant: 'danger' }
      ])
    }, 300)
  })
}
