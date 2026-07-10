import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light') // 'light', 'dark', 'blueprint'

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`app-theme ${theme}`}>{children}</div>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)