import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProjectHub from './pages/ProjectHub'
import AIProjectBrain from './pages/AIProjectBrain'
import AIIntelligence from './pages/AIIntelligence'
import Commissioning from './pages/Commissioning'
import Reports from './pages/Reports'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import GlobalSearch from './pages/GlobalSearch'

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/ai-brain" element={<ProtectedRoute><AIProjectBrain /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/global-search" element={<ProtectedRoute><GlobalSearch /></ProtectedRoute>} />
      <Route path="/project-hub" element={<ProtectedRoute><ProjectHub /></ProtectedRoute>} />
      <Route path="/project-hub/documents" element={<ProtectedRoute><ProjectHub /></ProtectedRoute>} />
      <Route path="/project-hub/schedule" element={<ProtectedRoute><ProjectHub /></ProtectedRoute>} />
      <Route path="/project-hub/vendors" element={<ProtectedRoute><ProjectHub /></ProtectedRoute>} />
      <Route path="/project-hub/equipment" element={<ProtectedRoute><ProjectHub /></ProtectedRoute>} />
      <Route path="/ai-intelligence" element={<ProtectedRoute><AIIntelligence /></ProtectedRoute>} />
      <Route path="/ai-intelligence/risk" element={<ProtectedRoute><AIIntelligence /></ProtectedRoute>} />
      <Route path="/ai-intelligence/compliance" element={<ProtectedRoute><AIIntelligence /></ProtectedRoute>} />
      <Route path="/ai-intelligence/simulation" element={<ProtectedRoute><AIIntelligence /></ProtectedRoute>} />
      <Route path="/commissioning" element={<ProtectedRoute><Commissioning /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    </Routes>
  )
}