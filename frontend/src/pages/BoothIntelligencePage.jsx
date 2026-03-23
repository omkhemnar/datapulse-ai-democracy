import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Users, Zap, AlertTriangle, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getAnalytics } from '../api'

export default function BoothIntelligencePage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getAnalytics().then(setData).catch(console.error)
  }, [])

  if (!data) return <div className="text-center p-10 text-slate-500 animate-pulse">Scanning Booth Intelligence...</div>

  const clusters = (data.scheme_groups || []).map(s => ({
    name: `${s.scheme} Cohort`,
    count: s.count,
    scheme: s.scheme
  }))

  const heatmapData = (data.boothCounts || []).map(b => ({
    booth: b.boothId,
    engagement: Math.min(b.count * 8, 100) // Simulated engagement proportional to booth size
  }))

  const insights = (data.recommendations || []).map((r, idx) => ({
    text: r.scheme ? `Cluster identified: ${r.cluster} is eligible for ${r.scheme}` : (typeof r === 'string' ? r : 'Intelligence mapping'),
    type: idx === 0 ? 'alert' : idx === 1 ? 'recommendation' : 'insight'
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Booth Intelligence</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Booth-level voter clusters and AI insights</p>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Users className="w-10 h-10 text-primary-600" />
            <div>
              <p className="text-sm text-slate-500">Voter Clusters</p>
              <p className="text-xl font-bold">{clusters.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Zap className="w-10 h-10 text-accent-500" />
            <div>
              <p className="text-sm text-slate-500">AI Insights</p>
              <p className="text-xl font-bold">{insights.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-10 h-10 text-secondary-600" />
            <div>
              <p className="text-sm text-slate-500">Smart Alerts</p>
              <p className="text-xl font-bold">{insights.filter(i => i.type === 'alert').length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader title="Booth-level Voter Clusters" subtitle="Demographic segmentation" />
          <CardContent>
            <div className="space-y-4">
              {clusters.map((c) => (
                <div key={c.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{c.name}</p>
                    <p className="text-sm text-slate-500">{c.scheme}</p>
                  </div>
                  <span className="text-lg font-bold text-primary-600">{c.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Engagement Heatmap" subtitle="Booth engagement scores" />
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={heatmapData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="booth" type="category" width={40} />
                  <Tooltip />
                  <Bar dataKey="engagement" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="AI Insights Panel" subtitle="Automated recommendations" />
        <CardContent>
          <div className="space-y-4">
            {insights.map((i, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  i.type === 'alert'
                    ? 'border-accent-200 bg-accent-50 dark:bg-accent-900/20'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <BarChart3 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                <p className="text-slate-700 dark:text-slate-300">{i.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
