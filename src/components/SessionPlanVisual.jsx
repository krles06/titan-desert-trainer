import { useState } from 'react'
import { CheckCircle, Circle, Droplets, Apple, Zap, Mountain, Activity, Heart, Wind } from 'lucide-react'

// ── Zone helpers ──────────────────────────────────────────────────────────────
const ZONE = {
    1: { label: 'Z1', name: 'Recuperación', color: '#60a5fa', bg: 'bg-blue-500/15',   text: 'text-blue-400',    border: 'border-blue-500/25' },
    2: { label: 'Z2', name: 'Resistencia',  color: '#34d399', bg: 'bg-emerald-500/15',text: 'text-emerald-400', border: 'border-emerald-500/25' },
    3: { label: 'Z3', name: 'Tempo',        color: '#fbbf24', bg: 'bg-yellow-500/15', text: 'text-yellow-400',  border: 'border-yellow-500/25' },
    4: { label: 'Z4', name: 'Umbral',       color: '#fb923c', bg: 'bg-orange-500/15', text: 'text-orange-400',  border: 'border-orange-500/25' },
    5: { label: 'Z5', name: 'VO2max',       color: '#f87171', bg: 'bg-red-500/15',    text: 'text-red-400',     border: 'border-red-500/25' },
}

function ZoneBadge({ zone, rpe, size = 'sm' }) {
    const z = ZONE[zone] || ZONE[2]
    const textSize = size === 'xs' ? 'text-[9px]' : 'text-[10px]'
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border font-black uppercase tracking-wider ${textSize} ${z.bg} ${z.text} ${z.border}`}>
            {z.label}{rpe ? ` · RPE ${rpe}` : ''}
        </span>
    )
}

// ── INTERVALOS ────────────────────────────────────────────────────────────────
function IntervalosPlan({ meta }) {
    const [done, setDone] = useState([])
    const toggle = (i) => setDone(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
    const allDone = done.length === meta.series

    return (
        <div className="space-y-4">
            {/* Structure diagram */}
            <div>
                <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-2.5">Estructura de la sesión</p>
                <div className="flex items-end gap-1 overflow-x-auto pb-1">
                    {/* Warmup */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className={`w-14 rounded-t-xl flex items-end justify-center pb-1.5 ${ZONE[2].bg}`} style={{ height: 40 }}>
                            <span className="text-[8px] font-black text-emerald-400">{meta.cal_min}'</span>
                        </div>
                        <span className="text-[8px] text-white/25 font-bold">Cal.</span>
                    </div>

                    {/* Arrow */}
                    <div className="text-white/15 text-xs mb-4">›</div>

                    {/* Series + recovery pairs */}
                    {Array.from({ length: meta.series }).map((_, i) => (
                        <div key={i} className="flex items-end gap-1 shrink-0">
                            <div className="flex flex-col items-center gap-1">
                                <div className={`w-10 rounded-t-xl flex items-end justify-center pb-1 ${ZONE[meta.ser_zona]?.bg || ZONE[5].bg}`}
                                    style={{ height: 64 }}>
                                    <span className={`text-[8px] font-black ${ZONE[meta.ser_zona]?.text || 'text-red-400'}`}>{meta.ser_min}'</span>
                                </div>
                                <span className="text-[8px] text-white/25 font-bold">S{i + 1}</span>
                            </div>
                            {i < meta.series - 1 && (
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                    <div className={`w-7 rounded-t-xl flex items-end justify-center pb-1 ${ZONE[1].bg}`} style={{ height: 24 }}>
                                        <span className="text-[7px] font-black text-blue-400">{meta.rec_min}'</span>
                                    </div>
                                    <span className="text-[7px] text-white/15 font-bold">Rec</span>
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="text-white/15 text-xs mb-4">›</div>

                    {/* Cooldown */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className={`w-14 rounded-t-xl flex items-end justify-center pb-1.5 ${ZONE[1].bg}`} style={{ height: 32 }}>
                            <span className="text-[8px] font-black text-blue-400">{meta.cal_final_min}'</span>
                        </div>
                        <span className="text-[8px] text-white/25 font-bold">Calma</span>
                    </div>
                </div>
            </div>

            {/* Summary pills */}
            <div className="flex flex-wrap gap-2">
                <ZoneBadge zone={meta.ser_zona} rpe={meta.ser_rpe} />
                <span className="text-[10px] font-black text-white/30 px-2 py-0.5 rounded-lg bg-white/5 border border-white/8">
                    {meta.series} × {meta.ser_min}min
                </span>
                <span className="text-[10px] font-black text-white/30 px-2 py-0.5 rounded-lg bg-white/5 border border-white/8">
                    Rec {meta.rec_min}min
                </span>
            </div>

            {/* Series checklist */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] font-black text-white/25 uppercase tracking-widest">Marcar series</p>
                    {allDone && (
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">¡Completadas!</span>
                    )}
                </div>
                <div className="space-y-1.5">
                    {Array.from({ length: meta.series }).map((_, i) => {
                        const isDone = done.includes(i)
                        return (
                            <button key={i} onClick={() => toggle(i)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${isDone ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-white/3 border-white/6 hover:border-white/12'}`}>
                                {isDone
                                    ? <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                                    : <Circle size={16} className="text-white/20 shrink-0" />
                                }
                                <span className={`text-xs font-bold flex-1 text-left ${isDone ? 'text-white/40 line-through' : 'text-white/70'}`}>
                                    Serie {i + 1} — {meta.ser_min} min
                                </span>
                                <ZoneBadge zone={meta.ser_zona} rpe={meta.ser_rpe} size="xs" />
                                <span className="text-[9px] text-white/20 shrink-0">+ {meta.rec_min}' rec</span>
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

    // Gradient visual: normalize to max 20% for display
    const gradientDisplay = Math.min(meta.pendiente_pct, 20)
    const gradientHeight = 20 + (gradientDisplay / 20) * 44

    return (
        <div className="space-y-4">
            {/* Gradient + summary */}
            <div className="grid grid-cols-2 gap-3">
                {/* Hill visual */}
                <div className="bg-white/4 rounded-2xl p-4 flex flex-col items-center justify-end border border-white/6" style={{ minHeight: 100 }}>
                    <div className="w-full flex items-end justify-center gap-1 mb-2">
                        <div className="w-full bg-white/5 rounded-sm" style={{ height: 4 }} />
                        <div className="bg-amber-500/60 rounded-t-sm shrink-0" style={{ width: 32, height: gradientHeight }} />
                    </div>
                    <p className="text-2xl font-black text-amber-400 leading-none">{meta.pendiente_pct}%</p>
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider mt-1">Pendiente objetivo</p>
                </div>

                {/* Key stats */}
                <div className="space-y-2">
                    <div className="bg-white/4 rounded-xl p-3 border border-white/6">
                        <p className="text-[9px] text-white/25 font-bold uppercase tracking-wider">Repeticiones</p>
                        <p className="text-xl font-black text-white">{meta.reps} <span className="text-xs text-white/30">× {meta.rep_min}min</span></p>
                    </div>
                    <div className="bg-white/4 rounded-xl p-3 border border-white/6">
                        <p className="text-[9px] text-white/25 font-bold uppercase tracking-wider">Recuperación</p>
                        <p className="text-lg font-black text-white">{meta.rec_min}<span className="text-xs text-white/30">min</span></p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <ZoneBadge zone={meta.zona} rpe={meta.rpe} />
                <span className="text-[10px] font-black text-white/30 px-2 py-0.5 rounded-lg bg-white/5 border border-white/8">
                    Cal. {meta.cal_min}min + Calma {meta.cal_final_min}min
                </span>
            </div>

            {/* Rep checklist */}
            <div>
                <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-2">Marcar repeticiones</p>
                <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: meta.reps }).map((_, i) => {
                        const isDone = done.includes(i)
                        return (
                            <button key={i} onClick={() => toggle(i)}
                                className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${isDone ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-white/3 border-white/6 hover:border-white/12'}`}>
                                {isDone
                                    ? <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                                    : <Circle size={14} className="text-white/20 shrink-0" />
                                }
                                <span className={`text-xs font-bold ${isDone ? 'text-white/30 line-through' : 'text-white/70'}`}>Rep {i + 1}</span>
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
    return (
        <div className="space-y-3">
            {/* Zone target */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${ZONE[meta.zona]?.bg || ZONE[2].bg} ${ZONE[meta.zona]?.border || ZONE[2].border}`}>
                <Activity size={20} className={ZONE[meta.zona]?.text || 'text-emerald-400'} />
                <div>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Zona de trabajo principal</p>
                    <p className={`text-sm font-black ${ZONE[meta.zona]?.text || 'text-emerald-400'}`}>
                        {ZONE[meta.zona]?.label || 'Z2'} — {ZONE[meta.zona]?.name || 'Resistencia'}
                    </p>
                </div>
            </div>

            {/* Nutrition + hydration */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4">
                    <Apple size={18} className="text-amber-400 mb-2" />
                    <p className="text-[9px] text-amber-400/60 font-black uppercase tracking-widest mb-1">Nutrición</p>
                    <p className="text-2xl font-black text-white leading-none">
                        {meta.nutricion_min}<span className="text-xs text-white/30 ml-0.5">min</span>
                    </p>
                    <p className="text-[9px] text-white/30 mt-1">
                        {meta.calorias_hora ? `~${meta.calorias_hora} kcal/h` : 'Gel, barrita o plátano'}
                    </p>
                </div>

                <div className="bg-blue-500/8 border border-blue-500/20 rounded-2xl p-4">
                    <Droplets size={18} className="text-blue-400 mb-2" />
                    <p className="text-[9px] text-blue-400/60 font-black uppercase tracking-widest mb-1">Hidratación</p>
                    <p className="text-2xl font-black text-white leading-none">
                        {meta.hidratacion_min}<span className="text-xs text-white/30 ml-0.5">min</span>
                    </p>
                    <p className="text-[9px] text-white/30 mt-1">Bebe antes de tener sed</p>
                </div>
            </div>

            <div className="bg-white/3 border border-white/6 rounded-xl p-3">
                <p className="text-[10px] text-white/35 leading-relaxed">
                    💡 <strong className="text-white/50">Regla de oro:</strong> Come y bebe siguiendo el reloj, no cuando tengas hambre o sed. La fatiga en las etapas empieza siempre antes de notarla.
                </p>
            </div>
        </div>
    )
}

// ── RODAJE ────────────────────────────────────────────────────────────────────
function RodajePlan({ meta }) {
    const z = ZONE[meta.zona] || ZONE[2]
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                {/* Zone */}
                <div className={`p-4 rounded-2xl border ${z.bg} ${z.border} flex flex-col items-center justify-center`}>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Zona objetivo</p>
                    <p className={`text-4xl font-black ${z.text} leading-none`}>{z.label}</p>
                    <p className={`text-xs font-bold ${z.text} opacity-60 mt-1`}>{z.name}</p>
                </div>

                {/* RPE */}
                <div className="p-4 rounded-2xl bg-white/4 border border-white/6 flex flex-col items-center justify-center">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Esfuerzo RPE</p>
                    <p className="text-4xl font-black text-white leading-none">{meta.rpe}</p>
                    <p className="text-[10px] text-white/30 mt-1">de 10</p>
                </div>
            </div>

            {/* RPE scale context */}
            <div className="flex gap-1 items-center">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <div key={n} className={`flex-1 h-1.5 rounded-full transition-all ${n <= meta.rpe ? (meta.rpe <= 3 ? 'bg-emerald-400' : meta.rpe <= 6 ? 'bg-yellow-400' : 'bg-red-400') : 'bg-white/8'}`} />
                ))}
            </div>

            {meta.objetivo && (
                <div className="bg-white/3 border border-white/6 rounded-xl p-3 flex items-start gap-2">
                    <Zap size={13} className="text-dunr-orange shrink-0 mt-0.5" />
                    <p className="text-xs text-white/60 font-medium leading-relaxed">{meta.objetivo}</p>
                </div>
            )}
        </div>
    )
}

// ── DESCANSO ACTIVO ───────────────────────────────────────────────────────────
function DescansoActivoPlan({ meta }) {
    return (
        <div className="space-y-3">
            {/* RPE max */}
            <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <Heart size={24} className="text-emerald-400" />
                </div>
                <div>
                    <p className="text-[9px] font-black text-emerald-400/60 uppercase tracking-widest mb-0.5">Intensidad máxima</p>
                    <p className="text-2xl font-black text-white">RPE {meta.rpe_max}<span className="text-sm text-white/30">/10</span></p>
                    <p className="text-[10px] text-white/30 mt-0.5">Zona 1 — Mantén la conversación cómoda</p>
                </div>
            </div>

            {/* Activities */}
            {meta.actividades?.length > 0 && (
                <div>
                    <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-2">Actividades sugeridas</p>
                    <div className="flex flex-wrap gap-2">
                        {meta.actividades.map((act, i) => (
                            <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/8 rounded-full text-xs font-bold text-white/60">
                                <Wind size={10} className="text-emerald-400" />
                                {act}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white/3 border border-white/6 rounded-xl p-3">
                <p className="text-[10px] text-white/35 leading-relaxed">
                    🔁 <strong className="text-white/50">Supercompensación:</strong> Tu cuerpo se fortalece durante el descanso, no durante el esfuerzo. Esta sesión es tan importante como cualquier intervalo.
                </p>
            </div>
        </div>
    )
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function SessionPlanVisual({ session }) {
    const meta = session?.metadata
    if (!meta) return null

    const TITLES = {
        intervalos:        { icon: Zap,      label: 'Plan de series',       color: 'text-red-400' },
        fuerza:            { icon: Mountain, label: 'Plan de subidas',       color: 'text-amber-400' },
        largo:             { icon: Activity, label: 'Guía de ruta larga',    color: 'text-white' },
        rodaje:            { icon: Activity, label: 'Objetivo del rodaje',   color: 'text-yellow-400' },
        'descanso activo': { icon: Heart,    label: 'Protocolo de descanso', color: 'text-emerald-400' },
    }

    const t = TITLES[session.tipo] || TITLES.rodaje
    const Icon = t.icon

    return (
        <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: '0.12s' }}>
            <div className="flex items-center gap-2 mb-4">
                <Icon size={14} className={t.color} />
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t.label}</h3>
            </div>

            {session.tipo === 'intervalos'        && <IntervalosPlan meta={meta} />}
            {session.tipo === 'fuerza'            && <FuerzaPlan meta={meta} />}
            {session.tipo === 'largo'             && <LargoPlan meta={meta} />}
            {session.tipo === 'rodaje'            && <RodajePlan meta={meta} />}
            {session.tipo === 'descanso activo'   && <DescansoActivoPlan meta={meta} />}
        </div>
    )
}
