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

