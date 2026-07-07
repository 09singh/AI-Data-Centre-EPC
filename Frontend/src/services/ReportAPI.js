// Mock reports data. Swap for GET /api/reports once the Report Module is ready.
export async function getReports() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { title: 'Weekly risk and schedule summary', format: 'PDF' },
        { title: 'Compliance audit trail', format: 'Excel' }
      ])
    }, 300)
  })
}
