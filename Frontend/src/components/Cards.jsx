const variantStyles = {
  default: { background: 'var(--panel)', border: '1px solid var(--border)' },
  danger: { background: 'var(--danger-bg)', border: 'none' },
  warning: { background: 'var(--warning-bg)', border: 'none' },
  success: { background: 'var(--success-bg)', border: 'none' }
}

export default function Card({ variant = 'default', children, className = '', style = {} }) {
  return (
    <div 
      className={`rounded-xl p-3 mb-2 ${className}`}
      style={{ ...variantStyles[variant], ...style }}
    >
      {children}
    </div>
  )
}