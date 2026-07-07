import Header from './Header'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navbar />
      <div className="flex flex-1 min-h-0">
        <main className="flex-1 p-6 min-w-0">
          {children}
        </main>
        <Sidebar />
      </div>
    </div>
  )
}