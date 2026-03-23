import axios from 'axios'

const API_BASE = import.meta.env.DEV ? '' : 'http://localhost:5001'

export const uploadCSV = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await axios.post(`${API_BASE}/api/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export const getAnalytics = async () => {
  const res = await axios.get(`${API_BASE}/api/analytics`)
  return res.data
}

export const getVoters = async () => {
  const res = await axios.get(`${API_BASE}/api/voters`)
  return res.data
}

export const submitFeedback = async (data) => {
  const res = await axios.post(`${API_BASE}/api/feedback`, data)
  return res.data
}

export const getFeedbackList = async () => {
  const res = await axios.get(`${API_BASE}/api/feedback`)
  return res.data
}

export const getCampaigns = async () => {
  const res = await axios.get(`${API_BASE}/api/campaigns`)
  return res.data
}

export const sendCampaign = async (data) => {
  const res = await axios.post(`${API_BASE}/api/campaigns`, data)
  return res.data
}

export const loadSampleData = async () => {
  const res = await axios.get(`${API_BASE}/api/load-sample`)
  return res.data
}

export const downloadSampleCsv = async () => {
  const res = await axios.get(`${API_BASE}/api/download-sample`, {
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'sample_voters.csv')
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
