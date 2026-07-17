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
