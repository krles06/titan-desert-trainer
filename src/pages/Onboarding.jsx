import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChevronRight, ChevronLeft, User, Activity, Calendar, Mountain } from 'lucide-react'

const STEPS = [
    { title: 'Datos personales', icon: User },
    { title: 'Rendimiento', icon: Activity },
    { title: 'Disponibilidad', icon: Calendar },
]

const NIVELES = [
    { value: 'principiante', label: 'Principiante', desc: 'Menos de 2 años en bici de carretera/gravel' },
    { value: 'intermedio', label: 'Intermedio', desc: '2-5 años, marchas regulares de +80 km' },
    { value: 'avanzado', label: 'Avanzado', desc: '+5 años, experiencia en ultradistancia' },
]

function InputField({ label, field, type = 'number', placeholder, unit, min, max, form, update, errors }) {
    return (
        <div>
            <label className="block text-sm font-medium text-titan-blue/70 mb-1.5">{label}</label>
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
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-titan-blue/40 font-medium">
                        {unit}
                    </span>
                )}
            </div>
            {errors[field] && <p className="text-xs text-titan-danger mt-1">{errors[field]}</p>}
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
    })

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }))
        setErrors((prev) => ({ ...prev, [field]: null }))
    }

    function validateStep() {
        const newErrors = {}
        if (step === 0) {
            if (!form.nombre.trim()) newErrors.nombre = 'Introduce tu nombre'
            if (!form.edad || form.edad < 16 || form.edad > 80) newErrors.edad = 'Edad entre 16 y 80'
            if (!form.peso || form.peso < 40 || form.peso > 150) newErrors.peso = 'Peso entre 40 y 150 kg'
            if (!form.altura || form.altura < 140 || form.altura > 210) newErrors.altura = 'Altura entre 140 y 210 cm'
        } else if (step === 1) {
            if (!form.velocidad_media || form.velocidad_media < 10 || form.velocidad_media > 50)
                newErrors.velocidad_media = 'Velocidad entre 10 y 50 km/h'
            if (!form.distancia_maxima || form.distancia_maxima < 10 || form.distancia_maxima > 500)
                newErrors.distancia_maxima = 'Distancia entre 10 y 500 km'
            if (!form.fc_reposo || form.fc_reposo < 30 || form.fc_reposo > 100)
                newErrors.fc_reposo = 'FC reposo entre 30 y 100 ppm'
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
        if (!validateStep()) return
        setLoading(true)
        try {
            const profileData = {
                ...form,
                edad: Number(form.edad),
                peso: Number(form.peso),
                altura: Number(form.altura),
                velocidad_media: Number(form.velocidad_media),
                distancia_maxima: Number(form.distancia_maxima),
                fc_reposo: Number(form.fc_reposo),
                dias_entreno_semana: Number(form.dias_entreno_semana),
                minutos_dia: Number(form.minutos_dia),
                subscription_status: 'trialing',
            }
            const { error } = await saveProfile(profileData)
            if (error) {
                setErrors({ form: 'Error al guardar el perfil. Inténtalo de nuevo.' })
            } else {
                navigate('/generate-plan')
            }
        } catch {
            setErrors({ form: 'Error inesperado. Inténtalo de nuevo.' })
        } finally {
            setLoading(false)
        }
    }



    return (
        <div className="min-h-screen bg-titan-sand-light">
            {/* Header */}
            <div className="gradient-desert px-4 pt-8 pb-12">
                <div className="max-w-lg mx-auto text-center">
                    <div className="inline-flex items-center gap-2 mb-3">
                        <Mountain size={20} className="text-titan-orange-light" />
                        <span className="text-white/70 text-sm font-medium">Titan Desert Trainer</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-6">Configura tu perfil</h1>

                    {/* Progress bar */}
                    <div className="flex items-center gap-2 max-w-xs mx-auto">
                        {STEPS.map((s, i) => (
                            <div key={i} className="flex-1 flex items-center gap-2">
                                <div
                                    className={`w-full h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'bg-titan-orange-light' : 'bg-white/20'
                                        }`}
                                />
                            </div>
                        ))}
                    </div>
                    <p className="text-white/60 text-sm mt-3">
                        Paso {step + 1} de {STEPS.length} — {STEPS[step].title}
                    </p>
                </div>
            </div>

            {/* Form content */}
            <div className="px-4 -mt-6 pb-8 max-w-lg mx-auto">
                <div className="glass-card p-6 animate-fade-in">
                    {errors.form && (
                        <div className="bg-titan-danger/10 border border-titan-danger/20 text-titan-danger text-sm rounded-xl px-4 py-3 mb-4">
                            {errors.form}
                        </div>
                    )}

                    {/* Step 1: Personal data */}
                    {step === 0 && (
                        <div className="space-y-4">
                            <InputField label="Nombre y apellidos" field="nombre" type="text" placeholder="Tu nombre completo" form={form} update={update} errors={errors} />
                            <div className="grid grid-cols-3 gap-3">
                                <InputField label="Edad" field="edad" placeholder="35" unit="años" min={16} max={80} form={form} update={update} errors={errors} />
                                <InputField label="Peso" field="peso" placeholder="75" unit="kg" min={40} max={150} form={form} update={update} errors={errors} />
                                <InputField label="Altura" field="altura" placeholder="178" unit="cm" min={140} max={210} form={form} update={update} errors={errors} />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Performance */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-titan-blue/70 mb-2">Nivel de experiencia</label>
                                <div className="grid gap-2">
                                    {NIVELES.map((nivel) => (
                                        <button
                                            key={nivel.value}
                                            type="button"
                                            onClick={() => update('nivel_experiencia', nivel.value)}
                                            className={`text-left p-3 rounded-xl border-2 transition-all ${form.nivel_experiencia === nivel.value
                                                ? 'border-titan-orange bg-titan-orange/5'
                                                : 'border-titan-sand-dark hover:border-titan-orange/30'
                                                }`}
                                        >
                                            <span className="font-semibold text-sm text-titan-blue">{nivel.label}</span>
                                            <p className="text-xs text-titan-blue/50 mt-0.5">{nivel.desc}</p>
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
                    {step === 2 && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-titan-blue/70 mb-2">
                                    Días disponibles para entrenar: <strong className="text-titan-orange">{form.dias_entreno_semana}</strong> días/semana
                                </label>
                                <input
                                    type="range"
                                    min="2"
                                    max="6"
                                    value={form.dias_entreno_semana}
                                    onChange={(e) => update('dias_entreno_semana', Number(e.target.value))}
                                    className="w-full h-2 bg-titan-sand-dark rounded-lg appearance-none cursor-pointer accent-titan-orange"
                                />
                                <div className="flex justify-between text-xs text-titan-blue/40 mt-1">
                                    <span>2 días</span>
                                    <span>6 días</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-titan-blue/70 mb-2">
                                    Disponibilidad diaria: <strong className="text-titan-orange">{form.minutos_dia}</strong> minutos
                                </label>
                                <input
                                    type="range"
                                    min="30"
                                    max="180"
                                    step="15"
                                    value={form.minutos_dia}
                                    onChange={(e) => update('minutos_dia', Number(e.target.value))}
                                    className="w-full h-2 bg-titan-sand-dark rounded-lg appearance-none cursor-pointer accent-titan-orange"
                                />
                                <div className="flex justify-between text-xs text-titan-blue/40 mt-1">
                                    <span>30 min</span>
                                    <span>3 horas</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-titan-blue/70 mb-3">
                                    ¿Has participado antes en la Titan Desert?
                                </label>
                                <div className="flex gap-3">
                                    {[
                                        { value: false, label: 'No, es mi primera vez' },
                                        { value: true, label: 'Sí, ya he participado' },
                                    ].map((option) => (
                                        <button
                                            key={String(option.value)}
                                            type="button"
                                            onClick={() => update('participado_antes', option.value)}
                                            className={`flex-1 p-3 rounded-xl border-2 text-sm font-medium transition-all ${form.participado_antes === option.value
                                                ? 'border-titan-orange bg-titan-orange/5 text-titan-orange'
                                                : 'border-titan-sand-dark text-titan-blue/60 hover:border-titan-orange/30'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center gap-3 mt-8">
                        {step > 0 && (
                            <button type="button" onClick={prevStep} className="btn-secondary flex-1">
                                <ChevronLeft size={18} /> Anterior
                            </button>
                        )}
                        {step < STEPS.length - 1 ? (
                            <button type="button" onClick={nextStep} className="btn-primary flex-1">
                                Siguiente <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Guardando...
                                    </span>
                                ) : (
                                    <>Generar mi plan <ChevronRight size={18} /></>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
