import Project from './project.model.js'

export const createProject = async (req, res) => {
  try {
    const { name, status, description } = req.body
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      })
    }
    
    const project = new Project({
      name,
      status: status || 'Not Started',
      description: description || ''
    })
    
    await project.save()
    
    res.status(201).json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('Create project error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
    res.json({
      success: true,
      data: projects
    })
  } catch (error) {
    console.error('Get projects error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }
    res.json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('Get project error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }
    res.json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('Update project error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }
    res.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    console.error('Delete project error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}