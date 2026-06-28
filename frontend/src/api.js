import axios from 'axios'

// Use VITE_API_URL in production (set in Vercel), fallback to localhost in development
export const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:5001')

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

export const sendNotificationEmail = async (data) => {
  const res = await axios.post(`${API_BASE}/api/send-notifications`, data)
  return res.data
}

export const getAllSchemes = async () => {
  const res = await axios.get(`${API_BASE}/api/schemes`)
  return res.data
}

export const getSchemesByCluster = async (cluster) => {
  const res = await axios.get(`${API_BASE}/api/schemes/${encodeURIComponent(cluster)}`)
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

export const sendTelegramClusterNotification = async (data) => {
  const res = await axios.post(`${API_BASE}/api/telegram/cluster-notify`, data)
  return res.data
}

export const addFamilyMember = async (data) => {
  const res = await axios.post(`${API_BASE}/api/family-member`, data);
  return res.data;
};

export const getFamilyMembers = async (voterId) => {
  const res = await axios.get(`${API_BASE}/api/family-members/${voterId}`);
  return res.data;
};

export const updateFamilyMember = async (id, data) => {
  const res = await axios.put(`${API_BASE}/api/family-member/${id}`, data);
  return res.data;
};

export const deleteFamilyMember = async (id) => {
  const res = await axios.delete(`${API_BASE}/api/family-member/${id}`);
  return res.data;
};

export const getFamilyMemberSchemes = async (id) => {
  const res = await axios.get(`${API_BASE}/api/family-member/${id}/schemes`);
  return res.data;
};
