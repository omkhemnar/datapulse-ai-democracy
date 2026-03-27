import { useState, useEffect } from 'react'
import { getAnalytics } from '../api'
import { useTheme } from '../context/ThemeContext'
import { 
  AreaChart, Area, 
  LineChart, Line, 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  RadialBarChart, RadialBar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from 'recharts'

const GROUP_COLORS = {
  'Youth (Under 18)': '#00e5a0',
  'Youth (18-25)': '#3b82f6',
  'Youth (26-35)': '#06b6d4',
  'Working Age (36-59)': '#f97316',
  'Senior Citizens (60+)': '#a855f7',
  'Women': '#f43f5e',
  'Farmers': '#22c55e',
}

const SEGMENT_PALETTE = [
  '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#fb923c',
]

const AGE_COLORS = ['#3b82f6', '#0ea5e9', '#0d9488', '#f59e0b', '#8b5cf6']
const GENDER_COLORS = ['#3b82f6', '#ec4899', '#94a3b8']

const RADIAL_COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

function ActivePieShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill={fill} className="text-sm" fontSize={13} fontWeight={700}>
        {payload.name.length > 14 ? payload.name.slice(0, 13) + '…' : payload.name}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" fontSize={12}>
        {value} · {(percent * 100).toFixed(1)}%
      </text>
      <g>
        <circle cx={cx} cy={cy} r={innerRadius - 4} fill="rgba(0,0,0,0.03)" />
      </g>
    </g>
  )
}

