import Layout from '../components/Layout'
import NotificationPanel from '../components/NotificationPanel'

const notifications = [
  { variant: 'danger', icon: 'ti-alert-triangle', title: 'Switchgear order missing certification field', time: '8 min ago' },
  { variant: 'warning', icon: 'ti-truck', title: 'Steel delivery trending 6 days late', time: '3 hrs ago' },
  { variant: 'default', icon: 'ti-refresh', title: 'Schedule.csv updated, recalculating timeline', time: '4 hrs ago' }
]

export default function Notifications() {
  return (
    <Layout>
      <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Notifications</p>
      <NotificationPanel notifications={notifications} />
    </Layout>
  )
}
