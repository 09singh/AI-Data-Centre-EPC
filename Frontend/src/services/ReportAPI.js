import api from './api'

export const getReports = async () => {
  try {
    const response = await api.get('/reports')
    return response.data
  } catch (error) {
    console.warn('Reports API not available, showing empty state')
    return [] // Return empty array
  }
}

export const generateReport = async (reportData) => {
  try {
    const response = await api.post('/reports', reportData)
    return response.data
  } catch (error) {
    console.error('Generate report error:', error)
    throw error
  }
}

export const getReportById = async (id) => {
  try {
    const response = await api.get(`/reports/${id}`)
    return response.data
  } catch (error) {
    console.error('Get report error:', error)
    return null
  }
}

export const downloadReport = async (id, format = 'pdf') => {
  try {
    const response = await api.get(`/reports/${id}/download`, {
      responseType: 'blob',
      params: { format }
    })
    return response.data
  } catch (error) {
    console.error('Download report error:', error)
    throw error
  }
}

export const getCommissioningData = async () => {
  try {
    const response = await api.get('/commissioning')
    return response.data
  } catch (error) {
    console.warn('Commissioning API not available, showing empty state')
    return null
  }
}