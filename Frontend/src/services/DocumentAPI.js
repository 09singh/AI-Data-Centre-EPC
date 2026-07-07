// Mock document data. Swap for GET /api/documents once the Document Module is ready.
export async function getDocuments() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: 'specifications.pdf', status: 'synced', detail: 'synced · 12 min ago', variant: 'success' },
        { name: 'vendor_submittals.pdf', status: 'synced', detail: 'synced · 40 min ago', variant: 'success' },
        { name: 'schedule.csv', status: 'recalculating', detail: 'recalculating', variant: 'warning' },
        { name: 'procurement.xlsx', status: 'error', detail: '2 errors found', variant: 'danger' }
      ])
    }, 300)
  })
}

// Swap for POST /api/documents/upload once ready.
export async function uploadDocument(file) {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true, fileName: file?.name }), 400))
}
