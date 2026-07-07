export function ProgressChart({ data, label }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
        <span>{label}</span>
        <span style={{ color: 'var(--muted)' }}>{data.percent}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
        <div
          style={{
            height: 8,
            width: `${data.percent}%`,
            borderRadius: 4,
            background: data.color || 'var(--accent)',
            transition: 'width 0.6s ease'
          }}
        />
      </div>
    </div>
  )
}

export function MetricCard({ label, value, subValue, icon, trend }) {
  return (
    <div
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '14px 16px',
        flex: 1,
        minWidth: 120
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        {icon && <i className={`ti ${icon}`} style={{ fontSize: 14, color: 'var(--accent)' }} />}
        <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>{label}</p>
      </div>
      <p style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{value}</p>
      {subValue && <p style={{ fontSize: 12, color: 'var(--muted)', margin: '2px 0 0' }}>{subValue}</p>}
      {trend && (
        <p style={{ fontSize: 11, color: trend.direction === 'up' ? 'var(--success)' : 'var(--danger)', margin: '4px 0 0' }}>
          {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
        </p>
      )}
    </div>
  )
}

export function CircleProgress({ value, label, size = 80, color }) {
  const circumference = 2 * Math.PI * (size / 2 - 8)
  const dash = (value / 100) * circumference

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          fill="none"
          stroke="var(--border)"
          strokeWidth="6"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          fill="none"
          stroke={color || 'var(--accent)'}
          strokeWidth="6"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span style={{ fontSize: Math.round(size * 0.28), fontWeight: 600 }}>{value}</span>
        <span style={{ fontSize: 10, color: 'var(--muted)' }}>{label}</span>
      </div>
    </div>
  )
}