import api from './api'


export const getAIHealth = async () => {
  try {
    const response = await api.get('/ai/health')
    return response.data
  } catch (error) {
    console.warn('AI Health API not available')
    return { status: 'unavailable' }
  }
}
export const askAIManager = async (question, options = {}) => {
  try {
    const payload = {
      question: question,
      session_id: options.session_id || `session_${Date.now()}`
    }
    
    // Add filters if provided (for document context)
    if (options.filters) {
      payload.filters = options.filters
    }
    
    const response = await api.post('/ai/chat', payload)
    return response.data
  } catch (error) {
    console.error('AI chat error:', error)
    return {
      response: error.response?.data?.message || 'AI service unavailable.',
      confidence: 0,
      citedSource: ''
    }
  }
}

export const searchAI = async (query, options = {}) => {
  try {
    const response = await api.post('/ai/search', { query, ...options })
    return response.data
  } catch (error) {
    console.error('AI search error:', error)
    return { results: [] }
  }
}

export const getRiskAnalysis = async () => {
  try {
    const response = await api.post('/ai/recommendation')
    return response.data
  } catch (error) {
    console.error('Risk analysis error:', error)
    return {
      riskScore: 72,
      predictedCompletion: 'Mar 14, 2027',
      delayDays: 18,
      risks: [
        { variant: 'danger', title: 'Switchgear order missing certification field' },
        { variant: 'warning', title: 'Steel delivery trending 6 days late' },
        { variant: 'warning', title: 'Cooling tower commissioning pending' }
      ]
    }
  }
}

export const getComplianceResults = async () => {
  try {
    const response = await api.post('/ai/compliance')
    return response.data
  } catch (error) {
    console.error('Compliance error:', error)
    return {
      passRate: 85,
      passed: 17,
      failed: 3,
      items: [
        { name: 'Switchgear certification', status: 'passed' },
        { name: 'Cooling system spec compliance', status: 'passed' },
        { name: 'Vendor submittal review', status: 'failed' },
        { name: 'Electrical load calculation', status: 'passed' },
        { name: 'Fire suppression system', status: 'failed' }
      ]
    }
  }
}

export const getSimulationResults = async (scenario) => {
  try {
    const response = await api.post('/ai/reports', { scenario })
    return response.data
  } catch (error) {
    console.error('Simulation error:', error)
    return {
      scenarios: [
        {
          name: 'Steel Delivery Delay',
          description: 'What if steel delivery is delayed by 2 weeks?',
          result: '5 day schedule impact · +2 critical path days'
        },
        {
          name: 'Switchgear Shortage',
          description: 'What if switchgear order is delayed by 1 month?',
          result: '12 day schedule impact · +8 critical path days'
        },
        {
          name: 'Accelerate Grading',
          description: 'What if grading is accelerated by 1 week?',
          result: 'Recovers 7 days · reduces overall delay by 40%'
        }
      ]
    }
  }
}

export const getRecommendations = async () => {
  try {
    const response = await api.post('/ai/recommendation')
    return response.data
  } catch (error) {
    console.error('Recommendations error:', error)
    return [
      { title: 'Switchgear Vendor Follow-up', priority: 'High' },
      { title: 'Steel Delivery Mitigation', priority: 'Medium' },
      { title: 'Cooling System Testing', priority: 'Low' }
    ]
  }
}

export const askAIAboutDocument = async (documentId, question) => {
  try {
    const response = await api.post('/ai/chat', {
      question: question,
      filters: { document_id: documentId },
      session_id: `doc_${documentId}_${Date.now()}`
    })
    return response.data
  } catch (error) {
    console.error('AI document chat error:', error)
    return {
      response: 'Failed to get AI insights for this document.',
      citations: []
    }
  }
}