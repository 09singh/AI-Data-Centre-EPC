import api from './api'

export const getProjects = async () => {
  try {
    const response = await api.get('/projects')
    return response.data
  } catch (error) {
    console.error('Get projects error:', error)
    return getMockProjects()
  }
}

export const getProjectById = async (id) => {
  try {
    const response = await api.get(`/projects/${id}`)
    return response.data
  } catch (error) {
    console.error('Get project error:', error)
    return getMockProjectSummary()
  }
}

export const createProject = async (projectData) => {
  try {
    const response = await api.post('/projects', projectData)
    return response.data
  } catch (error) {
    console.error('Create project error:', error)
    throw error
  }
}

export const updateProject = async (id, projectData) => {
  try {
    const response = await api.put(`/projects/${id}`, projectData)
    return response.data
  } catch (error) {
    console.error('Update project error:', error)
    throw error
  }
}

export const deleteProject = async (id) => {
  try {
    const response = await api.delete(`/projects/${id}`)
    return response.data
  } catch (error) {
    console.error('Delete project error:', error)
    throw error
  }
}

export const getProjectSummary = async () => {
  try {
    const response = await api.get('/projects/summary')
    return response.data
  } catch (error) {
    console.error('Project summary error:', error)
    return getMockProjectSummary()
  }
}

const getMockProjectSummary = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: 'Riverbend Data Centre',
        status: 'In progress',
        vendors: [
          { name: 'Voltage Systems Inc.', category: 'Switchgear', status: 'Active' },
          { name: 'CoolFlow Engineering', category: 'Cooling towers', status: 'Active' },
          { name: 'SteelCore Industries', category: 'Structural steel', status: 'Delayed' }
        ],
        equipment: [
          { name: 'Switchgear unit A', category: 'Electrical', status: 'Delayed' },
          { name: 'Cooling tower 1', category: 'Mechanical', status: 'On track' },
          { name: 'Generator set G1', category: 'Power', status: 'On track' },
          { name: 'UPS module 1', category: 'Power', status: 'Pending' }
        ],
        schedule: [
          { task: 'Design review', date: 'Jan 15, 2026', status: 'completed' },
          { task: 'Procurement phase 1', date: 'Feb 28, 2026', status: 'in-progress' },
          { task: 'Site preparation', date: 'Mar 15, 2026', status: 'pending' },
          { task: 'Foundation work', date: 'Apr 30, 2026', status: 'pending' }
        ]
      })
    }, 300)
  })
}
