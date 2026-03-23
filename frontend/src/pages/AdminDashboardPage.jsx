import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Users, MapPin, TrendingUp, Bell, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getAnalytics } from '../api'

const AGES_COLORS = ['#0ea5e9', '#14b8a6', '#f97316', '#8b5cf6', '#eab308']

export default function AdminDashboardPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getAnalytics().then(setData).catch(console.error)
  }, [])

  if (!data) return <div className="text-center p-10 text-slate-500 animate-pulse">Syncing with Live AI Dataset...</div>

  const kpi = [
    { label: 'Total Voters', value: data.totalVoters, change: 'Live Dataset', icon: Users, color: 'text-primary-600' },
    { label: 'Active Booths', value: (data.boothCounts || []).length, change: 'Live Coverage', icon: MapPin, color: 'text-secondary-600' },
    { label: 'AI Clusters', value: (data.clusterDistribution || []).length, change: 'Categorized', icon: TrendingUp, color: 'text-accent-500' },
  ]

  const boothData = (data.boothCounts || []).map(b => ({ booth: b.boothId, voters: b.count }))
  
  const pieData = (data.ageDistribution || []).map((a, i) => ({
    name: a.label, value: a.count, color: AGES_COLORS[i % AGES_COLORS.length]
  }))

  const notifications = (data.recommendations || []).slice(0, 3).map((r, i) => ({
    text: r.scheme ? `Targeting ${r.cluster} cohort with ${r.scheme}` : (typeof r === 'string' ? r : 'System Notification'),
    time: 'AI Model',
    unread: i === 0
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Admin Dashboard</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Overview of booth performance and voter analytics</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {kpi.map((k) => (
          <Card key={k.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{k.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{k.value}</p>
                <p className="text-sm text-green-600 mt-1">{k.change}</p>
              </div>
              <k.icon className={`w-10 h-10 ${k.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader title="Booth Performance" subtitle="Voters per booth" />
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={boothData}>
                  <XAxis dataKey="booth" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="voters" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Age Distribution" subtitle="Voter demographics" />
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                    {pieData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Geographic Booth Distribution" subtitle="Map preview" />
          <CardContent>
            <div className="h-48 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-slate-400" />
              <span className="ml-2 text-slate-500">Map visualization placeholder</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Real-time Notifications" subtitle="Latest updates" />
          <CardContent>
            <div className="space-y-3">
              {notifications.map((n, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    n.unread ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <Bell className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-900 dark:text-white">{n.text}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{n.time}</p>
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
