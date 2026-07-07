import Card from './Cards'

const textColor = {
  default: 'var(--text)',
  danger: 'var(--danger)',
  warning: 'var(--warning)',
  success: 'var(--success)'
}

export default function AlertCard({ variant = 'default', icon, title, subtitle }) {
  return (
    <Card variant={variant} className="flex items-start gap-2.5">
      {icon && <i className={`ti ${icon} text-base text-[${textColor[variant]}] mt-0.5`} />}
      <div>
        <p className="text-sm m-0" style={{ color: textColor[variant] }}>{title}</p>
        {subtitle && (
          <p className="text-[11px] m-0 mt-0.5 opacity-85" style={{ color: textColor[variant] }}>{subtitle}</p>
        )}
      </div>
    </Card>
  )
}