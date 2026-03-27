import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import MainLayout from './components/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import BoothIntelligencePage from './pages/BoothIntelligencePage'
import KnowledgeGraphPage from './pages/KnowledgeGraphPage'
import VoterSegmentationPage from './pages/VoterSegmentationPage'
import GovernanceUpdatePage from './pages/GovernanceUpdatePage'
import CitizenEngagementPage from './pages/CitizenEngagementPage'
import CitizenMobilePage from './pages/CitizenMobilePage'
import AdminDashboard from './pages/AdminDashboard'
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import LandingPage from './pages/LandingPage'
import BoothAuthPage from './pages/BoothAuthPage'
import VoterAuthPage from './pages/VoterAuthPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/booth-login" element={<BoothAuthPage />} />
          <Route path="/voter-login" element={<VoterAuthPage />} />
          <Route path="/reset-password/:role/:token" element={<ResetPasswordPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/citizen" element={<CitizenMobilePage />} />
            <Route path="/" element={<MainLayout />}>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="booth-intelligence" element={<BoothIntelligencePage />} />
              <Route path="knowledge-graph" element={<KnowledgeGraphPage />} />
              <Route path="voter-segmentation" element={<VoterSegmentationPage />} />
              <Route path="governance-updates" element={<GovernanceUpdatePage />} />
              <Route path="citizen-engagement" element={<CitizenEngagementPage />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="data-analytics" element={<AnalyticsDashboard />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
