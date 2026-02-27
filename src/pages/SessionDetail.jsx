import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DEMO_MODE, DEMO_SESSIONS } from '../lib/mockData'
import { supabase } from '../lib/supabase'
import {
    ArrowLeft, Clock, Target, TrendingUp, CheckCircle,
    MessageSquare, ThumbsUp, ThumbsDown, Minus,
    ChevronLeft, ChevronRight, Activity, ChevronDown, ChevronUp,
    Gauge, Mountain, Zap
} from 'lucide-react'

const TYPE_COLORS = {
    rodaje: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    intervalos: { bg: 'bg-red-500/10', text: 'text-red-400' },
    fuerza: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
    'descanso activo': { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    largo: { bg: 'bg-dunr-orange/10', text: 'text-dunr-orange' },
}

const ZONE_DESCRIPTIONS = {
    1: { name: 'Recuperación', effort: 'Muy suave', hr: '<60%' },
    2: { name: 'Resistencia', effort: 'Cómodo', hr: '60-70%' },
    3: { name: 'Tempo', effort: 'Moderado', hr: '70-80%' },
    4: { name: 'Umbral', effort: 'Duro', hr: '80-90%' },
    5: { name: 'VO2max', effort: 'Máximo', hr: '>90%' },
}

const DIFFICULTY_OPTIONS = [
    { value: 'muy_facil', label: 'Muy fácil', icon: ThumbsUp, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { value: 'normal', label: 'Normal', icon: Minus, color: 'text-dunr-blue bg-dunr-blue/10 border-dunr-blue/20' },
    { value: 'muy_dificil', label: 'Muy difícil', icon: ThumbsDown, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
]

export default function SessionDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [nota, setNota] = useState('')
    const [dificultad, setDificultad] = useState('normal')
    const [adjacentSessions, setAdjacentSessions] = useState({ prev: null, next: null })
    const [realStats, setRealStats] = useState({
        duracion: '',
        distancia: '',
        percepcion: 5,
        entera: true,
        nota: '',
        fc_media: '',
        fc_maxima: '',
        desnivel: '',
        velocidad: '',
        cadencia: ''
    })
    const [showDeviceStats, setShowDeviceStats] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0)
        async function loadSession() {
            if (DEMO_MODE) {
                const saved = localStorage.getItem('demo_sessions')
                const sessions = (saved ? JSON.parse(saved) : DEMO_SESSIONS).sort((a, b) => a.fecha.localeCompare(b.fecha))
                const found = sessions.find((s) => s.id === id)
                if (found) {
                    setSession(found)
                    setRealStats({
                        duracion: found.tiempo_real_min || found.duracion_min || '',
                        distancia: found.distancia_real_km || found.distancia_km || '',
                        percepcion: found.percepcion_esfuerzo || 5,
                        entera: found.completada_entera ?? true,
                        nota: found.nota_post || '',
                        fc_media: found.fc_media || '',
                        fc_maxima: found.fc_maxima || '',
                        desnivel: found.desnivel_m || '',
                        velocidad: found.velocidad_media_real || '',
                        cadencia: found.cadencia_media || ''
                    })
                    if (found.fc_media || found.desnivel_m) setShowDeviceStats(true)

                    const idx = sessions.findIndex(s => s.id === id)
                    setAdjacentSessions({
                        prev: idx > 0 ? sessions[idx - 1].id : null,
                        next: idx < sessions.length - 1 ? sessions[idx + 1].id : null
                    })
                }
            } else {
                const { data } = await supabase
                    .from('sessions')
                    .select('*')
                    .eq('id', id)
                    .single()
                if (data) {
                    setSession(data)
                    setRealStats({
                        duracion: data.tiempo_real_min || data.duracion_min || '',
                        distancia: data.distancia_real_km || data.distancia_km || '',
                        percepcion: data.percepcion_esfuerzo || 5,
                        entera: data.completada_entera ?? true,
                        nota: data.nota_post || '',
                        fc_media: data.fc_media || '',
                        fc_maxima: data.fc_maxima || '',
                        desnivel: data.desnivel_m || '',
                        velocidad: data.velocidad_media_real || '',
                        cadencia: data.cadencia_media || ''
                    })
                    if (data.fc_media || data.desnivel_m) setShowDeviceStats(true)

                    // Find adjacent sessions
                    const { data: allSessions } = await supabase
                        .from('sessions')
                        .select('id, fecha')
                        .order('fecha', { ascending: true })

                    if (allSessions) {
                        const idx = allSessions.findIndex(s => s.id === id)
                        setAdjacentSessions({
                            prev: idx > 0 ? allSessions[idx - 1].id : null,
                            next: idx < allSessions.length - 1 ? allSessions[idx + 1].id : null
                        })
                    }
                }
            }
            setLoading(false)
        }
        loadSession()
    }, [id])

    async function handleComplete(onlyUpdate = false) {
        setSaving(true)
        try {
            const isMarkingComplete = !session.completada && !onlyUpdate
            const isUnmarkingComplete = session.completada && !onlyUpdate

            const updatedSession = {
                ...session,
                completada: onlyUpdate ? session.completada : !session.completada,
                tiempo_real_min: (onlyUpdate || !session.completada) ? (realStats.duracion ? Number(realStats.duracion) : null) : null,
                distancia_real_km: (onlyUpdate || !session.completada) ? (realStats.distancia ? parseFloat(realStats.distancia) : null) : null,
                percepcion_esfuerzo: (onlyUpdate || !session.completada) ? realStats.percepcion : null,
                completada_entera: (onlyUpdate || !session.completada) ? realStats.entera : null,
                nota_post: (onlyUpdate || !session.completada) ? realStats.nota : null,
                fc_media: (onlyUpdate || !session.completada) ? (realStats.fc_media ? Number(realStats.fc_media) : null) : null,
                fc_maxima: (onlyUpdate || !session.completada) ? (realStats.fc_maxima ? Number(realStats.fc_maxima) : null) : null,
                desnivel_m: (onlyUpdate || !session.completada) ? (realStats.desnivel ? Number(realStats.desnivel) : null) : null,
                velocidad_media_real: (onlyUpdate || !session.completada) ? (realStats.velocidad ? parseFloat(realStats.velocidad) : null) : null,
                cadencia_media: (onlyUpdate || !session.completada) ? (realStats.cadencia ? Number(realStats.cadencia) : null) : null,
            }

            if (DEMO_MODE) {
                const saved = localStorage.getItem('demo_sessions')
                // Deep copy to avoid mutating reference if using DEMO_SESSIONS directly
                const sessionsArray = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEMO_SESSIONS))
                const idx = sessionsArray.findIndex((s) => s.id === id)
                if (idx !== -1) {
                    sessionsArray[idx] = updatedSession
                    localStorage.setItem('demo_sessions', JSON.stringify(sessionsArray))
                }
            } else {
                const { error: updateError } = await supabase
                    .from('sessions')
                    .update({
                        completada: updatedSession.completada,
                        tiempo_real_min: updatedSession.tiempo_real_min,
                        distancia_real_km: updatedSession.distancia_real_km,
                        percepcion_esfuerzo: updatedSession.percepcion_esfuerzo,
                        completada_entera: updatedSession.completada_entera,
                        nota_post: updatedSession.nota_post,
                        fc_media: updatedSession.fc_media,
                        fc_maxima: updatedSession.fc_maxima,
                        desnivel_m: updatedSession.desnivel_m,
                        velocidad_media_real: updatedSession.velocidad_media_real,
                        cadencia_media: updatedSession.cadencia_media,
                    })
                    .eq('id', id)

                if (updateError) throw updateError
            }

            setSession(updatedSession)
        } catch (err) {
            console.error('Error saving session:', err)
            alert('Error al guardar la sesión: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-dunr-black pb-24 px-4 pt-6">
                <div className="max-w-lg mx-auto space-y-4">
                    <div className="skeleton h-8 w-32 !bg-white/5" />
                    <div className="skeleton h-48 w-full !bg-white/5" />
                    <div className="skeleton h-32 w-full !bg-white/5" />
                </div>
            </div>
        )
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-dunr-black flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-white/30 mb-4 font-bold uppercase tracking-widest text-xs">Sesión no encontrada</p>
                    <button onClick={() => navigate(-1)} className="btn-primary">Volver</button>
                </div>
            </div>
        )
    }

    const colors = TYPE_COLORS[session.tipo] || TYPE_COLORS.rodaje
    const zone = ZONE_DESCRIPTIONS[session.intensidad_zona] || ZONE_DESCRIPTIONS[2]

    return (
        <div className="min-h-screen bg-dunr-black pb-24">
            {/* Header */}
            <div className="gradient-desert px-4 pt-6 pb-10">
                <div className="max-w-lg mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/calendar')}
                            className="flex items-center gap-1 text-white/60 hover:text-white min-h-[44px]"
                        >
                            <ArrowLeft size={18} /> Calendario
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate(`/session/${adjacentSessions.prev}`)}
                                disabled={!adjacentSessions.prev}
                                title="Sesión anterior"
                                className={`p-2 rounded-xl border border-white/10 text-white transition-all ${!adjacentSessions.prev ? 'opacity-20 pointer-events-none' : 'hover:bg-white/10 active:scale-95'}`}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => navigate(`/session/${adjacentSessions.next}`)}
                                disabled={!adjacentSessions.next}
                                title="Siguiente sesión"
                                className={`p-2 rounded-xl border border-white/10 text-white transition-all ${!adjacentSessions.next ? 'opacity-20 pointer-events-none' : 'hover:bg-white/10 active:scale-95'}`}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
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
                            <Clock size={20} className="text-dunr-blue mx-auto mb-1" />
                            <p className="text-xl font-black text-white">
                                {session.completada ? session.tiempo_real_min : session.duracion_min}
                                <span className="text-xs font-normal opacity-40 ml-0.5"> min</span>
                            </p>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{session.completada ? 'Tiempo real' : 'Duración'}</p>
                        </div>
                        <div className="text-center">
                            <Target size={20} className="text-dunr-orange mx-auto mb-1" />
                            <p className="text-xl font-black text-white">
                                {session.completada ? session.distancia_real_km : session.distancia_km}
                                <span className="text-xs font-normal opacity-40 ml-0.5"> km</span>
                            </p>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{session.completada ? 'Dist. real' : 'Distancia'}</p>
                        </div>
                        <div className="text-center">
                            <Activity size={20} className="text-emerald-400 mx-auto mb-1" />
                            <p className="text-xl font-black text-white">
                                {session.completada ? `RPE ${session.percepcion_esfuerzo}` : `Z${session.intensidad_zona}`}
                            </p>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider text-center flex justify-center truncate">
                                {session.completada ? 'Esfuerzo' : zone.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Zone info */}
                <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 opacity-60">Zona de intensidad {session.intensidad_zona}</h3>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-dunr-blue to-dunr-orange"
                                style={{ width: `${(session.intensidad_zona / 5) * 100}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-white/40 font-bold whitespace-nowrap">FC: {zone.hr}</span>
                    </div>
                    <p className="text-xs text-white/50 font-medium">Esfuerzo: <span className="text-white">{zone.effort}</span></p>
                </div>

                {/* Description */}
                <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: '0.15s' }}>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 opacity-60">Descripción</h3>
                    <p className="text-sm text-white/80 leading-relaxed font-medium">{session.descripcion}</p>
                </div>

                {/* Complete section */}
                <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <h3 className="text-sm font-black text-white mb-4 uppercase tracking-tight">
                        {session.completada ? 'Resumen de sesión' : 'Completar sesión'}
                    </h3>

                    {/* Manual Stats Entry */}
                    <div className="space-y-4 mb-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-white/30 uppercase tracking-widest">
                            <TrendingUp size={14} /> Registro de misión
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <label className="block text-[10px] font-bold text-white/30 uppercase mb-1.5 ml-1">Minutos reales</label>
                                <div className="relative">
                                    <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                                    <input
                                        type="number"
                                        value={realStats.duracion}
                                        onChange={(e) => setRealStats(prev => ({ ...prev, duracion: e.target.value }))}
                                        className="input-field !py-3 !pl-9 !text-sm border-white/10"
                                        placeholder={session.duracion_min}
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-[10px] font-bold text-white/30 uppercase mb-1.5 ml-1">Km reales</label>
                                <div className="relative">
                                    <Target size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={realStats.distancia}
                                        onChange={(e) => setRealStats(prev => ({ ...prev, distancia: e.target.value }))}
                                        className="input-field !py-3 !pl-9 !text-sm border-white/10"
                                        placeholder={session.distancia_km}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Completion Toggle */}
                    <div className="mb-6 flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div>
                            <p className="text-xs font-bold text-white uppercase tracking-wider">¿Completada entera?</p>
                            <p className="text-[10px] text-white/40">O tuve que acortarla</p>
                        </div>
                        <button
                            onClick={() => setRealStats(prev => ({ ...prev, entera: !prev.entera }))}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${realStats.entera ? 'bg-emerald-500' : 'bg-white/10'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${realStats.entera ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-white/30 uppercase tracking-widest mb-3">
                        <div className="flex items-center gap-2">
                            <Activity size={14} /> Percepción de esfuerzo
                        </div>
                        <span className={`text-lg font-black ${realStats.percepcion <= 3 ? 'text-emerald-400' : realStats.percepcion <= 6 ? 'text-dunr-orange' : 'text-titan-danger'}`}>
                            {realStats.percepcion}/10
                        </span>
                    </div>

                    {/* Effort Selector */}
                    <div className="grid grid-cols-5 gap-2 mb-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <button
                                key={num}
                                onClick={() => setRealStats(prev => ({ ...prev, percepcion: num }))}
                                className={`h-11 rounded-xl font-bold transition-all border-2 text-sm ${realStats.percepcion === num
                                    ? num <= 3 ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : num <= 6 ? 'bg-dunr-orange/20 border-dunr-orange text-dunr-orange' : 'bg-titan-danger/20 border-titan-danger text-titan-danger'
                                    : 'bg-white/5 border-white/5 text-white/30'
                                    }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>

                    {/* Note */}
                    <div className="mb-8">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-white/30 mb-2 uppercase tracking-widest">
                            <MessageSquare size={12} /> Sensaciones (Opcional)
                        </label>
                        <textarea
                            value={realStats.nota}
                            onChange={(e) => setRealStats(prev => ({ ...prev, nota: e.target.value.slice(0, 100) }))}
                            className="input-field text-sm resize-none !min-h-[80px] border-white/10"
                            rows={3}
                            maxLength={100}
                            placeholder="Ej: piernas cargadas, mucho viento, terreno técnico..."
                        />
                        <div className="flex justify-end mt-1">
                            <span className="text-[10px] text-white/20 font-bold">{realStats.nota.length}/100</span>
                        </div>
                    </div>

                    {/* GPS/Device Section Toggle */}
                    <div className="mb-6 mb-8 pt-6 border-t border-white/5">
                        <button
                            onClick={() => setShowDeviceStats(!showDeviceStats)}
                            className="w-full flex items-center justify-between text-white/40 hover:text-white transition-colors py-2"
                        >
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                                <Activity size={12} /> Tengo datos del dispositivo GPS o pulsómetro
                            </div>
                            <div className={`p-1 rounded-full bg-white/5 transition-transform ${showDeviceStats ? 'rotate-180' : ''}`}>
                                <ChevronDown size={14} />
                            </div>
                        </button>

                        {showDeviceStats && (
                            <div className="mt-6 space-y-6 animate-fade-in">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className="block text-[10px] font-bold text-white/30 uppercase mb-1.5 ml-1">FC Media (ppm)</label>
                                        <div className="relative">
                                            <Activity size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input
                                                type="number"
                                                value={realStats.fc_media}
                                                onChange={(e) => setRealStats(prev => ({ ...prev, fc_media: e.target.value }))}
                                                className="input-field !py-3 !pl-9 !text-sm border-white/10"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <label className="block text-[10px] font-bold text-white/30 uppercase mb-1.5 ml-1">FC Máxima (ppm)</label>
                                        <div className="relative">
                                            <Activity size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input
                                                type="number"
                                                value={realStats.fc_maxima}
                                                onChange={(e) => setRealStats(prev => ({ ...prev, fc_maxima: e.target.value }))}
                                                className="input-field !py-3 !pl-9 !text-sm border-white/10"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <label className="block text-[10px] font-bold text-white/30 uppercase mb-1.5 ml-1">Desnivel (m)</label>
                                        <div className="relative">
                                            <Mountain size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input
                                                type="number"
                                                value={realStats.desnivel}
                                                onChange={(e) => setRealStats(prev => ({ ...prev, desnivel: e.target.value }))}
                                                className="input-field !py-3 !pl-9 !text-sm border-white/10"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <label className="block text-[10px] font-bold text-white/30 uppercase mb-1.5 ml-1">Vel. Media (km/h)</label>
                                        <div className="relative">
                                            <Gauge size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={realStats.velocidad}
                                                onChange={(e) => setRealStats(prev => ({ ...prev, velocidad: e.target.value }))}
                                                className="input-field !py-3 !pl-9 !text-sm border-white/10"
                                                placeholder="0.0"
                                            />
                                        </div>
                                    </div>
                                    <div className="relative col-span-2">
                                        <label className="block text-[10px] font-bold text-white/30 uppercase mb-1.5 ml-1">Cadencia Media (rpm)</label>
                                        <div className="relative">
                                            <Zap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input
                                                type="number"
                                                value={realStats.cadencia}
                                                onChange={(e) => setRealStats(prev => ({ ...prev, cadencia: e.target.value }))}
                                                className="input-field !py-3 !pl-9 !text-sm border-white/10"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Complete/Update button */}
                    <div className="space-y-4">
                        <button
                            onClick={() => handleComplete()}
                            disabled={saving}
                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${session.completada
                                ? 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/10'
                                : 'btn-primary shadow-dunr-blue/20'
                                }`}
                        >
                            {saving && !session.completada ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                    Guardando...
                                </span>
                            ) : session.completada ? (
                                'Desmarcar sesión'
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <CheckCircle size={18} /> Marcar como completada
                                </span>
                            )}
                        </button>

                        {session.completada && (
                            <button
                                onClick={() => handleComplete(true)}
                                disabled={saving}
                                className="w-full py-3 rounded-2xl border border-dunr-orange/30 text-dunr-orange font-bold text-[10px] uppercase tracking-widest hover:bg-dunr-orange/5 transition-all"
                            >
                                {saving ? 'Actualizando...' : 'Actualizar datos reales'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
