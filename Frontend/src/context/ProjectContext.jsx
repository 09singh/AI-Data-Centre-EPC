import { createContext, useContext, useEffect, useState } from 'react'
import { getProjects } from '../services/ProjectAPI'

const ProjectContext = createContext()

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getProjects()
        const projectList = Array.isArray(data) && data.length > 0 ? data : []
        setProjects(projectList)
        if (projectList.length) {
          const stored = localStorage.getItem('selectedProjectId')
          const matched = projectList.find((p) => p._id === stored) || projectList[0]
          setSelectedProject(matched)
        } else {
          setSelectedProject(null)
        }
      } catch (error) {
        console.error('Failed to load projects', error)
        setProjects([])
        setSelectedProject(null)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProject?._id) {
      localStorage.setItem('selectedProjectId', selectedProject._id)
    }
  }, [selectedProject])

  const selectProject = (projectOrId) => {
    const project = typeof projectOrId === 'string'
      ? projects.find((item) => item._id === projectOrId)
      : projectOrId

    setSelectedProject(project || projects[0] || null)
  }

  return (
    <ProjectContext.Provider value={{ projects, selectedProject, setSelectedProject: selectProject, loading }}>
      {children}
    </ProjectContext.Provider>
  )
}

export const useProject = () => useContext(ProjectContext)
