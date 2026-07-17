<<<<<<< HEAD
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

=======
import api from './api'

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data.user
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData)
    return response.data
  } catch (error) {
    console.error('Register error:', error)
    throw error
  }
}

export const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile')
    return response.data
  } catch (error) {
    console.error('Get profile error:', error)
    throw error
  }
}

export const logoutUser = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const getCurrentUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const getToken = () => {
  return localStorage.getItem('token')
}
>>>>>>> 606d47541e84ba4a8ce10897ebdf4cfe70ff2496
