import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Users, Zap, Shield, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getAnalytics } from '../api'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'

export default function BoothIntelligencePage() {
  const [data, setData] = useState(null)
  const { t } = useTranslation()
  const { dark } = useTheme()

  useEffect(() => {
    getAnalytics().then(setData).catch(console.error)
  }, [])

  if (!data) return <div className="text-center p-10 text-slate-500 animate-pulse">{t('scanningBooth')}</div>

  const clusters = (data.scheme_groups || []).map(s => ({
    name: `${s.scheme} Cohort`,
    count: s.count,
    scheme: s.scheme
  }))

  const heatmapData = (data.boothCounts || []).map(b => ({
    booth: b.boothId,
    engagement: Math.min(b.count * 8, 100)
  }))

  // Simulated static computation based on raw counts
  const resourceData = (data.boothCounts || []).map(b => ({
    booth: `B-${b.boothId}`,
    EVMS: Math.max(2, Math.floor(b.count / 250)),
    Security: Math.max(1, Math.floor(b.count / 500)),
    Staff: Math.max(3, Math.floor(b.count / 150))
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('boothIntelTitle')}</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">{t('boothIntelSubtitle')}</p>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Users className="w-10 h-10 text-primary-600" />
            <div>
              <p className="text-sm text-slate-500">{t('voterClusters')}</p>
              <p className="text-xl font-bold">{clusters.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Zap className="w-10 h-10 text-accent-500" />
            <div>
              <p className="text-sm text-slate-500">{t('liveBooths')}</p>
              <p className="text-xl font-bold">{heatmapData.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-amber-500" />
            <div>
              <p className="text-sm text-slate-500">{t('resourceProtocols')}</p>
              <p className="text-xl font-bold">{t('active')}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader title={t('boothVoterClusters')} subtitle={t('boothVoterClustersSub')} />
          <CardContent>
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
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
          <CardHeader title={t('engagementScore')} subtitle={t('engagementScoreSub')} />
          <CardContent>
            <div className="h-[250px] overflow-y-auto custom-scrollbar pr-2">
              <div style={{ height: `${Math.max(250, heatmapData.length * 40)}px`, minHeight: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={heatmapData} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
                    <YAxis dataKey="booth" type="category" width={40} stroke="#94a3b8" />
                    <Tooltip cursor={{ fill: dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(51, 65, 85, 0.05)' }} contentStyle={{ backgroundColor: dark ? '#1e293b' : '#ffffff', borderRadius: '8px', border: dark ? 'none' : '1px solid #e2e8f0', color: dark ? '#fff' : '#0f172a', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} itemStyle={{ color: dark ? '#fff' : '#0f172a' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="engagement" name="Engagement Score" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title={t('logisticalResource')} subtitle={t('logisticalResourceSub')} />
        <CardContent>
          <div className="h-72 mt-4 overflow-x-auto custom-scrollbar">
            <div style={{ width: `${Math.max(100, resourceData.length * 60)}px`, minWidth: '100%', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resourceData} margin={{ top: 20 }}>
                  <XAxis dataKey="booth" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip cursor={{ fill: dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(51, 65, 85, 0.05)' }} contentStyle={{ backgroundColor: dark ? '#1e293b' : '#ffffff', borderRadius: '8px', border: dark ? 'none' : '1px solid #e2e8f0', color: dark ? '#fff' : '#0f172a', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} itemStyle={{ color: dark ? '#fff' : '#0f172a' }} />
                  <Legend iconType="circle" />
                  <Bar dataKey="Staff" stackId="a" fill="#14b8a6" name={t('pollingStaff')} />
                  <Bar dataKey="EVMS" stackId="a" fill="#0ea5e9" name={t('evmUnits')} />
                  <Bar dataKey="Security" stackId="a" fill="#f59e0b" name={t('securityPersonnel')} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
