import { apiGet } from './request'

export async function getDashboardData() {
  // Response shape must match the current mock object used by Dashboard.jsx
  const res = await apiGet('/api/dashboard')
  // Backend returns { success: true, data: { ...dashboardFields } }
  return res?.data ?? res
}

