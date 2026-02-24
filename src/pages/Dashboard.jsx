import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DEMO_MODE, DEMO_SESSIONS } from '../lib/mockData'
import { supabase } from '../lib/supabase'
import CountdownTimer from '../components/CountdownTimer'
import {
    TrendingUp, Clock, Calendar, Flame, ChevronRight,
    CheckCircle, Zap, Target
} from 'lucide-react'

export default function Dashboard() {
    const { profile, user } = useAuth()
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadSessions() {
            if (DEMO_MODE) {
                const saved = localStorage.getItem('demo_sessions')
                setSessions(saved ? JSON.parse(saved) : DEMO_SESSIONS)
            } else {
                const { data } = await supabase
                    .from('sessions')
                    .select('*')
                    .order('fecha', { ascending: true })
                setSessions(data || [])
            }
            setLoading(false)
        }
        loadSessions()
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
            .reduce((sum, s) => sum + (s.duracion_min || 0), 0) / 60

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

        // Plan readjustment logic
        let needsReadjustment = null
        const recentSessions = sessions
            .filter((s) => s.completada && s.dificultad_percibida)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 3)

        if (recentSessions.length >= 3) {
            const hardCount = recentSessions.filter(s => s.dificultad_percibida === 'muy_dificil').length
            const easyCount = recentSessions.filter(s => s.dificultad_percibida === 'muy_facil').length

            if (hardCount >= 2) needsReadjustment = 'hard'
            else if (easyCount >= 2) needsReadjustment = 'easy'
        }

        return { total, completed, percentComplete, weeks, weeksCompleted, hoursTotal, streak, nextSession, needsReadjustment }
    }, [sessions])

    if (loading) {
        return (
            <div className="min-h-screen bg-titan-sand-light pb-24 px-4 pt-6">
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
        <div className="min-h-screen bg-titan-sand-light pb-24">
            {/* Header */}
            <div className="gradient-desert px-4 pt-6 pb-10">
                <div className="max-w-lg mx-auto">
                    <p className="text-white/60 text-sm mb-1">¡Hola, {profile?.nombre?.split(' ')[0] || 'ciclista'}!</p>
                    <h1 className="text-2xl font-bold text-white mb-4">Tu preparación</h1>
                    <CountdownTimer mini />
                </div>
            </div>

            {/* Stats */}
            <div className="px-4 -mt-4 max-w-lg mx-auto">
                {stats && (
                    <>
                        {/* Readjustment Alert */}
                        {stats.needsReadjustment && (
                            <div className="glass-card border-titan-orange bg-titan-orange/10 p-4 mb-4 animate-fade-in flex flex-col gap-3">
                                <div className="flex gap-3">
                                    <div className="bg-titan-orange/20 p-2 rounded-full h-fit">
                                        <TrendingUp size={20} className="text-titan-orange" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-titan-blue text-sm">
                                            {stats.needsReadjustment === 'hard'
                                                ? '¿El plan es muy exigente?'
                                                : '¿El plan es muy fácil?'}
                                        </h3>
                                        <p className="text-xs text-titan-blue/60 mt-1">
                                            Hemos notado que tus últimas sesiones han sido
                                            {stats.needsReadjustment === 'hard' ? ' muy difíciles. ' : ' muy fáciles. '}
                                            Podemos adaptar el plan para que se ajuste mejor a tu nivel actual.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => window.location.href = '/generate-plan'}
                                    className="btn-primary w-full text-xs py-2"
                                >
                                    Adaptar plan con IA
                                </button>
                            </div>
                        )}

                        {/* Progress bar */}
                        <div className="glass-card p-5 mb-4 animate-fade-in">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-titan-blue/70">Progreso del plan</span>
                                <span className="text-2xl font-bold text-titan-orange">{stats.percentComplete}%</span>
                            </div>
                            <div className="w-full bg-titan-sand-dark/50 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-titan-orange to-titan-orange-light rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${stats.percentComplete}%` }}
                                />
                            </div>
                            <p className="text-xs text-titan-blue/40 mt-1.5">
                                {stats.completed} de {stats.total} sesiones completadas
                            </p>
                        </div>

                        {/* Stat cards */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                                <Calendar size={20} className="text-titan-orange mb-2" />
                                <p className="text-2xl font-bold text-titan-blue">{stats.weeksCompleted}<span className="text-sm font-normal text-titan-blue/40">/{stats.weeks}</span></p>
                                <p className="text-xs text-titan-blue/50">Semanas</p>
                            </div>
                            <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '0.15s' }}>
                                <Flame size={20} className="text-titan-orange mb-2" />
                                <p className="text-2xl font-bold text-titan-blue">{stats.streak}</p>
                                <p className="text-xs text-titan-blue/50">Días de racha</p>
                            </div>
                            <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                                <Clock size={20} className="text-titan-orange mb-2" />
                                <p className="text-2xl font-bold text-titan-blue">{Math.round(stats.hoursTotal)}<span className="text-sm font-normal text-titan-blue/40">h</span></p>
                                <p className="text-xs text-titan-blue/50">Horas entrenadas</p>
                            </div>
                            <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '0.25s' }}>
                                <CheckCircle size={20} className="text-titan-success mb-2" />
                                <p className="text-2xl font-bold text-titan-blue">{stats.completed}</p>
                                <p className="text-xs text-titan-blue/50">Sesiones hechas</p>
                            </div>
                        </div>

                        {/* Next session */}
                        {stats.nextSession && (
                            <Link
                                to={`/session/${stats.nextSession.id}`}
                                className="block glass-card-dark p-5 animate-fade-in hover:scale-[1.01] transition-transform"
                                style={{ animationDelay: '0.3s' }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Zap size={16} className="text-titan-orange-light" />
                                        <span className="text-sm font-medium text-white/70">Próxima sesión</span>
                                    </div>
                                    <ChevronRight size={18} className="text-white/40" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1 capitalize">
                                    {stats.nextSession.tipo}
                                </h3>
                                <p className="text-sm text-white/50 mb-3">{stats.nextSession.descripcion}</p>
                                <div className="flex items-center gap-4 text-xs text-white/40">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} /> {stats.nextSession.duracion_min} min
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Target size={12} /> {stats.nextSession.distancia_km} km
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <TrendingUp size={12} /> Zona {stats.nextSession.intensidad_zona}
                                    </span>
                                </div>
                            </Link>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
