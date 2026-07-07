import Layout from '../components/Layout'
import { useTheme } from '../context/ThemeContext'

export default function Settings() {
  const { theme, setTheme } = useTheme()

  return (
    <Layout>
      <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>Settings</p>
      <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 10 }}>
        Theme
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          className={theme === 'light' ? 'btn' : 'btn btn-outline'}
          onClick={() => setTheme('light')}
        >
          <i className="ti ti-sun" style={{ marginRight: 6, verticalAlign: -2 }} />
          Light — warm
        </button>
        <button
          className={theme === 'dark' ? 'btn' : 'btn btn-outline'}
          onClick={() => setTheme('dark')}
        >
          <i className="ti ti-moon" style={{ marginRight: 6, verticalAlign: -2 }} />
          Dark — cool
        </button>
      </div>
    </Layout>
  )
}
