import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
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
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

