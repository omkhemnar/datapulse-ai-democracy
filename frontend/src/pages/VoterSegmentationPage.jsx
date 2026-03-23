import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Filter, Download, Users, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getAnalytics } from '../api'

const filterOptions = { age: ['18-25', '26-40', '41-60', '60+'], occupation: ['Farmer', 'Student', 'Worker', 'Retired'], region: ['Rural', 'Urban'] }

export default function VoterSegmentationPage() {
  const [filters, setFilters] = useState({ age: '', occupation: '', region: '' })
  const [data, setData] = useState(null)

  useEffect(() => {
    getAnalytics().then(setData).catch(console.error)
  }, [])

  if (!data) return <div className="text-center p-10 text-slate-500 animate-pulse">Computing Segmentation Data...</div>

  const segments = (data.clusterDistribution || []).map(c => ({
    name: c.name,
    count: c.count,
    age: c.name.includes('Youth') ? '18-35' : (c.name.includes('Senior') ? '60+' : 'All'),
    occupation: c.name.toLowerCase().includes('farmer') ? 'Agriculture' : 'Various'
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Voter Segmentation</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">AI-generated clusters — filter by age, occupation, region</p>

      <Card className="mb-6">
        <CardHeader
          title="Filters"
          subtitle="Refine segmentation"
          action={
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          }
        />
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Age</label>
              <select
                value={filters.age}
                onChange={(e) => setFilters((f) => ({ ...f, age: e.target.value }))}
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {filterOptions.age.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Occupation</label>
              <select
                value={filters.occupation}
                onChange={(e) => setFilters((f) => ({ ...f, occupation: e.target.value }))}
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {filterOptions.occupation.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Region</label>
              <select
                value={filters.region}
                onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value }))}
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {filterOptions.region.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="AI Voter Clusters" subtitle="Behavioral insights" />
          <CardContent>
            <div className="space-y-3">
              {segments.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-primary-600" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{s.name}</p>
                      <p className="text-sm text-slate-500">Age: {s.age} · {s.occupation}</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-primary-600">{s.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Cluster Distribution" />
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={segments} layout="vertical" margin={{ left: 80 }}>
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0284c7" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
