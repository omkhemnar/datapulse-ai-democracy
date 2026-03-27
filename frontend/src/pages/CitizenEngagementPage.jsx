import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { MessageSquare, ThumbsUp } from 'lucide-react'
import { getFeedbackList } from '../api'
import { useTranslation } from 'react-i18next'

export default function CitizenEngagementPage() {
  const [feedback, setFeedback] = useState([])
  const { t } = useTranslation()

  useEffect(() => {
    getFeedbackList().then(setFeedback).catch(console.error)
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('citizenEngTitle')}</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        {t('citizenEngSubtitle')}
      </p>

      <div className="mb-6">
        <Card className="p-5 flex items-center justify-between border-l-4 border-l-secondary-500">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-secondary-50 dark:bg-secondary-900/20">
               <ThumbsUp className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('totalAuthFeedback')}</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{feedback.length}</p>
            </div>
          </div>
          <MessageSquare className="w-16 h-16 text-slate-100 dark:text-slate-800/50 hidden sm:block" />
        </Card>
      </div>

      <Card className="mb-6 shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader title={t('verifiedFeedbackStream')} subtitle={t('verifiedFeedbackSub')} />
        <CardContent>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {feedback.length === 0 && <p className="text-slate-400 dark:text-slate-500 text-sm">{t('noFeedbackYet')}</p>}
            <div className="grid md:grid-cols-2 gap-4">
              {feedback.map((f, i) => (
                <div key={i} className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition duration-300">
                  <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">"{f.msg}"</p>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                    <span className="text-xs text-secondary-600 dark:text-secondary-400 uppercase tracking-widest font-bold">{t('booth')}: {f.booth}</span>
                    <span className="text-xs text-slate-400 font-medium bg-white dark:bg-slate-900 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-800">{f.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
