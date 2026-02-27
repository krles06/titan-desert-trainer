import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChevronRight, ChevronLeft, User, Activity, Calendar, Mountain, MapPin, Trophy, Star } from 'lucide-react'
import { RACES } from '../lib/races'

const STEPS = [
    { title: 'Tu reto', icon: Trophy },
    { title: 'Datos personales', icon: User },
    { title: 'Rendimiento', icon: Activity },
    { title: 'Disponibilidad', icon: Calendar },
    { title: 'Días de entreno', icon: Calendar },
]

const NIVELES = [
    { value: 'principiante', label: 'Principiante', desc: 'Menos de 2 años en bici de carretera/gravel' },
    { value: 'intermedio', label: 'Intermedio', desc: '2-5 años, marchas regulares de +80 km' },
    { value: 'avanzado', label: 'Avanzado', desc: '+5 años, experiencia en ultradistancia' },
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
        dias_entreno_semana: 4,
        minutos_dia: 60,
        participado_antes: false,
        dias_preferidos: [], // ['Lunes', 'Miércoles', ...]
    })

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }))
        setErrors((prev) => ({ ...prev, [field]: null }))
    }

    function validateStep(s = step) {
        const newErrors = {}
        if (s === 0) {
            if (!form.carrera_id) newErrors.carrera_id = 'Selecciona un reto'
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
            if (!form.dias_entreno_semana) newErrors.dias_entreno_semana = 'Valor requerido'
            if (!form.minutos_dia) newErrors.minutos_dia = 'Valor requerido'
        } else if (s === 4) {
            if (form.dias_preferidos.length !== form.dias_entreno_semana) {
                newErrors.dias_preferidos = `Selecciona exactamente ${form.dias_entreno_semana} días`
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

    async function handleSubmit() {
        // Validate all steps before submitting
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
                subscription_status: 'trialing',
            }
            const { error: saveError } = await saveProfile(profileData)
            if (saveError) {
                console.error('Error saving profile:', saveError)
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
                        <Mountain size={14} className="text-dunr-blue" />
                        <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">DUNR TRAINER</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white mb-8 tracking-tighter">PREPARA TU RETO</h1>

                    {/* Progress indicator with icons */}
                    <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6">
                        {STEPS.map((s, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${i <= step ? 'bg-gradient-to-br from-dunr-blue to-dunr-orange border-none text-white shadow-xl shadow-dunr-blue/20' : 'bg-white/5 border-white/10 text-white/20'}`}>
                                    <s.icon size={18} className="sm:w-[20px]" />
                                </div>
                                <div className={`h-1.5 w-6 sm:w-8 rounded-full ${i <= step ? 'bg-dunr-blue' : 'bg-white/10'}`} />
                            </div>
                        ))}
                    </div>
                    <p className="text-white/90 text-sm font-semibold tracking-wide uppercase">
                        {STEPS[step].title}
                    </p>
                    <p className="text-white/60 text-xs mt-1">Paso {step + 1} de {STEPS.length}</p>
                </div>
            </div>

            {/* Form content */}
            <div className="px-4 -mt-6 pb-8 max-w-lg mx-auto">
                <div className="glass-card p-6 animate-fade-in border-white/5">
                    {errors.form && (
                        <div className="bg-titan-danger/10 border border-titan-danger/20 text-titan-danger text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-3 mb-6">
                            {errors.form}
                        </div>
                    )}

                    {/* Step 0: Race Selection */}
                    {step === 0 && (
                        <div className="space-y-4">
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest text-center mb-6">
                                Elige el desafío para el que quieres prepararte
                            </p>
                            <div className="space-y-3">
                                {RACES.map((race) => (
                                    <button
                                        key={race.id}
                                        type="button"
                                        onClick={() => update('carrera_id', race.id)}
                                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all relative overflow-hidden group ${form.carrera_id === race.id
                                            ? 'border-dunr-blue bg-dunr-blue/5 shadow-2xl shadow-dunr-blue/10'
                                            : 'border-white/5 bg-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className={`font-black text-lg tracking-tight transition-colors ${form.carrera_id === race.id ? 'text-dunr-blue' : 'text-white'}`}>
                                                        {race.name}
                                                    </h3>
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
                                                    <p className="text-xs font-bold text-white mt-0.5">
                                                        {new Date(race.date).toLocaleDateString()}
                                                    </p>
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
                                        {form.carrera_id === race.id && (
                                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-dunr-blue/10 rounded-full blur-2xl" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 1: Personal data */}
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

                    {/* Step 2: Performance */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 ml-1">Nivel de experiencia</label>
                                <div className="grid gap-2">
                                    {NIVELES.map((nivel) => (
                                        <button
                                            key={nivel.value}
                                            type="button"
                                            onClick={() => update('nivel_experiencia', nivel.value)}
                                            className={`text-left p-4 rounded-xl border-2 transition-all ${form.nivel_experiencia === nivel.value
                                                ? 'border-dunr-blue bg-dunr-blue/5'
                                                : 'border-white/5 bg-white/5 hover:border-white/20'
                                                }`}
                                        >
                                            <span className={`font-black uppercase tracking-tight text-sm ${form.nivel_experiencia === nivel.value ? 'text-dunr-blue' : 'text-white'}`}>{nivel.label}</span>
                                            <p className="text-[11px] text-white/40 mt-1 font-medium leading-relaxed">{nivel.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <InputField label="Velocidad media en ruta" field="velocidad_media" placeholder="25" unit="km/h" min={10} max={50} form={form} update={update} errors={errors} />
                            <InputField label="Distancia máxima rodada" field="distancia_maxima" placeholder="120" unit="km" min={10} max={500} form={form} update={update} errors={errors} />
                            <InputField label="Frecuencia cardíaca en reposo" field="fc_reposo" placeholder="58" unit="ppm" min={30} max={100} form={form} update={update} errors={errors} />
                        </div>
                    )}

                    {/* Step 3: Availability */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 ml-1">
                                    Días de entreno: <strong className="text-dunr-blue text-sm ml-1 tracking-normal">{form.dias_entreno_semana}</strong> días/semana
                                </label>
                                <input
                                    type="range"
                                    min="2"
                                    max="6"
                                    value={form.dias_entreno_semana}
                                    onChange={(e) => update('dias_entreno_semana', Number(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-dunr-blue"
                                />
                                <div className="flex justify-between text-[10px] text-white/20 font-bold uppercase tracking-wider mt-2 px-1">
                                    <span>2 días</span>
                                    <span>6 días</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 ml-1">
                                    Disponibilidad diaria: <strong className="text-dunr-blue text-sm ml-1 tracking-normal">{form.minutos_dia}</strong> minutos
                                </label>
                                <input
                                    type="range"
                                    min="30"
                                    max="180"
                                    step="15"
                                    value={form.minutos_dia}
                                    onChange={(e) => update('minutos_dia', Number(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-dunr-blue"
                                />
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
                                        <button
                                            key={String(option.value)}
                                            type="button"
                                            onClick={() => update('participado_antes', option.value)}
                                            className={`flex-1 p-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${form.participado_antes === option.value
                                                ? 'border-dunr-blue bg-dunr-blue text-white shadow-lg shadow-dunr-blue/20'
                                                : 'border-white/5 bg-white/5 text-white/30 hover:border-white/20'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Days of week */}
                    {step === 4 && (
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
                                            <button
                                                key={dia}
                                                type="button"
                                                onClick={() => {
                                                    const current = [...form.dias_preferidos]
                                                    if (isSelected) {
                                                        update('dias_preferidos', current.filter((d) => d !== dia))
                                                    } else if (current.length < form.dias_entreno_semana) {
                                                        update('dias_preferidos', [...current, dia])
                                                    }
                                                }}
                                                className={`py-3.5 px-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${isSelected
                                                    ? 'border-dunr-blue bg-dunr-blue text-white shadow-xl shadow-dunr-blue/20'
                                                    : 'border-white/5 bg-white/5 text-white/30 hover:border-white/20'
                                                    }`}
                                            >
                                                {dia}
                                            </button>
                                        )
                                    })}
                                </div>
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
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        GENERANDO...
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
