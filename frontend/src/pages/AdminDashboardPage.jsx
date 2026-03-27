import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Users, MapPin, TrendingUp, Bell } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { getAnalytics } from '../api'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'

import { MapContainer, TileLayer, Marker, Popup, Tooltip as LeafletTooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix generic Leaflet marker icon pathways within React environments
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

const AGES_COLORS = ['#0ea5e9', '#14b8a6', '#f97316', '#8b5cf6', '#eab308']

export default function AdminDashboardPage() {
  const [data, setData] = useState(null)
  const { dark } = useTheme()
  const { t } = useTranslation()

  useEffect(() => {
    getAnalytics().then(setData).catch(console.error)
  }, [])

  if (!data) return <div className="text-center p-10 text-slate-500 animate-pulse">{t('syncingDataset')}</div>

  const kpi = [
    { label: t('totalVoters'), value: data.totalVoters, change: t('liveDataset'), icon: Users, color: 'text-primary-600' },
    { label: t('activeBooths'), value: (data.boothCounts || []).length, change: t('liveCoverage'), icon: MapPin, color: 'text-secondary-600' },
    { label: t('aiClusters'), value: (data.clusterDistribution || []).length, change: t('categorized'), icon: TrendingUp, color: 'text-accent-500' },
  ]

  const boothData = (data.boothCounts || []).map(b => ({ booth: b.boothId, voters: b.count }))
  
  const pieData = (data.ageDistribution || []).map((a, i) => ({
    name: a.label, value: a.count, color: AGES_COLORS[i % AGES_COLORS.length]
  }))

  let notifications = (data.latestSchemes || []).slice(0, 3).map((s, i) => ({
    text: `MyScheme (Maharashtra) Update: A new benefit program "${s.name}" has been indexed into the central repository. Description: ${s.description}`,
    time: i === 0 ? 'Live feeds' : 'Earlier today',
    unread: i === 0
  }))

  if (notifications.length === 0) {
    notifications = [{
      text: "System Alert: The central Gov.in repository indexing engine is currently standing by. No new regional schemes have been broadcasted yet.",
      time: "System Monitor",
      unread: false
    }]
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('adminDashPageTitle')}</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">{t('adminDashPageSubtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {kpi.map((k) => (
          <Card key={k.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{k.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{k.value}</p>
                <p className="text-sm font-medium text-emerald-600 mt-1">{k.change}</p>
              </div>
              <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700`}>
                <k.icon className={`w-8 h-8 ${k.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader title={t('boothPerformance')} subtitle={t('boothPerformanceSub')} />
          <CardContent>
            <div className="h-64 overflow-x-auto custom-scrollbar">
              <div style={{ width: `${Math.max(100, boothData.length * 60)}px`, minWidth: '100%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={boothData} margin={{ top: 20 }}>
                    <XAxis dataKey="booth" stroke={dark ? '#64748b' : '#94a3b8'} />
                    <YAxis stroke={dark ? '#64748b' : '#94a3b8'} />
                    <Tooltip cursor={{ fill: dark ? '#334155' : '#f1f5f9' }} contentStyle={{ backgroundColor: dark ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none', color: dark ? '#fff' : '#000' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="voters" name="Total registered voters per booth proxy" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title={t('ageDemographics')} subtitle={t('ageDemoSub')} />
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="name" stroke="none">
                    {pieData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: dark ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none', color: dark ? '#fff' : '#000' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title={t('geographicBooth')} subtitle={t('geographicBoothSub')} />
          <CardContent>
            <div className="h-80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative z-0">
               <MapContainer center={[19.0760, 72.8777]} zoom={12} className="w-full h-full" zoomControl={false}>
                 <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Tiles &copy; Esri" />
                 <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />
                 {boothData.map((b, i) => {
                   const angle = i * 137.5 * (Math.PI / 180)
                   const radius = 0.015 * Math.sqrt(i)
                   const lat = 19.0760 + (Math.sin(angle) * radius)
                   const lng = 72.8777 + (Math.cos(angle) * radius)
                   return (
                     <Marker key={b.booth} position={[lat, lng]}>
                       <LeafletTooltip direction="top" offset={[0, -20]} opacity={0.9} permanent className="font-bold text-slate-800 bg-white shadow-xl shadow-black/20 border-slate-200">
                         {t('sector')} {b.booth}
                       </LeafletTooltip>
                       <Popup className={dark ? 'dark-popup' : ''}>
                         <div className="font-semibold text-slate-900">Mumbai South — {t('booth')} {b.booth}</div>
                         <div className="text-emerald-600 font-medium">{b.voters} {t('votersAssigned')}</div>
                       </Popup>
                     </Marker>
                   )
                 })}
               </MapContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title={t('govPortalSync')} subtitle={t('govPortalSyncSub')} />
          <CardContent>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {notifications.map((n, i) => (
                <div
                  key={i}
                  className={`flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl border transition-all ${
                    n.unread 
                    ? 'border-accent-200 bg-gradient-to-r from-accent-50 to-white dark:from-accent-900/30 dark:to-slate-800' 
                    : 'border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className={`p-3 rounded-lg shrink-0 ${n.unread ? 'bg-accent-100 dark:bg-accent-900/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <Bell className={`w-6 h-6 ${n.unread ? 'text-accent-600 dark:text-accent-400 hover:animate-swing' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1 mt-1 sm:mt-0">
                    <p className={`font-medium leading-relaxed ${n.unread ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{n.text}</p>
                    <div className="flex items-center gap-3 mt-3">
                       <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{t('govInPortal')}</span>
                       <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> {n.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
