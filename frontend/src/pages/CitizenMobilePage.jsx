import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { FileText, Send, CheckCircle2 } from 'lucide-react'
import { getAnalytics, submitFeedback } from '../api'

export default function CitizenMobilePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [feedback, setFeedback] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  const [voterData, setVoterData] = useState(location.state?.voterData || null)
  const phone = location.state?.phone || '9999999999'

  useEffect(() => {
    if (voterData) return; // If voterData is already passed from login, don't fetch fallback
    
    getAnalytics().then(data => {
      const groups = data.voter_groups || []
      if (groups.length > 0) {
        let num = parseInt(phone.slice(-4)) || 1
        setVoterData(groups[num % groups.length])
      }
    }).catch(err => console.error('Failed to load user eligibility:', err))
  }, [phone, voterData])

  const dynamicAlerts = voterData?.eligible_schemes?.map(s => ({
    text: `Based on your profile, you are eligible for ${s}.`,
    scheme: s
  })) || []
  
  const dynamicUpdates = (voterData?.eligible_schemes || []).map((s, i) => ({
    title: `${s} Update`,
    body: `New guidelines and applications are open for ${s}. Check your portal instructions!`,
    time: i === 0 ? '2 hrs ago' : '1 day ago'
  }))
  if (dynamicUpdates.length === 0) {
    dynamicUpdates.push({ title: 'System Notice', body: 'Governance updates tracking active. Please verify your KYC.', time: 'Just now' })
  }

  const scrollToId = (id) => {
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) return
    try {
      await submitFeedback({
        msg: feedback,
        rating: 5,
        booth: voterData?.BoothID || 'Unknown'
      })
      setFeedback('')
      setFeedbackSent(true)
      setTimeout(() => setFeedbackSent(false), 2500)
    } catch (err) {
      console.error('Failed to submit feedback:', err)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Citizen Dashboard</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Overview of your booth, eligible schemes, and latest governance updates.
            </p>
          </div>
          <div className="shrink-0">
            <Button
              variant="outline"
              onClick={() => navigate('/login', { replace: true })}
              className="whitespace-nowrap"
            >
              Logout
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.18em]">Your Booth</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                        {voterData ? `Booth ${voterData.BoothID || 'Unknown'} • ${voterData.Name}` : 'Booth B001 • Ward 12'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Local officer: Ananya Singh</p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>Turnout status</p>
                      <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[11px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Live
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-[0.18em] mb-3">Quick actions</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => scrollToId('governance-updates')}
                      className="px-3 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition"
                    >
                      View updates
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowFeedback(true)
                        setTimeout(() => scrollToId('feedback'), 100)
                      }}
                      className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    >
                      Feedback
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 md:grid-cols-1">
            <div className="rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 px-3 py-2 text-center">
              <p className="text-[11px] text-slate-500">Eligible schemes</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{voterData?.eligible_schemes?.length || dynamicAlerts.length}</p>
            </div>
            <div className="rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 px-3 py-2 text-center">
              <p className="text-[11px] text-slate-500">New updates</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{dynamicUpdates.length}</p>
            </div>
            <div className="rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 px-3 py-2 text-center">
              <p className="text-[11px] text-slate-500">Feedback sent</p>
              <p className="mt-1 text-sm font-semibold text-emerald-600">{feedbackSent ? 'Yes' : '—'}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {dynamicAlerts.length > 0 && (
              <Card className="border-accent-200 bg-accent-50 dark:bg-accent-900/20">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-accent-800 dark:text-accent-200">Personalized Scheme Eligibility</p>
                  {dynamicAlerts.map((a, i) => (
                    <p key={i} className="text-slate-700 dark:text-slate-300 mt-1">
                      {a.text}
                    </p>
                  ))}
                </CardContent>
              </Card>
            )}

            <div id="governance-updates">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-2">Governance Updates</h2>
              <div className="space-y-3">
                {dynamicUpdates.map((u, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <FileText className="w-8 h-8 text-primary-600 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{u.title}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{u.body}</p>
                          <p className="text-xs text-slate-500 mt-2">{u.time}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {showFeedback && (
              <Card id="feedback">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Feedback</h3>
                  <textarea
                    placeholder="Share your feedback..."
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-3 text-sm min-h-[80px]"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                  <Button className="mt-3 w-full" onClick={handleFeedbackSubmit} disabled={!feedback.trim()}>
                    {feedbackSent ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Sent
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit
                      </>
                    )}
                  </Button>
                  {feedbackSent && (
                    <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Thank you. Your feedback has been recorded.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-slate-500 uppercase tracking-[0.18em] mb-2">Local Announcements</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Booth B001: Voter list verification on <span className="font-semibold">Mar 15</span>. Carry valid ID
                  and booth slip.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
