import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DEMO_MODE, DEMO_SESSIONS } from '../lib/mockData'
import { supabase } from '../lib/supabase'
import {
    ChevronLeft, ChevronRight, CalendarDays,
    Clock, Target, TrendingUp, CheckCircle, Circle,
    MoveHorizontal, X, FileDown, FileSpreadsheet,
    Calendar as CalendarIcon
} from 'lucide-react'

const TYPE_COLORS = {
    rodaje: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-500' },
    intervalos: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' },
    fuerza: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-500' },
    'descanso activo': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' },
    largo: { bg: 'bg-dunr-orange/10', text: 'text-dunr-orange', dot: 'bg-dunr-orange' },
}

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

function getWeekDates(date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
    return Array.from({ length: 7 }, (_, i) => {
        const dt = new Date(monday)
        dt.setDate(monday.getDate() + i)
        return dt
    })
}

function getMonthDates(year, month) {
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const startDay = first.getDay() === 0 ? 6 : first.getDay() - 1
    const dates = []

    for (let i = startDay - 1; i >= 0; i--) {
        const d = new Date(year, month, -i)
        dates.push({ date: d, otherMonth: true })
    }
    for (let i = 1; i <= last.getDate(); i++) {
        dates.push({ date: new Date(year, month, i), otherMonth: false })
    }
    const remaining = 42 - dates.length
    for (let i = 1; i <= remaining; i++) {
        dates.push({ date: new Date(year, month + 1, i), otherMonth: true })
    }
    return dates
}

