import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { MessageSquare, ThumbsUp, Tag } from 'lucide-react'
import { getFeedbackList } from '../api'

export default function CitizenEngagementPage() {
  const [feedback, setFeedback] = useState([])

  useEffect(() => {
    getFeedbackList().then(setFeedback).catch(console.error)
  }, [])

  const issues = Object.entries(feedback.reduce((acc, curr) => {
    acc[curr.booth] = (acc[curr.booth] || 0) + 1;
    return acc;
  }, {})).map(([booth, count]) => ({ tag: 'Voter Feedback', count, booth }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Citizen Engagement Panel</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        Real-time voter feedback monitoring and local issue tagging
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <ThumbsUp className="w-10 h-10 text-secondary-600" />
            <div>
              <p className="text-sm text-slate-500">Feedback Received</p>
              <p className="text-2xl font-bold">{feedback.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Tag className="w-10 h-10 text-accent-500" />
            <div>
              <p className="text-sm text-slate-500">Local Issues</p>
              <p className="text-2xl font-bold">{issues.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader title="Recent Feedback" subtitle="Latest citizen comments" />
        <CardContent>
          <div className="space-y-4">
            {feedback.length === 0 && <p className="text-slate-400 text-sm">No feedback received yet.</p>}
            <div className="grid md:grid-cols-2 gap-4">
              {feedback.slice(0, 10).map((f, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">"{f.msg}"</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Booth: {f.booth}</span>
                    <span className="text-xs text-slate-400">{f.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Local Issue Tags" subtitle="Citizen-reported issues by booth" />
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {issues.length === 0 && <p className="text-slate-400 text-sm">No issues reported.</p>}
            {issues.map((i, idx) => (
              <span
                key={idx}
                className="px-4 py-2 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-800 dark:text-accent-200 text-sm"
              >
                {i.tag} ({i.count}) — {i.booth}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
