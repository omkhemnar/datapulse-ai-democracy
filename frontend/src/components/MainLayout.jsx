import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Button from './ui/Button'
import {
  LayoutDashboard,
  Users,
  Network,
  BarChart3,
  Send,
  MessageSquare,
  TrendingUp,
  Menu,
  Sun,
  Moon,
  Search,
  Bell,
  LogOut,
} from 'lucide-react'
import { useState } from 'react'

const nav = [
  { path: '/admin', label: 'Data Upload', icon: LayoutDashboard },
  { path: '/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
  { path: '/booth-intelligence', label: 'Booth Intelligence', icon: Users },
  { path: '/knowledge-graph', label: 'Knowledge Graph', icon: Network },
  { path: '/voter-segmentation', label: 'Voter Segmentation', icon: BarChart3 },
  { path: '/governance-updates', label: 'Governance Updates', icon: Send },
  { path: '/citizen-engagement', label: 'Citizen Engagement', icon: MessageSquare },
  { path: '/analytics', label: 'Analytics & Insights', icon: TrendingUp },
  { path: '/data-analytics', label: 'Data Analytics', icon: TrendingUp },
]

export default function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'
          } shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all flex flex-col`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-slate-900 dark:text-white">Booth AI</span>}
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${active
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                placeholder="Smart search..."
                className="w-64 pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
            </button>
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/login', { replace: true })}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
