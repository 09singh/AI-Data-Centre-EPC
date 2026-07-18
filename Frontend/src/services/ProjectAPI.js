import api from './api'

const fallbackProjects = [
  {
    _id: 'riverbend-data-centre',
    name: 'Riverbend Data Centre',
    description: 'Mission-critical data centre project with power, cooling, and network integration.',
    company: 'EPC Solutions',
    location: 'Mumbai, India',
    status: 'In Progress',
    startDate: '2026-01-15',
    endDate: '2026-12-15',
    schedule: [
      { id: 'T-001', title: 'Switchgear Installation', description: 'Install switchgear units A and B in electrical room', status: 'In Progress', priority: 'High', dueDate: '2026-07-25', assignedTeam: 'Electrical Team', dependencies: ['Foundation Complete', 'Switchgear Delivery'], progress: 65, category: 'Equipment Installation', documents: ['switchgear_manual.pdf', 'installation_guide.pdf'], vendor: 'Voltage Systems Inc.', equipment: ['Switchgear Unit A', 'Switchgear Unit B'], aiInsight: 'Installation is progressing well. Ensure torque specifications are followed.', recoverySuggestion: null },
      { id: 'T-002', title: 'Cooling Tower Commissioning', description: 'Complete testing and commissioning of cooling tower 1', status: 'Delayed', priority: 'Critical', dueDate: '2026-07-20', assignedTeam: 'Mechanical Team', dependencies: ['Cooling Tower Installation', 'Water Supply Connection'], progress: 40, category: 'Commissioning', documents: ['cooling_specs.pdf', 'test_procedure.pdf'], vendor: 'CoolFlow Engineering', equipment: ['Cooling Tower 1'], aiInsight: 'Pressure imbalance detected. Recalibration required before proceeding.', recoverySuggestion: 'Recalibrate cooling loop valves and re-run pressure test. Estimated 2 days to resolve.' }
    ],
    vendors: [
      { id: 'V-001', name: 'Voltage Systems Inc.', equipment: ['Switchgear Unit A', 'UPS Module 1'], contact: 'contact@voltagesystems.com', status: 'Active', deliveryStatus: 'On Track', expectedDelivery: '2026-07-20', reliabilityScore: 92, completedOrders: 8, issues: 0 },
      { id: 'V-002', name: 'CoolFlow Engineering', equipment: ['Cooling Tower 1'], contact: 'info@coolflow.com', status: 'Active', deliveryStatus: 'Delayed', expectedDelivery: '2026-07-25', reliabilityScore: 78, completedOrders: 5, issues: 2 }
    ],
    equipment: [
      { id: 'EQ-001', name: 'Switchgear Unit A', type: 'Electrical', model: 'SG-2000', vendor: 'Voltage Systems Inc.', quantity: 2, status: 'Installed', installationStatus: 'Installed', testingStatus: 'Passed', specifications: '2000A, 480V, 3-Phase', documents: ['specifications.pdf', 'test_report_A.pdf'], maintenanceHistory: 'Last serviced: Jun 2026' },
      { id: 'EQ-002', name: 'Cooling Tower 1', type: 'Mechanical', model: 'CT-1500', vendor: 'CoolFlow Engineering', quantity: 3, status: 'In Progress', installationStatus: 'In Progress', testingStatus: 'Failed', specifications: '1500 TR, Evaporative Cooling', documents: ['cooling_specs.pdf'], maintenanceHistory: 'Installation in progress' }
    ],
    commissioning: {
      readinessScore: 86,
      readyForHandover: true,
      overallCompletion: 82,
      remainingCriticalTests: 3,
      systems: [
        { id: 'power', name: 'Power Systems', total: 24, passed: 20, failed: 2, pending: 2, status: 'In Progress' },
        { id: 'cooling', name: 'Cooling Systems', total: 18, passed: 14, failed: 3, pending: 1, status: 'In Progress' }
      ],
      ncrData: [
        { id: 'NCR-001', issue: 'UPS Load Transfer Time Exceeds Specification', severity: 'Critical', engineer: 'Jane Smith', status: 'In Progress', date: '2026-07-09' }
      ],
      timeline: [
        { phase: 'Power Testing', status: 'completed', date: '2026-07-05' },
        { phase: 'Cooling Testing', status: 'in-progress', date: '2026-07-09' }
      ],
      aiRecommendations: [
        { title: 'Cooling System Test Failed', description: 'Pressure imbalance detected. Recalibrate.', priority: 'Critical' }
      ]
    },
    reports: [
      { id: 1, title: 'Project Summary Report', description: 'Overall project health', type: 'summary', status: 'Open', date: '2026-07-10', category: 'Project Overview', icon: 'ti-dashboard' }
    ]
  },
  {
    _id: 'sunrise-data-centre',
    name: 'Sunrise Data Centre',
    description: 'New edge data centre with hybrid backup systems and renewable cooling.',
    company: 'Northwind EPC',
    location: 'Bengaluru, India',
    status: 'Planning',
    startDate: '2026-03-01',
    endDate: '2027-02-01',
    schedule: [
      { id: 'S-001', title: 'Foundation Pour', description: 'Complete concrete foundation for module 1', status: 'Upcoming', priority: 'High', dueDate: '2026-08-15', assignedTeam: 'Civil Team', dependencies: ['Site Survey'], progress: 10, category: 'Civil', documents: ['site_plan.pdf'], vendor: 'BuildCore', equipment: ['Foundation Formwork'], aiInsight: 'Weather window is narrow. Advance procurement needed.', recoverySuggestion: null }
    ],
    vendors: [
      { id: 'V-101', name: 'BuildCore', equipment: ['Foundation Formwork'], contact: 'ops@buildcore.com', status: 'Active', deliveryStatus: 'On Track', expectedDelivery: '2026-08-02', reliabilityScore: 90, completedOrders: 9, issues: 1 }
    ],
    equipment: [
      { id: 'EQ-101', name: 'Backup Battery Bank', type: 'Power', model: 'BB-400', vendor: 'BuildCore', quantity: 2, status: 'Not Installed', installationStatus: 'Not Installed', testingStatus: 'Pending', specifications: '400kWh, modular', documents: ['battery_specs.pdf'], maintenanceHistory: 'Awaiting delivery' }
    ],
    commissioning: {
      readinessScore: 61,
      readyForHandover: false,
      overallCompletion: 34,
      remainingCriticalTests: 8,
      systems: [{ id: 'backup', name: 'Backup Systems', total: 10, passed: 3, failed: 1, pending: 6, status: 'In Progress' }],
      ncrData: [],
      timeline: [{ phase: 'Site Preparation', status: 'completed', date: '2026-06-01' }],
      aiRecommendations: []
    },
    reports: [{ id: 3, title: 'Planning Report', description: 'Initial planning and procurement status', type: 'summary', status: 'Open', date: '2026-06-12', category: 'Project Overview', icon: 'ti-dashboard' }]
  },
  {
    _id: 'delta-epc-project',
    name: 'Delta EPC Project',
    description: 'Industrial automation and utility plant expansion project.',
    company: 'Delta Infrastructure',
    location: 'Abu Dhabi, UAE',
    status: 'Completed',
    startDate: '2025-04-01',
    endDate: '2026-06-01',
    schedule: [{ id: 'D-001', title: 'Automation Integration', description: 'Complete PLC and SCADA integration', status: 'Completed', priority: 'High', dueDate: '2026-05-18', assignedTeam: 'Controls Team', dependencies: ['Panel Delivery'], progress: 100, category: 'Automation', documents: ['scada_specs.pdf'], vendor: 'Axiom Controls', equipment: ['PLC Rack'], aiInsight: 'Integration completed with no further issues.', recoverySuggestion: null }],
    vendors: [{ id: 'V-201', name: 'Axiom Controls', equipment: ['PLC Rack'], contact: 'sales@axiomcontrols.com', status: 'Completed', deliveryStatus: 'Delivered', expectedDelivery: '2026-05-10', reliabilityScore: 96, completedOrders: 14, issues: 0 }],
    equipment: [{ id: 'EQ-201', name: 'PLC Rack', type: 'Automation', model: 'PLX-900', vendor: 'Axiom Controls', quantity: 1, status: 'Commissioned', installationStatus: 'Commissioned', testingStatus: 'Passed', specifications: 'Industrial PLC', documents: ['plc_specs.pdf'], maintenanceHistory: 'Commissioned: May 2026' }],
    commissioning: {
      readinessScore: 95,
      readyForHandover: true,
      overallCompletion: 100,
      remainingCriticalTests: 0,
      systems: [{ id: 'automation', name: 'Automation Systems', total: 12, passed: 12, failed: 0, pending: 0, status: 'Completed' }],
      ncrData: [],
      timeline: [{ phase: 'Commissioning', status: 'completed', date: '2026-05-30' }],
      aiRecommendations: []
    },
    reports: [{ id: 4, title: 'Final Commissioning Report', description: 'All systems commissioned successfully', type: 'commissioning', status: 'Resolved', date: '2026-06-01', category: 'Commissioning', icon: 'ti-clipboard-check' }]
  }
]

