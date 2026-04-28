import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNav from './components/BottomNav'
import InstallBanner from './components/InstallBanner'

const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const GeneratePlan = lazy(() => import('./pages/GeneratePlan'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const CalendarPage = lazy(() => import('./pages/Calendar'))
const SessionDetail = lazy(() => import('./pages/SessionDetail'))
const Profile = lazy(() => import('./pages/Profile'))
const Subscription = lazy(() => import('./pages/Subscription'))
const Legal = lazy(() => import('./pages/Legal'))
const CoachChat = lazy(() => import('./pages/CoachChat'))
const AdjustPlan = lazy(() => import('./pages/AdjustPlan'))

function RouteLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-dunr-black">
      <div className="w-10 h-10 border-4 border-dunr-orange border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(255,138,0,0.3)]" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="relative min-h-screen">
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/legal" element={<Legal />} />

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
              <Route path="/coach" element={
                <ProtectedRoute><CoachChat /></ProtectedRoute>
              } />
              <Route path="/adjust-plan" element={
                <ProtectedRoute><AdjustPlan /></ProtectedRoute>
              } />
            </Routes>
          </Suspense>
          <BottomNav />
          <InstallBanner />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
