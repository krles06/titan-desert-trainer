import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DEMO_MODE, DEMO_SESSIONS } from '../lib/mockData'
import { supabase } from '../lib/supabase'
import {
    ChevronLeft, ChevronRight, CalendarDays,
    Clock, Target, TrendingUp, CheckCircle, Circle
} from 'lucide-react'

const TYPE_COLORS = {
    rodaje: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
    intervalos: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
    fuerza: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    'descanso activo': { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    largo: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
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

    const today = new Date().toISOString().split('T')[0]

    if (loading) {
        return (
            <div className="min-h-screen bg-titan-sand-light pb-24 px-4 pt-6">
                <div className="max-w-lg mx-auto space-y-3">
                    <div className="skeleton h-12 w-full" />
                    <div className="skeleton h-80 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-titan-sand-light pb-24">
            {/* Header */}
            <div className="bg-white border-b border-titan-sand-dark/30 sticky top-0 z-40">
                <div className="max-w-lg mx-auto px-4 py-3">
                    {/* View toggle */}
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-lg font-bold text-titan-blue">Calendario</h1>
                        <div className="flex bg-titan-sand/50 rounded-xl p-0.5">
                            <button
                                onClick={() => setView('week')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'week' ? 'bg-white text-titan-blue shadow-sm' : 'text-titan-blue/50'
                                    }`}
                            >
                                Semana
                            </button>
                            <button
                                onClick={() => setView('month')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'month' ? 'bg-white text-titan-blue shadow-sm' : 'text-titan-blue/50'
                                    }`}
                            >
                                Mes
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
                            <ChevronLeft size={20} className="text-titan-blue/60" />
                        </button>
                        <button onClick={goToday} className="text-sm font-semibold text-titan-blue">
                            {view === 'week'
                                ? `Semana del ${getWeekDates(currentDate)[0].getDate()} ${MONTH_NAMES[getWeekDates(currentDate)[0].getMonth()]}`
                                : `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                            }
                        </button>
                        <button onClick={() => navigate(1)} className="p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
                            <ChevronRight size={20} className="text-titan-blue/60" />
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
                    />
                )}
            </div>
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

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-titan-sand-dark/20">
                {Object.entries(TYPE_COLORS).map(([type, colors]) => (
                    <div key={type} className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                        <span className="text-xs text-titan-blue/50 capitalize">{type}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function WeekView({ currentDate, sessionsByDate, today }) {
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
                                            {session.completada ? (
                                                <CheckCircle size={20} className="text-titan-success" />
                                            ) : (
                                                <Circle size={20} className="text-titan-blue/20" />
                                            )}
                                        </div>
                                        <p className="text-sm text-titan-blue/70 mb-2 line-clamp-2">{session.descripcion}</p>
                                        <div className="flex items-center gap-4 text-xs text-titan-blue/40">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} /> {session.duracion_min} min
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Target size={12} /> {session.distancia_km} km
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
