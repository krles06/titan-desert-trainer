import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChevronRight, ChevronLeft, User, Activity, Calendar, Mountain, MapPin, Trophy, Bike } from 'lucide-react'
import { RACES } from '../lib/races'

const STEPS = [
    { title: 'Tu reto', icon: Trophy },
    { title: 'Datos personales', icon: User },
    { title: 'Rendimiento', icon: Activity },
    { title: 'Tu perfil MTB', icon: Bike },
    { title: 'Disponibilidad', icon: Calendar },
    { title: 'Días de entreno', icon: Calendar },
]

const NIVELES = [
    { value: 'principiante', label: 'Principiante', desc: 'Menos de 2 años en bici. Salidas cortas, sin competiciones.' },
    { value: 'intermedio', label: 'Intermedio', desc: '2-5 años, marchas regulares de +80 km, alguna carrera.' },
    { value: 'avanzado', label: 'Avanzado', desc: '+5 años, experiencia en ultradistancia o etapas.' },
]

function InputField({ label, field, type = 'number', placeholder, unit, min, max, form, update, errors }) {
    return (
        <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">{label}</label>
            <div className="relative">
                <input
                    type={type}
                    value={form[field]}
                    onChange={(e) => update(field, e.target.value)}
                    className={`input-field ${unit ? 'pr-14' : ''} ${errors[field] ? '!border-titan-danger' : ''}`}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                />
                {unit && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30 font-bold uppercase">
                        {unit}
                    </span>
                )}
            </div>
            {errors[field] && <p className="text-[10px] text-titan-danger mt-1.5 font-bold ml-1">{errors[field]}</p>}
        </div>
    )
}

