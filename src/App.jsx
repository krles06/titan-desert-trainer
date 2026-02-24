import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNav from './components/BottomNav'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Onboarding from './pages/Onboarding'
import GeneratePlan from './pages/GeneratePlan'
import Dashboard from './pages/Dashboard'
import CalendarPage from './pages/Calendar'
import SessionDetail from './pages/SessionDetail'
import Profile from './pages/Profile'
import Subscription from './pages/Subscription'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="relative min-h-screen">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected routes */}
            <Route path="/onboarding" element={
              <ProtectedRoute><Onboarding /></ProtectedRoute>
            } />
            <Route path="/generate-plan" element={
              <ProtectedRoute><GeneratePlan /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute><CalendarPage /></ProtectedRoute>
            } />
            <Route path="/session/:id" element={
              <ProtectedRoute><SessionDetail /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
            <Route path="/subscription" element={
              <ProtectedRoute><Subscription /></ProtectedRoute>
            } />
          </Routes>
          <BottomNav />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
