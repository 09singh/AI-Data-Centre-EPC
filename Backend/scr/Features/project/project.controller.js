import mongoose from 'mongoose'
import Project from './project.model.js'

const slugify = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const findProjectByIdOrSlug = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const project = await Project.findById(id)
    if (project) return project
  }

  const projects = await Project.find({})
  return projects.find((project) => slugify(project.name) === slugify(id)) || null
}

export const createProject = async (req, res) => {
  try {
    const { name, status, description, ...rest } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      })
    }

    const project = new Project({
      name,
      status: status || 'In Progress',
      description: description || '',
      ...rest,
      createdBy: req.user?.id || rest.createdBy || null
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
    const projects = await Project.find({}).sort({ createdAt: 1 })
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
    const project = await findProjectByIdOrSlug(req.params.id)
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

export const getProjectSchedule = async (req, res) => {
  try {
    const project = await findProjectByIdOrSlug(req.params.id)
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }
    res.json({ success: true, data: project.schedule || [] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getProjectVendors = async (req, res) => {
  try {
    const project = await findProjectByIdOrSlug(req.params.id)
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }
    res.json({ success: true, data: project.vendors || [] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getProjectEquipment = async (req, res) => {
  try {
    const project = await findProjectByIdOrSlug(req.params.id)
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }
    res.json({ success: true, data: project.equipment || [] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getProjectCommissioning = async (req, res) => {
  try {
    const project = await findProjectByIdOrSlug(req.params.id)
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }
    res.json({ success: true, data: project.commissioning || {} })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getProjectReports = async (req, res) => {
  try {
    const project = await findProjectByIdOrSlug(req.params.id)
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }
    res.json({ success: true, data: project.reports || [] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
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