const getProjectSlug = (project) =>
  (project?.slug || project?._id || project?.name || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const getFallbackProject = (idOrProject) => {
  const id = typeof idOrProject === 'string' ? idOrProject : idOrProject?._id
  const name = typeof idOrProject === 'object' ? idOrProject?.name : ''
  const slug = getProjectSlug({ _id: id, name })

  return fallbackProjects.find((project) => (
    project._id === id ||
    project.name === name ||
    getProjectSlug(project) === slug
  ))
}

const hasUsefulProjectData = (project) => (
  (Array.isArray(project?.schedule) && project.schedule.length > 0) ||
  (Array.isArray(project?.vendors) && project.vendors.length > 0) ||
  (Array.isArray(project?.equipment) && project.equipment.length > 0) ||
  (Array.isArray(project?.reports) && project.reports.length > 0) ||
  (project?.commissioning && Object.keys(project.commissioning).length > 0)
)

const hydrateProject = (project) => {
  const fallback = getFallbackProject(project)
  if (!fallback) return project

  if (!hasUsefulProjectData(project)) {
    return { ...fallback, ...project }
  }

  return {
    ...fallback,
    ...project,
    schedule: project.schedule?.length ? project.schedule : fallback.schedule,
    vendors: project.vendors?.length ? project.vendors : fallback.vendors,
    equipment: project.equipment?.length ? project.equipment : fallback.equipment,
    commissioning: Object.keys(project.commissioning || {}).length ? project.commissioning : fallback.commissioning,
    reports: project.reports?.length ? project.reports : fallback.reports
  }
}

const normalizeProjects = (projects = []) => {
  const byName = new Map()
  const combined = [...projects, ...fallbackProjects].filter(Boolean).map(hydrateProject)

  combined.forEach((project) => {
    const key = (project.name || project._id || '').toString().trim().toLowerCase()
    if (!key) return

    const existing = byName.get(key)
    if (!existing || (!hasUsefulProjectData(existing) && hasUsefulProjectData(project))) {
      byName.set(key, project)
    }
  })

  return Array.from(byName.values())
}

export const getProjects = async () => {
  try {
    const response = await api.get('/projects')
    const projects = response.data?.data || []
    return normalizeProjects(Array.isArray(projects) ? projects : [])
  } catch (error) {
    console.warn('Get projects fallback used:', error.message)
    return normalizeProjects()
  }
}

export const getProjectSchedule = async (id) => {
  try {
    const response = await api.get(`/projects/${id}/schedule`)
    const project = getFallbackProject(id)
    const data = response.data.data || []
    return data.length ? data : project?.schedule || []
  } catch (error) {
    const project = getFallbackProject(id)
    return project?.schedule || []
  }
}

export const getProjectVendors = async (id) => {
  try {
    const response = await api.get(`/projects/${id}/vendors`)
    const project = getFallbackProject(id)
    const data = response.data.data || []
    return data.length ? data : project?.vendors || []
  } catch (error) {
    const project = getFallbackProject(id)
    return project?.vendors || []
  }
}

export const getProjectEquipment = async (id) => {
  try {
    const response = await api.get(`/projects/${id}/equipment`)
    const project = getFallbackProject(id)
    const data = response.data.data || []
    return data.length ? data : project?.equipment || []
  } catch (error) {
    const project = getFallbackProject(id)
    return project?.equipment || []
  }
}

export const getProjectCommissioning = async (id) => {
  try {
    const response = await api.get(`/projects/${id}/commissioning`)
    const project = getFallbackProject(id)
    const data = response.data.data || {}
    return Object.keys(data).length ? data : project?.commissioning || { readinessScore: 0, systems: [], ncrData: [], timeline: [], aiRecommendations: [] }
  } catch (error) {
    const project = getFallbackProject(id)
    return project?.commissioning || { readinessScore: 0, systems: [], ncrData: [], timeline: [], aiRecommendations: [] }
  }
}

export const getProjectReports = async (id) => {
  try {
    const response = await api.get(`/projects/${id}/reports`)
    const project = getFallbackProject(id)
    const data = response.data.data || []
    return data.length ? data : project?.reports || []
  } catch (error) {
    const project = getFallbackProject(id)
    return project?.reports || []
  }
}

export const getProjectById = async (id) => {
  try {
    const response = await api.get(`/projects/${id}`)
    return hydrateProject(response.data.data)
  } catch (error) {
    console.warn('Get project fallback used:', error.message)
    return getFallbackProject(id) || null
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

export const getProjectSummary = async (id = null) => {
  try {
    const projects = await getProjects()
    const project = id ? getFallbackProject(id) || projects.find((item) => item._id === id) || projects[0] : projects[0]
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
    const project = getFallbackProject(id) || fallbackProjects[0]
    return {
      _id: project._id,
      name: project.name || 'No Project Selected',
      status: project.status || 'Not Started',
      vendors: project.vendors || [],
      equipment: project.equipment || [],
      schedule: project.schedule || [],
      tasks: project.schedule || [],
      phases: project.phases || []
    }
  }
}
