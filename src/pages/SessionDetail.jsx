import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DEMO_MODE, DEMO_SESSIONS } from '../lib/mockData'
import { supabase } from '../lib/supabase'
import {
    ArrowLeft, Clock, Target, TrendingUp, CheckCircle,
    MessageSquare, ChevronLeft, ChevronRight, Activity,
    ChevronDown, Gauge, Mountain, Zap, Edit2, X
} from 'lucide-react'
import SessionPlanVisual from '../components/SessionPlanVisual'

const TYPE_META = {
    rodaje:            { label: 'Rodaje',         color: '#FACC15', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
    intervalos:        { label: 'Intervalos',      color: '#EF4444', bg: 'bg-red-500/10',    text: 'text-red-400' },
    fuerza:            { label: 'Fuerza',          color: '#F59E0B', bg: 'bg-amber-500/10',  text: 'text-amber-400' },
    'descanso activo': { label: 'Descanso activo', color: '#10B981', bg: 'bg-emerald-500/10',text: 'text-emerald-400' },
    largo:             { label: 'Largo',           color: '#ffffff', bg: 'bg-white/10',      text: 'text-white' },
}

const ZONE_INFO = {
    1: { name: 'Recuperación', effort: 'Muy suave',  hr: '<60% FC máx' },
    2: { name: 'Resistencia',  effort: 'Cómodo',     hr: '60–70% FC máx' },
    3: { name: 'Tempo',        effort: 'Moderado',   hr: '70–80% FC máx' },
    4: { name: 'Umbral',       effort: 'Duro',       hr: '80–90% FC máx' },
    5: { name: 'VO2max',       effort: 'Máximo',     hr: '>90% FC máx' },
}

function Toast({ message, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 2800)
        return () => clearTimeout(t)
    }, [])
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
            <div className="flex items-center gap-2 bg-dunr-orange text-black text-xs font-black uppercase tracking-widest px-5 py-3 rounded-2xl shadow-2xl shadow-dunr-orange/40">
                <CheckCircle size={14} />
                {message}
            </div>
        </div>
    )
}

