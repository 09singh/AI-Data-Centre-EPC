export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatTimeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} hr ago`
  return `${days} day${days > 1 ? 's' : ''} ago`
}

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const getStatusColor = (status) => {
  const colors = {
    'on track': 'var(--success)',
    'in progress': 'var(--warning)',
    'delayed': 'var(--danger)',
    'pending': 'var(--muted)',
    'completed': 'var(--success)',
    'failed': 'var(--danger)',
    'passed': 'var(--success)'
  }
  return colors[status.toLowerCase()] || 'var(--muted)'
}