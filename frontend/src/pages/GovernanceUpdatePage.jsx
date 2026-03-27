import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { getAnalytics, getCampaigns, sendCampaign, sendNotificationEmail, getSchemesByCluster, sendTelegramClusterNotification } from '../api'
import { Send, MessageSquare, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function GovernanceUpdatePage() {
  const [message, setMessage] = useState('')
  const [segment, setSegment] = useState('')
  const [campaignData, setCampaignData] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [schemes, setSchemes] = useState([])
  const [selectedScheme, setSelectedScheme] = useState(null)
  const { t } = useTranslation()

  useEffect(() => {
    Promise.all([getCampaigns(), getAnalytics()])
      .then(([cms, an]) => {
        setCampaignData(cms)
        setAnalytics(an)
        if (an?.clusterDistribution?.length > 0) {
          setSegment(an.clusterDistribution[0].name)
        }
      })
      .catch(console.error)
      .finally(() => setFetching(false))
  }, [])

  useEffect(() => {
    if (segment) {
      getSchemesByCluster(segment).then(data => {
        setSchemes(data || [])
        if (data && data.length > 0) {
          setSelectedScheme(data[0])
        } else {
          setSelectedScheme(null)
        }
      }).catch(console.error)
    }
  }, [segment])

  const handleSend = async (type) => {
    if (!message.trim()) return
    setLoading(true)

    const clusterName = segment
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

  const handleTelegram = async () => {
    if (!message.trim()) return
    setLoading(true)

    const clusterName = segment
    const cluster = analytics?.clusterDistribution?.find(c => c.name === clusterName)
    const sentCount = cluster?.count || 0

    try {
      const res = await sendCampaign({
        name: `${clusterName} - Telegram`,
        segment: clusterName,
        sent: sentCount,
        type: 'Telegram',
        message: message
      })
      setCampaignData(prev => [res.campaign, ...prev])
      setMessage('')
      // Redirect user to the real Telegram bot so they can start it
      window.open('https://t.me/Gov_Schemes_Alert_bot', '_blank')
      alert(`Campaign recorded for ${sentCount} voters. Telegram bot opened — users must press START to receive messages!`)
    } catch (err) {
      console.error(err)
      alert('Failed to send campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!message.trim()) return
    setLoading(true)

    try {
      if (!selectedScheme) {
        throw new Error("Select a scheme first!");
      }

      await sendNotificationEmail({
        cluster: segment,
        message: message,
        scheme: selectedScheme?.name
      })
      alert(`Simulation: Secure Notification dynamically dispatched to cluster segment via Email!`)
    } catch (err) {
      console.error(err)
      alert('Failed to route email notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleTelegramUpdates = async () => {
    if (!message.trim()) return
    setLoading(true)

    try {
      if (!selectedScheme) {
        throw new Error("Select a scheme first!");
      }

      const res = await sendTelegramClusterNotification({
        cluster: segment,
        message: message,
        scheme: selectedScheme?.name
      })
      alert(`Sent scheme updates to ${res.count} Telegram users in the ${segment} cluster!`)
    } catch (err) {
      console.error(err)
      alert(`Failed to send Telegram updates: ${err.response?.data?.error || err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="p-10 text-center animate-pulse text-slate-500">{t('loadingGovSystem')}</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('govUpdateTitle')}</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        {t('govUpdateSubtitle')}
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader title={t('composeCampaign')} subtitle={t('composeCampaignSub')} />
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('targetSegment')}</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
              >
                {analytics?.clusterDistribution?.map((c, i) => (
                  <option key={i} value={c.name}>{c.name} ({c.count} {t('voters')})</option>
                ))}
                {(!analytics?.clusterDistribution || analytics.clusterDistribution.length === 0) && (
                  <option value="">{t('noSegments')}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('mappedSchemes')} {segment || t('segment')}</label>
              <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600">
                {schemes.length > 0 ? (
                  schemes.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedScheme(s)}
                      className={`p-2 rounded-md cursor-pointer border transition-colors ${selectedScheme?.name === s.name ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm' : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                    >
                      <div className="font-semibold text-sm">{s.name}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm p-2 text-slate-500 text-center italic">{t('noRecordsResolved')}</div>
                )}
              </div>
            </div>
            <Input
              label={t('message')}
              placeholder={t('enterNotification')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
                onClick={handleTelegram}
                disabled={loading || !message.trim()}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
                Telegram Bot
              </Button>
              <Button
                variant="secondary"
                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white"
                onClick={handleTelegramUpdates}
                disabled={loading || !message.trim()}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Telegram Updates
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-500/50 dark:hover:bg-emerald-900/20"
                onClick={handleSendEmail}
                disabled={loading || !message.trim()}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Email
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title={t('personalizedPreview')} subtitle={t('personalizedPreviewSub')} />
          <CardContent>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 h-full">
              <p className="text-sm text-slate-500 mb-4 border-b border-slate-200 dark:border-slate-600 pb-2">{t('sampleRecipient')} ({segment || t('general')})</p>
              <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                {message ? (
                  <span className="whitespace-pre-wrap">{message}</span>
                ) : selectedScheme ? (
                  <span className="whitespace-pre-wrap">
                    {t('dearCitizen')} <strong>{selectedScheme.name}</strong>.<br /><br />
                    <span className="text-slate-600 dark:text-slate-400">{selectedScheme.description}</span><br /><br />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium whitespace-pre-line">{t('benefits')}: {selectedScheme.benefits || 'Check official guidelines'}</span><br /><br />
                    {t('registerNow')}
                  </span>
                ) : (
                  <span className="text-slate-400 italic">{t('previewPlaceholder')}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
