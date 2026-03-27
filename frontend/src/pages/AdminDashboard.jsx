import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadCSV, loadSampleData, downloadSampleCsv } from '../api'
import { useTranslation } from 'react-i18next'

export default function AdminDashboard() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [downloadLoading, setDownloadLoading] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleLoadSample = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      const result = await loadSampleData()
      setMessage({ type: 'success', text: `Loaded ${result.count} sample voters!` })
      navigate('/analytics')
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || err.message || 'Failed to load sample',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a CSV file' })
      return
    }
    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      const result = await uploadCSV(file)
      setMessage({ type: 'success', text: `Uploaded ${result.count} voters successfully!` })
      setFile(null)
      navigate('/analytics')
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || err.message || 'Upload failed',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t('adminDashTitle')}</h1>
      <p className="text-slate-600 dark:text-slate-300 mb-8">{t('adminDashSubtitle')}</p>

      <div className="max-w-xl">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">{t('uploadCsv')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {t('requiredColumns')}
          </p>
          <form onSubmit={handleUpload}>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-slate-600 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 dark:bg-primary-900/30 file:text-primary-700 dark:text-primary-300 hover:file:bg-primary-100 mb-6"
            />
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? t('processing') : t('uploadAndProcess')}
              </button>
              <button
                type="button"
                onClick={handleLoadSample}
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-300 disabled:opacity-50 transition"
              >
                {t('loadSampleData')}
              </button>
            </div>
          </form>
          {message.text && (
            <p
              className={`mt-4 text-sm ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message.text}
            </p>
          )}
        </div>

        <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-amber-800 dark:text-amber-400">
            <strong>{t('tip')}:</strong> {t('tipDownload')}
          </p>
          <button
            type="button"
            onClick={async () => {
              setDownloadLoading(true)
              try {
                await downloadSampleCsv()
              } catch (err) {
                setMessage({
                  type: 'error',
                  text: err.response?.data?.error || 'Download failed. Is the backend running?',
                })
              } finally {
                setDownloadLoading(false)
              }
            }}
            disabled={downloadLoading}
            className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50 transition"
          >
            {downloadLoading ? t('downloading') : t('downloadSampleCsv')}
          </button>
        </div>
      </div>
    </div>
  )
}
