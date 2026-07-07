export default function ProgressBar({ label, percent }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'var(--border)' }}>
        <div style={{ height: 6, width: `${percent}%`, borderRadius: 3, background: 'var(--accent)' }} />
      </div>
    </div>
  )
}
