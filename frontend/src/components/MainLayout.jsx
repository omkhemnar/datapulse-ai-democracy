import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  Languages,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const nav = [
  { path: '/admin', labelKey: 'navDataUpload', icon: LayoutDashboard },
  { path: '/dashboard', labelKey: 'navAdminDash', icon: LayoutDashboard },
  { path: '/booth-intelligence', labelKey: 'navBoothIntel', icon: Users },
  { path: '/knowledge-graph', labelKey: 'navKg', icon: Network },
  { path: '/voter-segmentation', labelKey: 'navVoterSeg', icon: BarChart3 },
  { path: '/governance-updates', labelKey: 'navGovResp', icon: Send },
  { path: '/citizen-engagement', labelKey: 'navCitizenEng', icon: MessageSquare },
  { path: '/data-analytics', labelKey: 'navAnalytics', icon: TrendingUp },
]

export default function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Language Framework
  const { t, i18n } = useTranslation();

  const cycleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : i18n.language === 'hi' ? 'mr' : 'en';
    i18n.changeLanguage(nextLang);
  };
  
  // Interactive Header State
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)

  const searchRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearchDropdown(false)
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false)
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef, notifRef]);

  const filteredRoutes = nav.filter(route => 
    t(route.labelKey).toLowerCase().includes(searchQuery.toLowerCase()) || 
    route.path.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const mockNotifications = [
    { title: "Gov.in API Sync", time: "2m ago", desc: "Successfully pulled active schemas for District 4." },
    { title: "Live Feedback", time: "15m ago", desc: "Citizen at Booth B12 submitted a localized issue." },
    { title: "AI Model Recalculated", time: "1h ago", desc: "Clustering algorithms detected 4 new overlaps." }
  ]

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'
          } shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all flex flex-col z-20`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 overflow-hidden truncate">
            <div className="w-9 h-9 shrink-0 rounded-lg bg-primary-600 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-slate-900 dark:text-white truncate">{t('boothAI')}</span>}
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hidden sm:block">
            <Menu className="w-5 h-5 dark:text-slate-300" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {nav.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition overflow-hidden truncate ${active
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span className="truncate">{t(item.labelKey)}</span>}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between px-6 z-10 transition-colors">
          <div className="flex items-center gap-4">
            
            {/* Interactive Smart Search */}
            <div className="relative" ref={searchRef}>
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSearchDropdown(true)
                }}
                placeholder={t('smartRouteSearch')}
                className="w-48 sm:w-64 pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all dark:text-white"
              />
              
              {showSearchDropdown && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {filteredRoutes.length > 0 ? (
                    <div className="py-2 max-h-64 overflow-y-auto custom-scrollbar">
                      <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-700/50 mb-1">{t('suggestedPages')}</div>
                      {filteredRoutes.map((route) => {
                        const Icon = route.icon
                        return (
                          <button
                            key={route.path}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition"
                            onClick={() => {
                              navigate(route.path)
                              setShowSearchDropdown(false)
                              setSearchQuery('')
                            }}
                          >
                            <Icon className="w-4 h-4 text-primary-500 shrink-0" />
                            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">{t(route.labelKey)}</span>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                      {t('noResults')} "{searchQuery}"
                     </div>
                  )}
                </div>
              )}
            </div>
            
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Interactive Notifications Bell */}
            <div className="relative" ref={notifRef}>
              <button 
                className={`p-2 rounded-lg transition relative ${showNotifications ? 'bg-slate-100 dark:bg-slate-700 text-primary-600 dark:text-primary-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-300 text-slate-600'}`}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
              </button>
              
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <span className="font-semibold text-slate-900 dark:text-white">{t('notifications')}</span>
                    <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full ring-1 ring-primary-500/20">3 {t('newCount')}</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {mockNotifications.map((notif, i) => (
                      <div key={i} className="px-4 py-3.5 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition cursor-pointer last:border-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{notif.title}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider whitespace-nowrap ml-2">{notif.time}</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug">{notif.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-slate-100 dark:border-slate-700 text-center bg-slate-50/30 dark:bg-slate-800/30">
                     <button className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 hover:text-primary-700 transition px-4 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20">{t('markAllRead')}</button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={cycleLanguage} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition text-sm font-medium">
              <Languages className="w-4 h-4 text-slate-600 dark:text-slate-300" /> <span className="text-slate-700 dark:text-slate-300">{(i18n.language || 'en').toUpperCase()}</span>
            </button>
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-300 text-slate-600 transition">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="hidden sm:block pl-2 border-l border-slate-200 dark:border-slate-700 ml-1">
              <Button variant="ghost" size="sm" onClick={() => {
                localStorage.removeItem('token');
                navigate('/login', { replace: true });
              }}>
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
            <button className="sm:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-rose-500 dark:text-rose-400" onClick={() => {
                localStorage.removeItem('token');
                navigate('/login', { replace: true });
            }}>
                <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 pb-24 sm:pb-6 relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
