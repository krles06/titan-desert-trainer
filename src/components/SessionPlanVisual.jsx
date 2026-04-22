import { useState } from 'react'
import {
    CheckCircle, Circle, Droplets, Apple, Zap,
    Mountain, Activity, Heart, Wind, TrendingUp, MapPin, ChevronDown
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────────
const ZONE = {
    1: { label: 'Z1', name: 'Recuperación', color: '#60a5fa', bg: 'bg-blue-500/15',    text: 'text-blue-400',    border: 'border-blue-500/25' },
    2: { label: 'Z2', name: 'Resistencia',  color: '#34d399', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/25' },
    3: { label: 'Z3', name: 'Tempo',        color: '#fbbf24', bg: 'bg-yellow-500/15',  text: 'text-yellow-400',  border: 'border-yellow-500/25' },
    4: { label: 'Z4', name: 'Umbral',       color: '#fb923c', bg: 'bg-orange-500/15',  text: 'text-orange-400',  border: 'border-orange-500/25' },
    5: { label: 'Z5', name: 'VO2max',       color: '#f87171', bg: 'bg-red-500/15',     text: 'text-red-400',     border: 'border-red-500/25' },
}

const z = (zone) => ZONE[zone] || ZONE[2]
// Safe numeric: returns fallback if value is null, undefined, or NaN
const n = (val, fallback = 0) =>
    val !== null && val !== undefined && !isNaN(Number(val)) ? Number(val) : fallback

function ZoneBadge({ zone, rpe, size = 'sm' }) {
    const zz = z(zone)
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border font-black uppercase tracking-wider
            ${size === 'xs' ? 'text-[9px]' : 'text-[10px]'} ${zz.bg} ${zz.text} ${zz.border}`}>
            {zz.label}{rpe > 0 ? ` · RPE ${rpe}` : ''}
        </span>
    )
}

// ── INTERVALOS ────────────────────────────────────────────────────────────────
function IntervalosPlan({ meta }) {
    const [done, setDone] = useState([])
    const toggle = (i) => setDone(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])

    const series    = Math.max(n(meta.series, 1), 1)
    const calMin    = n(meta.cal_min, 10)
    const calFin    = n(meta.cal_final_min, 5)
    const serMin    = n(meta.ser_min, 5)
    const serZona   = n(meta.ser_zona, 4)
    const serRpe    = n(meta.ser_rpe, 0)
    const recMin    = n(meta.rec_min, 2)
    const allDone   = done.length === series

    // Bar heights proportional to actual durations (min 14px, max 68px)
    const maxD = Math.max(calMin, serMin, calFin, recMin, 1)
    const barH = (min) => Math.max(14, Math.round((n(min) / maxD) * 68))

    return (
        <div className="space-y-5">
            {/* ── Session structure diagram ── */}
            <div>
                <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-3">
                    Estructura de la sesión
                </p>
                <div className="flex items-end gap-1.5 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                    {/* Warmup */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className={`w-12 rounded-t-lg border border-emerald-500/20 ${ZONE[2].bg} flex items-center justify-center`}
                            style={{ height: barH(calMin) }}>
                            <span className="text-[8px] font-black text-emerald-400">{calMin}'</span>
                        </div>
                        <span className="text-[8px] text-white/20 font-bold">Cal.</span>
                    </div>

                    <div className="text-white/15 text-sm mb-5 shrink-0">›</div>

                    {/* Series + recovery pairs */}
                    {Array.from({ length: series }).map((_, i) => (
                        <div key={i} className="flex items-end gap-1 shrink-0">
                            <div className="flex flex-col items-center gap-1">
                                <div className={`w-9 rounded-t-lg border ${z(serZona).bg} ${z(serZona).border} flex items-center justify-center`}
                                    style={{ height: barH(serMin) }}>
                                    <span className={`text-[8px] font-black ${z(serZona).text}`}>{serMin}'</span>
                                </div>
                                <span className="text-[8px] text-white/20 font-bold">S{i + 1}</span>
                            </div>
                            {/* Recovery only between series, not after the last */}
                            {i < series - 1 && (
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                    <div className={`w-6 rounded-t-lg ${ZONE[1].bg} flex items-center justify-center`}
                                        style={{ height: barH(recMin) }}>
                                        <span className="text-[7px] font-black text-blue-400">{recMin}'</span>
                                    </div>
                                    <span className="text-[7px] text-white/15 font-bold">Rec</span>
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="text-white/15 text-sm mb-5 shrink-0">›</div>

                    {/* Cooldown */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className={`w-12 rounded-t-lg border border-blue-500/20 ${ZONE[1].bg} flex items-center justify-center`}
                            style={{ height: barH(calFin) }}>
                            <span className="text-[8px] font-black text-blue-400">{calFin}'</span>
                        </div>
                        <span className="text-[8px] text-white/20 font-bold">Calma</span>
                    </div>
                </div>
            </div>

            {/* ── Summary pills ── */}
            <div className="flex flex-wrap gap-2">
                <ZoneBadge zone={serZona} rpe={serRpe} />
                <span className="text-[10px] font-black text-white/30 px-2.5 py-1 rounded-lg bg-white/5 border border-white/8">
                    {series} × {serMin} min
                </span>
                <span className="text-[10px] font-black text-white/30 px-2.5 py-1 rounded-lg bg-white/5 border border-white/8">
                    Rec {recMin} min
                </span>
            </div>

            {/* ── Interactive series checklist ── */}
            <div>
                <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[9px] font-black text-white/25 uppercase tracking-widest">Marcar series</p>
                    <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${allDone ? 'text-emerald-400' : 'text-white/20'}`}>
                        {done.length}/{series}{allDone ? ' 🔥' : ''}
                    </span>
                </div>
                <div className="space-y-1.5">
                    {Array.from({ length: series }).map((_, i) => {
                        const isDone  = done.includes(i)
                        const isLast  = i === series - 1
                        return (
                            <button key={i} onClick={() => toggle(i)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                                    ${isDone
                                        ? 'bg-emerald-500/8 border-emerald-500/20'
                                        : 'bg-white/3 border-white/6 active:border-white/12'}`}>
                                {isDone
                                    ? <CheckCircle size={15} className="text-emerald-400 shrink-0" />
                                    : <Circle      size={15} className="text-white/20 shrink-0" />
                                }
                                <span className={`text-xs font-bold flex-1 ${isDone ? 'text-white/30 line-through' : 'text-white/70'}`}>
                                    Serie {i + 1} — {serMin} min
                                </span>
                                <ZoneBadge zone={serZona} rpe={serRpe} size="xs" />
                                {/* No recovery shown after the last series */}
                                {!isLast && (
                                    <span className="text-[9px] text-white/20 shrink-0 ml-1">+{recMin}' rec</span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

// ── FUERZA ────────────────────────────────────────────────────────────────────
function FuerzaPlan({ meta }) {
    const [done, setDone] = useState([])
    const toggle = (i) => setDone(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])

    const reps       = Math.max(n(meta.reps, 4), 1)
    const repMin     = n(meta.rep_min, 5)
    const pendiente  = n(meta.pendiente_pct, 8)
    const recMin     = n(meta.rec_min, 3)
    const calMin     = n(meta.cal_min, 10)
    const calFin     = n(meta.cal_final_min, 5)
    const zona       = n(meta.zona, 4)
    const rpe        = n(meta.rpe, 0)
    const allDone    = done.length === reps

    // Slope height: scales from 20% at 5% grade to 85% at 20%+ grade
    const slopeRatio = Math.min(Math.max((pendiente - 3) / 17, 0.15), 1)

    return (
        <div className="space-y-4">
            {/* ── Hill + key stats ── */}
            <div className="grid grid-cols-2 gap-3">
                {/* Slope visualization using clip-path triangle */}
                <div className="bg-white/4 rounded-2xl border border-white/6 overflow-hidden relative"
                    style={{ minHeight: 108 }}>
                    {/* Slope fill — right-triangle pointing up-right */}
                    <div className="absolute inset-0"
                        style={{
                            background: 'linear-gradient(to top, rgba(245,158,11,0.35), rgba(245,158,11,0.06))',
                            clipPath: `polygon(0 100%, 100% ${Math.round((1 - slopeRatio) * 100)}%, 100% 100%)`,
                        }} />
                    {/* Ground line */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
                    {/* Label centered */}
                    <div className="relative flex flex-col items-center justify-center h-full py-4 gap-0.5">
                        <p className="text-3xl font-black text-amber-400 leading-none">{pendiente}%</p>
                        <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Pendiente</p>
                    </div>
                </div>

                {/* Key stats */}
                <div className="space-y-2">
                    <div className="bg-white/4 rounded-xl p-3 border border-white/6">
                        <p className="text-[9px] text-white/25 font-bold uppercase tracking-wider">Repeticiones</p>
                        <p className="text-xl font-black text-white leading-tight">
                            {reps} <span className="text-xs text-white/30">× {repMin}min</span>
                        </p>
                    </div>
                    <div className="bg-white/4 rounded-xl p-3 border border-white/6">
                        <p className="text-[9px] text-white/25 font-bold uppercase tracking-wider">Recuperación</p>
                        <p className="text-xl font-black text-white leading-tight">
                            {recMin}<span className="text-xs text-white/30">min</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Pills ── */}
            <div className="flex flex-wrap gap-2">
                <ZoneBadge zone={zona} rpe={rpe} />
                <span className="text-[10px] font-black text-white/30 px-2.5 py-1 rounded-lg bg-white/5 border border-white/8">
                    Cal. {calMin}' + Calma {calFin}'
                </span>
            </div>

            {/* ── Rep checklist ── */}
            <div>
                <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[9px] font-black text-white/25 uppercase tracking-widest">Marcar repeticiones</p>
                    <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${allDone ? 'text-emerald-400' : 'text-white/20'}`}>
                        {done.length}/{reps}{allDone ? ' 🔥' : ''}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: reps }).map((_, i) => {
                        const isDone = done.includes(i)
                        return (
                            <button key={i} onClick={() => toggle(i)}
                                className={`flex items-center gap-2 p-3 rounded-xl border transition-all
                                    ${isDone ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-white/3 border-white/6 active:border-white/12'}`}>
                                {isDone
                                    ? <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                                    : <Circle      size={14} className="text-white/20 shrink-0" />
                                }
                                <span className={`text-xs font-bold flex-1 text-left ${isDone ? 'text-white/30 line-through' : 'text-white/70'}`}>
                                    Rep {i + 1}
                                </span>
                                <span className={`text-[9px] font-bold shrink-0 ${isDone ? 'text-white/15' : 'text-white/25'}`}>
                                    {repMin}'
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

// ── LARGO ─────────────────────────────────────────────────────────────────────
function LargoPlan({ meta }) {
    const zona          = n(meta.zona, 2)
    const nutricionMin  = n(meta.nutricion_min, 30)
    const hidratMin     = n(meta.hidratacion_min, 15)
    const calHora       = n(meta.calorias_hora, 0)
    const zz            = z(zona)

    return (
        <div className="space-y-3">
            {/* ── Zone target ── */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${zz.bg} ${zz.border}`}>
                <Activity size={20} className={zz.text} />
                <div>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Zona de trabajo principal</p>
                    <p className={`text-sm font-black ${zz.text}`}>{zz.label} — {zz.name}</p>
                </div>
            </div>

            {/* ── Nutrition + hydration ──
                Labels say "Comer cada" / "Beber cada" so the number is immediately clear */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4">
                    <Apple size={18} className="text-amber-400 mb-2" />
                    <p className="text-[9px] text-amber-400/60 font-black uppercase tracking-widest mb-0.5">Comer cada</p>
                    <p className="text-2xl font-black text-white leading-none">
                        {nutricionMin}<span className="text-xs text-white/30 ml-0.5">min</span>
                    </p>
                    {calHora > 0 && (
                        <p className="text-[9px] text-white/30 font-bold mt-1.5">~{calHora} kcal/h</p>
                    )}
                </div>

                <div className="bg-blue-500/8 border border-blue-500/20 rounded-2xl p-4">
                    <Droplets size={18} className="text-blue-400 mb-2" />
                    <p className="text-[9px] text-blue-400/60 font-black uppercase tracking-widest mb-0.5">Beber cada</p>
                    <p className="text-2xl font-black text-white leading-none">
                        {hidratMin}<span className="text-xs text-white/30 ml-0.5">min</span>
                    </p>
                    <p className="text-[9px] text-white/30 font-bold mt-1.5">Antes de tener sed</p>
                </div>
            </div>

            <div className="bg-white/3 border border-white/6 rounded-xl p-3">
                <p className="text-[10px] text-white/40 leading-relaxed">
                    <span className="text-white/55 font-black">Regla de oro — </span>
                    Come y bebe siguiendo el reloj, no cuando tengas hambre o sed. El desajuste energético en etapas siempre llega antes de que lo notes.
                </p>
            </div>
        </div>
    )
}

// ── RODAJE ────────────────────────────────────────────────────────────────────
function RodajePlan({ meta }) {
    const zona = n(meta.zona, 2)
    const rpe  = n(meta.rpe, 5)
    const zz   = z(zona)

    const rpeColor = rpe <= 3 ? 'bg-emerald-400' : rpe <= 6 ? 'bg-yellow-400' : 'bg-red-400'
    const rpeLabel = rpe <= 3 ? 'Muy fácil' : rpe <= 5 ? 'Cómodo' : rpe <= 7 ? 'Moderado' : 'Duro'

    return (
        <div className="space-y-3">
            {/* ── Zone + RPE side by side ── */}
            <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-2xl border ${zz.bg} ${zz.border} flex flex-col items-center justify-center gap-0.5`}
                    style={{ minHeight: 100 }}>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Zona objetivo</p>
                    <p className={`text-5xl font-black ${zz.text} leading-none`}>{zz.label}</p>
                    <p className={`text-[10px] font-bold ${zz.text} opacity-60`}>{zz.name}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/4 border border-white/6 flex flex-col items-center justify-center gap-0.5"
                    style={{ minHeight: 100 }}>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Esfuerzo RPE</p>
                    <p className="text-5xl font-black text-white leading-none">{rpe}</p>
                    <p className="text-[10px] text-white/30">{rpeLabel}</p>
                </div>
            </div>

            {/* ── RPE scale bar ── */}
            <div>
                <div className="flex gap-1 mb-1.5">
                    {[1,2,3,4,5,6,7,8,9,10].map(i => (
                        <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i <= rpe ? rpeColor : 'bg-white/8'}`} />
                    ))}
                </div>
                <div className="flex justify-between text-[8px] text-white/20 font-bold px-0.5">
                    <span>Muy fácil</span><span>Moderado</span><span>Máximo</span>
                </div>
            </div>

            {/* ── Objective pill ── */}
            {meta.objetivo && (
                <div className="bg-white/3 border border-white/6 rounded-xl p-3 flex items-start gap-2">
                    <Zap size={13} className="text-dunr-orange shrink-0 mt-0.5" />
                    <p className="text-xs text-white/60 font-medium leading-relaxed italic">
                        "{meta.objetivo}"
                    </p>
                </div>
            )}
        </div>
    )
}

// ── DESCANSO ACTIVO ───────────────────────────────────────────────────────────
function DescansoActivoPlan({ meta }) {
    const rpeMax     = n(meta.rpe_max, 3)
    const actividades = Array.isArray(meta.actividades) ? meta.actividades : []

    return (
        <div className="space-y-3">
            {/* ── Max intensity card ── */}
            <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <Heart size={22} className="text-emerald-400" />
                </div>
                <div>
                    <p className="text-[9px] font-black text-emerald-400/60 uppercase tracking-widest mb-0.5">
                        Intensidad máxima hoy
                    </p>
                    <p className="text-2xl font-black text-white leading-none">
                        RPE {rpeMax}<span className="text-sm text-white/30">/10</span>
                    </p>
                    <p className="text-[10px] text-white/35 mt-0.5">
                        Z1 — Debes poder hablar sin dificultad
                    </p>
                </div>
            </div>

            {/* ── Activity pills ── */}
            {actividades.length > 0 && (
                <div>
                    <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-2">
                        Actividades sugeridas
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {actividades.map((act, i) => (
                            <span key={i}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/8 rounded-full text-xs font-bold text-white/55">
                                <Wind size={10} className="text-emerald-400 shrink-0" />
                                {act}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white/3 border border-white/6 rounded-xl p-3">
                <p className="text-[10px] text-white/40 leading-relaxed">
                    <span className="text-white/55 font-black">Supercompensación — </span>
                    Tu cuerpo se fortalece durante el descanso, no durante el esfuerzo. Esta sesión es tan importante como cualquier intervalo.
                </p>
            </div>
        </div>
    )
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
const TITLES = {
    intervalos:        { icon: Zap,        label: 'Plan de series',        color: 'text-red-400',     accent: '#f87171' },
    fuerza:            { icon: Mountain,   label: 'Plan de subidas',        color: 'text-amber-400',   accent: '#f59e0b' },
    largo:             { icon: MapPin,     label: 'Guía de ruta larga',     color: 'text-white/70',    accent: '#ffffff' },
    rodaje:            { icon: TrendingUp, label: 'Objetivo del rodaje',    color: 'text-yellow-400',  accent: '#facc15' },
    'descanso activo': { icon: Heart,      label: 'Protocolo de descanso',  color: 'text-emerald-400', accent: '#34d399' },
}

export default function SessionPlanVisual({ session }) {
    const [collapsed, setCollapsed] = useState(false)
    const meta = session?.metadata
    if (!meta) return null

    const t    = TITLES[session.tipo] || TITLES.rodaje
    const Icon = t.icon

    return (
        <div className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '0.16s' }}>
            {/* ── Header (tap to collapse) ── */}
            <button
                onClick={() => setCollapsed(c => !c)}
                className="w-full flex items-center justify-between px-5 pt-5 pb-4 text-left">
                <div className="flex items-center gap-2">
                    <Icon size={14} className={t.color} />
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                        {t.label}
                    </h3>
                </div>
                <ChevronDown
                    size={14}
                    className={`text-white/20 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
                />
            </button>

            {/* ── Accent divider ── */}
            {!collapsed && (
                <div className="mx-5 mb-5 h-px"
                    style={{ background: `linear-gradient(to right, ${t.accent}40, transparent)` }} />
            )}

            {/* ── Content ── */}
            {!collapsed && (
                <div className="px-5 pb-5">
                    {session.tipo === 'intervalos'      && <IntervalosPlan meta={meta} />}
                    {session.tipo === 'fuerza'          && <FuerzaPlan meta={meta} />}
                    {session.tipo === 'largo'           && <LargoPlan meta={meta} />}
                    {session.tipo === 'rodaje'          && <RodajePlan meta={meta} />}
                    {session.tipo === 'descanso activo' && <DescansoActivoPlan meta={meta} />}
                </div>
            )}
        </div>
    )
}
