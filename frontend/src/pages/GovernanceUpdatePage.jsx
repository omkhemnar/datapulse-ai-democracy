import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Send, MessageSquare, BarChart3, CheckCircle, Loader2 } from 'lucide-react'
import { getAnalytics, getCampaigns, sendCampaign } from '../api'

const segmentMap = {
  farmers: 'Farmers',
  youth: 'Youth (18-25)',
  seniors: 'Senior Citizens (60+)',
  women: 'Women'
}

export default function GovernanceUpdatePage() {
  const [message, setMessage] = useState('')
  const [segment, setSegment] = useState('farmers')
  const [campaignData, setCampaignData] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    Promise.all([getCampaigns(), getAnalytics()])
      .then(([cms, an]) => {
        setCampaignData(cms)
        setAnalytics(an)
      })
      .catch(console.error)
      .finally(() => setFetching(false))
  }, [])

  const handleSend = async (type) => {
    if (!message.trim()) return
    setLoading(true)
    
    // Calculate targeted count based on actual cluster size
    const clusterName = segmentMap[segment]
    const cluster = analytics?.clusterDistribution?.find(c => c.name === clusterName)
    const sentCount = cluster?.count || 0

    try {
      const res = await sendCampaign({
        name: `${clusterName} - ${type}`,
        segment: clusterName,
        sent: sentCount,
        type: type,
        message: message
      })
      setCampaignData(prev => [res.campaign, ...prev])
      setMessage('')
      alert(`Campaign sent via ${type} to ${sentCount} voters!`)
    } catch (err) {
      console.error(err)
      alert('Failed to send campaign')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="p-10 text-center animate-pulse text-slate-500">Loading Governance System...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Governance Update System</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        Send targeted scheme notifications via WhatsApp / SMS
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader title="Compose Campaign" subtitle="Targeted scheme notifications" />
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Segment</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
              >
                <option value="farmers">Farmers (PM-KISAN)</option>
                <option value="youth">Youth 18-25 (Skill India)</option>
                <option value="seniors">Senior Citizens (Ayushman)</option>
                <option value="women">Women (Ladli Behna)</option>
              </select>
            </div>
            <Input
              label="Message"
              placeholder="Enter notification message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex gap-3">
              <Button 
                className="flex-1" 
                onClick={() => handleSend('WhatsApp')}
                disabled={loading || !message.trim()}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
                WhatsApp
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={() => handleSend('SMS')}
                disabled={loading || !message.trim()}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                SMS
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Personalized Preview" subtitle="How voters will see it" />
          <CardContent>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
              <p className="text-sm text-slate-500 mb-2">Sample recipient: Rajesh Kumar (Farmer, B001)</p>
              <p className="text-slate-700 dark:text-slate-300">
                {message || 'Your message will appear here. PM-KISAN scheme: ₹6000/year income support for farmers. Register at...'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="Campaign Performance" subtitle="Recent sends" />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 font-medium">Campaign</th>
                  <th className="text-left py-3 font-medium">Sent</th>
                  <th className="text-left py-3 font-medium">Opened</th>
                  <th className="text-left py-3 font-medium">Replied</th>
                  <th className="text-left py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {campaignData.map((c, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="py-3 font-medium text-slate-800 dark:text-slate-200">{c.name}</td>
                    <td className="py-3">{c.sent.toLocaleString()}</td>
                    <td className="py-3 text-emerald-600 font-medium">{c.opened.toLocaleString()}</td>
                    <td className="py-3 text-primary-600 font-medium">{c.replied.toLocaleString()}</td>
                    <td className="py-3 text-slate-500">{c.date}</td>
                  </tr>
                ))}
                {campaignData.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-400">No campaigns found. Start one above!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
