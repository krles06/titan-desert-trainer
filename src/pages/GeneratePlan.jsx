import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { DEMO_MODE, DEMO_SESSIONS, DEMO_PLAN } from '../lib/mockData'
import { Bike, Mountain, Wind, ChevronRight, Calendar, Clock, Zap, CheckCircle } from 'lucide-react'

const loadingMessages = [
    { icon: Mountain, text: 'Analizando tu perfil de ciclista...' },
    { icon: Bike, text: 'Diseñando sesiones personalizadas...' },
    { icon: Wind, text: 'Calculando progresión óptima...' },
    { icon: Mountain, text: 'Preparando tu ruta hacia la Titan Desert...' },
]

const TYPE_META = {
    rodaje:            { label: 'Rodaje',    color: '#FACC15' },
    intervalos:        { label: 'Intervalos', color: '#EF4444' },
    fuerza:            { label: 'Fuerza',    color: '#F59E0B' },
    'descanso activo': { label: 'Descanso',  color: '#10B981' },
    largo:             { label: 'Largo',     color: '#ffffff' },
}

export default function GeneratePlan() {
    const { profile, setHasActivePlan } = useAuth()
    const navigate = useNavigate()
    const [messageIndex, setMessageIndex] = useState(0)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState(null)
    const [summary, setSummary] = useState(null) // null = loading, object = ready

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const reason = params.get('reason')

        const msgInterval = setInterval(() => {
            setMessageIndex((i) => (i + 1) % loadingMessages.length)
        }, 2500)

        const progressInterval = setInterval(() => {
            setProgress((p) => Math.min(p + Math.random() * 8, 90))
        }, 500)

        const timeout = setTimeout(async () => {
            try {
                if (DEMO_MODE) {
                    localStorage.setItem('demo_sessions', JSON.stringify(DEMO_SESSIONS))
                    localStorage.setItem('demo_plan', JSON.stringify(DEMO_PLAN))
                    setProgress(100)
                    buildDemoSummary()
                } else {
                    const { data, error: functionError } = await supabase.functions.invoke('generate-plan', {
                        body: { profile, reason }
                    })

                    if (functionError) {
                        const errorBody = functionError.context ? await functionError.context.text() : null
                        throw new Error(errorBody || functionError.message || 'Error al conectar con la función')
                    }
                    if (data?.error) throw new Error(`Error de IA: ${data.error}`)

                    setHasActivePlan(true)
                    setProgress(100)

                    // Small delay to ensure DB commit is visible
                    await new Promise(r => setTimeout(r, 800))
                    await buildSummary(data.is_phase_1)
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

    async function buildSummary(isPhase1) {
        const today = new Date().toISOString().split('T')[0]

        const { data: sessions } = await supabase
            .from('sessions')
            .select('tipo, duracion_min, semana, fecha')
            .order('fecha', { ascending: true })

        if (!sessions?.length) { navigate('/dashboard'); return }

        const weeks = new Set(sessions.map(s => s.semana)).size
        const totalMin = sessions.reduce((sum, s) => sum + (s.duracion_min || 0), 0)

        // Type distribution
        const typeCount = {}
        sessions.forEach(s => { typeCount[s.tipo] = (typeCount[s.tipo] || 0) + 1 })
        const typeBreakdown = Object.entries(typeCount)
            .map(([tipo, count]) => ({ tipo, count, pct: Math.round((count / sessions.length) * 100) }))
            .sort((a, b) => b.count - a.count)

        // First upcoming session
        const nextSession = sessions.find(s => s.fecha >= today)

        setSummary({ weeks, total: sessions.length, totalMin, typeBreakdown, nextSession, isPhase1 })
    }

    function buildDemoSummary() {
        const today = new Date().toISOString().split('T')[0]
        const sessions = DEMO_SESSIONS
        const weeks = new Set(sessions.map(s => s.semana)).size
        const totalMin = sessions.reduce((sum, s) => sum + (s.duracion_min || 0), 0)
        const typeCount = {}
        sessions.forEach(s => { typeCount[s.tipo] = (typeCount[s.tipo] || 0) + 1 })
        const typeBreakdown = Object.entries(typeCount)
            .map(([tipo, count]) => ({ tipo, count, pct: Math.round((count / sessions.length) * 100) }))
            .sort((a, b) => b.count - a.count)
        const nextSession = sessions.find(s => s.fecha >= today)
        setSummary({ weeks, total: sessions.length, totalMin, typeBreakdown, nextSession, isPhase1: false })
    }

    const currentMessage = loadingMessages[messageIndex]
    const Icon = currentMessage.icon

    // ── Error ──
    if (error) {
        return (
            <div className="min-h-screen bg-dunr-black flex items-center justify-center px-4">
                <div className="glass-card p-8 max-w-sm w-full text-center border-titan-danger/10">
                    <div className="w-16 h-16 bg-titan-danger/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Error de generación</h2>
                    <p className="text-sm text-white/40 mb-8 leading-relaxed">{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-primary w-full !py-4 !text-xs !font-black !uppercase !tracking-widest">
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        )
    }

    // ── Summary reveal ──
    if (summary) {
        const hours = Math.round(summary.totalMin / 60)
        const dstUrl = '/dashboard' + (summary.isPhase1 ? '?phase1=true' : '')

        return (
            <div className="min-h-screen bg-dunr-black flex flex-col px-4 py-10 animate-fade-in">
                <div className="max-w-lg mx-auto w-full flex flex-col gap-5">

                    {/* Header */}
                    <div className="text-center pt-4 pb-2">
                        <div className="w-16 h-16 bg-dunr-orange rounded-3xl flex items-center justify-center mx-auto mb-5">
                            <CheckCircle size={30} className="text-black" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                            Tu plan está listo
                        </h1>
                        <p className="text-white/50 text-sm">
                            {summary.weeks} semanas · {summary.total} sesiones · {hours}h de entrenamiento
                        </p>
                        {summary.isPhase1 && (
                            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-dunr-orange/10 border border-dunr-orange/20">
                                <Zap size={11} className="text-dunr-orange" />
                                <span className="text-[10px] text-dunr-orange font-black uppercase tracking-wider">Fase 1 de 2 — Primeras 12 semanas</span>
                            </div>
                        )}
                    </div>

                    {/* Big stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: Calendar, label: 'Semanas', value: summary.weeks },
                            { icon: Zap, label: 'Sesiones', value: summary.total },
                            { icon: Clock, label: 'Horas', value: `${hours}h` },
                        ].map(({ icon: Ic, label, value }) => (
                            <div key={label} className="glass-card p-4 text-center">
                                <Ic size={16} className="text-dunr-orange mx-auto mb-2" />
                                <p className="text-2xl font-black text-white leading-none">{value}</p>
                                <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider mt-1">{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Type breakdown */}
                    <div className="glass-card p-5">
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">
                            Distribución de sesiones
                        </h3>
                        <div className="space-y-3">
                            {summary.typeBreakdown.map(({ tipo, count, pct }) => {
                                const meta = TYPE_META[tipo] || { label: tipo, color: '#888' }
                                return (
                                    <div key={tipo}>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                                                <span className="text-xs font-bold text-white/80">{meta.label}</span>
                                            </div>
                                            <span className="text-[11px] text-white/30 font-bold">{count} ses. · {pct}%</span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-1.5">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{ width: `${pct}%`, background: meta.color, opacity: 0.85 }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Next session preview */}
                    {summary.nextSession && (
                        <div className="glass-card p-5 border-l-4 border-l-dunr-orange">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap size={13} className="text-dunr-orange" />
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Primera sesión</span>
                            </div>
                            <p className="text-base font-black text-white capitalize">{summary.nextSession.tipo}</p>
                            <p className="text-xs text-white/40 mt-1">
                                {summary.nextSession.fecha} · Semana {summary.nextSession.semana} · {summary.nextSession.duracion_min} min
                            </p>
                        </div>
                    )}

                    {/* CTA */}
                    <Link to={dstUrl} className="btn-primary w-full text-center !py-4 !text-sm !font-black !uppercase !tracking-widest mt-2">
                        Empezar a entrenar <ChevronRight size={18} />
                    </Link>
                </div>
            </div>
        )
    }

    // ── Loading ──
    return (
        <div className="min-h-screen bg-dunr-black flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-dunr-orange/5 rounded-full blur-3xl -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-dunr-orange/5 rounded-full blur-3xl -ml-48 -mb-48" />

            <div className="max-w-sm w-full text-center relative z-10">
                <div className="relative mb-12">
                    <div className="w-28 h-28 mx-auto rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center animate-pulse-glow shadow-2xl shadow-dunr-orange/10">
                        <Icon size={44} className="text-dunr-orange" />
                    </div>
                    <div className="absolute -inset-4 mx-auto w-36 h-36">
                        <svg className="animate-spin-slow" viewBox="0 0 128 128">
                            <circle cx="64" cy="64" r="62" fill="none" stroke="url(#gradient-ring)" strokeWidth="2" strokeDasharray="10 15" />
                            <defs>
                                <linearGradient id="gradient-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="var(--color-dunr-orange)" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="var(--color-dunr-orange)" stopOpacity="0.4" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight animate-fade-in" key={messageIndex}>
                    {currentMessage.text}
                </h2>
                <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest mb-10">
                    INTELIGENCIA ARTIFICIAL DUNR
                </p>

                <div className="px-8">
                    <div className="w-full bg-white/5 border border-white/5 rounded-full h-1.5 overflow-hidden mb-3">
                        <div
                            className="h-full bg-dunr-orange rounded-full transition-all duration-700 ease-out"
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
