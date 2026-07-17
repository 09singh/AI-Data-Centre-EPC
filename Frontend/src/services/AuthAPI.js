import { apiPost } from './request'

// Real auth service (JWT)
export async function loginUser(details) {
  const res = await apiPost('/api/auth/login', {
    email: details.email,
    password: details.password,
    role: details.role,
  })

  // Backend response: { success, token, role, message }
  if (!res?.token) {
    throw new Error(res?.message || 'Login failed')
  }

  return {
    token: res.token,
    user: {
      email: details.email,
      role: res.role || details.role || 'Project Manager',
      name: details.company || 'Project Manager'
    }
  }
}

