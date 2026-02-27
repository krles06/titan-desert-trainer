import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    User, Mail, Activity, Mountain, LogOut,
    RefreshCw, ChevronRight, Save, Shield, Info
} from 'lucide-react'

export default function Profile() {
    const { user, profile, signOut, saveProfile } = useAuth()
    const navigate = useNavigate()
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState(profile || {})

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    async function handleSave() {
        setSaving(true)
        try {
            await saveProfile(form)
            setEditing(false)
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

    const LEVELS = {
        principiante: 'Principiante',
        intermedio: 'Intermedio',
        avanzado: 'Avanzado',
    }

    return (
        <div className="min-h-screen bg-dunr-black pb-32 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-dunr-blue/5 rounded-full blur-3xl -mr-40 -mt-40" />
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-dunr-orange/5 rounded-full blur-3xl -ml-32" />

            {/* Header */}
            <div className="gradient-dark px-4 pt-10 pb-16 border-b border-white/5">
                <div className="max-w-lg mx-auto">
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tighter">MI PERFIL</h1>
                    <div className="flex items-center gap-2 text-white/40">
                        <Mail size={14} />
                        <span className="text-xs font-bold uppercase tracking-widest">{user?.email || 'demo@titandesert.com'}</span>
                    </div>
                </div>
            </div>

            <div className="px-4 -mt-4 max-w-lg mx-auto space-y-4">
                {/* Profile card */}
                <div className="glass-card p-6 animate-fade-in border-white/10 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                                <User size={32} className="text-dunr-blue" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">{profile?.nombre || 'Ciclista'}</h2>
                                <p className="text-[10px] font-black text-dunr-orange uppercase tracking-widest mt-0.5">{LEVELS[profile?.nivel_experiencia] || 'Intermedio'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setEditing(!editing)}
                            className="bg-white/10 px-4 py-2 rounded-xl text-[10px] text-white font-black uppercase tracking-widest hover:bg-white/20 transition-colors"
                        >
                            {editing ? 'Cancelar' : 'Editar'}
                        </button>
                    </div>

                    {editing ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block ml-1">Nombre</label>
                                    <input
                                        type="text"
                                        value={form.nombre || ''}
                                        onChange={(e) => update('nombre', e.target.value)}
                                        className="input-field text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block ml-1">Edad</label>
                                    <input
                                        type="number"
                                        value={form.edad || ''}
                                        onChange={(e) => update('edad', Number(e.target.value))}
                                        className="input-field text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block ml-1">Peso (kg)</label>
                                    <input
                                        type="number"
                                        value={form.peso || ''}
                                        onChange={(e) => update('peso', Number(e.target.value))}
                                        className="input-field text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block ml-1">Altura (cm)</label>
                                    <input
                                        type="number"
                                        value={form.altura || ''}
                                        onChange={(e) => update('altura', Number(e.target.value))}
                                        className="input-field text-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block ml-1">Vel. media</label>
                                    <input
                                        type="number"
                                        value={form.velocidad_media || ''}
                                        onChange={(e) => update('velocidad_media', Number(e.target.value))}
                                        className="input-field text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block ml-1">Dist. máxima</label>
                                    <input
                                        type="number"
                                        value={form.distancia_maxima || ''}
                                        onChange={(e) => update('distancia_maxima', Number(e.target.value))}
                                        className="input-field text-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block ml-1">Días/semana</label>
                                    <input
                                        type="number"
                                        min="2"
                                        max="6"
                                        value={form.dias_entreno_semana || 4}
                                        onChange={(e) => update('dias_entreno_semana', Number(e.target.value))}
                                        className="input-field text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 block ml-1">Min/día</label>
                                    <input
                                        type="number"
                                        value={form.minutos_dia || 60}
                                        onChange={(e) => update('minutos_dia', Number(e.target.value))}
                                        className="input-field text-sm"
                                    />
                                </div>
                            </div>
                            <button onClick={handleSave} disabled={saving} className="btn-primary w-full !py-4 !text-xs !font-black !uppercase !tracking-widest shadow-xl shadow-dunr-blue/20">
                                {saving ? 'Guardando...' : <><Save size={16} /> Guardar cambios</>}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            <ProfileStat label="Edad" value={`${profile?.edad || '-'} años`} />
                            <ProfileStat label="Peso" value={`${profile?.peso || '-'} kg`} />
                            <ProfileStat label="Altura" value={`${profile?.altura || '-'} cm`} />
                            <ProfileStat label="FC reposo" value={`${profile?.fc_reposo || '-'} ppm`} />
                            <ProfileStat label="Vel. media" value={`${profile?.velocidad_media || '-'} km/h`} />
                            <ProfileStat label="Dist. máxima" value={`${profile?.distancia_maxima || '-'} km`} />
                            <ProfileStat label="Días/semana" value={profile?.dias_entreno_semana || '-'} />
                            <ProfileStat label="Min/día" value={`${profile?.minutos_dia || '-'} min`} />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="glass-card overflow-hidden animate-fade-in border-white/5" style={{ animationDelay: '0.1s' }}>
                    <button
                        onClick={() => navigate('/subscription')}
                        className="w-full flex items-center gap-4 px-6 py-5 hover:bg-white/5 transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-dunr-blue/10 flex items-center justify-center text-dunr-blue transition-colors group-hover:bg-dunr-blue group-hover:text-white">
                            <Shield size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-white flex-1 text-left">Mi Suscripción</span>
                        <ChevronRight size={16} className="text-white/20" />
                    </button>
                    <div className="h-px bg-white/5" />
                    <div className="px-6 py-6">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-dunr-orange/10 flex items-center justify-center text-dunr-orange">
                                <RefreshCw size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Gestión del Plan</span>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/generate-plan?reason=manual_refresh')}
                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-dunr-blue/5 border border-dunr-blue/10 hover:bg-dunr-blue/10 transition-all group"
                            >
                                <div className="text-left">
                                    <p className="text-xs font-black text-white uppercase tracking-wider mb-1">Mantener mis datos</p>
                                    <p className="text-[10px] text-white/40 font-medium">Regenera sesiones con tu perfil actual</p>
                                </div>
                                <RefreshCw size={16} className="text-dunr-blue group-hover:rotate-180 transition-transform duration-500" />
                            </button>
                            <button
                                onClick={() => navigate('/onboarding')}
                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                            >
                                <div className="text-left">
                                    <p className="text-xs font-black text-white/60 uppercase tracking-wider mb-1 group-hover:text-white transition-colors">Cambiar mi perfil</p>
                                    <p className="text-[10px] text-white/30 font-medium">Modifica tus datos y crea un plan nuevo</p>
                                </div>
                                <ChevronRight size={16} className="text-white/20 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                    <div className="h-px bg-white/5" />
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-6 py-5 hover:bg-white/5 transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-titan-danger/10 flex items-center justify-center text-titan-danger transition-colors group-hover:bg-titan-danger group-hover:text-white">
                            <LogOut size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-titan-danger flex-1 text-left">Cerrar sesión</span>
                    </button>
                    <div className="h-px bg-white/5" />
                    <button
                        onClick={() => navigate('/legal')}
                        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors group opacity-60"
                    >
                        <Info size={18} className="text-white/40" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Información Legal</span>
                    </button>
                </div>

                {/* App info */}
                <div className="text-center py-8">
                    <div className="flex items-center justify-center gap-1.5 text-white/20 mb-2">
                        <Mountain size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">DUNR</span>
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/10">v1.2 · Preparación extrema</p>
                </div>
            </div>
        </div>
    )
}

function ProfileStat({ label, value }) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</p>
            <p className="text-sm font-bold text-white">{value}</p>
        </div>
    )
}
