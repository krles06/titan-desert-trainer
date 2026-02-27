import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, hasProfile, hasActivePlan, loading } = useAuth()
    const path = window.location.pathname

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-dunr-black">
                <div className="w-10 h-10 border-4 border-dunr-blue border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,163,255,0.3)]" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    // Redirection Logic:
    // 1. If no profile -> always onboarding
    if (!hasProfile && path !== '/onboarding') {
        return <Navigate to="/onboarding" replace />
    }

    // 2. If has profile but no plan -> force generation (either via onboarding or generate-plan)
    const allowedPathWithoutPlan = ['/onboarding', '/generate-plan']
    if (hasProfile && !hasActivePlan && !allowedPathWithoutPlan.includes(path)) {
        return <Navigate to="/onboarding" replace />
    }

    return children
}
