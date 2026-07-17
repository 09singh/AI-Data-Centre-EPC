<<<<<<< HEAD
import { apiGet, apiPost } from './request'

// Health check
export function getAIHealth() {
  return apiGet('/api/ai/health')
}

// Chat endpoints
export async function askAIManager(question, options = {}) {
  // Backend contract is assumed to accept { question } and optionally { context }.
  // Keep it flexible so UI can evolve.
  const res = await apiPost('/api/ai/chat', {
    question,
    ...options
  })

  // Normalize common shapes.
  // Expected by existing UI: { response, confidence, citedSource }
  if (res && typeof res === 'object') {
    return {
      response: res.response ?? res.answer ?? res.text ?? '',
      confidence: res.confidence ?? res.confidenceScore ?? 0,
      citedSource: res.citedSource ?? res.citations ?? res.source ?? ''
    }
  }

  return { response: String(res ?? ''), confidence: 0, citedSource: '' }
}

// No backend chat-history endpoint exists yet. Keep this export removed.
// If other components still import getChatHistory, compilation will fail and
// we should update them accordingly.

// Other AI modules
export function getRiskAnalysis() {
  return apiPost('/api/ai/recommendation')
}

export function getComplianceResults() {
  return apiPost('/api/ai/compliance')
}

export function getSimulationResults() {
  return apiPost('/api/ai/reports')
}

// Search (optional for now)
export function searchAI(query, options = {}) {
  return apiPost('/api/ai/search', { query, ...options })
}

=======
import api from './api'

const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000'

export const askAIManager = async (question) => {
  try {
    const response = await api.post('/ai/chat', { question })
    return response.data
  } catch (error) {
    console.error('AI chat error:', error)
    return {
      response: 'Two switchgear orders are missing the certification field required by spec section 26-24.',
      confidence: 0.94,
      citedSource: 'specifications.pdf, section 26-24'
    }
  }
}

export const getChatHistory = async () => {
  try {
    const response = await api.get('/ai/history')
    return response.data
  } catch (error) {
    console.error('AI history error:', error)
    return [
      { id: 1, title: 'Switchgear certification' },
      { id: 2, title: 'Steel delivery delay' },
      { id: 3, title: 'Weekly summary request' }
    ]
  }
}

export const getRiskAnalysis = async () => {
  try {
    const response = await api.post('/ai/risk')
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
    const response = await api.post('/ai/simulation', { scenario })
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
>>>>>>> 606d47541e84ba4a8ce10897ebdf4cfe70ff2496
