export default function Modal({ open, onClose, children }) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50
      }}
      onClick={onClose}
    >
      <div className="card" style={{ minWidth: 300 }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
