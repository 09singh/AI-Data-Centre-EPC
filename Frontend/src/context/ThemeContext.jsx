import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light') // 'light' (warm red/orange/pink) or 'dark' (cool blue/purple/pink)

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`app-theme ${theme}`}>{children}</div>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
