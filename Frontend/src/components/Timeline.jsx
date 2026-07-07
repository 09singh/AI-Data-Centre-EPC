export default function Timeline({ events }) {
  return (
    <div style={{ position: 'relative', paddingLeft: 16 }}>
      {events.map((event, i) => (
        <div key={i} style={{ position: 'relative', paddingBottom: 16, paddingLeft: 20 }}>
          {/* Timeline line */}
          {i < events.length - 1 && (
            <div
              style={{
                position: 'absolute',
                left: -4,
                top: 16,
                bottom: 0,
                width: 2,
                background: 'var(--border)'
              }}
            />
          )}
          {/* Timeline dot */}
          <div
            style={{
              position: 'absolute',
              left: -8,
              top: 4,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: event.color || 'var(--accent)',
              border: '2px solid var(--bg)'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 13, margin: 0, fontWeight: 500 }}>{event.title}</p>
              {event.description && (
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: '2px 0 0' }}>{event.description}</p>
              )}
            </div>
            <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0, marginLeft: 12 }}>
              {event.time}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}