export default function Onboarding() {
    const { saveProfile } = useAuth()
    const navigate = useNavigate()
    const [step, setStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [form, setForm] = useState({
        carrera_id: RACES[0].id,
        nombre: '',
        edad: '',
        peso: '',
        altura: '',
        nivel_experiencia: 'intermedio',
        velocidad_media: '',
        distancia_maxima: '',
        fc_reposo: '',
        objetivo_carrera: 'terminar',
        tipo_bici: 'hardtail',
        tiene_pulsometro: true,
        lesiones: [],
        terreno_habitual: 'mixto',
        dias_entreno_semana: 4,
        minutos_dia: 60,
        participado_antes: false,
        dias_preferidos: [],
        dia_fuerte: '',
        objetivo_distancia: '',
        objetivo_desnivel: '',
        objetivo_fecha: '',
        objetivo_terreno: 'mtb',
    })

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }))
        setErrors((prev) => ({ ...prev, [field]: null }))
    }

    function validateStep(s = step) {
        const newErrors = {}
        if (s === 0) {
            if (!form.carrera_id) newErrors.carrera_id = 'Selecciona un reto'
            if (form.carrera_id === 'custom') {
                if (!form.objetivo_distancia || form.objetivo_distancia < 1) newErrors.objetivo_distancia = 'Distancia mínima 1 km'
                if (!form.objetivo_desnivel || form.objetivo_desnivel < 0) newErrors.objetivo_desnivel = 'Desnivel no válido'
                if (!form.objetivo_fecha) newErrors.objetivo_fecha = 'Selecciona una fecha'
                else {
                    const selected = new Date(form.objetivo_fecha)
                    const now = new Date()
                    if (selected <= now) newErrors.objetivo_fecha = 'La fecha debe ser futura'
                }
            }
        } else if (s === 1) {
            if (!form.nombre.trim()) newErrors.nombre = 'Introduce tu nombre'
            if (!form.edad || form.edad < 16 || form.edad > 80) newErrors.edad = 'Edad entre 16 y 80'
            if (!form.peso || form.peso < 40 || form.peso > 150) newErrors.peso = 'Peso entre 40 y 150 kg'
            if (!form.altura || form.altura < 140 || form.altura > 210) newErrors.altura = 'Altura entre 140 y 210 cm'
        } else if (s === 2) {
            if (!form.velocidad_media || form.velocidad_media < 10 || form.velocidad_media > 50)
                newErrors.velocidad_media = 'Velocidad entre 10 y 50 km/h'
            if (!form.distancia_maxima || form.distancia_maxima < 10 || form.distancia_maxima > 500)
                newErrors.distancia_maxima = 'Distancia entre 10 y 500 km'
            if (!form.fc_reposo || form.fc_reposo < 30 || form.fc_reposo > 100)
                newErrors.fc_reposo = 'FC reposo entre 30 y 100 ppm'
        } else if (s === 3) {
            // Step 3 is optional fields — no hard validation
        } else if (s === 4) {
            if (!form.dias_entreno_semana) newErrors.dias_entreno_semana = 'Valor requerido'
            if (!form.minutos_dia) newErrors.minutos_dia = 'Valor requerido'
        } else if (s === 5) {
            if (form.dias_preferidos.length !== form.dias_entreno_semana) {
                newErrors.dias_preferidos = `Selecciona exactamente ${form.dias_entreno_semana} días`
            }
            if (!form.dia_fuerte) {
                newErrors.dia_fuerte = 'Selecciona tu día fuerte'
            }
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    function nextStep() {
        if (validateStep()) {
            setStep((s) => Math.min(s + 1, STEPS.length - 1))
        }
    }

    function prevStep() {
        setStep((s) => Math.max(s - 1, 0))
    }

    function toggleLesion(val) {
        if (val === 'ninguna') {
            update('lesiones', form.lesiones.includes('ninguna') ? [] : ['ninguna'])
        } else {
            const current = form.lesiones.filter(l => l !== 'ninguna')
            if (current.includes(val)) update('lesiones', current.filter(l => l !== val))
            else update('lesiones', [...current, val])
        }
    }

    async function handleSubmit() {
        for (let i = 0; i < STEPS.length; i++) {
            if (!validateStep(i)) {
                setStep(i)
                return
            }
        }

        setLoading(true)
        try {
            const profileData = {
                ...form,
                edad: Number(form.edad),
                peso: Number(form.peso),
                altura: Number(form.altura),
                velocidad_media: parseFloat(form.velocidad_media),
                distancia_maxima: Number(form.distancia_maxima),
                fc_reposo: Number(form.fc_reposo),
                dias_entreno_semana: Number(form.dias_entreno_semana),
                minutos_dia: Number(form.minutos_dia),
                objetivo_distancia: form.carrera_id === 'custom' ? Number(form.objetivo_distancia) : null,
                objetivo_desnivel: form.carrera_id === 'custom' ? Number(form.objetivo_desnivel) : null,
                objetivo_fecha: form.carrera_id === 'custom' ? form.objetivo_fecha : null,
                objetivo_terreno: form.carrera_id === 'custom' ? form.objetivo_terreno : null,
                subscription_status: 'trialing',
            }
            const { error: saveError } = await saveProfile(profileData)
            if (saveError) {
                setErrors({ form: 'Error al guardar el perfil: ' + (saveError.message || 'Inténtalo de nuevo.') })
            } else {
                navigate('/generate-plan')
            }
        } catch (err) {
            console.error('Unexpected error:', err)
            setErrors({ form: 'Error inesperado. Inténtalo de nuevo.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-dunr-black">
            {/* Header */}
            <div className="gradient-desert px-4 pt-8 pb-12">
                <div className="max-w-lg mx-auto text-center">
                    <div className="inline-flex items-center gap-2 mb-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1">
                        <Mountain size={14} className="text-dunr-orange" />
                        <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">DUNR TRAINER</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white mb-8 tracking-tighter">PREPARA TU RETO</h1>

                    {/* Progress */}
                    <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6">
                        {STEPS.map((s, i) => (
                            <div key={i} className="flex flex-col items-center gap-1.5">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 border-2 ${i < step ? 'bg-dunr-orange border-dunr-orange text-black' : i === step ? 'bg-dunr-orange/20 border-dunr-orange text-dunr-orange' : 'bg-white/5 border-white/10 text-white/20'}`}>
                                    <s.icon size={15} />
                                </div>
                                <div className={`h-1 w-5 rounded-full ${i <= step ? 'bg-dunr-orange' : 'bg-white/10'}`} />
                            </div>
                        ))}
                    </div>
                    <p className="text-white/90 text-sm font-semibold tracking-wide uppercase">{STEPS[step].title}</p>
                    <p className="text-white/40 text-xs mt-1">Paso {step + 1} de {STEPS.length}</p>
                </div>
            </div>

            {/* Form */}
            <div className="px-4 -mt-6 pb-8 max-w-lg mx-auto">
                <div className="glass-card p-6 animate-fade-in border-white/5">
                    {errors.form && (
                        <div className="bg-titan-danger/10 border border-titan-danger/20 text-titan-danger text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-3 mb-6">
                            {errors.form}
                        </div>
                    )}

                    {/* ── Step 0: Race ── */}
                    {step === 0 && (
                        <div className="space-y-4">
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest text-center mb-6">
                                Elige el desafío para el que quieres prepararte
                            </p>
                            <div className="space-y-3">
                                {RACES.map((race) => (
                                    <button key={race.id} type="button" onClick={() => update('carrera_id', race.id)}
                                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${form.carrera_id === race.id ? 'border-dunr-orange bg-dunr-orange/5 shadow-2xl shadow-dunr-orange/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className={`font-black text-lg tracking-tight transition-colors ${form.carrera_id === race.id ? 'text-dunr-orange' : 'text-white'}`}>{race.name}</h3>
                                                    <p className="text-[10px] text-white/40 flex items-center gap-1 mt-1 font-bold uppercase tracking-wider">
                                                        <MapPin size={10} /> {race.location}
                                                    </p>
                                                </div>
                                                <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${race.difficulty === 'Extrema' ? 'bg-red-500/20 text-red-400' : 'bg-dunr-orange/20 text-dunr-orange'}`}>
                                                    {race.difficulty}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-white/5">
                                                <div>
                                                    <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Fecha</p>
                                                    <p className="text-xs font-bold text-white mt-0.5">{new Date(race.date).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Distancia</p>
                                                    <p className="text-xs font-bold text-white mt-0.5">{race.distance_total} km</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Etapas</p>
                                                    <p className="text-xs font-bold text-white mt-0.5">{race.stages}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {form.carrera_id === race.id && <div className="absolute -top-4 -right-4 w-24 h-24 bg-dunr-orange/10 rounded-full blur-2xl" />}
                                    </button>
                                ))}

                                {/* Custom */}
                                <button type="button" onClick={() => update('carrera_id', 'custom')}
                                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${form.carrera_id === 'custom' ? 'border-dunr-orange bg-dunr-orange/5 shadow-2xl shadow-dunr-orange/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className={`font-black text-lg tracking-tight transition-colors ${form.carrera_id === 'custom' ? 'text-dunr-orange' : 'text-white'}`}>OBJETIVO PERSONALIZADO</h3>
                                                <p className="text-[10px] text-white/40 flex items-center gap-1 mt-1 font-bold uppercase tracking-wider">Define tu propio reto y terreno</p>
                                            </div>
                                            <div className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/10 text-white/60">Configurable</div>
                                        </div>
                                        {form.carrera_id === 'custom' && (
                                            <div className="mt-6 pt-6 border-t border-white/10 space-y-4 animate-fade-in">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <InputField label="Distancia" field="objetivo_distancia" placeholder="100" unit="km" form={form} update={update} errors={errors} />
                                                    <InputField label="Desnivel" field="objetivo_desnivel" placeholder="2000" unit="m" form={form} update={update} errors={errors} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">Fecha límite</label>
                                                        <input type="date" value={form.objetivo_fecha} onChange={(e) => update('objetivo_fecha', e.target.value)}
                                                            className={`input-field !text-xs ${errors.objetivo_fecha ? '!border-titan-danger' : ''}`} />
                                                        {errors.objetivo_fecha && <p className="text-[10px] text-titan-danger mt-1.5 font-bold ml-1">{errors.objetivo_fecha}</p>}
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">Terreno</label>
                                                        <select value={form.objetivo_terreno} onChange={(e) => update('objetivo_terreno', e.target.value)}
                                                            className="input-field !text-xs !bg-transparent appearance-none">
                                                            <option value="carretera">Carretera</option>
                                                            <option value="mtb">MTB</option>
                                                            <option value="gravel">Gravel</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {form.carrera_id === 'custom' && <div className="absolute -top-4 -right-4 w-24 h-24 bg-dunr-orange/10 rounded-full blur-2xl" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 1: Personal data ── */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <InputField label="Nombre y apellidos" field="nombre" type="text" placeholder="Tu nombre completo" form={form} update={update} errors={errors} />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-3">
                                <InputField label="Edad" field="edad" placeholder="35" unit="años" min={16} max={80} form={form} update={update} errors={errors} />
                                <InputField label="Peso" field="peso" placeholder="75" unit="kg" min={40} max={150} form={form} update={update} errors={errors} />
                                <InputField label="Altura" field="altura" placeholder="178" unit="cm" min={140} max={210} form={form} update={update} errors={errors} />
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Performance ── */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 ml-1">Nivel de experiencia en ciclismo</label>
                                <div className="grid gap-2">
                                    {NIVELES.map((nivel) => (
                                        <button key={nivel.value} type="button" onClick={() => update('nivel_experiencia', nivel.value)}
                                            className={`text-left p-4 rounded-xl border-2 transition-all ${form.nivel_experiencia === nivel.value ? 'border-dunr-orange bg-dunr-orange/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                                            <span className={`font-black uppercase tracking-tight text-sm ${form.nivel_experiencia === nivel.value ? 'text-dunr-orange' : 'text-white'}`}>{nivel.label}</span>
                                            <p className="text-[11px] text-white/40 mt-1 font-medium leading-relaxed">{nivel.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <InputField label="Velocidad media en ruta" field="velocidad_media" placeholder="25" unit="km/h" min={10} max={50} form={form} update={update} errors={errors} />
                            <InputField label="Distancia máxima que has rodado" field="distancia_maxima" placeholder="120" unit="km" min={10} max={500} form={form} update={update} errors={errors} />
                            <InputField label="Frecuencia cardíaca en reposo" field="fc_reposo" placeholder="58" unit="ppm" min={30} max={100} form={form} update={update} errors={errors} />
                        </div>
                    )}

                    {/* ── Step 3: MTB Profile ── */}
                    {step === 3 && (
                        <div className="space-y-5">
                            {/* Objetivo */}
                            <div>
                                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 ml-1">¿Cuál es tu objetivo principal en la carrera?</label>
                                <div className="grid gap-2">
                                    {[
                                        { value: 'terminar', label: '🏁 Terminar la carrera', desc: 'Llegar a meta sin importar el tiempo. Prioridad: resistencia, gestión del esfuerzo y no lesionarse.' },
                                        { value: 'competir', label: '🏆 Competir y mejorar el tiempo', desc: 'Buscar el mejor resultado posible. El plan incluirá trabajo de umbral, ritmo de carrera y series de calidad.' },
                                    ].map(opt => (
                                        <button key={opt.value} type="button" onClick={() => update('objetivo_carrera', opt.value)}
                                            className={`text-left p-4 rounded-xl border-2 transition-all ${form.objetivo_carrera === opt.value ? 'border-dunr-orange bg-dunr-orange/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                                            <span className={`font-black uppercase tracking-tight text-sm ${form.objetivo_carrera === opt.value ? 'text-dunr-orange' : 'text-white'}`}>{opt.label}</span>
                                            <p className="text-[11px] text-white/40 mt-1 font-medium leading-relaxed">{opt.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tipo bici */}
                            <div>
                                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 ml-1">Tipo de bicicleta principal</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { value: 'hardtail', label: '🚵 Hardtail MTB' },
                                        { value: 'full_suspension', label: '🏔️ Full Suspension' },
                                        { value: 'gravel', label: '🛤️ Gravel' },
                                        { value: 'carretera', label: '🚴 Carretera' },
                                    ].map(opt => (
                                        <button key={opt.value} type="button" onClick={() => update('tipo_bici', opt.value)}
                                            className={`py-3.5 px-3 rounded-xl border-2 text-[11px] font-black tracking-wide transition-all ${form.tipo_bici === opt.value ? 'border-dunr-orange bg-dunr-orange text-black' : 'border-white/5 bg-white/5 text-white/50 hover:border-white/20'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pulsómetro */}
                            <div>
                                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 ml-1">¿Tienes pulsómetro o potenciómetro?</label>
                                <div className="flex gap-3">
                                    {[
                                        { value: true, label: 'Sí, entreno con datos' },
                                        { value: false, label: 'No, a sensaciones' },
                                    ].map(opt => (
                                        <button key={String(opt.value)} type="button" onClick={() => update('tiene_pulsometro', opt.value)}
                                            className={`flex-1 p-3.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${form.tiene_pulsometro === opt.value ? 'border-dunr-orange bg-dunr-orange text-black' : 'border-white/5 bg-white/5 text-white/30 hover:border-white/20'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-white/25 mt-2 ml-1 leading-relaxed">
                                    {form.tiene_pulsometro ? 'Las sesiones incluirán zonas de FC exactas (Z1–Z5).' : 'Las sesiones usarán escala de esfuerzo percibido (RPE 1–10).'}
                                </p>
                            </div>

                            {/* Lesiones */}
                            <div>
                                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 ml-1">Lesiones o limitaciones físicas</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { value: 'ninguna', label: '✓ Ninguna' },
                                        { value: 'rodilla', label: '🦵 Rodilla' },
                                        { value: 'espalda', label: '🔙 Espalda/lumbar' },
                                        { value: 'hombro', label: '💪 Hombro/cervical' },
                                        { value: 'tobillo', label: '🦶 Tobillo/pie' },
                                        { value: 'muneca', label: '✋ Muñeca/codo' },
                                    ].map(opt => {
                                        const isSelected = form.lesiones.includes(opt.value)
                                        return (
                                            <button key={opt.value} type="button" onClick={() => toggleLesion(opt.value)}
                                                className={`py-3 px-3 rounded-xl border-2 text-[11px] font-black tracking-wide transition-all ${isSelected ? 'border-dunr-orange bg-dunr-orange/10 text-dunr-orange' : 'border-white/5 bg-white/5 text-white/40 hover:border-white/20'}`}>
                                                {opt.label}
                                            </button>
                                        )
                                    })}
                                </div>
                                {form.lesiones.length > 0 && !form.lesiones.includes('ninguna') && (
                                    <p className="text-[10px] text-dunr-orange/60 mt-2 ml-1 leading-relaxed">
                                        El plan adaptará los ejercicios de fuerza y las sesiones técnicas para proteger las zonas afectadas.
                                    </p>
                                )}
                            </div>

                            {/* Terreno habitual */}
                            <div>
                                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 ml-1">Terreno habitual de entrenamiento</label>
                                <div className="grid gap-2">
                                    {[
                                        { value: 'montana', label: '⛰️ Montaña y pistas de tierra', desc: 'Rutas técnicas, desnivel, tierra y grava. Acceso habitual a monte.' },
                                        { value: 'mixto', label: '🔀 Mixto asfalto/tierra', desc: 'Combino carretera, carril bici y caminos según el día.' },
                                        { value: 'asfalto', label: '🛣️ Principalmente asfalto', desc: 'Carreteras y carriles bici. Poco desnivel disponible.' },
                                    ].map(opt => (
                                        <button key={opt.value} type="button" onClick={() => update('terreno_habitual', opt.value)}
                                            className={`text-left p-3.5 rounded-xl border-2 transition-all ${form.terreno_habitual === opt.value ? 'border-dunr-orange bg-dunr-orange/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                                            <span className={`font-black text-sm ${form.terreno_habitual === opt.value ? 'text-dunr-orange' : 'text-white'}`}>{opt.label}</span>
                                            <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">{opt.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 4: Availability ── */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 ml-1">
                                    Días de entreno: <strong className="text-dunr-orange text-sm ml-1 tracking-normal">{form.dias_entreno_semana}</strong> días/semana
                                </label>
                                <input type="range" min="2" max="6" value={form.dias_entreno_semana}
                                    onChange={(e) => update('dias_entreno_semana', Number(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-dunr-orange" />
                                <div className="flex justify-between text-[10px] text-white/20 font-bold uppercase tracking-wider mt-2 px-1">
                                    <span>2 días</span>
                                    <span>6 días</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 ml-1">
                                    Disponibilidad diaria: <strong className="text-dunr-orange text-sm ml-1 tracking-normal">{form.minutos_dia}</strong> minutos
                                </label>
                                <input type="range" min="30" max="180" step="15" value={form.minutos_dia}
                                    onChange={(e) => update('minutos_dia', Number(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-dunr-orange" />
                                <div className="flex justify-between text-[10px] text-white/20 font-bold uppercase tracking-wider mt-2 px-1">
                                    <span>30 min</span>
                                    <span>3 horas</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 ml-1">
                                    ¿Experiencia previa en la Titan?
                                </label>
                                <div className="flex gap-3">
                                    {[
                                        { value: false, label: 'NUEVO RETO' },
                                        { value: true, label: 'YA HE ESTADO' },
                                    ].map((option) => (
                                        <button key={String(option.value)} type="button" onClick={() => update('participado_antes', option.value)}
                                            className={`flex-1 p-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${form.participado_antes === option.value ? 'border-dunr-orange bg-dunr-orange text-black shadow-lg shadow-dunr-orange/20' : 'border-white/5 bg-white/5 text-white/30 hover:border-white/20'}`}>
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 5: Days ── */}
                    {step === 5 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight leading-none uppercase mb-2">Casi listo</h3>
                                <p className="text-[11px] text-white/40 mb-6 font-medium leading-relaxed">
                                    Selecciona los <strong>{form.dias_entreno_semana} días</strong> de la semana que prefieres dedicar al entreno:
                                </p>

                                {errors.dias_preferidos && (
                                    <p className="text-[10px] text-titan-danger mb-4 bg-titan-danger/5 p-3 rounded-xl border border-titan-danger/20 font-bold uppercase tracking-wider text-center">
                                        {errors.dias_preferidos}
                                    </p>
                                )}

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((dia) => {
                                        const isSelected = form.dias_preferidos.includes(dia)
                                        return (
                                            <button key={dia} type="button" onClick={() => {
                                                const current = [...form.dias_preferidos]
                                                if (isSelected) {
                                                    const next = current.filter((d) => d !== dia)
                                                    update('dias_preferidos', next)
                                                    if (form.dia_fuerte === dia) update('dia_fuerte', '')
                                                } else if (current.length < form.dias_entreno_semana) {
                                                    update('dias_preferidos', [...current, dia])
                                                }
                                            }}
                                                className={`py-3.5 px-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${isSelected ? 'border-dunr-orange bg-dunr-orange text-black shadow-xl shadow-dunr-orange/20' : 'border-white/5 bg-white/5 text-white/30 hover:border-white/20'}`}>
                                                {dia}
                                            </button>
                                        )
                                    })}
                                </div>

                                {form.dias_preferidos.length === form.dias_entreno_semana && (
                                    <div className="mt-10 pt-10 border-t border-white/5 animate-fade-in">
                                        <h3 className="text-xl font-black text-white tracking-tight leading-none uppercase mb-2">¿Cuál es tu día fuerte?</h3>
                                        <p className="text-[11px] text-white/40 mb-6 font-medium leading-relaxed">
                                            El día en que tienes <strong>más tiempo y energía</strong> para los entrenamientos más exigentes:
                                        </p>

                                        {errors.dia_fuerte && (
                                            <p className="text-[10px] text-titan-danger mb-4 font-bold uppercase tracking-wider ml-1">{errors.dia_fuerte}</p>
                                        )}

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {form.dias_preferidos.map((dia) => {
                                                const isStrong = form.dia_fuerte === dia
                                                return (
                                                    <button key={`strong-${dia}`} type="button" onClick={() => update('dia_fuerte', dia)}
                                                        className={`py-3 px-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${isStrong ? 'border-dunr-orange bg-dunr-orange text-black shadow-xl shadow-dunr-orange/20' : 'border-white/5 bg-white/5 text-white/30 hover:border-white/20'}`}>
                                                        {dia}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                <p className="text-[10px] text-white/20 mt-6 text-center italic font-medium">
                                    Si eliges descansar algún día, la IA de DUNR lo tendrá en cuenta.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center gap-3 mt-10">
                        {step > 0 && (
                            <button type="button" onClick={prevStep} className="btn-secondary flex-1 !text-xs !font-black !uppercase !tracking-widest">
                                <ChevronLeft size={16} /> Anterior
                            </button>
                        )}
                        {step < STEPS.length - 1 ? (
                            <button type="button" onClick={nextStep} className="btn-primary flex-1 !text-xs !font-black !uppercase !tracking-widest">
                                Siguiente <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 !text-xs !font-black !uppercase !tracking-widest">
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        GUARDANDO...
                                    </span>
                                ) : (
                                    <>GENERAR MI PLAN <ChevronRight size={16} /></>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
