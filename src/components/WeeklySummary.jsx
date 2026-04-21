import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, Award } from 'lucide-react'

function getWeekRange(offsetWeeks = 0) {
    const now = new Date()
    const day = now.getDay() || 7
    const monday = new Date(now)
    monday.setDate(now.getDate() - day + 1 + offsetWeeks * 7)
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    return { from: monday, to: sunday }
}

function sessionsInRange(sessions, { from, to }) {
    return sessions.filter(s => {
        const d = new Date(s.fecha)
        return d >= from && d <= to
    })
}

function coachMessage(pct) {
    if (pct === 100) return '¡Semana perfecta! Estás exactamente donde tienes que estar.'
    if (pct >= 80) return 'Muy buena semana. Sigue manteniendo esa constancia.'
    if (pct >= 60) return 'Semana aceptable. Intenta no saltarte las sesiones clave esta semana.'
    if (pct > 0) return 'Semana difícil. No pasa nada — esta semana volvemos a por ello.'
    return 'No completaste sesiones la semana pasada. ¡Esta semana es tu oportunidad!'
}

function Delta({ current, previous, unit = '' }) {
    if (previous === 0) return null
    const diff = current - previous
    const pct = Math.round(Math.abs(diff / previous) * 100)
    if (Math.abs(diff) < 0.5) return <span className="text-white/30 text-[10px]">= igual</span>
    const up = diff > 0
    const Icon = up ? TrendingUp : TrendingDown
    return (
        <span className={`flex items-center gap-0.5 text-[10px] font-bold ${up ? 'text-titan-success' : 'text-titan-danger'}`}>
            <Icon size={10} />
            {up ? '+' : '-'}{unit === 'h' ? (Math.abs(diff) / 60).toFixed(1) : Math.round(Math.abs(diff))}{unit} ({pct}%)
        </span>
    )
}

export default function WeeklySummary({ sessions }) {
    const summary = useMemo(() => {
        const lastWeek = getWeekRange(-1)
        const prevWeek = getWeekRange(-2)

        const last = sessionsInRange(sessions, lastWeek)
        const prev = sessionsInRange(sessions, prevWeek)

        if (last.length === 0) return null

        const planned = last.length
        const completed = last.filter(s => s.completada)
        const pct = Math.round((completed.length / planned) * 100)

        const kmLast = completed.reduce((sum, s) => sum + parseFloat(s.distancia_real_km || s.distancia_km || 0), 0)
        const minLast = completed.reduce((sum, s) => sum + (s.tiempo_real_min || s.duracion_min || 0), 0)

        const prevCompleted = prev.filter(s => s.completada)
        const kmPrev = prevCompleted.reduce((sum, s) => sum + parseFloat(s.distancia_real_km || s.distancia_km || 0), 0)
        const minPrev = prevCompleted.reduce((sum, s) => sum + (s.tiempo_real_min || s.duracion_min || 0), 0)

        const weekLabel = `${lastWeek.from.getDate()}/${lastWeek.from.getMonth() + 1} – ${lastWeek.to.getDate()}/${lastWeek.to.getMonth() + 1}`

        return { planned, completed: completed.length, pct, kmLast, minLast, kmPrev, minPrev, weekLabel }
    }, [sessions])

    if (!summary) return null

    const { planned, completed, pct, kmLast, minLast, kmPrev, minPrev, weekLabel } = summary
    const hoursLast = (minLast / 60).toFixed(1)

    const ringColor = pct === 100 ? '#FACC15' : pct >= 80 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444'

    return (
        <div className="glass-card p-5 mb-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <Award size={13} className="text-dunr-orange" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Semana pasada</span>
                    </div>
                    <p className="text-[11px] text-white/25 font-bold">{weekLabel}</p>
                </div>
                {/* Completion ring */}
                <div className="relative w-14 h-14">
                    <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                        <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                        <circle
                            cx="28" cy="28" r="22" fill="none"
                            stroke={ringColor} strokeWidth="5"
                            strokeDasharray={`${2 * Math.PI * 22}`}
                            strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-black text-white">{pct}%</span>
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-white/4 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-white leading-none">{completed}<span className="text-white/30 text-xs">/{planned}</span></p>
                    <p className="text-[9px] text-white/30 uppercase font-bold tracking-wider mt-1">Sesiones</p>
                </div>
                <div className="bg-white/4 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-white leading-none">{Math.round(kmLast)}<span className="text-white/30 text-xs"> km</span></p>
                    <p className="text-[9px] text-white/30 uppercase font-bold tracking-wider mt-1">Distancia</p>
                    <Delta current={kmLast} previous={kmPrev} unit="km" />
                </div>
                <div className="bg-white/4 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-white leading-none">{hoursLast}<span className="text-white/30 text-xs">h</span></p>
                    <p className="text-[9px] text-white/30 uppercase font-bold tracking-wider mt-1">Tiempo</p>
                    <Delta current={minLast} previous={minPrev} unit="h" />
                </div>
            </div>

            {/* Coach message */}
            <div className="flex gap-3 items-start bg-white/3 rounded-xl p-3 border border-white/5">
                <div className="w-6 h-6 rounded-lg bg-dunr-orange/15 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px]">🤖</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed italic">{coachMessage(pct)}</p>
            </div>
        </div>
    )
}
