import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CountdownTimer from '../components/CountdownTimer'
import CookieBanner from '../components/CookieBanner'
import {
    Mountain, Brain, Calendar, TrendingUp, ChevronRight,
    Info, Bot, Zap, CheckCircle, BarChart2, RefreshCw
} from 'lucide-react'
import { RACES } from '../lib/races'

const STEPS = [
    {
        n: '01',
        title: 'Cuéntanos tu nivel',
        desc: 'Rellena un formulario de 2 minutos con tu experiencia, disponibilidad y objetivo.',
    },
    {
        n: '02',
        title: 'La IA genera tu plan',
        desc: 'Creamos un macrociclo completo hasta el día de la carrera, con sesiones diarias detalladas.',
    },
    {
        n: '03',
        title: 'Entrena con tu coach',
        desc: 'Sigue las sesiones, registra tus datos y pregunta lo que quieras a tu entrenador IA.',
    },
]

const FEATURES = [
    { icon: Brain, title: 'Plan 100% personalizado', desc: 'Generado por IA con tu nivel, disponibilidad y fecha de carrera.' },
    { icon: Bot, title: 'Coach IA 24/7', desc: 'Pregunta cualquier duda sobre entrenamiento, nutrición o recuperación.' },
    { icon: Calendar, title: 'Calendario inteligente', desc: 'Sesiones organizadas día a día, reordenables con un toque.' },
    { icon: BarChart2, title: 'Análisis de progreso', desc: 'Gráficas de volumen semanal y distribución de carga por tipo.' },
    { icon: RefreshCw, title: 'Ajuste dinámico', desc: 'Si te quedas corto o lo estás dando todo, recalculamos el plan.' },
    { icon: Zap, title: 'Listo en 2 minutos', desc: 'Del registro al plan completo en menos tiempo del que tardas en calentar.' },
]

const STATS = [
    { value: '< 2 min', label: 'para generar tu plan' },
    { value: '16', label: 'semanas de entrenamiento' },
    { value: '5', label: 'tipos de sesión MTB' },
    { value: '24/7', label: 'coach IA disponible' },
]

// Simplified app UI mockup
function AppMockup() {
    return (
        <div className="relative mx-auto w-full max-w-[280px]">
            {/* Phone frame */}
            <div className="bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden shadow-2xl shadow-black/80">
                {/* Status bar */}
                <div className="flex justify-between items-center px-5 pt-3 pb-1">
                    <span className="text-[10px] text-white/40 font-bold">9:41</span>
                    <div className="flex gap-1">
                        <div className="w-4 h-2 rounded-sm bg-white/20" />
                        <div className="w-1.5 h-2 rounded-sm bg-white/20" />
                    </div>
                </div>
                {/* Header */}
                <div className="px-4 pt-2 pb-3 border-b border-white/5">
                    <p className="text-[10px] text-white/40">¡Hola, ciclista!</p>
                    <p className="text-sm font-black text-white">Tu preparación</p>
                </div>
                {/* Next session card */}
                <div className="mx-3 mt-3 rounded-2xl bg-white/5 border border-dunr-orange/20 border-l-4 border-l-dunr-orange p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Zap size={10} className="text-dunr-orange" />
                        <span className="text-[9px] text-white/50 uppercase font-bold tracking-wider">Próxima sesión</span>
                    </div>
                    <p className="text-xs font-black text-white">Intervalos</p>
                    <p className="text-[10px] text-white/50 mt-0.5">75 min · 28 km · Zona 4</p>
                </div>
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2 mx-3 mt-2 mb-3">
                    {[
                        { label: 'Semanas', value: '8/16' },
                        { label: 'Racha', value: '5 días' },
                        { label: 'Entrenado', value: '42h' },
                        { label: 'Progreso', value: '51%' },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-white/5 rounded-xl p-2.5">
                            <p className="text-[11px] font-black text-white">{value}</p>
                            <p className="text-[9px] text-white/30 uppercase font-bold">{label}</p>
                        </div>
                    ))}
                </div>
                {/* Progress bar */}
                <div className="mx-3 mb-3">
                    <div className="flex justify-between mb-1">
                        <span className="text-[9px] text-white/30 uppercase font-bold">Progreso total</span>
                        <span className="text-[10px] font-black text-dunr-orange">51%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-[51%] bg-dunr-orange rounded-full" />
                    </div>
                </div>
                {/* Bottom nav */}
                <div className="flex justify-around px-4 py-2.5 border-t border-white/5">
                    {['Dashboard', 'Calendario', 'Coach', 'Perfil'].map((tab, i) => (
                        <div key={tab} className="flex flex-col items-center gap-0.5">
                            <div className={`w-3 h-3 rounded-sm ${i === 0 ? 'bg-dunr-orange' : 'bg-white/20'}`} />
                            <span className={`text-[8px] font-bold ${i === 0 ? 'text-dunr-orange' : 'text-white/30'}`}>{tab}</span>
                        </div>
                    ))}
                </div>
            </div>
            {/* Glow */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-40 h-12 bg-dunr-orange/20 blur-2xl rounded-full" />
        </div>
    )
}

