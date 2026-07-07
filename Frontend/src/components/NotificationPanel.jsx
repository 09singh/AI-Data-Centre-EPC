import AlertCard from './AlertCards'

export default function NotificationPanel({ notifications = [] }) {
  return (
    <div>
      {notifications.map((n, i) => (
        <AlertCard key={i} variant={n.variant} icon={n.icon} title={n.title} subtitle={n.time} />
      ))}
    </div>
  )
}
