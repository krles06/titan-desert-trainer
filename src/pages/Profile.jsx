import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    User, Mail, LogOut, RefreshCw, ChevronRight,
    Save, Shield, Info, Bike, Heart, AlertCircle
} from 'lucide-react'
import DunrLogo from '../components/DunrLogo'

const TIPO_BICI_LABELS = {
    hardtail: '🚵 Hardtail MTB',
    full_suspension: '🏔️ Full Suspension',
    gravel: '🛤️ Gravel',
    carretera: '🚴 Carretera',
}
const TERRENO_LABELS = {
    montana: '⛰️ Montaña y pistas',
    mixto: '🔀 Mixto',
    asfalto: '🛣️ Asfalto',
}
const NIVEL_LABELS = {
    principiante: 'Principiante',
    intermedio: 'Intermedio',
    avanzado: 'Avanzado',
}

function StatItem({ label, value }) {
    return (
        <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/25">{label}</p>
            <p className="text-sm font-bold text-white mt-0.5">{value || '—'}</p>
        </div>
    )
}

function SectionTitle({ children }) {
    return (
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">{children}</p>
    )
}

export default function Profile() {
    const { user, profile, signOut, saveProfile } = useAuth()
    const navigate = useNavigate()
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [form, setForm] = useState(profile || {})

    function update(field, value) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    function toggleLesion(val) {
        const current = form.lesiones || []
        if (val === 'ninguna') {
            update('lesiones', current.includes('ninguna') ? [] : ['ninguna'])
        } else {
            const filtered = current.filter(l => l !== 'ninguna')
            if (filtered.includes(val)) update('lesiones', filtered.filter(l => l !== val))
            else update('lesiones', [...filtered, val])
        }
    }

    async function handleSave() {
        setSaving(true)
        try {
            await saveProfile(form)
            setEditing(false)
            setSaved(true)
            setTimeout(() => setSaved(false), 2500)
        } catch (err) {
            console.error('Error saving profile:', err)
        } finally {
            setSaving(false)
        }
    }

    async function handleLogout() {
        await signOut()
        navigate('/')
    }

    const lesiones = profile?.lesiones?.filter(l => l !== 'ninguna') || []

    return (
        <div className="min-h-screen bg-dunr-black pb-32 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-dunr-orange/5 rounded-full blur-3xl -mr-40 -mt-40" />

            {/* Saved toast */}
            {saved && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
                    <div className="flex items-center gap-2 bg-dunr-orange text-black text-xs font-black uppercase tracking-widest px-5 py-3 rounded-2xl shadow-2xl">
                        <Save size={13} /> Perfil guardado
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="gradient-desert px-4 pt-10 pb-16 border-b border-white/5">
                <div className="max-w-lg mx-auto">
                    <h1 className="text-3xl font-black text-white mb-1.5 tracking-tighter">MI PERFIL</h1>
                    <div className="flex items-center gap-2 text-white/35">
                        <Mail size={13} />
                        <span className="text-xs font-bold">{user?.email || 'demo@dunr.app'}</span>
                    </div>
                </div>
            </div>

            <div className="px-4 -mt-4 max-w-lg mx-auto space-y-4">

                {/* ── PROFILE CARD ── */}
                <div className="glass-card p-6 animate-fade-in relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-dunr-orange/10 border border-dunr-orange/20 flex items-center justify-center">
                                <User size={26} className="text-dunr-orange" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">{profile?.nombre || 'Ciclista'}</h2>
                                <p className="text-[10px] font-black text-dunr-orange uppercase tracking-widest mt-0.5">
                                    {NIVEL_LABELS[profile?.nivel_experiencia] || 'Intermedio'}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => { setForm(profile || {}); setEditing(!editing) }}
                            className="bg-white/8 px-4 py-2 rounded-xl text-[10px] text-white font-black uppercase tracking-widest hover:bg-white/15 transition-colors">
                            {editing ? 'Cancelar' : 'Editar'}
                        </button>
                    </div>

                    {editing ? (
                        /* ── EDIT MODE ── */
                        <div className="space-y-6">

                            {/* Personal */}
                            <div>
                                <SectionTitle>Datos personales</SectionTitle>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Nombre', field: 'nombre', type: 'text', colSpan: true },
                                        { label: 'Edad', field: 'edad', unit: 'años' },
                                        { label: 'Peso', field: 'peso', unit: 'kg' },
                                        { label: 'Altura', field: 'altura', unit: 'cm' },
                                        { label: 'FC reposo', field: 'fc_reposo', unit: 'ppm' },
                                    ].map(({ label, field, type, unit, colSpan }) => (
                                        <div key={field} className={colSpan ? 'col-span-2' : ''}>
                                            <label className="block text-[9px] font-bold text-white/25 uppercase tracking-widest mb-1.5 ml-1">{label}{unit && ` (${unit})`}</label>
                                            <input type={type || 'number'} value={form[field] || ''}
                                                onChange={e => update(field, type === 'text' ? e.target.value : Number(e.target.value))}
                                                className="input-field !text-sm" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Performance */}
                            <div>
                                <SectionTitle>Rendimiento</SectionTitle>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Vel. media (km/h)', field: 'velocidad_media' },
                                        { label: 'Dist. máxima (km)', field: 'distancia_maxima' },
                                    ].map(({ label, field }) => (
                                        <div key={field}>
                                            <label className="block text-[9px] font-bold text-white/25 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
                                            <input type="number" value={form[field] || ''}
                                                onChange={e => update(field, Number(e.target.value))}
                                                className="input-field !text-sm" />
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-3">
                                    <label className="block text-[9px] font-bold text-white/25 uppercase tracking-widest mb-2 ml-1">Nivel de experiencia</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['principiante', 'intermedio', 'avanzado'].map(v => (
                                            <button key={v} type="button" onClick={() => update('nivel_experiencia', v)}
                                                className={`py-2.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-wide transition-all ${form.nivel_experiencia === v ? 'border-dunr-orange bg-dunr-orange text-black' : 'border-white/5 bg-white/5 text-white/40'}`}>
                                                {NIVEL_LABELS[v]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* MTB Profile */}
                            <div>
                                <SectionTitle>Perfil MTB</SectionTitle>

                                <div className="space-y-4">
                                    {/* Objetivo */}
                                    <div>
                                        <label className="block text-[9px] font-bold text-white/25 uppercase tracking-widest mb-2 ml-1">Objetivo en carrera</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { v: 'terminar', l: '🏁 Terminar' },
                                                { v: 'competir', l: '🏆 Competir' },
                                            ].map(({ v, l }) => (
                                                <button key={v} onClick={() => update('objetivo_carrera', v)}
                                                    className={`py-3 rounded-xl border-2 text-[11px] font-black transition-all ${form.objetivo_carrera === v ? 'border-dunr-orange bg-dunr-orange text-black' : 'border-white/5 bg-white/5 text-white/40'}`}>
                                                    {l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tipo bici */}
                                    <div>
                                        <label className="block text-[9px] font-bold text-white/25 uppercase tracking-widest mb-2 ml-1">Tipo de bicicleta</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(TIPO_BICI_LABELS).map(([v, l]) => (
                                                <button key={v} onClick={() => update('tipo_bici', v)}
                                                    className={`py-2.5 rounded-xl border-2 text-[10px] font-black transition-all ${form.tipo_bici === v ? 'border-dunr-orange bg-dunr-orange text-black' : 'border-white/5 bg-white/5 text-white/40'}`}>
                                                    {l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pulsómetro */}
                                    <div className="flex items-center justify-between p-3.5 bg-white/4 rounded-xl border border-white/8">
                                        <div>
                                            <p className="text-xs font-bold text-white">Pulsómetro / potenciómetro</p>
                                            <p className="text-[10px] text-white/35 mt-0.5">
                                                {form.tiene_pulsometro ? 'Las sesiones prescriben zonas FC' : 'Las sesiones usan escala RPE'}
                                            </p>
                                        </div>
                                        <button onClick={() => update('tiene_pulsometro', !form.tiene_pulsometro)}
                                            className={`w-11 h-6 rounded-full p-0.5 transition-colors ${form.tiene_pulsometro ? 'bg-dunr-orange' : 'bg-white/10'}`}>
                                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${form.tiene_pulsometro ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    {/* Terreno */}
                                    <div>
                                        <label className="block text-[9px] font-bold text-white/25 uppercase tracking-widest mb-2 ml-1">Terreno habitual</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {Object.entries(TERRENO_LABELS).map(([v, l]) => (
                                                <button key={v} onClick={() => update('terreno_habitual', v)}
                                                    className={`py-2.5 rounded-xl border-2 text-[10px] font-black transition-all ${form.terreno_habitual === v ? 'border-dunr-orange bg-dunr-orange text-black' : 'border-white/5 bg-white/5 text-white/40'}`}>
                                                    {l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Lesiones */}
                                    <div>
                                        <label className="block text-[9px] font-bold text-white/25 uppercase tracking-widest mb-2 ml-1">Lesiones o limitaciones</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { v: 'ninguna', l: '✓ Ninguna' },
                                                { v: 'rodilla', l: '🦵 Rodilla' },
                                                { v: 'espalda', l: '🔙 Espalda' },
                                                { v: 'hombro', l: '💪 Hombro' },
                                                { v: 'tobillo', l: '🦶 Tobillo' },
                                                { v: 'muneca', l: '✋ Muñeca' },
                                            ].map(({ v, l }) => {
                                                const sel = (form.lesiones || []).includes(v)
                                                return (
                                                    <button key={v} onClick={() => toggleLesion(v)}
                                                        className={`py-2.5 rounded-xl border-2 text-[10px] font-black transition-all ${sel ? 'border-dunr-orange bg-dunr-orange/10 text-dunr-orange' : 'border-white/5 bg-white/5 text-white/40'}`}>
                                                        {l}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Availability */}
                            <div>
                                <SectionTitle>Disponibilidad</SectionTitle>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[9px] font-bold text-white/25 uppercase tracking-widest mb-3 ml-1">
                                            Días/semana: <span className="text-dunr-orange font-black">{form.dias_entreno_semana || 4}</span>
                                        </label>
                                        <input type="range" min="2" max="6" value={form.dias_entreno_semana || 4}
                                            onChange={e => update('dias_entreno_semana', Number(e.target.value))}
                                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-dunr-orange" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold text-white/25 uppercase tracking-widest mb-3 ml-1">
                                            Min/día: <span className="text-dunr-orange font-black">{form.minutos_dia || 60}</span>
                                        </label>
                                        <input type="range" min="30" max="180" step="15" value={form.minutos_dia || 60}
                                            onChange={e => update('minutos_dia', Number(e.target.value))}
                                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-dunr-orange" />
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleSave} disabled={saving}
                                className="btn-primary w-full !py-4 !text-xs !font-black !uppercase !tracking-widest">
                                {saving ? 'Guardando...' : <span className="flex items-center justify-center gap-2"><Save size={15} /> Guardar cambios</span>}
                            </button>
                        </div>
                    ) : (
                        /* ── READ MODE ── */
                        <div className="space-y-6">
                            {/* Stats */}
                            <div>
                                <SectionTitle>Datos personales y rendimiento</SectionTitle>
                                <div className="grid grid-cols-3 gap-y-4 gap-x-2">
                                    <StatItem label="Edad" value={profile?.edad ? `${profile.edad} años` : null} />
                                    <StatItem label="Peso" value={profile?.peso ? `${profile.peso} kg` : null} />
                                    <StatItem label="Altura" value={profile?.altura ? `${profile.altura} cm` : null} />
                                    <StatItem label="FC reposo" value={profile?.fc_reposo ? `${profile.fc_reposo} ppm` : null} />
                                    <StatItem label="Vel. media" value={profile?.velocidad_media ? `${profile.velocidad_media} km/h` : null} />
                                    <StatItem label="Dist. máx." value={profile?.distancia_maxima ? `${profile.distancia_maxima} km` : null} />
                                    <StatItem label="Días/sem." value={profile?.dias_entreno_semana} />
                                    <StatItem label="Min/día" value={profile?.minutos_dia ? `${profile.minutos_dia} min` : null} />
                                </div>
                            </div>

                            {/* MTB profile */}
                            <div className="pt-4 border-t border-white/5">
                                <SectionTitle>Perfil MTB</SectionTitle>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/4 rounded-xl p-3">
                                        <p className="text-[9px] text-white/25 font-bold uppercase tracking-widest mb-1.5">Objetivo</p>
                                        <p className="text-sm font-black text-white">
                                            {profile?.objetivo_carrera === 'competir' ? '🏆 Competir' : '🏁 Terminar'}
                                        </p>
                                    </div>
                                    <div className="bg-white/4 rounded-xl p-3">
                                        <p className="text-[9px] text-white/25 font-bold uppercase tracking-widest mb-1.5">Bicicleta</p>
                                        <p className="text-sm font-black text-white">{TIPO_BICI_LABELS[profile?.tipo_bici] || '—'}</p>
                                    </div>
                                    <div className="bg-white/4 rounded-xl p-3">
                                        <p className="text-[9px] text-white/25 font-bold uppercase tracking-widest mb-1.5">Dispositivo</p>
                                        <p className="text-sm font-black text-white">
                                            {profile?.tiene_pulsometro ? '❤️ Pulsómetro' : '👁️ Sensaciones'}
                                        </p>
                                    </div>
                                    <div className="bg-white/4 rounded-xl p-3">
                                        <p className="text-[9px] text-white/25 font-bold uppercase tracking-widest mb-1.5">Terreno</p>
                                        <p className="text-sm font-black text-white">{TERRENO_LABELS[profile?.terreno_habitual] || '—'}</p>
                                    </div>
                                    {lesiones.length > 0 && (
                                        <div className="col-span-2 bg-amber-500/5 border border-amber-500/15 rounded-xl p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertCircle size={11} className="text-amber-400" />
                                                <p className="text-[9px] text-amber-400/70 font-bold uppercase tracking-widest">Limitaciones</p>
                                            </div>
                                            <p className="text-sm font-bold text-white capitalize">{lesiones.join(', ')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── PLAN MANAGEMENT ── */}
                <div className="glass-card overflow-hidden animate-fade-in border-white/5" style={{ animationDelay: '0.1s' }}>
                    <button onClick={() => navigate('/subscription')}
                        className="w-full flex items-center gap-4 px-6 py-5 hover:bg-white/5 transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-dunr-orange/10 flex items-center justify-center text-dunr-orange group-hover:bg-dunr-orange group-hover:text-black transition-colors">
                            <Shield size={18} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-white flex-1 text-left">Mi Suscripción</span>
                        <ChevronRight size={16} className="text-white/20" />
                    </button>

                    <div className="h-px bg-white/5" />

                    <div className="px-6 py-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-dunr-orange/10 flex items-center justify-center text-dunr-orange">
                                <RefreshCw size={17} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Gestión del plan</span>
                        </div>
                        <div className="space-y-2.5">
                            <button onClick={() => navigate('/adjust-plan?reason=cambio_dias')}
                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-dunr-orange/5 border border-dunr-orange/15 hover:bg-dunr-orange/10 transition-all group">
                                <div className="text-left">
                                    <p className="text-xs font-black text-white uppercase tracking-wider mb-0.5">Ajustar plan actual</p>
                                    <p className="text-[10px] text-white/35">Regenera sesiones futuras manteniendo tu historial</p>
                                </div>
                                <RefreshCw size={15} className="text-dunr-orange group-hover:rotate-180 transition-transform duration-500 shrink-0 ml-3" />
                            </button>
                            <button onClick={() => navigate('/onboarding')}
                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                                <div className="text-left">
                                    <p className="text-xs font-black text-white/60 uppercase tracking-wider mb-0.5 group-hover:text-white transition-colors">Crear un plan nuevo</p>
                                    <p className="text-[10px] text-white/25">Modifica tu perfil y genera un plan desde cero</p>
                                </div>
                                <ChevronRight size={15} className="text-white/20 group-hover:translate-x-1 transition-transform shrink-0 ml-3" />
                            </button>
                        </div>
                    </div>

                    <div className="h-px bg-white/5" />
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-6 py-5 hover:bg-white/5 transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                            <LogOut size={18} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-red-400 flex-1 text-left">Cerrar sesión</span>
                    </button>

                    <div className="h-px bg-white/5" />
                    <button onClick={() => navigate('/legal')}
                        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors opacity-50">
                        <Info size={16} className="text-white/40" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Información Legal</span>
                    </button>
                </div>

                <div className="text-center py-6">
                    <DunrLogo className="justify-center opacity-25 mb-1" markClassName="h-5" wordClassName="text-[10px] tracking-[0.2em]" />
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/10">v1.3 · Preparación extrema</p>
                </div>
            </div>
        </div>
    )
}