export default function SessionDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState(null)
    const [adjacent, setAdjacent] = useState({ prev: null, next: null })
    const [showEditForm, setShowEditForm] = useState(false)
    const [showDeviceStats, setShowDeviceStats] = useState(false)
    const [realStats, setRealStats] = useState({
        duracion: '', distancia: '', percepcion: 5,
        entera: true, nota: '',
        fc_media: '', fc_maxima: '', desnivel: '', velocidad: '', cadencia: ''
    })

    useEffect(() => {
        window.scrollTo(0, 0)
        async function load() {
            if (DEMO_MODE) {
                const saved = localStorage.getItem('demo_sessions')
                const sessions = (saved ? JSON.parse(saved) : DEMO_SESSIONS).sort((a, b) => a.fecha.localeCompare(b.fecha))
                const found = sessions.find(s => s.id === id)
                if (found) {
                    setSession(found)
                    fillStats(found)
                    if (found.fc_media || found.desnivel_m) setShowDeviceStats(true)
                    const idx = sessions.findIndex(s => s.id === id)
                    setAdjacent({ prev: idx > 0 ? sessions[idx - 1].id : null, next: idx < sessions.length - 1 ? sessions[idx + 1].id : null })
                }
            } else {
                const { data } = await supabase.from('sessions').select('*').eq('id', id).single()
                if (data) {
                    setSession(data)
                    fillStats(data)
                    if (data.fc_media || data.desnivel_m) setShowDeviceStats(true)
                    const { data: all } = await supabase.from('sessions').select('id, fecha').order('fecha', { ascending: true })
                    if (all) {
                        const idx = all.findIndex(s => s.id === id)
                        setAdjacent({ prev: idx > 0 ? all[idx - 1].id : null, next: idx < all.length - 1 ? all[idx + 1].id : null })
                    }
                }
            }
            setLoading(false)
        }
        load()
    }, [id])

    function fillStats(data) {
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
    }

    async function handleComplete(onlyUpdate = false) {
        setSaving(true)
        try {
            const markingComplete = !session.completada && !onlyUpdate
            const updated = {
                ...session,
                completada: onlyUpdate ? session.completada : !session.completada,
                tiempo_real_min: (onlyUpdate || markingComplete) ? (realStats.duracion ? Number(realStats.duracion) : null) : null,
                distancia_real_km: (onlyUpdate || markingComplete) ? (realStats.distancia ? parseFloat(realStats.distancia) : null) : null,
                percepcion_esfuerzo: (onlyUpdate || markingComplete) ? realStats.percepcion : null,
                completada_entera: (onlyUpdate || markingComplete) ? realStats.entera : null,
                nota_post: (onlyUpdate || markingComplete) ? realStats.nota : null,
                fc_media: (onlyUpdate || markingComplete) ? (realStats.fc_media ? Number(realStats.fc_media) : null) : null,
                fc_maxima: (onlyUpdate || markingComplete) ? (realStats.fc_maxima ? Number(realStats.fc_maxima) : null) : null,
                desnivel_m: (onlyUpdate || markingComplete) ? (realStats.desnivel ? Number(realStats.desnivel) : null) : null,
                velocidad_media_real: (onlyUpdate || markingComplete) ? (realStats.velocidad ? parseFloat(realStats.velocidad) : null) : null,
                cadencia_media: (onlyUpdate || markingComplete) ? (realStats.cadencia ? Number(realStats.cadencia) : null) : null,
            }

            if (DEMO_MODE) {
                const saved = localStorage.getItem('demo_sessions')
                const arr = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEMO_SESSIONS))
                const idx = arr.findIndex(s => s.id === id)
                if (idx !== -1) { arr[idx] = updated; localStorage.setItem('demo_sessions', JSON.stringify(arr)) }
            } else {
                const { error } = await supabase.from('sessions').update({
                    completada: updated.completada,
                    tiempo_real_min: updated.tiempo_real_min,
                    distancia_real_km: updated.distancia_real_km,
                    percepcion_esfuerzo: updated.percepcion_esfuerzo,
                    completada_entera: updated.completada_entera,
                    nota_post: updated.nota_post,
                    fc_media: updated.fc_media,
                    fc_maxima: updated.fc_maxima,
                    desnivel_m: updated.desnivel_m,
                    velocidad_media_real: updated.velocidad_media_real,
                    cadencia_media: updated.cadencia_media,
                }).eq('id', id)
                if (error) throw error
            }

            setSession(updated)
            setShowEditForm(false)
            if (markingComplete) setToast('¡Sesión completada!')
            else if (onlyUpdate) setToast('Datos actualizados')
            else setToast('Sesión desmarcada')
        } catch (err) {
            console.error('Error saving session:', err)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-dunr-black pb-24 px-4 pt-6">
            <div className="max-w-lg mx-auto space-y-4">
                <div className="skeleton h-8 w-32" />
                <div className="skeleton h-48 w-full" />
                <div className="skeleton h-32 w-full" />
            </div>
        </div>
    )

    if (!session) return (
        <div className="min-h-screen bg-dunr-black flex items-center justify-center px-4">
            <div className="text-center">
                <p className="text-white/30 mb-4 font-bold uppercase tracking-widest text-xs">Sesión no encontrada</p>
                <button onClick={() => navigate(-1)} className="btn-primary">Volver</button>
            </div>
        </div>
    )

    const meta = TYPE_META[session.tipo] || TYPE_META.rodaje
    const zone = ZONE_INFO[session.intensidad_zona] || ZONE_INFO[2]

    return (
        <div className="min-h-screen bg-dunr-black pb-28">
            {toast && <Toast message={toast} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="gradient-desert px-4 pt-6 pb-10">
                <div className="max-w-lg mx-auto">
                    <div className="flex items-center justify-between mb-5">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-white/60 hover:text-white min-h-[44px] text-sm font-bold">
                            <ArrowLeft size={18} /> Volver
                        </button>
                        <div className="flex items-center gap-2">
                            <button onClick={() => navigate(`/session/${adjacent.prev}`)} disabled={!adjacent.prev}
                                className={`p-2 rounded-xl border border-white/10 text-white transition-all ${!adjacent.prev ? 'opacity-20 pointer-events-none' : 'hover:bg-white/10'}`}>
                                <ChevronLeft size={18} />
                            </button>
                            <button onClick={() => navigate(`/session/${adjacent.next}`)} disabled={!adjacent.next}
                                className={`p-2 rounded-xl border border-white/10 text-white transition-all ${!adjacent.next ? 'opacity-20 pointer-events-none' : 'hover:bg-white/10'}`}>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${meta.bg} ${meta.text}`}>
                            {meta.label}
                        </span>
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Semana {session.semana}</span>
                        {session.completada && (
                            <span className="flex items-center gap-1 text-emerald-400 text-xs font-black uppercase tracking-wider ml-auto">
                                <CheckCircle size={13} /> Completada
                            </span>
                        )}
                    </div>

                    <h1 className="text-2xl font-black text-white tracking-tight">
                        {session.dia_semana}, {new Date(session.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                    </h1>
                </div>
            </div>

            <div className="px-4 -mt-4 max-w-lg mx-auto space-y-4">

                {/* Stats row */}
                <div className="glass-card p-5 animate-fade-in">
                    <div className="grid grid-cols-3 gap-4 divide-x divide-white/5">
                        <div className="text-center">
                            <Clock size={18} className="text-dunr-orange mx-auto mb-2" />
                            <p className="text-xl font-black text-white leading-none">
                                {session.completada ? (session.tiempo_real_min || session.duracion_min) : session.duracion_min}
                                <span className="text-[10px] font-normal text-white/30 ml-0.5">min</span>
                            </p>
                            <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider mt-1.5">
                                {session.completada && session.tiempo_real_min ? 'Tiempo real' : 'Planificado'}
                            </p>
                        </div>
                        <div className="text-center pl-4">
                            <Target size={18} className="text-dunr-orange mx-auto mb-2" />
                            <p className="text-xl font-black text-white leading-none">
                                {session.completada ? (session.distancia_real_km || session.distancia_km) : session.distancia_km}
                                <span className="text-[10px] font-normal text-white/30 ml-0.5">km</span>
                            </p>
                            <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider mt-1.5">
                                {session.completada && session.distancia_real_km ? 'Dist. real' : 'Estimada'}
                            </p>
                        </div>
                        <div className="text-center pl-4">
                            <Activity size={18} className="text-emerald-400 mx-auto mb-2" />
                            <p className="text-xl font-black text-white leading-none">
                                {session.completada ? `${session.percepcion_esfuerzo || '—'}/10` : `Z${session.intensidad_zona}`}
                            </p>
                            <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider mt-1.5">
                                {session.completada ? 'Esfuerzo' : zone.name}
                            </p>
                        </div>
                    </div>

                    {/* Zona bar (only when not completed) */}
                    {!session.completada && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-3 mb-1.5">
                                <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                                    <div className="h-full rounded-full bg-dunr-orange transition-all"
                                        style={{ width: `${(session.intensidad_zona / 5) * 100}%` }} />
                                </div>
                                <span className="text-[10px] text-white/30 font-bold whitespace-nowrap">{zone.hr}</span>
                            </div>
                            <p className="text-[10px] text-white/30">Esfuerzo: <span className="text-white/60 font-bold">{zone.effort}</span></p>
                        </div>
                    )}
                </div>

                {/* Description — hero of the page */}
                <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: '0.08s' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 rounded-full" style={{ background: meta.color }} />
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Cómo ejecutar la sesión</h3>
                    </div>
                    <p className="text-sm text-white/85 leading-relaxed">{session.descripcion}</p>
                </div>

                {/* Type-specific visual plan */}
                <SessionPlanVisual session={session} />

                {/* ── COMPLETED STATE ── */}
                {session.completada && !showEditForm && (
                    <div className="glass-card p-5 animate-fade-in border border-emerald-500/15 bg-emerald-500/3" style={{ animationDelay: '0.12s' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                                    <CheckCircle size={16} className="text-emerald-400" />
                                </div>
                                <span className="text-sm font-black text-white uppercase tracking-tight">Sesión completada</span>
                            </div>
                            <button onClick={() => setShowEditForm(true)}
                                className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white/60 font-black uppercase tracking-widest transition-colors">
                                <Edit2 size={11} /> Editar
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {session.tiempo_real_min && (
                                <div className="bg-white/4 rounded-xl p-3">
                                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider mb-1">Tiempo real</p>
                                    <p className="text-base font-black text-white">{session.tiempo_real_min}<span className="text-xs text-white/30 ml-0.5">min</span></p>
                                </div>
                            )}
                            {session.distancia_real_km && (
                                <div className="bg-white/4 rounded-xl p-3">
                                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider mb-1">Distancia real</p>
                                    <p className="text-base font-black text-white">{session.distancia_real_km}<span className="text-xs text-white/30 ml-0.5">km</span></p>
                                </div>
                            )}
                            {session.percepcion_esfuerzo && (
                                <div className="bg-white/4 rounded-xl p-3">
                                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider mb-1">Esfuerzo percibido</p>
                                    <p className={`text-base font-black ${session.percepcion_esfuerzo <= 3 ? 'text-emerald-400' : session.percepcion_esfuerzo <= 6 ? 'text-dunr-orange' : 'text-red-400'}`}>
                                        {session.percepcion_esfuerzo}<span className="text-xs text-white/30 ml-0.5">/10</span>
                                    </p>
                                </div>
                            )}
                            {session.completada_entera !== null && (
                                <div className="bg-white/4 rounded-xl p-3">
                                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider mb-1">Completada entera</p>
                                    <p className={`text-base font-black ${session.completada_entera ? 'text-emerald-400' : 'text-dunr-orange'}`}>
                                        {session.completada_entera ? 'Sí ✓' : 'Parcial'}
                                    </p>
                                </div>
                            )}
                            {session.fc_media && (
                                <div className="bg-white/4 rounded-xl p-3">
                                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider mb-1">FC Media</p>
                                    <p className="text-base font-black text-white">{session.fc_media}<span className="text-xs text-white/30 ml-0.5">ppm</span></p>
                                </div>
                            )}
                            {session.desnivel_m && (
                                <div className="bg-white/4 rounded-xl p-3">
                                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider mb-1">Desnivel</p>
                                    <p className="text-base font-black text-white">{session.desnivel_m}<span className="text-xs text-white/30 ml-0.5">m</span></p>
                                </div>
                            )}
                        </div>

                        {session.nota_post && (
                            <div className="mt-3 p-3 bg-white/4 rounded-xl">
                                <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider mb-1">Sensaciones</p>
                                <p className="text-xs text-white/70 italic leading-relaxed">"{session.nota_post}"</p>
                            </div>
                        )}

                        <button onClick={() => handleComplete()}
                            className="mt-4 w-full py-2.5 rounded-xl border border-white/8 text-white/25 text-[10px] font-black uppercase tracking-widest hover:border-white/15 hover:text-white/40 transition-all">
                            Desmarcar sesión
                        </button>
                    </div>
                )}

                {/* ── FORM (not completed OR editing) ── */}
                {(!session.completada || showEditForm) && (
                    <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: '0.15s' }}>
                        {showEditForm && (
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-sm font-black text-white uppercase tracking-tight">Editar datos</h3>
                                <button onClick={() => setShowEditForm(false)} className="text-white/20 hover:text-white/60 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                        {!showEditForm && (
                            <h3 className="text-sm font-black text-white mb-5 uppercase tracking-tight">Completar sesión</h3>
                        )}

                        <div className="space-y-5">
                            {/* Time & distance */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 ml-1">Minutos reales</label>
                                    <div className="relative">
                                        <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                                        <input type="number" value={realStats.duracion}
                                            onChange={e => setRealStats(p => ({ ...p, duracion: e.target.value }))}
                                            className="input-field !py-3 !pl-9 !text-sm" placeholder={session.duracion_min} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 ml-1">Km reales</label>
                                    <div className="relative">
                                        <Target size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                                        <input type="number" step="0.1" value={realStats.distancia}
                                            onChange={e => setRealStats(p => ({ ...p, distancia: e.target.value }))}
                                            className="input-field !py-3 !pl-9 !text-sm" placeholder={session.distancia_km} />
                                    </div>
                                </div>
                            </div>

                            {/* Completed entirely toggle */}
                            <div className="flex items-center justify-between p-4 bg-white/4 rounded-xl border border-white/8">
                                <div>
                                    <p className="text-xs font-bold text-white uppercase tracking-wide">¿Completada entera?</p>
                                    <p className="text-[10px] text-white/35 mt-0.5">O tuve que acortarla</p>
                                </div>
                                <button onClick={() => setRealStats(p => ({ ...p, entera: !p.entera }))}
                                    className={`w-11 h-6 rounded-full p-0.5 transition-colors ${realStats.entera ? 'bg-emerald-500' : 'bg-white/10'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${realStats.entera ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {/* RPE */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                                        <Activity size={12} /> Esfuerzo percibido (RPE)
                                    </label>
                                    <span className={`text-lg font-black ${realStats.percepcion <= 3 ? 'text-emerald-400' : realStats.percepcion <= 6 ? 'text-dunr-orange' : 'text-red-400'}`}>
                                        {realStats.percepcion}/10
                                    </span>
                                </div>
                                <div className="grid grid-cols-5 gap-1.5">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                        <button key={n} onClick={() => setRealStats(p => ({ ...p, percepcion: n }))}
                                            className={`h-11 rounded-xl font-black text-sm transition-all border-2 ${realStats.percepcion === n
                                                ? n <= 3 ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                                    : n <= 6 ? 'bg-dunr-orange/20 border-dunr-orange text-dunr-orange'
                                                    : 'bg-red-500/20 border-red-500 text-red-400'
                                                : 'bg-white/5 border-white/5 text-white/25 hover:border-white/15'}`}>
                                            {n}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-between text-[9px] text-white/20 font-bold mt-1.5 px-0.5">
                                    <span>Fácil</span><span>Moderado</span><span>Máximo</span>
                                </div>
                            </div>

                            {/* Note */}
                            <div>
                                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                                    <MessageSquare size={11} /> Sensaciones (opcional)
                                </label>
                                <textarea value={realStats.nota}
                                    onChange={e => setRealStats(p => ({ ...p, nota: e.target.value.slice(0, 140) }))}
                                    className="input-field text-sm resize-none !min-h-[72px]" rows={3} maxLength={140}
                                    placeholder="Piernas cargadas, mucho viento, terreno técnico..." />
                                <p className="text-right text-[10px] text-white/20 mt-1">{realStats.nota.length}/140</p>
                            </div>

                            {/* Device stats toggle */}
                            <div className="pt-4 border-t border-white/5">
                                <button onClick={() => setShowDeviceStats(!showDeviceStats)}
                                    className="w-full flex items-center justify-between text-white/30 hover:text-white/60 transition-colors py-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <Gauge size={11} /> Datos de GPS o pulsómetro
                                    </span>
                                    <ChevronDown size={14} className={`transition-transform ${showDeviceStats ? 'rotate-180' : ''}`} />
                                </button>

                                {showDeviceStats && (
                                    <div className="mt-4 grid grid-cols-2 gap-3 animate-fade-in">
                                        {[
                                            { label: 'FC Media (ppm)', key: 'fc_media', icon: Activity },
                                            { label: 'FC Máxima (ppm)', key: 'fc_maxima', icon: Activity },
                                            { label: 'Desnivel (m)', key: 'desnivel', icon: Mountain },
                                            { label: 'Vel. media (km/h)', key: 'velocidad', icon: Gauge, step: '0.1' },
                                        ].map(({ label, key, icon: Icon, step }) => (
                                            <div key={key} className="relative">
                                                <label className="block text-[9px] font-bold text-white/25 uppercase tracking-wider mb-1.5 ml-1">{label}</label>
                                                <div className="relative">
                                                    <Icon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/15" />
                                                    <input type="number" step={step} value={realStats[key]}
                                                        onChange={e => setRealStats(p => ({ ...p, [key]: e.target.value }))}
                                                        className="input-field !py-2.5 !pl-8 !text-sm" placeholder="0" />
                                                </div>
                                            </div>
                                        ))}
                                        <div className="col-span-2 relative">
                                            <label className="block text-[9px] font-bold text-white/25 uppercase tracking-wider mb-1.5 ml-1">Cadencia media (rpm)</label>
                                            <div className="relative">
                                                <Zap size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/15" />
                                                <input type="number" value={realStats.cadencia}
                                                    onChange={e => setRealStats(p => ({ ...p, cadencia: e.target.value }))}
                                                    className="input-field !py-2.5 !pl-8 !text-sm" placeholder="0" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* CTA buttons */}
                            <div className="space-y-3 pt-2">
                                {!session.completada ? (
                                    <button onClick={() => handleComplete()} disabled={saving}
                                        className="btn-primary w-full !py-4 !text-xs !font-black !uppercase !tracking-widest shadow-xl shadow-dunr-orange/20">
                                        {saving ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                Guardando...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <CheckCircle size={16} /> Marcar como completada
                                            </span>
                                        )}
                                    </button>
                                ) : (
                                    <button onClick={() => handleComplete(true)} disabled={saving}
                                        className="btn-primary w-full !py-4 !text-xs !font-black !uppercase !tracking-widest">
                                        {saving ? 'Guardando...' : 'Guardar cambios'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
