import Layout from '../components/Layout'
import Table from '../components/Table'

const rows = [
  ['Switchgear integration test', <span key="1" style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '2px 8px', borderRadius: 6 }}>passed</span>],
  ['Cooling system commissioning', <span key="2" style={{ background: 'var(--warning-bg)', color: 'var(--warning)', padding: '2px 8px', borderRadius: 6 }}>pending</span>]
]

export default function Commissioning() {
  return (
    <Layout>
      <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>Commissioning</p>
      <Table columns={['Test', 'Status']} rows={rows} />
    </Layout>
  )
}
