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

  if (!data) return <div className="text-center p-10 text-slate-500 animate-pulse">Mapping Knowledge Graph...</div>

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
        // For booths, extract the raw Booth number to merge nodes cleanly
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
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Knowledge Graph</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        Interactive graph: Voters, Booths, Government Schemes — scroll to zoom, drag to pan
      </p>

      <div className="flex gap-4 mb-4 text-sm text-slate-500">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#0ea5e9]" /> Voters</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#14b8a6]" /> Booths</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#f97316]" /> Schemes</span>
      </div>

      <Card>
        <CardHeader title="Graph Visualization" subtitle="Click nodes to highlight relationships" />
        <CardContent>
          <div className="h-[500px] rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden">
            {ForceGraph2D ? (
              <ForceGraph2D
                graphData={dynamicGraph}
                nodeLabel="name"
                nodeColor={(n) =>
                  n.type === 'voter' ? '#0ea5e9' : n.type === 'booth' ? '#14b8a6' : '#f97316'
                }
                linkColor={() => '#94a3b8'}
                onNodeClick={(n) => console.log('Clicked node', n?.name)}
              />
            ) : (
              <div className="text-center">
                <Network className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">Graph visualization</p>
                <p className="text-sm text-slate-400 mt-1">Run: npm install react-force-graph-2d</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
