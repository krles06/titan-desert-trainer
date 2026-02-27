import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DEMO_MODE, DEMO_SESSIONS } from '../lib/mockData'
import { supabase } from '../lib/supabase'
import CountdownTimer from '../components/CountdownTimer'
import {
    TrendingUp, Clock, Calendar, Flame, ChevronRight,
    CheckCircle, Zap, Target, RefreshCw
} from 'lucide-react'
import { getRaceById } from '../lib/races'

export default function Dashboard() {
    const { profile, user } = useAuth()
    const [sessions, setSessions] = useState([])
    const [plan, setPlan] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadDashboardData() {
            if (DEMO_MODE) {
                const saved = localStorage.getItem('demo_sessions')
                setSessions(saved ? JSON.parse(saved) : DEMO_SESSIONS)
                setPlan({
                    plan_json: {
                        advertencias: [
                            { semana: 1, tipo: 'alerta_critica', mensaje: 'Trabajo hecho. Descansa y confía en el entrenamiento.' },
                            { semana: 8, tipo: 'alerta_importante', mensaje: 'Momento del entrenamiento largo más exigente del plan.' }
                        ]
                    }
                })
            } else {
                // Fetch sessions
                const { data: sessionData } = await supabase
                    .from('sessions')
                    .select('*')
                    .order('fecha', { ascending: true })
                setSessions(sessionData || [])

                // Fetch active plan to get advertencias
                const { data: planData } = await supabase
                    .from('training_plans')
                    .select('*')
                    .eq('activo', true)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single()

                if (planData) setPlan(planData)
            }
            setLoading(false)
        }
        loadDashboardData()
    }, [user])

    const stats = useMemo(() => {
        if (!sessions.length) return null

        const total = sessions.length
        const completed = sessions.filter((s) => s.completada).length
        const percentComplete = Math.round((completed / total) * 100)

        const weeks = new Set(sessions.map((s) => s.semana)).size
        const weeksCompleted = new Set(
            sessions.filter((s) => s.completada).map((s) => s.semana)
        ).size

        const hoursTotal = sessions
            .filter((s) => s.completada)
            .reduce((sum, s) => sum + (s.duracion_real || s.duracion_min || 0), 0) / 60

        // Calculate streak
        const today = new Date().toISOString().split('T')[0]
        const completedDates = sessions
            .filter((s) => s.completada)
            .map((s) => s.fecha)
            .sort()
            .reverse()

        let streak = 0
        const checkDate = new Date()
        for (let i = 0; i < 60; i++) {
            const dateStr = checkDate.toISOString().split('T')[0]
            const hasSession = sessions.some((s) => s.fecha === dateStr)
            const wasCompleted = completedDates.includes(dateStr)

            if (hasSession && wasCompleted) {
                streak++
            } else if (hasSession && !wasCompleted && dateStr < today) {
                break
            }
            checkDate.setDate(checkDate.getDate() - 1)
        }

        // Next session
        const nextSession = sessions.find(
            (s) => !s.completada && s.fecha >= today
        )

        // Plan readjustment logic (based on new 1-10 RPE scale)
        let needsReadjustment = null
        const recentSessions = sessions
            .filter((s) => s.completada && s.percepcion_esfuerzo)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 3)

        if (recentSessions.length >= 3) {
            const highEffortCount = recentSessions.filter(s => s.percepcion_esfuerzo >= 8).length
            const lowEffortCount = recentSessions.filter(s => s.percepcion_esfuerzo <= 3).length

            if (highEffortCount >= 3) needsReadjustment = 'hard'
            else if (lowEffortCount >= 3) needsReadjustment = 'easy'
        }

        // Active coaching warnings logic
        const race = getRaceById(profile?.carrera_id)
        let activeWarnings = []
        if (plan?.plan_json?.advertencias && race) {
            const raceDate = new Date(race.date + 'T00:00:00')
            const now = new Date()
            const diffTime = raceDate - now
            const weeksRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)))

            activeWarnings = plan.plan_json.advertencias.filter(a => a.semana === weeksRemaining)
        }

        return { total, completed, percentComplete, weeks, weeksCompleted, hoursTotal, streak, nextSession, needsReadjustment, activeWarnings }
    }, [sessions, plan, profile])

    if (loading) {
        return (
            <div className="min-h-screen bg-dunr-black pb-24 px-4 pt-6">
                <div className="max-w-lg mx-auto space-y-4">
                    <div className="skeleton h-20 w-full" />
                    <div className="grid grid-cols-2 gap-3">
                        <div className="skeleton h-28" />
                        <div className="skeleton h-28" />
                        <div className="skeleton h-28" />
                        <div className="skeleton h-28" />
                    </div>
                    <div className="skeleton h-32 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-dunr-black pb-24">
            {/* Header */}
            <div className="gradient-desert px-4 pt-6 pb-10">
                <div className="max-w-lg mx-auto">
                    <p className="text-white/60 text-sm mb-1">¡Hola, {profile?.nombre?.split(' ')[0] || 'ciclista'}!</p>
                    <h1 className="text-2xl font-bold text-white mb-4">Tu preparación</h1>
                    <CountdownTimer
                        mini
                        targetDate={getRaceById(profile?.carrera_id).date}
                        raceName={getRaceById(profile?.carrera_id).name}
                    />
                </div>
            </div>

            {/* Phase 1 Warning */}
            {new URLSearchParams(window.location.search).get('phase1') === 'true' && (
                <div className="px-4 mt-4 animate-fade-in">
                    <div className="glass-card border-dunr-blue/30 bg-dunr-blue/5 p-4 flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-xl bg-dunr-blue/20 flex items-center justify-center text-dunr-blue shrink-0">
                            <Zap size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-white uppercase tracking-wider mb-0.5">Plan de Fase 1 Generado</p>
                            <p className="text-[10px] text-white/60 leading-tight">Tu carrera aún está lejos. Hemos creado las primeras 12 semanas para máxima precisión.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="px-4 -mt-4 max-w-lg mx-auto">
                {stats && (
                    <>
                        {/* Coaching Warnings */}
                        {stats.activeWarnings?.map((warning, idx) => (
                            <div
                                key={idx}
                                className={`glass-card p-4 mb-4 animate-fade-in flex gap-4 items-start border-l-4 ${warning.tipo === 'alerta_critica'
                                    ? 'border-titan-danger bg-titan-danger/5'
                                    : warning.tipo === 'alerta_importante'
                                        ? 'border-dunr-orange bg-dunr-orange/5'
                                        : 'border-dunr-blue bg-dunr-blue/5'
                                    }`}
                            >
                                <div className={`p-2 rounded-xl h-fit ${warning.tipo === 'alerta_critica'
                                    ? 'bg-titan-danger/20 text-titan-danger'
                                    : warning.tipo === 'alerta_importante'
                                        ? 'bg-dunr-orange/20 text-dunr-orange'
                                        : 'bg-dunr-blue/20 text-dunr-blue'
                                    }`}>
                                    <TrendingUp size={20} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Notificación DUNR</h3>
                                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${warning.tipo === 'alerta_critica' ? 'bg-titan-danger' : warning.tipo === 'alerta_importante' ? 'bg-dunr-orange' : 'bg-dunr-blue'}`} />
                                    </div>
                                    <p className="text-sm font-bold text-white leading-tight">{warning.mensaje}</p>
                                </div>
                            </div>
                        ))}

                        {/* Readjustment Alert */}
                        {stats.needsReadjustment && (
                            <div className="glass-card border-dunr-orange bg-dunr-orange/5 p-4 mb-4 animate-fade-in flex flex-col gap-3">
                                <div className="flex gap-3">
                                    <div className="bg-dunr-orange/20 p-2 rounded-full h-fit">
                                        <TrendingUp size={20} className="text-dunr-orange" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm">
                                            Tu rendimiento sugiere ajustes
                                        </h3>
                                        <p className="text-white/60 text-xs">
                                            Hemos detectado inconsistencias en tus últimos entrenos.
                                        </p>
                                    </div>
                                </div>
                                <Link to={`/generate-plan?reason=${stats.needsReadjustment}`} className="btn-primary w-full py-2.5 text-xs shadow-none">
                                    Recalcular macrociclo con DUNR
                                </Link>
                            </div>
                        )}

                        {/* Next session - HIGHER PROMINENCE */}
                        {stats.nextSession ? (
                            <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <Zap size={16} className="text-dunr-blue" />
                                    <span className="text-xs font-bold text-white/90 uppercase tracking-wider">Próxima sesión</span>
                                </div>
                                <Link
                                    to={`/session/${stats.nextSession.id}`}
                                    className="block glass-card p-6 hover:scale-[1.01] transition-transform shadow-xl shadow-dunr-blue/5 border-l-4 border-l-dunr-blue"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-black text-white capitalize mb-1">
                                                {stats.nextSession.tipo}
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] bg-dunr-blue text-white px-2 py-0.5 rounded-full font-bold uppercase">
                                                    Semana {stats.nextSession.semana}
                                                </span>
                                                <span className="text-xs text-white/40">{stats.nextSession.dia_semana}</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/10 p-2 rounded-xl">
                                            <ChevronRight size={20} className="text-white" />
                                        </div>
                                    </div>

                                    <p className="text-sm text-white/60 mb-5 leading-relaxed">
                                        {stats.nextSession.descripcion}
                                    </p>

                                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-white/10">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-white/30 uppercase font-bold">Tiempo</span>
                                            <span className="text-sm text-white font-medium">{stats.nextSession.duracion_min} min</span>
                                        </div>
                                        <div className="flex flex-col border-l border-white/10 pl-3">
                                            <span className="text-[10px] text-white/30 uppercase font-bold">Distancia</span>
                                            <span className="text-sm text-white font-medium">{stats.nextSession.distancia_km} km</span>
                                        </div>
                                        <div className="flex flex-col border-l border-white/10 pl-3">
                                            <span className="text-[10px] text-white/30 uppercase font-bold">Zona</span>
                                            <span className="text-sm text-white font-medium">Z{stats.nextSession.intensidad_zona}</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ) : (
                            <div className="glass-card p-8 mb-6 text-center animate-fade-in border-dashed">
                                <Target size={40} className="mx-auto text-white/10 mb-4" />
                                <h3 className="text-lg font-bold text-white mb-2">¿Aún no tienes plan?</h3>
                                <p className="text-sm text-white/50 mb-6 max-w-[200px] mx-auto">
                                    Genera tu entrenamiento para empezar la aventura con DUNR.
                                </p>
                                <Link to="/onboarding" className="btn-primary w-full block">
                                    Crear mi plan con IA
                                </Link>
                            </div>
                        )}

                        {/* Progress bar */}
                        <div className="glass-card p-5 mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-white/60">Progreso total</span>
                                <span className="text-2xl font-black text-dunr-orange">{stats.percentComplete}%</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-dunr-blue to-dunr-orange rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${stats.percentComplete}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-white/40 mt-2 font-bold uppercase tracking-wider">
                                {stats.completed} de {stats.total} SESIONES COMPLETADAS
                            </p>
                        </div>

                        {/* Stat cards */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                                <Calendar size={18} className="text-dunr-blue mb-2" />
                                <p className="text-2xl font-black text-white">{stats.weeksCompleted}<span className="text-xs font-normal text-white/30 ml-1">/{stats.weeks}</span></p>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Semanas</p>
                            </div>
                            <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '0.35s' }}>
                                <Flame size={18} className="text-dunr-orange mb-2" />
                                <p className="text-2xl font-black text-white">{stats.streak}</p>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Días racha</p>
                            </div>
                            <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                                <Clock size={12} className="text-dunr-blue mb-2" />
                                <p className="text-xl font-black text-white">{Math.round(stats.hoursTotal)}<span className="text-xs font-normal text-white/30 ml-1">h</span></p>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Entrenado</p>
                            </div>
                            <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '0.45s' }}>
                                <CheckCircle size={18} className="text-titan-success mb-2" />
                                <p className="text-xl font-black text-white">{stats.completed}</p>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Hechas</p>
                            </div>
                        </div>

                        <div className="mt-8 mb-4 border-t border-white/5 opacity-50" />
                    </>
                )}
            </div>
        </div >
    )
}
