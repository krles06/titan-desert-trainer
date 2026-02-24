import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DEMO_MODE, DEMO_SESSIONS } from '../lib/mockData'
import { supabase } from '../lib/supabase'
import {
    ArrowLeft, Clock, Target, TrendingUp, CheckCircle,
    MessageSquare, ThumbsUp, ThumbsDown, Minus
} from 'lucide-react'

const TYPE_COLORS = {
    rodaje: { bg: 'bg-blue-100', text: 'text-blue-700' },
    intervalos: { bg: 'bg-red-100', text: 'text-red-700' },
    fuerza: { bg: 'bg-amber-100', text: 'text-amber-700' },
    'descanso activo': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    largo: { bg: 'bg-orange-100', text: 'text-orange-700' },
}

const ZONE_DESCRIPTIONS = {
    1: { name: 'Recuperación', effort: 'Muy suave', hr: '<60%' },
    2: { name: 'Resistencia', effort: 'Cómodo', hr: '60-70%' },
    3: { name: 'Tempo', effort: 'Moderado', hr: '70-80%' },
    4: { name: 'Umbral', effort: 'Duro', hr: '80-90%' },
    5: { name: 'VO2max', effort: 'Máximo', hr: '>90%' },
}

const DIFFICULTY_OPTIONS = [
    { value: 'muy_facil', label: 'Muy fácil', icon: ThumbsUp, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
    { value: 'normal', label: 'Normal', icon: Minus, color: 'text-blue-500 bg-blue-50 border-blue-200' },
    { value: 'muy_dificil', label: 'Muy difícil', icon: ThumbsDown, color: 'text-red-500 bg-red-50 border-red-200' },
]

export default function SessionDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [nota, setNota] = useState('')
    const [dificultad, setDificultad] = useState('normal')

    useEffect(() => {
        async function loadSession() {
            if (DEMO_MODE) {
                const saved = localStorage.getItem('demo_sessions')
                const sessions = saved ? JSON.parse(saved) : DEMO_SESSIONS
                const found = sessions.find((s) => s.id === id)
                if (found) {
                    setSession(found)
                    setNota(found.nota_usuario || '')
                    setDificultad(found.dificultad_percibida || 'normal')
                }
            } else {
                const { data } = await supabase
                    .from('sessions')
                    .select('*')
                    .eq('id', id)
                    .single()
                if (data) {
                    setSession(data)
                    setNota(data.nota_usuario || '')
                    setDificultad(data.dificultad_percibida || 'normal')
                }
            }
            setLoading(false)
        }
        loadSession()
    }, [id])

    async function handleComplete() {
        setSaving(true)
        try {
            const updatedSession = {
                ...session,
                completada: !session.completada,
                dificultad_percibida: !session.completada ? dificultad : null,
                nota_usuario: !session.completada ? nota : null,
            }

            if (DEMO_MODE) {
                const saved = localStorage.getItem('demo_sessions')
                const sessions = saved ? JSON.parse(saved) : DEMO_SESSIONS
                const idx = sessions.findIndex((s) => s.id === id)
                if (idx !== -1) {
                    sessions[idx] = updatedSession
                    localStorage.setItem('demo_sessions', JSON.stringify(sessions))
                }
            } else {
                await supabase
                    .from('sessions')
                    .update({
                        completada: updatedSession.completada,
                        dificultad_percibida: updatedSession.dificultad_percibida,
                        nota_usuario: updatedSession.nota_usuario,
                    })
                    .eq('id', id)
            }

            setSession(updatedSession)
        } catch (err) {
            console.error('Error saving:', err)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-titan-sand-light pb-24 px-4 pt-6">
                <div className="max-w-lg mx-auto space-y-4">
                    <div className="skeleton h-8 w-32" />
                    <div className="skeleton h-48 w-full" />
                    <div className="skeleton h-32 w-full" />
                </div>
            </div>
        )
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-titan-sand-light flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-titan-blue/50 mb-4">Sesión no encontrada</p>
                    <button onClick={() => navigate(-1)} className="btn-primary">Volver</button>
                </div>
            </div>
        )
    }

    const colors = TYPE_COLORS[session.tipo] || TYPE_COLORS.rodaje
    const zone = ZONE_DESCRIPTIONS[session.intensidad_zona] || ZONE_DESCRIPTIONS[2]

    return (
        <div className="min-h-screen bg-titan-sand-light pb-24">
            {/* Header */}
            <div className="gradient-desert px-4 pt-6 pb-10">
                <div className="max-w-lg mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 text-white/60 hover:text-white mb-4 min-h-[44px]"
                    >
                        <ArrowLeft size={18} /> Volver
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-xl text-sm font-semibold ${colors.bg} ${colors.text} capitalize`}>
                            {session.tipo}
                        </span>
                        {session.completada && (
                            <span className="flex items-center gap-1 text-titan-success text-sm font-medium">
                                <CheckCircle size={16} /> Completada
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">
                        {session.dia_semana}, {new Date(session.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                    </h1>
                    <p className="text-white/50 text-sm">Semana {session.semana}</p>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 -mt-4 max-w-lg mx-auto space-y-4">
                {/* Stats */}
                <div className="glass-card p-5 animate-fade-in">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <Clock size={20} className="text-titan-orange mx-auto mb-1" />
                            <p className="text-xl font-bold text-titan-blue">{session.duracion_min}<span className="text-sm font-normal"> min</span></p>
                            <p className="text-xs text-titan-blue/40">Duración</p>
                        </div>
                        <div className="text-center">
                            <Target size={20} className="text-titan-orange mx-auto mb-1" />
                            <p className="text-xl font-bold text-titan-blue">{session.distancia_km}<span className="text-sm font-normal"> km</span></p>
                            <p className="text-xs text-titan-blue/40">Distancia</p>
                        </div>
                        <div className="text-center">
                            <TrendingUp size={20} className="text-titan-orange mx-auto mb-1" />
                            <p className="text-xl font-bold text-titan-blue">Z{session.intensidad_zona}</p>
                            <p className="text-xs text-titan-blue/40">{zone.name}</p>
                        </div>
                    </div>
                </div>

                {/* Zone info */}
                <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <h3 className="text-sm font-semibold text-titan-blue mb-2">Zona de intensidad {session.intensidad_zona}</h3>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 bg-titan-sand rounded-full h-2.5 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500"
                                style={{ width: `${(session.intensidad_zona / 5) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs text-titan-blue/50 whitespace-nowrap">FC: {zone.hr}</span>
                    </div>
                    <p className="text-xs text-titan-blue/50">Esfuerzo: {zone.effort}</p>
                </div>

                {/* Description */}
                <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: '0.15s' }}>
                    <h3 className="text-sm font-semibold text-titan-blue mb-2">Descripción</h3>
                    <p className="text-sm text-titan-blue/70 leading-relaxed">{session.descripcion}</p>
                </div>

                {/* Complete section */}
                <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <h3 className="text-sm font-semibold text-titan-blue mb-3">
                        {session.completada ? '¿Cómo fue la sesión?' : 'Completar sesión'}
                    </h3>

                    {/* Difficulty */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {DIFFICULTY_OPTIONS.map(({ value, label, icon: Icon, color }) => (
                            <button
                                key={value}
                                onClick={() => setDificultad(value)}
                                className={`p-2.5 rounded-xl border-2 flex flex-col items-center gap-1 transition-all text-xs font-medium ${dificultad === value ? color : 'border-titan-sand-dark/30 text-titan-blue/40'
                                    }`}
                            >
                                <Icon size={18} />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Note */}
                    <div className="mb-4">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-titan-blue/50 mb-1.5">
                            <MessageSquare size={12} /> Nota (opcional)
                        </label>
                        <textarea
                            value={nota}
                            onChange={(e) => setNota(e.target.value)}
                            className="input-field text-sm resize-none"
                            rows={2}
                            placeholder="¿Cómo te has sentido? ¿Alguna observación?"
                        />
                    </div>

                    {/* Complete button */}
                    <button
                        onClick={handleComplete}
                        disabled={saving}
                        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all min-h-[44px] ${session.completada
                                ? 'bg-titan-sand text-titan-blue/60 hover:bg-titan-sand-dark'
                                : 'btn-primary'
                            }`}
                    >
                        {saving ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                Guardando...
                            </span>
                        ) : session.completada ? (
                            'Desmarcar como completada'
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <CheckCircle size={18} /> Marcar como completada
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
