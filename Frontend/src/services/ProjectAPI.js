import api from './api'

export const getProjects = async () => {
  try {
    const response = await api.get('/projects')
    return response.data.data || []
  } catch (error) {
    console.error('Get projects error:', error)
    return []
  }
}

export const getProjectById = async (id) => {
  try {
    const response = await api.get(`/projects/${id}`)
    return response.data.data
  } catch (error) {
    console.error('Get project error:', error)
    return null
  }
}

export const createProject = async (projectData) => {
  try {
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    // Prepare project data with all required fields
    const data = {
      name: projectData.name || 'Riverbend Data Centre',
      company: projectData.company || 'EPC Solutions',
      location: projectData.location || 'Mumbai, India',
      status: projectData.status || 'In Progress',
      description: projectData.description || '',
      createdBy: user.id || null  // Use logged-in user's ID
    }
    
    console.log('Creating project with data:', data)
    
    const response = await api.post('/projects', data)
    return response.data.data
  } catch (error) {
    console.error('Create project error:', error)
    throw error
  }
}

export const updateProject = async (id, projectData) => {
  try {
    const response = await api.put(`/projects/${id}`, projectData)
    return response.data.data
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
    const response = await api.get('/projects')
    const projects = response.data.data || []
    
    // If no projects exist, create a default one
    if (projects.length === 0) {
      console.log('No projects found, creating default project...')
      const newProject = await createProject({
        name: 'Riverbend Data Centre',
        company: 'EPC Solutions',
        location: 'Mumbai, India',
        status: 'In Progress',
        description: 'Default project for EPC AI Platform'
      })
      return {
        _id: newProject._id,
        name: newProject.name,
        status: newProject.status,
        vendors: newProject.vendors || [],
        equipment: newProject.equipment || [],
        schedule: newProject.schedule || [],
        tasks: newProject.tasks || [],
        phases: newProject.phases || []
      }
    }
    
    const project = projects[0]
    return {
      _id: project._id,
      name: project.name || 'No Project Selected',
      status: project.status || 'Not Started',
      vendors: project.vendors || [],
      equipment: project.equipment || [],
      schedule: project.schedule || [],
      tasks: project.tasks || [],
      phases: project.phases || []
    }
  } catch (error) {
    console.error('Project summary error:', error)
    return {
      _id: null,
      name: 'Error Loading Project',
      status: 'Not Started',
      vendors: [],
      equipment: [],
      schedule: [],
      tasks: [],
      phases: []
    }
  }
}