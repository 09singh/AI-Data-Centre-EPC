<<<<<<< HEAD
import { createContext, useContext, useEffect, useState } from 'react'
=======
import { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser, logoutUser } from '../services/AuthAPI'
>>>>>>> 606d47541e84ba4a8ce10897ebdf4cfe70ff2496

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
<<<<<<< HEAD
    // Support token persistence for protected API calls.
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (token) {
      setUser(storedUser ? JSON.parse(storedUser) : { name: '', email: '', role: '' })
    }
  }, [])

  const login = (userDetails) => {
    // If the login API returns token, store it.
    if (userDetails?.token) localStorage.setItem('token', userDetails.token)
    localStorage.setItem('user', JSON.stringify(userDetails?.user || userDetails))
    setUser(userDetails?.user || userDetails)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
=======
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
  }

  const logout = () => {
    logoutUser()
>>>>>>> 606d47541e84ba4a8ce10897ebdf4cfe70ff2496
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoggedIn: !!user,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

<<<<<<< HEAD
export const useAuth = () => useContext(AuthContext)

=======
export const useAuth = () => useContext(AuthContext)
>>>>>>> 606d47541e84ba4a8ce10897ebdf4cfe70ff2496
