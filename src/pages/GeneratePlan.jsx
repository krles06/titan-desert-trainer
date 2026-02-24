import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { DEMO_MODE, DEMO_SESSIONS, DEMO_PLAN } from '../lib/mockData'
import { Bike, Mountain, Wind } from 'lucide-react'

const loadingMessages = [
    { icon: Mountain, text: 'Analizando tu perfil de ciclista...' },
    { icon: Bike, text: 'Diseñando sesiones personalizadas...' },
    { icon: Wind, text: 'Calculando progresión óptima...' },
    { icon: Mountain, text: 'Preparando tu ruta hacia la Titan Desert...' },
]

export default function GeneratePlan() {
    const { profile } = useAuth()
    const navigate = useNavigate()
    const [messageIndex, setMessageIndex] = useState(0)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Get readjustment reason from URL if any
        const params = new URLSearchParams(window.location.search)
        const reason = params.get('reason')

        // Rotate loading messages
        const msgInterval = setInterval(() => {
            setMessageIndex((i) => (i + 1) % loadingMessages.length)
        }, 2500)

        // Animate progress bar
        const progressInterval = setInterval(() => {
            setProgress((p) => Math.min(p + Math.random() * 8, 90))
        }, 500)

        // Simulate plan generation
        const timeout = setTimeout(async () => {
            try {
                if (DEMO_MODE) {
                    // In demo mode, save sessions to localStorage
                    localStorage.setItem('demo_sessions', JSON.stringify(DEMO_SESSIONS))
                    localStorage.setItem('demo_plan', JSON.stringify(DEMO_PLAN))
                    setProgress(100)
                    setTimeout(() => navigate('/dashboard'), 500)
                } else {
                    // Call Supabase Edge Function with current user session
                    const { data, error: functionError } = await supabase.functions.invoke('generate-plan', {
                        body: { profile, reason }
                    })

                    console.log("Edge function response:", { data, functionError })

                    if (functionError) {
                        if (functionError.context) {
                            const errorBody = await functionError.context.text()
                            throw new Error(`Error en el servidor: ${errorBody}`)
                        }
                        throw new Error(functionError.message || 'Error al conectar con la función')
                    }
                    if (data?.error) {
                        throw new Error(`Error de IA: ${data.error}`)
                    }

                    setProgress(100)
                    setTimeout(() => navigate('/dashboard'), 500)
                }
            } catch (err) {
                setError(err.message || 'Error al generar el plan')
            }
        }, 4000)

        return () => {
            clearInterval(msgInterval)
            clearInterval(progressInterval)
            clearTimeout(timeout)
        }
    }, [navigate, profile])

    const currentMessage = loadingMessages[messageIndex]
    const Icon = currentMessage.icon

    if (error) {
        return (
            <div className="min-h-screen gradient-desert flex items-center justify-center px-4">
                <div className="glass-card p-8 max-w-sm w-full text-center">
                    <div className="w-16 h-16 bg-titan-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-bold text-titan-blue mb-2">Error al generar el plan</h2>
                    <p className="text-sm text-titan-blue/60 mb-6">{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-primary w-full">
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen gradient-desert flex items-center justify-center px-4">
            <div className="max-w-sm w-full text-center">
                {/* Animated icon */}
                <div className="relative mb-8">
                    <div className="w-24 h-24 mx-auto rounded-full bg-titan-orange/20 backdrop-blur-sm flex items-center justify-center animate-pulse-glow">
                        <Icon size={40} className="text-titan-orange-light" />
                    </div>
                    {/* Rotating ring */}
                    <div className="absolute inset-0 mx-auto w-32 h-32 -top-4">
                        <svg className="animate-spin-slow" viewBox="0 0 128 128">
                            <circle
                                cx="64" cy="64" r="60"
                                fill="none"
                                stroke="rgba(224,92,0,0.2)"
                                strokeWidth="2"
                                strokeDasharray="8 12"
                            />
                        </svg>
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-xl font-bold text-white mb-2 animate-fade-in" key={messageIndex}>
                    {currentMessage.text}
                </h2>
                <p className="text-white/50 text-sm mb-8">
                    Esto puede tardar unos segundos...
                </p>

                {/* Progress bar */}
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-titan-orange to-titan-orange-light rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-white/40 text-xs mt-2">{Math.round(progress)}%</p>
            </div>
        </div>
    )
}
