// Mock project data. Swap for GET /api/projects/:id once backend is ready.

export async function getProjectSummary() {
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