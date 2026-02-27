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
    const { profile, setHasActivePlan } = useAuth()
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
                    const { data: { session } } = await supabase.auth.getSession()
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

                    if (data?.is_phase_1) {
                        console.log("Plan generated in Phase 1 mode");
                    }

                    setHasActivePlan(true)
                    setProgress(100)
                    setTimeout(() => navigate('/dashboard' + (data?.is_phase_1 ? '?phase1=true' : '')), 500)
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
            <div className="min-h-screen bg-dunr-black flex items-center justify-center px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-titan-danger/5 rounded-full blur-3xl" />
                <div className="glass-card p-8 max-w-sm w-full text-center relative z-10 border-titan-danger/10">
                    <div className="w-16 h-16 bg-titan-danger/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Error de generación</h2>
                    <p className="text-sm text-white/40 mb-8 leading-relaxed font-medium">{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-primary w-full !py-4 !text-xs !font-black !uppercase !tracking-widest">
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-dunr-black flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-dunr-blue/5 rounded-full blur-3xl -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-dunr-orange/5 rounded-full blur-3xl -ml-48 -mb-48" />

            <div className="max-w-sm w-full text-center relative z-10">
                {/* Animated icon */}
                <div className="relative mb-12">
                    <div className="w-28 h-28 mx-auto rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center animate-pulse-glow shadow-2xl shadow-dunr-blue/10">
                        <Icon size={44} className="text-dunr-blue" />
                    </div>
                    {/* Rotating ring */}
                    <div className="absolute -inset-4 mx-auto w-36 h-36">
                        <svg className="animate-spin-slow" viewBox="0 0 128 128">
                            <circle
                                cx="64" cy="64" r="62"
                                fill="none"
                                stroke="url(#gradient-ring)"
                                strokeWidth="2"
                                strokeDasharray="10 15"
                            />
                            <defs>
                                <linearGradient id="gradient-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="var(--color-dunr-blue)" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="var(--color-dunr-orange)" stopOpacity="0.4" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight animate-fade-in" key={messageIndex}>
                    {currentMessage.text}
                </h2>
                <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest mb-10">
                    INTELIGENCIA ARTIFICIAL DUNR
                </p>

                {/* Progress bar */}
                <div className="px-8">
                    <div className="w-full bg-white/5 border border-white/5 rounded-full h-1.5 overflow-hidden mb-3">
                        <div
                            className="h-full bg-gradient-to-r from-dunr-blue to-dunr-orange rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-white/80 uppercase">
                        <span>Estado</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
