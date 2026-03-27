import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Filter, Download, Users, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts'
import { getAnalytics } from '../api'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'

const filterOptions = { age: ['18-25', '26-40', '41-60', '60+'], occupation: ['Farmer', 'Student', 'Worker', 'Retired'], region: ['Rural', 'Urban'] }

export default function VoterSegmentationPage() {
  const [filters, setFilters] = useState({ age: '', occupation: '', region: '' })
  const [data, setData] = useState(null)
  const { t } = useTranslation()
  const { dark } = useTheme()

  useEffect(() => {
    getAnalytics().then(setData).catch(console.error)
  }, [])

  if (!data) return <div className="text-center p-10 text-slate-500 animate-pulse">{t('computingSeg')}</div>

  const segments = (data.clusterDistribution || []).map(c => ({
    name: c.name,
    count: c.count,
    age: c.name.includes('Youth') ? '18-35' : (c.name.includes('Senior') ? '60+' : 'All'),
    occupation: c.name.toLowerCase().includes('farmer') ? 'Agriculture' : 'Various'
  }))

  const handleExport = () => {
    if (!segments || segments.length === 0) return;
    
    const headers = ['Segment Name', 'Voter Count', 'Primary Age Range', 'Primary Occupation'];
    const csvRows = [headers.join(',')];
    
    segments.forEach(s => {
      const row = [`"${s.name}"`, s.count, `"${s.age}"`, `"${s.occupation}"`];
      csvRows.push(row.join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'voter_segmentation_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('voterSegTitle')}</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">{t('voterSegSubtitle')}</p>

      <Card className="mb-6">
        <CardHeader
          title={t('dataSlicing')}
          subtitle={t('dataSlicingSub')}
          action={
            <Button variant="outline" size="sm" onClick={handleExport} className="border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40">
              <Download className="w-4 h-4 mr-2" />
              {t('exportSeg')}
            </Button>
          }
        />
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{t('ageBracket')}</label>
              <select
                value={filters.age}
                onChange={(e) => setFilters((f) => ({ ...f, age: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
              >
                {filterOptions.age.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{t('primaryOcc')}</label>
              <select
                value={filters.occupation}
                onChange={(e) => setFilters((f) => ({ ...f, occupation: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
              >
                {filterOptions.occupation.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{t('geographicRegion')}</label>
              <select
                value={filters.region}
                onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
              >
                {filterOptions.region.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 items-stretch">
        <Card className="h-full flex flex-col">
          <CardHeader title={t('aiIndexedClusters')} subtitle={t('aiIndexedClustersSub')} />
          <CardContent className="flex-1">
            <div className="space-y-5 h-[580px] overflow-y-scroll pr-3 custom-scrollbar">
              {segments.map((s, i) => (
                <div
                  key={s.name}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-400 dark:hover:border-primary-500 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-5 mb-3 sm:mb-0">
                    <div className="p-2.5 rounded-lg bg-primary-50 dark:bg-primary-900/40 border border-primary-100 dark:border-primary-800">
                      <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white leading-tight">{s.name}</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{t('ageBracket')}: {s.age} · {s.occupation}</p>
                    </div>
                  </div>
                  <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-700">
                     <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:hidden">{t('totalCount')}</span>
                     <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">{s.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title={t('segConversion')} subtitle={t('segConversionSub')} />
            <CardContent>
              <div className="h-[220px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={segments}>
                    <defs>
                      <linearGradient id="segGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => val.split(' ')[0]} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip cursor={{ fill: dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(51, 65, 85, 0.05)' }} contentStyle={{ backgroundColor: dark ? '#1e293b' : '#ffffff', borderRadius: '12px', border: dark ? 'none' : '1px solid #e2e8f0', color: dark ? '#fff' : '#0f172a', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} itemStyle={{ color: dark ? '#fff' : '#0f172a' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="count" name="Voter Count" stroke="#14b8a6" strokeWidth={3} fill="url(#segGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title={t('clusterDistribution')} subtitle={t('clusterDistributionSub')} />
            <CardContent>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={segments} layout="vertical" margin={{ left: 80, right: 10 }}>
                    <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: '#64748b' }} stroke="#94a3b8" />
                    <Tooltip cursor={{ fill: dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(51, 65, 85, 0.05)' }} contentStyle={{ backgroundColor: dark ? '#1e293b' : '#ffffff', borderRadius: '12px', border: dark ? 'none' : '1px solid #e2e8f0', color: dark ? '#fff' : '#0f172a', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} itemStyle={{ color: dark ? '#fff' : '#0f172a' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="count" name="Voter Count" fill="#0ea5e9" radius={[0, 6, 6, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
