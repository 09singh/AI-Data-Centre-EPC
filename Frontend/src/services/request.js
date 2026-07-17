const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

function buildUrl(path) {
  if (!path) return API_BASE_URL
  // If caller already provided an absolute URL, keep it.
  if (/^https?:\/\//i.test(path)) return path
  const base = API_BASE_URL.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

async function requestJson(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(buildUrl(path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  })

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  let payload = null
  if (isJson) {
    payload = await res.json().catch(() => null)
  } else {
    payload = await res.text().catch(() => null)
  }

  if (!res.ok) {
    const message =
      (payload && typeof payload === 'object' && (payload.message || payload.error)) ||
      (typeof payload === 'string' && payload) ||
      `Request failed with status ${res.status}`
    const err = new Error(message)
    err.status = res.status
    err.payload = payload
    throw err
  }

  return payload
}

export function apiGet(path, headers) {
  return requestJson(path, { method: 'GET', headers })
}

export function apiPost(path, body, headers) {
  return requestJson(path, { method: 'POST', body, headers })
}

export { requestJson, API_BASE_URL }

