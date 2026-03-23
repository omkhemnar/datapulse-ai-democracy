import { Outlet, Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/admin', label: 'Admin Dashboard', icon: '📤' },
  { path: '/analytics', label: 'Analytics', icon: '📊' },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <Link to="/" className="p-6 border-b border-slate-700 hover:bg-slate-800 transition">
          <h1 className="text-xl font-bold">DataPulse</h1>
          <p className="text-slate-400 text-sm mt-1">Booth Intelligence</p>
        </Link>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                location.pathname === item.path
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
