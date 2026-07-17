import { apiGet } from './request'

// Backend integration
// - GET /api/projects returns projects for the authenticated user
// - We return the first project transformed to match the current ProjectHub UI shape
export async function getProjectSummary() {
  const res = await apiGet('/api/projects')

  // Backend is expected to return: { success: true, data: projects[] }
  const projects = res?.data || res || []
  const project = Array.isArray(projects) ? projects[0] : projects

  // If backend returns populated domain fields, pass through.
  if (project?.vendors || project?.equipment || project?.schedule) {
    return project
  }

  // Minimal fallback to keep UI from crashing (still no mock arrays).
  // Prefer updating backend to provide vendors/equipment/schedule later.
  return {
    name: project?.name || project?.title || '',
    status: project?.status || 'In progress',
    vendors: project?.vendors || [],
    equipment: project?.equipment || [],
    schedule: project?.schedule || []
  }
}

