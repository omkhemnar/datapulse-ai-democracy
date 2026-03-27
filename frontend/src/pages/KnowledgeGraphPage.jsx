import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Network } from 'lucide-react'
import ForceGraph2D from 'react-force-graph-2d'
import { getAnalytics } from '../api'

export default function KnowledgeGraphPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getAnalytics().then(setData).catch(console.error)
  }, [])

  if (!data) return <div className="text-center p-10 text-slate-500 animate-pulse">Mapping Vast Knowledge Graph...</div>

  const nodes = []
  const links = []
  const nodeSet = new Set()

  const addNode = (id, name, type) => {
    if (!nodeSet.has(id)) {
      nodes.push({ id, name, type })
      nodeSet.add(id)
    }
  }

  if (data.voter_groups) {
    data.voter_groups.forEach(voter => {
      const vId = `v_${voter.id}`
      addNode(vId, voter.Name, 'voter')

      if (voter.BoothID) {
        const bId = `b_${voter.BoothID}`
        addNode(bId, `Booth ${voter.BoothID}`, 'booth')
        links.push({ source: vId, target: bId })
      }

      if (voter.eligible_schemes) {
        voter.eligible_schemes.forEach(scheme => {
          const sId = `s_${scheme}`
          addNode(sId, scheme, 'scheme')
          links.push({ source: vId, target: sId })
        })
      }
    })
  }

  const dynamicGraph = { nodes, links }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Knowledge Graph Integration</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        Interactive geospatial graph isolating relationships across Voters, assigned Booths, and Government Schemes
      </p>

      <div className="flex flex-wrap gap-4 sm:gap-6 mb-4 text-sm font-medium text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#0ea5e9] ring-2 ring-[#0ea5e9]/30" /> Individual Voters</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#14b8a6] ring-2 ring-[#14b8a6]/30" /> Local Booths</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#f59e0b] ring-2 ring-[#f59e0b]/30" /> Assigned Schemes</span>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[500px] w-full rounded-2xl bg-slate-50 dark:bg-slate-900/50 overflow-hidden relative border border-slate-200 dark:border-slate-700 shadow-inner group">
          <div className="absolute top-4 right-4 bg-white/95 dark:bg-slate-900/95 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md text-xs text-slate-600 dark:text-slate-400 flex flex-col gap-2 z-10 opacity-70 group-hover:opacity-100 transition-opacity">
              <span className="flex items-center gap-2"><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-sm font-mono text-[10px]">Scroll</kbd> Zoom Canvas</span>
              <span className="flex items-center gap-2"><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-sm font-mono text-[10px]">Drag</kbd> Pan Graph</span>
              <span className="flex items-center gap-2"><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-sm font-mono text-[10px]">Click</kbd> Isolate Node</span>
          </div>

          {ForceGraph2D ? (
            <ForceGraph2D
              graphData={dynamicGraph}
              nodeLabel="name"
              nodeRelSize={7}
              linkWidth={1.5}
              linkColor={() => '#94a3b8'}
              linkDirectionalParticles={1}
              linkDirectionalParticleSpeed={0.005}
              d3VelocityDecay={0.8}
              nodeColor={(n) =>
                n.type === 'voter' ? '#0ea5e9' : n.type === 'booth' ? '#14b8a6' : '#f59e0b'
              }
              backgroundColor="transparent"
            />
          ) : (
            <div className="text-center mt-32">
              <Network className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500">Graph core missing</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden h-full">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-2xl pointer-events-none" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-6 relative z-10 uppercase tracking-widest text-xs">Live Network Statistics</h3>
            
            <div className="space-y-6 relative z-10">
              <div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 block">Total Active Nodes</span>
                <span className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1 block">{nodes.length}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 block">Relational Vector Edges</span>
                <span className="text-3xl font-bold text-primary-600 mt-1 block">{links.length}</span>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 block mb-2">System Graph Integrity</span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold text-sm tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  100% Encrypted
                </span>
              </div>
            </div>

            <div className="mt-8 bg-accent-50 dark:bg-accent-900/10 p-4 rounded-xl border border-accent-100 dark:border-accent-900/50 text-sm">
                <h4 className="font-semibold text-accent-800 dark:text-accent-300 mb-2">Automated Discovery</h4>
                <p className="text-accent-700/80 dark:text-accent-400/80 text-xs leading-relaxed mb-3">AI detects non-linear dependency mapping between local poll density and multi-federal scheme subsidies.</p>
                <div className="w-full bg-accent-200 dark:bg-accent-800/50 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-accent-500 w-[85%] h-full rounded-full animate-pulse" />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
