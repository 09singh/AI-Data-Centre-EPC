import { useState } from 'react'
import Layout from '../components/Layout'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Buttons'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  
  // Profile State
  const [profile, setProfile] = useState({
    fullName: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    company: 'Riverbend Constructions',
    role: user?.role || 'Project Manager'
  })
  
  // Password State
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  
  // Project Settings State
  const [project, setProject] = useState({
    name: 'Riverbend Data Centre',
    description: 'Hyperscale data centre facility with 50MW capacity',
    startDate: '2026-01-15',
    completionDate: '2027-06-30'
  })
  
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'John Doe', role: 'Project Manager', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', role: 'Engineer', email: 'jane@example.com' },
    { id: 3, name: 'Mike Johnson', role: 'QA', email: 'mike@example.com' },
    { id: 4, name: 'Sarah Williams', role: 'Admin', email: 'sarah@example.com' }
  ])
  
  // Add Member Modal State
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'Engineer'
  })
  
  // Notifications State - Removed Email Notifications
  const [notifications, setNotifications] = useState({
    aiAlerts: true,
    riskAlerts: true,
    dailySummary: false,
    weeklyReport: true
  })
  
  // AI Preferences State
  const [aiPrefs, setAiPrefs] = useState({
    recommendationLevel: 'detailed',
    autoDocumentAnalysis: true,
    autoRiskDetection: true
  })
  
  // Security State
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  
  const [activeSessions] = useState([
    { id: 1, device: 'MacBook Pro', browser: 'Chrome 120', time: '2026-07-10 14:30', status: 'Current' },
    { id: 2, device: 'iPhone 15', browser: 'Safari', time: '2026-07-09 09:15', status: 'Active' },
    { id: 3, device: 'Windows PC', browser: 'Edge', time: '2026-07-08 18:45', status: 'Active' }
  ])

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPassword({ ...password, [e.target.name]: e.target.value })
  }

  const handleProjectChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value })
  }

  const handleNotificationToggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] })
  }

  const handleAiPrefChange = (key, value) => {
    setAiPrefs({ ...aiPrefs, [key]: value })
  }

  const handleRemoveTeamMember = (id) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id))
  }

  const handleAddMemberSubmit = () => {
    if (!newMember.name || !newMember.email) return
    const member = {
      id: Date.now(),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role
    }
    setTeamMembers([...teamMembers, member])
    setNewMember({ name: '', email: '', role: 'Engineer' })
    setShowAddMember(false)
  }

  const handleLogoutAll = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogoutAll = () => {
    setShowLogoutConfirm(false)
    alert('Logged out from all devices')
  }

  const handleSessionLogout = (id) => {
    alert(`Logged out from session ${id}`)
  }

  // Theme options
  const themeOptions = [
    { 
      id: 'light', 
      label: 'Light Mode', 
      description: 'Warm red/orange theme',
      preview: 'bg-white border border-gray-200'
    },
    { 
      id: 'dark', 
      label: 'Dark Mode', 
      description: 'Cool blue/purple theme',
      preview: 'bg-[#161225] border border-[rgba(255,255,255,0.1)]'
    },
    { 
      id: 'blueprint', 
      label: 'Blueprint Mode', 
      description: 'Monochrome engineering command',
      preview: 'bg-[#0a0a0f] border border-[rgba(255,255,255,0.08)]'
    }
  ]

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <p className="text-lg font-semibold mb-1">Settings</p>
        <p className="text-sm text-[var(--muted)] mb-6">Manage your account, project, and application preferences</p>

        {/* Profile Section */}
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-1">
            <i className="ti ti-user text-[var(--accent)] text-lg" />
            <p className="text-sm font-medium m-0">Profile</p>
          </div>
          <p className="text-xs text-[var(--muted)] mb-4">Manage your personal and account information</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Full Name</label>
              <input
                className="input"
                name="fullName"
                value={profile.fullName}
                onChange={handleProfileChange}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Work Email</label>
              <input
                className="input"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleProfileChange}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Company Name</label>
              <input
                className="input"
                name="company"
                value={profile.company}
                onChange={handleProfileChange}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Role</label>
              <input
                className="input"
                value={profile.role}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>
          </div>

          {/* Change Password */}
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <p className="text-sm font-medium mb-3">Change Password</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-[var(--muted)] block mb-1">Current Password</label>
                <input
                  className="input"
                  name="current"
                  type="password"
                  placeholder="Enter current password"
                  value={password.current}
                  onChange={handlePasswordChange}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] block mb-1">New Password</label>
                <input
                  className="input"
                  name="new"
                  type="password"
                  placeholder="Enter new password"
                  value={password.new}
                  onChange={handlePasswordChange}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] block mb-1">Confirm Password</label>
                <input
                  className="input"
                  name="confirm"
                  type="password"
                  placeholder="Confirm new password"
                  value={password.confirm}
                  onChange={handlePasswordChange}
                />
              </div>
            </div>
            <Button className="mt-3 text-sm px-4 py-1.5">Update Password</Button>
          </div>
        </div>

        {/* Project Settings */}
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-1">
            <i className="ti ti-folder text-[var(--accent)] text-lg" />
            <p className="text-sm font-medium m-0">Project Settings</p>
          </div>
          <p className="text-xs text-[var(--muted)] mb-4">Manage the currently selected project</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Project Name</label>
              <input
                className="input"
                name="name"
                value={project.name}
                onChange={handleProjectChange}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Project Description</label>
              <input
                className="input"
                name="description"
                value={project.description}
                onChange={handleProjectChange}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Start Date</label>
              <input
                className="input"
                name="startDate"
                type="date"
                value={project.startDate}
                onChange={handleProjectChange}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1">Expected Completion</label>
              <input
                className="input"
                name="completionDate"
                type="date"
                value={project.completionDate}
                onChange={handleProjectChange}
              />
            </div>
          </div>

          {/* Team Members */}
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium m-0">Team Members</p>
              <Button className="text-xs px-3 py-1" onClick={() => setShowAddMember(true)}>
                <i className="ti ti-plus mr-1" /> Add Member
              </Button>
            </div>

            <div className="space-y-1.5">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2.5 border border-[var(--border)] rounded-lg">
                  <div>
                    <p className="text-sm m-0">{member.name}</p>
                    <p className="text-xs text-[var(--muted)] m-0">{member.role} · {member.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select className="text-xs px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--panel)] text-[var(--text)]">
                      <option>Project Manager</option>
                      <option>Engineer</option>
                      <option>QA</option>
                      <option>Admin</option>
                    </select>
                    <button
                      onClick={() => handleRemoveTeamMember(member.id)}
                      className="text-[var(--danger)] hover:bg-[var(--danger-bg)] p-1 rounded-lg transition-colors"
                    >
                      <i className="ti ti-x text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button className="mt-4 text-sm px-4 py-1.5">Save Project Settings</Button>
        </div>

        {/* Notifications */}
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-1">
            <i className="ti ti-bell text-[var(--accent)] text-lg" />
            <p className="text-sm font-medium m-0">Notifications</p>
          </div>
          <p className="text-xs text-[var(--muted)] mb-4">Control how you receive project updates</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg">
              <div>
                <p className="text-sm m-0">AI Alerts</p>
                <p className="text-xs text-[var(--muted)] m-0">Receive AI-generated alerts about risks and recommendations</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('aiAlerts')}
                className={`w-10 h-5 rounded-full transition-colors ${notifications.aiAlerts ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifications.aiAlerts ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg">
              <div>
                <p className="text-sm m-0">Risk & Delay Alerts</p>
                <p className="text-xs text-[var(--muted)] m-0">Get notified about potential risks and schedule delays</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('riskAlerts')}
                className={`w-10 h-5 rounded-full transition-colors ${notifications.riskAlerts ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifications.riskAlerts ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg">
              <div>
                <p className="text-sm m-0">Daily Project Summary</p>
                <p className="text-xs text-[var(--muted)] m-0">Receive a daily summary of project progress</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('dailySummary')}
                className={`w-10 h-5 rounded-full transition-colors ${notifications.dailySummary ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifications.dailySummary ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg">
              <div>
                <p className="text-sm m-0">Weekly Project Report</p>
                <p className="text-xs text-[var(--muted)] m-0">Receive a comprehensive weekly project report</p>
              </div>
              <button
                onClick={() => handleNotificationToggle('weeklyReport')}
                className={`w-10 h-5 rounded-full transition-colors ${notifications.weeklyReport ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifications.weeklyReport ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* AI Preferences */}
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-1">
            <i className="ti ti-brain text-[var(--accent)] text-lg" />
            <p className="text-sm font-medium m-0">AI Preferences</p>
          </div>
          <p className="text-xs text-[var(--muted)] mb-4">Customize AI behavior according to your workflow</p>

          <div className="space-y-3">
            <div>
              <label className="text-sm block mb-1">AI Recommendation Level</label>
              <select
                className="input max-w-xs"
                value={aiPrefs.recommendationLevel}
                onChange={(e) => handleAiPrefChange('recommendationLevel', e.target.value)}
              >
                <option value="basic">Basic</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg">
              <div>
                <p className="text-sm m-0">Auto Document Analysis</p>
                <p className="text-xs text-[var(--muted)] m-0">Automatically analyze uploaded documents</p>
              </div>
              <button
                onClick={() => handleAiPrefChange('autoDocumentAnalysis', !aiPrefs.autoDocumentAnalysis)}
                className={`w-10 h-5 rounded-full transition-colors ${aiPrefs.autoDocumentAnalysis ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${aiPrefs.autoDocumentAnalysis ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg">
              <div>
                <p className="text-sm m-0">Auto Risk Detection</p>
                <p className="text-xs text-[var(--muted)] m-0">Automatically detect risks and delays</p>
              </div>
              <button
                onClick={() => handleAiPrefChange('autoRiskDetection', !aiPrefs.autoRiskDetection)}
                className={`w-10 h-5 rounded-full transition-colors ${aiPrefs.autoRiskDetection ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${aiPrefs.autoRiskDetection ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          <div className="mt-3 p-3 bg-[var(--accent-soft)] rounded-lg">
            <p className="text-xs text-[var(--muted)] m-0">
              <i className="ti ti-info-circle mr-1" />
              Enabling automatic analysis allows the AI to continuously monitor uploaded documents and generate proactive insights.
            </p>
          </div>
        </div>

        {/* Theme & Appearance - Updated with 3 themes */}
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-1">
            <i className="ti ti-palette text-[var(--accent)] text-lg" />
            <p className="text-sm font-medium m-0">Theme & Appearance</p>
          </div>
          <p className="text-xs text-[var(--muted)] mb-4">Personalize the application interface</p>

          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setTheme(option.id)}
                className={`p-4 border-2 rounded-xl text-center transition-all ${
                  theme === option.id 
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)]' 
                    : 'border-[var(--border)] hover:border-[var(--muted)]'
                }`}
              >
                <div className={`w-full h-12 rounded-lg ${option.preview} flex items-center justify-center mb-2`}>
                  <span className={`text-xs ${
                    option.id === 'light' ? 'text-gray-600' :
                    option.id === 'dark' ? 'text-white' :
                    'text-[#7b8c9e]'
                  }`}>
                    {option.label}
                  </span>
                </div>
                <p className="text-sm m-0">{option.label}</p>
                <p className="text-xs text-[var(--muted)] m-0">{option.description}</p>
                {theme === option.id && (
                  <div className="mt-2 text-[var(--accent)]">
                    <i className="ti ti-check-circle" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <Button className="mt-4 text-sm px-4 py-1.5">Apply Theme</Button>
        </div>

        {/* Security */}
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-1">
            <i className="ti ti-shield text-[var(--accent)] text-lg" />
            <p className="text-sm font-medium m-0">Security</p>
          </div>
          <p className="text-xs text-[var(--muted)] mb-4">Manage account protection and active sessions</p>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg mb-4">
            <div>
              <p className="text-sm m-0">Two-Factor Authentication (2FA)</p>
              <p className="text-xs text-[var(--muted)] m-0">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => setTwoFactorAuth(!twoFactorAuth)}
              className={`w-10 h-5 rounded-full transition-colors ${twoFactorAuth ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${twoFactorAuth ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Active Sessions */}
          <p className="text-sm font-medium mb-3">Active Sessions</p>
          <div className="space-y-2">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg">
                <div>
                  <p className="text-sm m-0">{session.device}</p>
                  <p className="text-xs text-[var(--muted)] m-0">{session.browser} · {session.time}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    session.status === 'Current' 
                      ? 'bg-[var(--success-bg)] text-[var(--success)]' 
                      : 'bg-[var(--border)] text-[var(--muted)]'
                  }`}>
                    {session.status}
                  </span>
                  {session.status !== 'Current' && (
                    <button
                      onClick={() => handleSessionLogout(session.id)}
                      className="text-xs text-[var(--danger)] hover:bg-[var(--danger-bg)] px-2 py-1 rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            <Button className="text-sm px-4 py-1.5" onClick={handleLogoutAll}>Logout from All Devices</Button>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="card max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-semibold m-0">Add Team Member</p>
              <button
                onClick={() => setShowAddMember(false)}
                className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                <i className="ti ti-x text-xl" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--muted)] block mb-1">Full Name</label>
                <input
                  className="input"
                  placeholder="Enter member's full name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] block mb-1">Email Address</label>
                <input
                  className="input"
                  type="email"
                  placeholder="Enter member's email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] block mb-1">Role</label>
                <select
                  className="input"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                >
                  <option>Project Manager</option>
                  <option>Engineer</option>
                  <option>QA</option>
                  <option>Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button 
                className="flex-1 text-sm py-2"
                onClick={handleAddMemberSubmit}
              >
                Add Member
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 text-sm py-2"
                onClick={() => setShowAddMember(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="card max-w-sm w-full">
            <p className="text-base font-semibold m-0">Logout from All Devices</p>
            <p className="text-sm text-[var(--muted)] mt-2 mb-4">
              This will log you out from all active sessions across all devices. Are you sure you want to continue?
            </p>
            <div className="flex gap-3">
              <Button 
                className="flex-1 text-sm py-2"
                onClick={confirmLogoutAll}
              >
                Yes, Logout All
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 text-sm py-2"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}