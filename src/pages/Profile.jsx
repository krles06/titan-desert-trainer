import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    User, Mail, Activity, Mountain, LogOut,
    RefreshCw, ChevronRight, Save, Shield
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
        <div className="min-h-screen bg-titan-sand-light pb-24">
            {/* Header */}
            <div className="gradient-desert px-4 pt-6 pb-10">
                <div className="max-w-lg mx-auto">
                    <h1 className="text-2xl font-bold text-white mb-2">Mi perfil</h1>
                    <div className="flex items-center gap-2 text-white/50">
                        <Mail size={14} />
                        <span className="text-sm">{user?.email || 'demo@titandesert.com'}</span>
                    </div>
                </div>
            </div>

            <div className="px-4 -mt-4 max-w-lg mx-auto space-y-4">
                {/* Profile card */}
                <div className="glass-card p-5 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-titan-orange/10 flex items-center justify-center">
                                <User size={24} className="text-titan-orange" />
                            </div>
                            <div>
                                <h2 className="font-bold text-titan-blue">{profile?.nombre || 'Ciclista'}</h2>
                                <p className="text-xs text-titan-blue/40">{LEVELS[profile?.nivel_experiencia] || 'Intermedio'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setEditing(!editing)}
                            className="text-sm text-titan-orange font-medium hover:underline min-h-[44px] flex items-center"
                        >
                            {editing ? 'Cancelar' : 'Editar'}
                        </button>
                    </div>

                    {editing ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-titan-blue/50 mb-1 block">Nombre</label>
                                    <input
                                        type="text"
                                        value={form.nombre || ''}
                                        onChange={(e) => update('nombre', e.target.value)}
                                        className="input-field text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-titan-blue/50 mb-1 block">Edad</label>
                                    <input
                                        type="number"
                                        value={form.edad || ''}
                                        onChange={(e) => update('edad', Number(e.target.value))}
                                        className="input-field text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-titan-blue/50 mb-1 block">Peso (kg)</label>
                                    <input
                                        type="number"
                                        value={form.peso || ''}
                                        onChange={(e) => update('peso', Number(e.target.value))}
                                        className="input-field text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-titan-blue/50 mb-1 block">Altura (cm)</label>
                                    <input
                                        type="number"
                                        value={form.altura || ''}
                                        onChange={(e) => update('altura', Number(e.target.value))}
                                        className="input-field text-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-titan-blue/50 mb-1 block">Vel. media (km/h)</label>
                                    <input
                                        type="number"
                                        value={form.velocidad_media || ''}
                                        onChange={(e) => update('velocidad_media', Number(e.target.value))}
                                        className="input-field text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-titan-blue/50 mb-1 block">Dist. máxima (km)</label>
                                    <input
                                        type="number"
                                        value={form.distancia_maxima || ''}
                                        onChange={(e) => update('distancia_maxima', Number(e.target.value))}
                                        className="input-field text-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-titan-blue/50 mb-1 block">Días/semana</label>
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
                                    <label className="text-xs text-titan-blue/50 mb-1 block">Min/día</label>
                                    <input
                                        type="number"
                                        value={form.minutos_dia || 60}
                                        onChange={(e) => update('minutos_dia', Number(e.target.value))}
                                        className="input-field text-sm"
                                    />
                                </div>
                            </div>
                            <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
                                {saving ? 'Guardando...' : <><Save size={16} /> Guardar cambios</>}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
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
                <div className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <button
                        onClick={() => navigate('/subscription')}
                        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-titan-sand/50 transition-colors min-h-[44px]"
                    >
                        <Shield size={18} className="text-titan-blue/60" />
                        <span className="text-sm font-medium text-titan-blue flex-1 text-left">Mi Suscripción</span>
                        <ChevronRight size={16} className="text-titan-blue/30" />
                    </button>
                    <div className="border-t border-titan-sand-dark/20" />
                    <button
                        onClick={() => navigate('/generate-plan')}
                        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-titan-sand/50 transition-colors min-h-[44px]"
                    >
                        <RefreshCw size={18} className="text-titan-orange" />
                        <span className="text-sm font-medium text-titan-blue flex-1 text-left">Regenerar plan de entrenamiento</span>
                        <ChevronRight size={16} className="text-titan-blue/30" />
                    </button>
                    <div className="border-t border-titan-sand-dark/20" />
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-titan-sand/50 transition-colors min-h-[44px]"
                    >
                        <LogOut size={18} className="text-titan-danger" />
                        <span className="text-sm font-medium text-titan-danger flex-1 text-left">Cerrar sesión</span>
                    </button>
                </div>

                {/* App info */}
                <div className="text-center py-4">
                    <div className="flex items-center justify-center gap-1.5 text-titan-blue/30 mb-1">
                        <Mountain size={14} />
                        <span className="text-xs font-medium">Titan Desert Trainer</span>
                    </div>
                    <p className="text-[10px] text-titan-blue/20">v1.0 · Hecho con ❤️ para ciclistas</p>
                </div>
            </div>
        </div>
    )
}

function ProfileStat({ label, value }) {
    return (
        <div>
            <p className="text-xs text-titan-blue/40">{label}</p>
            <p className="font-semibold text-titan-blue">{value}</p>
        </div>
    )
}
