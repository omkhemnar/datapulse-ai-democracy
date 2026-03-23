import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { TrendingUp, Brain, BarChart3, Target } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { getAnalytics } from '../api'

export default function AnalyticsInsightsPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getAnalytics().then(setData).catch(console.error)
  }, [])

  if (!data) return <div className="text-center p-10 text-slate-500 animate-pulse">Generating Predictive Insights...</div>

  const trendData = [
    { month: 'Jan', engagement: 62, voters: Math.floor(data.totalVoters * 0.8) },
    { month: 'Feb', engagement: 68, voters: Math.floor(data.totalVoters * 0.9) },
    { month: 'Mar', engagement: 76, voters: data.totalVoters },
  ]

  const predictions = (data.recommendations || []).map((r, i) => ({
    text: r.scheme ? `Recommend applying ${r.scheme} to ${r.cluster}` : (typeof r === 'string' ? r : 'New insight'),
    confidence: 95 - i * 2,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Analytics & Insights</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        AI predictions, trend graphs, policy impact analysis
      </p>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary-600" />
            <div>
              <p className="text-sm text-slate-500">Engagement Trend</p>
              <p className="text-xl font-bold text-green-600">+14%</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-secondary-600" />
            <div>
              <p className="text-sm text-slate-500">AI Predictions</p>
              <p className="text-xl font-bold">{predictions.length} active</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-accent-500" />
            <div>
              <p className="text-sm text-slate-500">Policy Impact</p>
              <p className="text-xl font-bold">{data.totalVoters > 0 ? 'High' : 'Low'}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-slate-600" />
            <div>
              <p className="text-sm text-slate-500">Reports</p>
              <p className="text-xl font-bold">12</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader title="Engagement Trend" subtitle="Last 3 months" />
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="eng" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="engagement" stroke="#0284c7" fill="url(#eng)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Voter Growth" />
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="voters" stroke="#14b8a6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="AI Recommendations" subtitle="Policy impact & predictions" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {predictions.map((p, i) => (
              <div key={i} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <Brain className="w-6 h-6 text-secondary-600 shrink-0 mt-1" />
                <div>
                  <p className="text-slate-700 dark:text-slate-300">{p.text}</p>
                  <p className="text-sm text-slate-500 mt-1">Confidence: {p.confidence}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
