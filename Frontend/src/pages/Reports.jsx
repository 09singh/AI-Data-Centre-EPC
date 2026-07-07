import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Loader from '../components/Loader'
import { Button } from '../components/Buttons'
import { getReports } from '../services/ReportAPI'

export default function Reports() {
  const [reports, setReports] = useState(null)

  useEffect(() => {
    getReports().then(setReports)
  }, [])

  return (
    <Layout>
      <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>Reports</p>

      {!reports && <Loader />}

      {reports &&
        reports.map((r) => (
          <div
            key={r.title}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px', marginBottom: 8 }}
          >
            <span style={{ fontSize: 13 }}>{r.title}</span>
            <Button variant="outline">Export {r.format}</Button>
          </div>
        ))}
    </Layout>
  )
}
