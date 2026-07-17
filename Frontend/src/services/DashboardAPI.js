import api from './api'

export const getDashboardData = async () => {
  try {
    const response = await api.get('/dashboard')
    return response.data
  } catch (error) {
    console.error('Dashboard data error:', error)
    // Fallback to mock data if API fails
    return getMockDashboardData()
  }
}

// Mock fallback data
const getMockDashboardData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        healthScore: 72,
        progress: 64,
        activeRisks: 4,
        upcomingMilestones: 3,
        aiInsights: 'Switchgear certification missing. Recommend following up with Voltage Systems Inc. before next milestone.',
        alerts: [
          {
            variant: 'danger',
            icon: 'ti-alert-triangle',
            title: 'Follow up on switchgear certification with vendor',
            subtitle: 'Blocking compliance sign-off'
          },
          {
            variant: 'warning',
            icon: 'ti-truck',
            title: 'Check steel delivery status, trending 6 days late',
            subtitle: 'Affects transformer install milestone'
          },
          {
            variant: 'success',
            icon: 'ti-checkbox',
            title: 'Approve resequencing of grading and permitting',
            subtitle: 'Recovers 12 of 18 predicted delay days'
          }
        ],
        recommendations: [
          {
            title: 'Switchgear Vendor Follow-up',
            description: 'Certification missing. Contact vendor immediately.',
            action: 'Follow Up'
          },
          {
            title: 'Steel Delivery Mitigation',
            description: 'Consider alternate vendor or accelerate shipping.',
            action: 'Explore Options'
          }
        ],
        timeline: [
          { title: 'Specifications uploaded', description: '3 documents added', time: '10 min ago', color: 'var(--success)' },
          { title: 'Vendor submittal reviewed', description: '2 of 5 approved', time: '2 hrs ago', color: 'var(--accent)' },
          { title: 'Schedule updated', description: 'Milestone adjusted', time: '4 hrs ago', color: 'var(--warning)' },
          { title: 'Risk detected', description: 'Switchgear certification missing', time: '8 hrs ago', color: 'var(--danger)' }
        ],
        milestones: [
          { label: 'Design Complete', progress: 100, color: 'var(--success)' },
          { label: 'Procurement', progress: 65, color: 'var(--warning)' },
          { label: 'Construction', progress: 40, color: 'var(--accent)' },
          { label: 'Commissioning', progress: 15, color: 'var(--muted)' }
        ]
      })
    }, 300)
  })
}
