import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { DEMO_MODE } from '../lib/mockData'
import { Check, Shield, Zap, ChevronLeft } from 'lucide-react'

export default function Subscription() {
    const { profile, user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const isSubscribed = profile?.subscription_status === 'active'

    async function handleSubscribe() {
        if (isSubscribed) return

        setLoading(true)
        setError(null)
        try {
            if (DEMO_MODE) {
                // Simulate a checkout redirect
                setTimeout(() => alert('En modo demo no se procesan pagos reales. Redirigiendo a Stripe...'), 1000)
                return
            }

            // Call Supabase Edge Function to create Stripe Checkout Session
            const { data, error: functionError } = await supabase.functions.invoke('create-checkout-session', {
                body: { returnUrl: window.location.origin + '/dashboard' }
            })

            if (functionError) throw functionError

            // Redirect to Stripe
            if (data?.url) {
                window.location.href = data.url
            } else {
                throw new Error('No se pudo inicializar el pago.')
            }

        } catch (err) {
            setError(err.message || 'Error al conectar con Stripe')
        } finally {
            setLoading(false)
        }
    }

    async function handlePortal() {
        setLoading(true)
        try {
            if (DEMO_MODE) {
                alert('Modo demo: Portal de cliente no disponible.')
                return
            }

            const { data, error: functionError } = await supabase.functions.invoke('create-portal-link', {
                body: { returnUrl: window.location.origin + '/profile' }
            })

            if (functionError) throw functionError

            if (data?.url) {
                window.location.href = data.url
            }
        } catch (err) {
            setError('Error al abrir el portal de facturación')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-dunr-black pb-32 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-dunr-blue/5 rounded-full blur-3xl -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-dunr-orange/5 rounded-full blur-3xl -ml-48 -mb-48" />

            {/* Header */}
            <div className="px-4 pt-8 pb-10 relative z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors mb-10"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="max-w-lg mx-auto text-center">
                    <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-dunr-orange/10 rotate-3 animate-pulse-glow">
                        <Zap size={40} className="text-dunr-orange" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-3 tracking-tighter uppercase">
                        {isSubscribed ? 'TU SUSCRIPCIÓN' : 'POTENCIAL ILIMITADO'}
                    </h1>
                    <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest px-8 leading-relaxed">
                        {isSubscribed
                            ? 'Gracias por confiar en DUNR. Tu plan de rendimiento extremo está activo.'
                            : 'Únete hoy y obtén un plan de entrenamiento evolutivo generado por IA avanzada.'}
                    </p>
                </div>
            </div>

            <div className="px-4 max-w-lg mx-auto relative z-10">
                {error && (
                    <div className="bg-titan-danger/10 border border-titan-danger/20 text-titan-danger text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl mb-8 flex items-center gap-3">
                        <Shield size={16} />
                        {error}
                    </div>
                )}

                {/* Pricing Card */}
                <div className="glass-card p-8 border-white/10 shadow-3xl relative overflow-hidden animate-fade-in group hover:border-white/20 transition-all duration-500">
                    {/* Badge */}
                    <div className="absolute top-0 right-0 bg-dunr-orange text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest shadow-lg">
                        RECOMENDADO
                    </div>

                    <div className="mb-10">
                        <h2 className="text-sm font-black text-white/40 uppercase tracking-[0.2em] mb-4">PLAN PRO</h2>
                        <div className="flex items-end gap-2 mb-3">
                            <span className="text-6xl font-black text-white tracking-tighter">14<span className="text-dunr-orange">.99</span></span>
                            <div className="flex flex-col mb-1.5">
                                <span className="text-2xl font-black text-white tracking-tighter">€</span>
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">/ MES</span>
                            </div>
                        </div>
                        <p className="text-[11px] text-white/30 font-bold uppercase tracking-wider leading-relaxed">Facturado mensualmente.<br />Cancela en cualquier momento.</p>
                    </div>

                    <ul className="space-y-4 mb-10">
                        {[
                            'Plan de entrenamiento IA personalizado',
                            'Ajuste inteligente basado en tu feedback',
                            'Sincronización semanal automática',
                            'Análisis de zonas de frecuencia cardíaca',
                            'Soporte prioritario'
                        ].map((feature, i) => (
                            <li key={i} className="flex items-start gap-4">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                                    <Check size={12} className="text-emerald-500" />
                                </div>
                                <span className="text-xs font-bold text-white uppercase tracking-wide leading-tight">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    {isSubscribed ? (
                        <button
                            onClick={handlePortal}
                            disabled={loading}
                            className="w-full py-5 px-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-colors flex justify-center items-center gap-3"
                        >
                            {loading ? 'Redirigiendo...' : 'Gestionar suscripción'}
                        </button>
                    ) : (
                        <button
                            onClick={handleSubscribe}
                            disabled={loading}
                            className="btn-primary w-full py-5 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-dunr-blue/40 disabled:opacity-50"
                        >
                            {loading ? 'CONECTANDO...' : 'SUSCRIBIRSE AHORA'}
                        </button>
                    )}

                    <div className="mt-8 flex items-center justify-center gap-3 text-white/20 text-[10px] font-bold uppercase tracking-widest">
                        <Shield size={14} />
                        <span>Pago seguro vía Stripe</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
