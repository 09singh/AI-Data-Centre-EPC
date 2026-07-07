// Mock auth service. Swap the body of loginUser for a real fetch('/api/auth/login')
// call once the backend Authentication Module is ready — keep the returned shape the same.
export async function loginUser(details) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: details.company || 'Project Manager',
        email: details.email,
        role: details.role,
        project: details.project || 'Riverbend Data Centre'
      })
    }, 300)
  })
}
