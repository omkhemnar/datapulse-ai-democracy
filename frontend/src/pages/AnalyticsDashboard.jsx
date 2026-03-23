import { useState, useEffect } from 'react'
import { getAnalytics } from '../api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
  },
}

const GROUP_COLORS = {
  'Youth (Under 18)': '#22c55e',
  'Youth (18-25)': '#3b82f6',
  'Youth (26-35)': '#0d9488',
  'Working Age (36-59)': '#f59e0b',
  'Senior Citizens (60+)': '#8b5cf6',
  'Women': '#ec4899',
  'Farmers': '#16a34a',
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedGroup, setExpandedGroup] = useState(null)

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500">Loading analytics...</div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          Error: {error}. Ensure the backend is running at http://localhost:5001
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

  const ageChartData = {
    labels: ageData.map((d) => d.label),
    datasets: [
      {
        label: 'Voters',
        data: ageData.map((d) => d.count),
        backgroundColor: ['#3b82f6', '#0d9488', '#f59e0b', '#8b5cf6'],
      },
    ],
  }

  const genderChartData = {
    labels: Object.keys(genderData),
    datasets: [
      {
        data: Object.values(genderData),
        backgroundColor: ['#3b82f6', '#ec4899', '#94a3b8'],
      },
    ],
  }

  const boothChartData = {
    labels: boothData.map((d) => d.boothId),
    datasets: [
      {
        label: 'Voters per Booth',
        data: boothData.map((d) => d.count),
        backgroundColor: '#3b82f6',
      },
    ],
  }

  const groupChartData = {
    labels: groupSummary.map((d) => d.name),
    datasets: [
      {
        data: groupSummary.map((d) => d.count),
        backgroundColor: groupSummary.map((d) => GROUP_COLORS[d.name] || '#64748b'),
      },
    ],
  }

  // Group voters by primary_group for display
  const votersByGroup = voterGroups.reduce((acc, v) => {
    const g = v.primary_group || 'Other'
    if (!acc[g]) acc[g] = []
    acc[g].push(v)
    return acc
  }, {})

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Analytics Dashboard</h1>
      <p className="text-slate-600 mb-8">
        Voter classification by age, gender & occupation — scheme-eligible groups
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-slate-500 text-sm font-medium">Total Voters</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">{total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-slate-500 text-sm font-medium">Groups</p>
          <p className="text-2xl font-bold text-accent-teal mt-1">{groupSummary.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-slate-500 text-sm font-medium">Scheme Categories</p>
          <p className="text-2xl font-bold text-accent-amber mt-1">{schemeGroups.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-slate-500 text-sm font-medium">Booths</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{boothData.length}</p>
        </div>
      </div>

      {/* Scheme-eligible groups - main feature */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Scheme-Eligible Groups</h2>
        <p className="text-sm text-slate-500 mb-4">
          Voters classified by age, gender & occupation — click a group to see voters
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {groupSummary.map((g) => (
            <div
              key={g.name}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-slate-50 transition flex items-center justify-between"
                onClick={() => setExpandedGroup(expandedGroup === g.name ? null : g.name)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: GROUP_COLORS[g.name] || '#64748b' }}
                  />
                  <div>
                    <p className="font-semibold text-slate-800">{g.name}</p>
                    <p className="text-2xl font-bold text-primary-600">{g.count}</p>
                  </div>
                </div>
                <span className="text-slate-400 text-sm">
                  {expandedGroup === g.name ? '▼' : '▶'}
                </span>
              </div>
              {expandedGroup === g.name && votersByGroup[g.name] && (
                <div className="border-t border-slate-100 max-h-48 overflow-y-auto p-3 bg-slate-50">
                  {votersByGroup[g.name].map((v) => (
                    <div
                      key={v.id}
                      className="text-sm py-1.5 border-b border-slate-100 last:border-0 flex justify-between"
                    >
                      <span className="font-medium text-slate-700">{v.Name}</span>
                      <span className="text-slate-500">{v.Age}y, {v.Gender}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Schemes by eligibility */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Government Schemes — Eligible Voters</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schemeGroups.map((sg) => (
            <div
              key={sg.scheme}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-4"
            >
              <h3 className="font-semibold text-primary-600 mb-1">{sg.scheme}</h3>
              <p className="text-xs text-slate-500 mb-2">{sg.eligibility}</p>
              <p className="text-2xl font-bold text-slate-800">{sg.count} voters</p>
              {sg.description && (
                <p className="text-sm text-slate-600 mt-2">{sg.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Age Distribution</h3>
          <div className="h-56">
            {ageData.length ? (
              <Bar data={ageChartData} options={chartOptions} />
            ) : (
              <p className="text-slate-400 text-sm">No data. Upload a CSV first.</p>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Gender Ratio</h3>
          <div className="h-56">
            {Object.keys(genderData).length ? (
              <Doughnut data={genderChartData} options={chartOptions} />
            ) : (
              <p className="text-slate-400 text-sm">No data.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Booth-wise Voter Counts</h3>
          <div className="h-56">
            {boothData.length ? (
              <Bar data={boothChartData} options={chartOptions} />
            ) : (
              <p className="text-slate-400 text-sm">No data.</p>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Group Distribution</h3>
          <div className="h-56">
            {groupSummary.length ? (
              <Doughnut data={groupChartData} options={chartOptions} />
            ) : (
              <p className="text-slate-400 text-sm">Load sample data or upload CSV.</p>
            )}
          </div>
        </div>
      </div>

      {/* Notable schemes highlight */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="font-semibold text-amber-900 mb-3">Key schemes in use</h3>
        <ul className="grid md:grid-cols-2 gap-2 text-sm text-amber-800">
          <li>• <strong>Ladli Behna Yojana</strong> — Women 21–60 years</li>
          <li>• <strong>Skill India (18+)</strong> — Age 18–35</li>
          <li>• <strong>Child Welfare</strong> — Under 18</li>
          <li>• <strong>PM-KISAN</strong> — Farmers</li>
          <li>• <strong>Ayushman Bharat</strong> — Senior citizens 60+</li>
        </ul>
      </div>
    </div>
  )
}