export default function CalendarPage() {
    const { user } = useAuth()
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState('week') // 'week' or 'month'
    const [currentDate, setCurrentDate] = useState(new Date())
    const [movingSession, setMovingSession] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)
    const [showExportMenu, setShowExportMenu] = useState(false)

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

    const sessionsByDate = useMemo(() => {
        const map = {}
        sessions.forEach((s) => {
            if (!map[s.fecha]) map[s.fecha] = []
            map[s.fecha].push(s)
        })
        return map
    }, [sessions])

    function navigate(dir) {
        const d = new Date(currentDate)
        if (view === 'week') {
            d.setDate(d.getDate() + dir * 7)
        } else {
            d.setMonth(d.getMonth() + dir)
        }
        setCurrentDate(d)
    }

    function goToday() {
        setCurrentDate(new Date())
    }

    async function moveSession(session, newDate) {
        setActionLoading(true)
        try {
            const dateStr = newDate.toISOString().split('T')[0]
            const dayName = DAY_NAMES[newDate.getDay() === 0 ? 6 : newDate.getDay() - 1]

            if (DEMO_MODE) {
                const saved = JSON.parse(localStorage.getItem('demo_sessions') || '[]')
                const updated = saved.map(s => s.id === session.id ? { ...s, fecha: dateStr, dia_semana: dayName } : s)
                localStorage.setItem('demo_sessions', JSON.stringify(updated))
                setSessions(updated)
            } else {
                const { error } = await supabase
                    .from('sessions')
                    .update({ fecha: dateStr, dia_semana: dayName })
                    .eq('id', session.id)

                if (error) throw error
                setSessions(prev => prev.map(s => s.id === session.id ? { ...s, fecha: dateStr, dia_semana: dayName } : s))
            }
            setMovingSession(null)
        } catch (err) {
            console.error(err)
            alert('Error al mover la sesión')
        } finally {
            setActionLoading(false)
        }
    }

    const exportToCSV = () => {
        if (!sessions.length) return

        const headers = ['Fecha', 'Dia', 'Semana', 'Tipo', 'Duracion (min)', 'Distancia (km)', 'Zona', 'Descripcion']
        const rows = sessions.map(s => [
            s.fecha,
            s.dia_semana,
            s.semana,
            s.tipo,
            s.duracion_min,
            s.distancia_km,
            s.intensidad_zona,
            `"${s.descripcion.replace(/"/g, '""')}"`
        ])

        const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `Plan_Entrenamiento_Titan_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setShowExportMenu(false)
    }

    const exportToiCal = () => {
        if (!sessions.length) return

        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//DUNR Trainer//NONSGML Training Plan//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH'
        ].join('\r\n')

        sessions.forEach(s => {
            const date = s.fecha.replace(/-/g, '')
            icsContent += [
                '\r\nBEGIN:VEVENT',
                `UID:${s.id}@dunr.fit`,
                `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                `DTSTART;VALUE=DATE:${date}`,
                `DTEND;VALUE=DATE:${date}`,
                `SUMMARY:Entreno DUNR: ${s.tipo.toUpperCase()}`,
                `DESCRIPTION:${s.descripcion} (${s.duracion_min} min | ${s.distancia_km} km)`,
                'STATUS:CONFIRMED',
                'SEQUENCE:0',
                'END:VEVENT'
            ].join('\r\n')
        })

        icsContent += '\r\nEND:VCALENDAR'

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', 'Plan_Titan_Desert.ics')
        link.click()
        setShowExportMenu(false)
    }

    const today = new Date().toISOString().split('T')[0]

    if (loading) {
        return (
            <div className="min-h-screen bg-dunr-black pb-24 px-4 pt-6">
                <div className="max-w-lg mx-auto space-y-3">
                    <div className="skeleton h-12 w-full !bg-white/5" />
                    <div className="skeleton h-80 w-full !bg-white/5" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-dunr-black pb-24">
            {/* Header */}
            <div className="bg-dunr-black/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
                <div className="max-w-lg mx-auto px-4 py-3">
                    {/* View toggle */}
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-xl font-black text-white tracking-tight uppercase">Calendario</h1>
                        <div className="flex items-center gap-2">
                            {/* Export Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    className="p-2 rounded-xl bg-white/5 text-white/60 hover:text-dunr-blue transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center border border-white/10"
                                    title="Exportar plan"
                                >
                                    <FileDown size={18} />
                                </button>

                                {showExportMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-[60]"
                                            onClick={() => setShowExportMenu(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-52 bg-dunr-gray rounded-2xl shadow-2xl border border-white/10 py-2 z-[70] animate-fade-in origin-top-right overflow-hidden">
                                            <button
                                                onClick={exportToCSV}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:bg-white/5 transition-colors"
                                            >
                                                <div className="bg-emerald-500/10 p-1.5 rounded-lg">
                                                    <FileSpreadsheet size={16} className="text-emerald-500" />
                                                </div>
                                                Excel / CSV
                                            </button>
                                            <button
                                                onClick={exportToiCal}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:bg-white/5 transition-colors"
                                            >
                                                <div className="bg-dunr-blue/10 p-1.5 rounded-lg">
                                                    <CalendarIcon size={16} className="text-dunr-blue" />
                                                </div>
                                                Calendario (iCal)
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* View Toggle */}
                            <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5">
                                <button
                                    onClick={() => setView('week')}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${view === 'week' ? 'bg-white/10 text-dunr-blue shadow-sm' : 'text-white/40'
                                        }`}
                                >
                                    Semana
                                </button>
                                <button
                                    onClick={() => setView('month')}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${view === 'month' ? 'bg-white/10 text-dunr-blue shadow-sm' : 'text-white/40'
                                        }`}
                                >
                                    Mes
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/30 hover:text-white transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={goToday} className="text-sm font-bold text-white uppercase tracking-wider">
                            {view === 'week'
                                ? `Semana ${getWeekDates(currentDate)[0].getDate()} ${MONTH_NAMES[getWeekDates(currentDate)[0].getMonth()]}`
                                : `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                            }
                        </button>
                        <button onClick={() => navigate(1)} className="p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/30 hover:text-white transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar content */}
            <div className="px-4 pt-4 max-w-lg mx-auto">
                {view === 'month' ? (
                    <MonthView
                        currentDate={currentDate}
                        sessionsByDate={sessionsByDate}
                        today={today}
                    />
                ) : (
                    <WeekView
                        currentDate={currentDate}
                        sessionsByDate={sessionsByDate}
                        today={today}
                        onStartMove={setMovingSession}
                    />
                )}
            </div>

            {/* Move Modal */}
            {movingSession && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-titan-blue/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-titan-blue">Mover sesión</h2>
                            <button onClick={() => setMovingSession(null)} className="p-2 text-titan-blue/20 hover:text-titan-blue transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className={`p-4 rounded-2xl ${TYPE_COLORS[movingSession.tipo]?.bg} border border-black/5`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-bold uppercase ${TYPE_COLORS[movingSession.tipo]?.text}`}>{movingSession.tipo}</span>
                                    <span className="text-xs text-titan-blue/40">• Semana {movingSession.semana}</span>
                                </div>
                                <p className="text-sm font-medium text-titan-blue/70 line-clamp-1">{movingSession.descripcion}</p>
                            </div>
                        </div>

                        <p className="text-sm font-bold text-titan-blue/40 mb-3 uppercase tracking-wider">Selecciona nueva fecha:</p>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {Array.from({ length: 7 }, (_, i) => {
                                const d = new Date()
                                d.setDate(d.getDate() + i)
                                const dStr = d.toISOString().split('T')[0]
                                const isCurrent = dStr === movingSession.fecha

                                return (
                                    <button
                                        key={i}
                                        disabled={actionLoading || isCurrent}
                                        onClick={() => moveSession(movingSession, d)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isCurrent
                                            ? 'border-titan-orange/20 bg-titan-sand-light cursor-default opacity-50'
                                            : 'border-titan-sand-dark/30 hover:border-titan-orange hover:bg-titan-orange/5'
                                            }`}
                                    >
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-bold text-titan-blue uppercase">
                                                {DAY_NAMES[d.getDay() === 0 ? 6 : d.getDay() - 1]} {d.getDate()}
                                            </span>
                                            <span className="text-xs text-titan-blue/40">
                                                {MONTH_NAMES[d.getMonth()]}
                                            </span>
                                        </div>
                                        {actionLoading && !isCurrent ? (
                                            <div className="w-4 h-4 border-2 border-titan-orange/30 border-t-titan-orange rounded-full animate-spin" />
                                        ) : (
                                            <ChevronRight size={18} className={isCurrent ? 'text-titan-blue/10' : 'text-titan-orange'} />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function MonthView({ currentDate, sessionsByDate, today }) {
    const dates = getMonthDates(currentDate.getFullYear(), currentDate.getMonth())

    return (
        <div>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
                {DAY_NAMES.map((d) => (
                    <div key={d} className="text-center text-xs font-medium text-titan-blue/40 py-1">
                        {d}
                    </div>
                ))}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
                {dates.map(({ date, otherMonth }, i) => {
                    const dateStr = date.toISOString().split('T')[0]
                    const daySessions = sessionsByDate[dateStr] || []
                    const isToday = dateStr === today
                    const hasCompleted = daySessions.some((s) => s.completada)
                    const allCompleted = daySessions.length > 0 && daySessions.every((s) => s.completada)

                    return (
                        <Link
                            key={i}
                            to={daySessions.length > 0 ? `/session/${daySessions[0].id}` : '#'}
                            className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-center transition-all ${otherMonth ? 'opacity-30' : ''
                                } ${isToday ? 'ring-2 ring-titan-orange' : ''} ${daySessions.length > 0 ? 'hover:bg-titan-sand cursor-pointer' : 'cursor-default'
                                }`}
                        >
                            <span className={`text-xs font-medium ${isToday ? 'text-titan-orange font-bold' : 'text-titan-blue/70'
                                }`}>
                                {date.getDate()}
                            </span>
                            {daySessions.length > 0 && (
                                <div className="flex items-center gap-0.5 mt-0.5">
                                    {allCompleted ? (
                                        <CheckCircle size={10} className="text-titan-success" />
                                    ) : (
                                        daySessions.map((s, j) => {
                                            const color = TYPE_COLORS[s.tipo] || TYPE_COLORS.rodaje
                                            return (
                                                <div key={j} className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                                            )
                                        })
                                    )}
                                </div>
                            )}
                        </Link>
                    )
                })}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/5">
                {Object.entries(TYPE_COLORS).map(([type, colors]) => (
                    <div key={type} className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{type}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function WeekView({ currentDate, sessionsByDate, today, onStartMove }) {
    const weekDates = getWeekDates(currentDate)

    return (
        <div className="space-y-3">
            {weekDates.map((date) => {
                const dateStr = date.toISOString().split('T')[0]
                const daySessions = sessionsByDate[dateStr] || []
                const isToday = dateStr === today
                const dayName = DAY_NAMES[date.getDay() === 0 ? 6 : date.getDay() - 1]

                return (
                    <div key={dateStr} className={`animate-fade-in ${isToday ? '' : ''}`}>
                        {/* Day label */}
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-xs font-bold uppercase tracking-wider ${isToday ? 'text-titan-orange' : 'text-titan-blue/40'
                                }`}>
                                {dayName} {date.getDate()}
                            </span>
                            {isToday && (
                                <span className="text-[10px] bg-titan-orange text-white px-2 py-0.5 rounded-full font-medium">
                                    HOY
                                </span>
                            )}
                        </div>

                        {daySessions.length > 0 ? (
                            daySessions.map((session) => {
                                const colors = TYPE_COLORS[session.tipo] || TYPE_COLORS.rodaje
                                return (
                                    <Link
                                        key={session.id}
                                        to={`/session/${session.id}`}
                                        className={`block glass-card p-4 hover:scale-[1.01] transition-all ${session.completada ? 'opacity-70' : ''
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${colors.bg} ${colors.text} capitalize`}>
                                                    {session.tipo}
                                                </span>
                                                <span className="text-xs text-titan-blue/40">Zona {session.intensidad_zona}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        onStartMove(session)
                                                    }}
                                                    className="p-1 rounded-lg bg-titan-blue/5 text-titan-blue/30 hover:bg-titan-orange/10 hover:text-titan-orange transition-all"
                                                    title="Mover de día"
                                                >
                                                    <MoveHorizontal size={16} />
                                                </button>
                                                {session.completada ? (
                                                    <CheckCircle size={20} className="text-titan-success" />
                                                ) : (
                                                    <Circle size={20} className="text-titan-blue/20" />
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-titan-blue/70 mb-2 line-clamp-2">{session.descripcion}</p>
                                        <div className="flex items-center gap-4 text-xs text-titan-blue/40">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} /> {session.completada ? session.duracion_real : session.duracion_min} min
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Target size={12} /> {session.completada ? session.distancia_real : session.distancia_km} km
                                            </span>
                                        </div>
                                    </Link>
                                )
                            })
                        ) : (
                            <div className="glass-card p-4 text-center">
                                <p className="text-sm text-titan-blue/30">Descanso</p>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