export default function Landing() {
    const { isAuthenticated } = useAuth()

    return (
        <div className="min-h-screen flex flex-col bg-dunr-black">
            <CookieBanner />

            {/* ── HERO ── */}
            <section className="relative overflow-hidden px-4 pt-14 pb-16">
                <div className="absolute top-0 right-0 w-80 h-80 bg-dunr-orange/8 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/3 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-lg mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 mb-6">
                        <Mountain size={12} className="text-dunr-orange" />
                        <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">Titan Desert 2026</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl sm:text-6xl font-black text-white leading-[0.95] tracking-tighter mb-4">
                        Entrena<br />
                        como un<br />
                        <span className="text-dunr-orange">pro.</span>
                    </h1>

                    <p className="text-white/60 text-base leading-relaxed mb-8 max-w-xs">
                        Plan de entrenamiento personalizado con IA y coach disponible 24/7. Del sofá al desierto.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col gap-3 mb-10">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="btn-primary w-full text-center">
                                Ir al Dashboard <ChevronRight size={18} />
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn-primary w-full text-center text-sm font-black uppercase tracking-widest">
                                    Empieza gratis <ChevronRight size={16} />
                                </Link>
                                <Link to="/login" className="btn-secondary w-full text-center text-sm">
                                    Ya tengo cuenta
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Countdown */}
                    <CountdownTimer targetDate={RACES[0].date} raceName={RACES[0].name} />
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="px-4 py-8 border-y border-white/5">
                <div className="max-w-lg mx-auto grid grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden">
                    {STATS.map(({ value, label }) => (
                        <div key={label} className="bg-dunr-black px-5 py-4">
                            <p className="text-2xl font-black text-dunr-orange leading-none">{value}</p>
                            <p className="text-[11px] text-white/40 mt-1 font-bold uppercase tracking-wider leading-tight">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="px-4 py-14 max-w-lg mx-auto w-full">
                <p className="text-[10px] font-black text-dunr-orange uppercase tracking-[0.3em] mb-2">Proceso</p>
                <h2 className="text-3xl font-black text-white tracking-tight mb-10">Cómo funciona</h2>

                <div className="space-y-6">
                    {STEPS.map(({ n, title, desc }) => (
                        <div key={n} className="flex gap-5 items-start">
                            <div className="shrink-0 w-12 h-12 rounded-2xl bg-dunr-orange flex items-center justify-center">
                                <span className="text-xs font-black text-black">{n}</span>
                            </div>
                            <div className="pt-1">
                                <h3 className="text-base font-black text-white mb-1">{title}</h3>
                                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── APP MOCKUP ── */}
            <section className="px-4 py-10 bg-[#060606]">
                <div className="max-w-lg mx-auto">
                    <p className="text-[10px] font-black text-dunr-orange uppercase tracking-[0.3em] mb-2 text-center">La app</p>
                    <h2 className="text-3xl font-black text-white tracking-tight mb-8 text-center">Todo en tu bolsillo</h2>
                    <AppMockup />
                    <p className="text-center text-xs text-white/30 mt-8">Instálala en tu móvil · Sin App Store</p>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="px-4 py-14 max-w-lg mx-auto w-full">
                <p className="text-[10px] font-black text-dunr-orange uppercase tracking-[0.3em] mb-2">Funcionalidades</p>
                <h2 className="text-3xl font-black text-white tracking-tight mb-8">Todo lo que necesitas</h2>

                <div className="grid grid-cols-1 gap-3">
                    {FEATURES.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="glass-card p-4 flex items-start gap-4">
                            <div className="w-9 h-9 rounded-xl bg-dunr-orange/10 flex items-center justify-center shrink-0">
                                <Icon size={18} className="text-dunr-orange" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white mb-0.5">{title}</h3>
                                <p className="text-xs text-white/50 leading-relaxed">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── RACES ── */}
            <section className="px-4 pb-14 max-w-lg mx-auto w-full">
                <p className="text-[10px] font-black text-dunr-orange uppercase tracking-[0.3em] mb-2">Carreras</p>
                <h2 className="text-3xl font-black text-white tracking-tight mb-6">¿Cuál es tu objetivo?</h2>

                <div className="space-y-3">
                    <div className="glass-card p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-dunr-orange font-black uppercase tracking-wider mb-1">Morocco</p>
                            <p className="text-base font-black text-white">Škoda Morocco Titan Desert</p>
                            <p className="text-xs text-white/40 mt-1">26 abr – 1 may 2026 · 6 etapas · +600 km</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-dunr-orange/10 flex items-center justify-center shrink-0">
                            <Mountain size={20} className="text-dunr-orange" />
                        </div>
                    </div>
                    <div className="glass-card p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-white/40 font-black uppercase tracking-wider mb-1">Almería</p>
                            <p className="text-base font-black text-white">Titan Desert Almería</p>
                            <p className="text-xs text-white/40 mt-1">Oct 2026 · 5 etapas · +350 km</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                            <Mountain size={20} className="text-white/40" />
                        </div>
                    </div>
                    <div className="glass-card p-5 flex items-center justify-between border border-dashed border-white/10">
                        <div>
                            <p className="text-xs text-white/40 font-black uppercase tracking-wider mb-1">Personalizado</p>
                            <p className="text-base font-black text-white">Tu propio objetivo</p>
                            <p className="text-xs text-white/40 mt-1">Cualquier fecha y distancia</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                            <Zap size={20} className="text-white/30" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ── */}
            <section className="px-4 pb-20 max-w-lg mx-auto w-full">
                <div className="bg-dunr-orange rounded-3xl p-8 text-center">
                    <h2 className="text-2xl font-black text-black leading-tight mb-2">
                        ¿Listo para el desierto?
                    </h2>
                    <p className="text-black/60 text-sm mb-6">Tu plan personalizado en menos de 2 minutos.</p>
                    {isAuthenticated ? (
                        <Link to="/dashboard" className="inline-flex items-center gap-2 bg-black text-white font-black text-sm uppercase tracking-widest px-6 py-3.5 rounded-xl hover:bg-black/80 transition-colors">
                            Ver mi plan <ChevronRight size={16} />
                        </Link>
                    ) : (
                        <Link to="/register" className="inline-flex items-center gap-2 bg-black text-white font-black text-sm uppercase tracking-widest px-6 py-3.5 rounded-xl hover:bg-black/80 transition-colors">
                            Empezar gratis <ChevronRight size={16} />
                        </Link>
                    )}
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="px-4 py-8 border-t border-white/5 text-center">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">DUNR © 2026</span>
                    <Link to="/legal" className="inline-flex items-center gap-1.5 text-white/20 hover:text-dunr-orange transition-colors text-[10px] font-black uppercase tracking-widest">
                        <Info size={11} />
                        Legal
                    </Link>
                </div>
            </footer>
        </div>
    )
}
