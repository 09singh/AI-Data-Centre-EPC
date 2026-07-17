import { apiGet } from './request'

// Backend integration
// GET /api/reports returns: { success: true, data: Report[] }
export async function getReports() {
  const res = await apiGet('/api/reports')
  const payload = res?.data ?? res
  return Array.isArray(payload) ? payload : []
}

