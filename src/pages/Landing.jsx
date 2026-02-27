import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CountdownTimer from '../components/CountdownTimer'
import { Mountain, Bike, Brain, Calendar, TrendingUp, ChevronRight } from 'lucide-react'
import { RACES } from '../lib/races'

const features = [
    {
        icon: Brain,
        title: 'Plan con IA',
        desc: 'Entrenamiento personalizado generado por inteligencia artificial',
    },
    {
        icon: Calendar,
        title: 'Calendario inteligente',
        desc: 'Sesiones organizadas día a día con seguimiento de progreso',
    },
    {
        icon: TrendingUp,
        title: 'Ajuste dinámico',
        desc: 'El plan se adapta según tu rendimiento real',
    },
]

export default function Landing() {
    const { isAuthenticated } = useAuth()

    return (
        <div className="min-h-screen flex flex-col">
            {/* Hero */}
            <section className="gradient-desert relative overflow-hidden px-4 pt-12 pb-16 sm:pt-16 sm:pb-20">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-dunr-blue/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-dunr-orange/5 rounded-full blur-2xl" />

                <div className="relative max-w-lg mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
                        <Mountain size={14} className="text-dunr-blue" />
                        <span className="text-xs font-medium text-white/80">{RACES[0].name} 2026</span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-3 tracking-tighter">
                        DUN
                        <span className="text-dunr-orange">R</span>
                    </h1>

                    <p className="text-white/90 text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed">
                        Tu preparación personalizada para conquistar el desierto. Planes de entrenamiento con IA, adaptados a tu nivel.
                    </p>

                    {/* Countdown */}
                    <div className="mb-8">
                        <CountdownTimer targetDate={RACES[0].date} raceName={RACES[0].name} />
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="btn-primary w-full sm:w-auto text-center">
                                Ir al Dashboard <ChevronRight size={18} />
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn-primary w-full sm:w-auto text-center">
                                    Empieza tu preparación <ChevronRight size={18} />
                                </Link>
                                <Link
                                    to="/login"
                                    className="btn-secondary w-full sm:w-auto text-center !bg-white/10 backdrop-blur-sm !text-white !border-white/20 hover:!bg-white/20 hover:!border-white/40 transition-all font-bold"
                                >
                                    Ya tengo cuenta
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="px-4 py-12 sm:py-16 max-w-lg mx-auto w-full">
                <h2 className="text-2xl font-bold text-titan-blue text-center mb-8">
                    ¿Cómo te preparamos?
                </h2>
                <div className="grid gap-4">
                    {features.map(({ icon: Icon, title, desc }) => (
                        <div
                            key={title}
                            className="glass-card p-5 flex items-start gap-4 animate-fade-in"
                        >
                            <div className="w-11 h-11 rounded-xl bg-titan-orange/10 flex items-center justify-center shrink-0">
                                <Icon size={22} className="text-titan-orange" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-titan-blue mb-0.5">{title}</h3>
                                <p className="text-sm text-titan-blue/60">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Event details */}
            <section className="px-4 pb-12 max-w-lg mx-auto w-full">
                <div className="glass-card-dark p-6 text-center">
                    <Bike size={28} className="text-titan-orange-light mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-2">26 abril — 1 mayo 2026</h3>
                    <p className="text-white/80 text-sm">
                        6 etapas · +600 km · Desierto del Sahara, Marruecos
                    </p>
                </div>
            </section>
        </div>
    )
}
