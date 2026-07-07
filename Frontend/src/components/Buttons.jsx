export function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseClass = variant === 'outline' 
    ? 'btn-outline' 
    : 'btn'
  
  return (
    <button className={`${baseClass} ${className}`} {...props}>
      {children}
    </button>
  )
}