export default function AnalyticsDashboard() {
  const { dark } = useTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedGroup, setExpandedGroup] = useState(null)
  const [activePieIndex, setActivePieIndex] = useState(null)
  const [activeRadialIndex, setActiveRadialIndex] = useState(null)

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500 dark:text-slate-400 animate-pulse font-medium tracking-wide">Synthesizing Dataset...</div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-rose-700 shadow-sm">
          <span className="font-bold block mb-1">Telemetry Error Detected</span>
          {error} — Ensure the backend API is reachable and running.
        </div>
      </div>
    )
  }

  const total = data?.totalVoters || 0
  const ageData = data?.ageDistribution || []
  const genderData = data?.genderRatio || {}
  const boothData = data?.boothCounts || []
  const groupSummary = data?.group_summary || []
  const schemeGroups = data?.scheme_groups || []
  const voterGroups = data?.voter_groups || []

  // Recharts Data Mapping
  const trendData = [
    { month: 'Jan', engagement: 62, voters: Math.floor(total * 0.8) },
    { month: 'Feb', engagement: 68, voters: Math.floor(total * 0.9) },
    { month: 'Mar', engagement: 76, voters: total },
  ]

  const mappedGender = Object.keys(genderData).map((key, i) => ({
    name: key,
    value: genderData[key],
    color: GENDER_COLORS[i % GENDER_COLORS.length]
  }))

  const mappedGroups = groupSummary.map((d, i) => ({
    name: d.name,
    value: d.count,
    color: GROUP_COLORS[d.name] || SEGMENT_PALETTE[i % SEGMENT_PALETTE.length]
  }))

  const mappedBooths = boothData.map((d) => ({
    name: `Booth ${d.boothId}`,
    count: d.count
  }))

  const votersByGroup = voterGroups.reduce((acc, v) => {
    const g = v.primary_group || 'Other'
    if (!acc[g]) acc[g] = []
    acc[g].push(v)
    return acc
  }, {})

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Data Analytics Engine</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-3xl">
        Algorithmic voter classification by demographic shifts, localized scheme-eligible groups, and granular intersectional metric distributions.
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Registered</p>
          <p className="text-3xl font-black text-primary-600 dark:text-primary-400 mt-2">{total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Active Cohorts</p>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{groupSummary.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Gov Schemes</p>
          <p className="text-3xl font-black text-amber-500 mt-2">{schemeGroups.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Booth Scopes</p>
          <p className="text-3xl font-black text-slate-700 dark:text-slate-200 mt-2">{boothData.length}</p>
        </div>
      </div>

      {/* Trend Charts */}
      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 mt-10">Longitudinal Velocity</h2>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 relative z-0">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-6">Historical Engagement Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="eng" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: dark ? 'rgba(255,255,255,0.05)' : 'rgba(51,65,85,0.05)' }} contentStyle={{ backgroundColor: dark ? '#1e293b' : '#ffffff', borderRadius: '12px', border: dark ? 'none' : '1px solid #e2e8f0', color: dark ? '#fff' : '#0f172a', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} itemStyle={{ color: dark ? '#fff' : '#0f172a' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="engagement" name="Engagement %" stroke="#0ea5e9" strokeWidth={3} fill="url(#eng)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 relative z-0">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-6">Voter Base Growth Projection</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: dark ? 'rgba(255,255,255,0.05)' : 'rgba(51,65,85,0.05)' }} contentStyle={{ backgroundColor: dark ? '#1e293b' : '#ffffff', borderRadius: '12px', border: dark ? 'none' : '1px solid #e2e8f0', color: dark ? '#fff' : '#0f172a', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} itemStyle={{ color: dark ? '#fff' : '#0f172a' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="voters" name="Total Voters" stroke="#14b8a6" strokeWidth={4} dot={{ r: 5, fill: '#14b8a6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, fill: '#14b8a6', stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mb-8 mt-12">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Intersectional Diagnostics</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
          {groupSummary.map((g) => (
             <div
               key={g.name}
               className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative hover:-translate-y-1 transition duration-300 group"
             >
               <div
                 className="p-5 cursor-pointer flex items-center justify-between rounded-xl relative z-10"
                 onClick={() => setExpandedGroup(expandedGroup === g.name ? null : g.name)}
               >
                 <div className="flex items-center gap-4">
                   <div
                     className="w-4 h-4 rounded-full shrink-0 shadow-inner"
                     style={{ backgroundColor: GROUP_COLORS[g.name] || '#64748b' }}
                   />
                   <div>
                     <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{g.name}</p>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{g.count} Validated Profiles</p>
                   </div>
                 </div>
                 <span className="text-slate-300 dark:text-slate-600 text-sm transition-transform duration-300" style={{ transform: expandedGroup === g.name ? 'rotate(90deg)' : 'none' }}>
                   ▶
                 </span>
               </div>
               
               {expandedGroup === g.name && votersByGroup[g.name] && (
                 <div className="mt-3 w-full border border-slate-200 dark:border-slate-600 rounded-2xl max-h-[300px] overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-900/40 custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200 shadow-inner">
                   <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">Granular User Demographics</div>
                   {votersByGroup[g.name].map((v) => (
                     <div
                       key={v.id}
                       className="text-sm py-2 px-3 border-b border-slate-100 dark:border-slate-700/50 last:border-0 flex justify-between items-center hover:bg-white dark:hover:bg-slate-700 rounded-lg transition"
                     >
                       <span className="font-bold text-slate-700 dark:text-slate-200">{v.Name}</span>
                       <span className="text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 shadow-sm px-2.5 py-1 rounded-md text-xs font-medium tracking-wide">{v.Age}y, {v.Gender}</span>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           ))}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Federal Scheme Matrices</h2>
        <div className="max-h-[600px] overflow-y-auto pr-4 pb-4 pt-2 -mt-2 custom-scrollbar">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {schemeGroups.map((sg) => (
              <div
                key={sg.scheme}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 relative overflow-hidden group hover:border-primary-300 dark:hover:border-primary-800 transition duration-500"
              >
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary-100 dark:bg-primary-900/10 rounded-full blur-2xl group-hover:scale-150 transition duration-700 -z-0" />
                <h3 className="font-bold text-lg text-primary-700 dark:text-primary-400 mb-1 relative z-10">{sg.scheme}</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-5 relative z-10">{sg.eligibility}</p>
                
                <div className="flex items-baseline gap-2 relative z-10">
                  <span className="text-4xl font-black text-slate-800 dark:text-slate-100">{sg.count}</span>
                  <span className="text-sm font-medium text-slate-500">Indexed Users</span>
                </div>
                
                {sg.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50 leading-relaxed relative z-10">{sg.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 mt-12">Universal Ratios</h2>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 relative z-0">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-6">Age Cohorts</h3>
          <div className="h-64">
            {ageData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: dark ? 'rgba(255,255,255,0.05)' : 'rgba(51,65,85,0.05)' }} contentStyle={{ backgroundColor: dark ? '#1e293b' : '#ffffff', borderRadius: '12px', border: dark ? 'none' : '1px solid #e2e8f0', color: dark ? '#fff' : '#0f172a', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} itemStyle={{ color: dark ? '#fff' : '#0f172a' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="count" name="Voter Count" radius={[6, 6, 0, 0]}>
                    {ageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-sm">Awaiting payload matrix.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 relative z-0 flex flex-col items-center">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 w-full text-left">Gender Indexing</h3>
          <div className="h-72 w-full">
            {Object.keys(genderData).length ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="85%" barSize={20} data={mappedGroups.map((g, i) => ({ ...g, fill: RADIAL_COLORS[i % RADIAL_COLORS.length] }))}>
                  <RadialBar
                    minAngle={15}
                    background={{ fill: '#f1f5f9' }}
                    clockWise
                    dataKey="value"
                    nameKey="name"
                    cornerRadius={10}
                    cursor="pointer"
                    onMouseEnter={(_, index) => setActiveRadialIndex(index)}
                    onMouseLeave={() => setActiveRadialIndex(null)}
                    label={false}
                  >
                    {mappedGroups.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={RADIAL_COLORS[index % RADIAL_COLORS.length]}
                        opacity={activeRadialIndex === null || activeRadialIndex === index ? 1 : 0.4}
                        style={{ transition: 'opacity 0.2s' }}
                      />
                    ))}
                  </RadialBar>
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: dark ? 'none' : '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: dark ? '#1e293b' : 'rgba(255,255,255,0.98)', color: dark ? '#fff' : '#0f172a' }}
                    itemStyle={{ fontWeight: 700, color: dark ? '#fff' : '#334155' }}
                    formatter={(value, name) => [`${value} voters`, name]}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    formatter={(value, entry) => (
                      <span style={{ color: activeRadialIndex === entry.payload?.index ? entry.color : '#64748b', fontWeight: activeRadialIndex === entry.payload?.index ? 700 : 400, transition: 'all 0.2s' }}>{value}</span>
                    )}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-sm">Awaiting payload matrix.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 relative z-0">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-6">Booth Localization Depth</h3>
          <div className="h-64">
            {boothData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mappedBooths} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBoothWave" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.4} />
                  <Tooltip 
                    cursor={{ stroke: 'rgba(14, 165, 233, 0.4)', strokeWidth: 2, strokeDasharray: '4 4' }}
                    contentStyle={{ borderRadius: '12px', border: dark ? 'none' : '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: dark ? '#1e293b' : 'rgba(255, 255, 255, 0.98)', color: dark ? '#fff' : '#0f172a' }}
                    itemStyle={{ fontWeight: 600, color: dark ? '#fff' : '#334155' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="count" name="Booth Voters" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorBoothWave)" activeDot={{ r: 8, strokeWidth: 0, fill: '#0ea5e9' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-sm">Awaiting payload matrix.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 relative z-0 flex flex-col items-center">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 w-full text-left">Segment Distribution</h3>
          <div className="h-72 w-full">
            {groupSummary.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{ backgroundColor: dark ? '#1e293b' : '#ffffff', borderRadius: '12px', border: dark ? 'none' : '1px solid #e2e8f0', color: dark ? '#fff' : '#0f172a', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    itemStyle={{ color: dark ? '#fff' : '#0f172a' }}
                    formatter={(value, name) => [`${value} voters`, name]}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px' }}
                    onClick={(e) => {
                      const idx = mappedGroups.findIndex(g => g.name === e.value)
                      setActivePieIndex(activePieIndex === idx ? null : idx)
                    }}
                    formatter={(value, entry, index) => (
                      <span
                        style={{
                          color: activePieIndex === null || activePieIndex === index ? '#334155' : '#94a3b8',
                          fontWeight: activePieIndex === index ? 700 : 400,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >{value}</span>
                    )}
                  />
                  <Pie
                    data={mappedGroups}
                    cx="50%"
                    cy="45%"
                    innerRadius={52}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                    activeIndex={activePieIndex}
                    activeShape={ActivePieShape}
                    onMouseEnter={(_, index) => setActivePieIndex(index)}
                    onMouseLeave={() => setActivePieIndex(null)}
                  >
                    {mappedGroups.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={activePieIndex === null || activePieIndex === index ? 1 : 0.35}
                        style={{ cursor: 'pointer', transition: 'opacity 0.2s, transform 0.2s' }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-sm">Awaiting payload matrix.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
