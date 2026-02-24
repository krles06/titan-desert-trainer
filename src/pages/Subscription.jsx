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
        <div className="min-h-screen gradient-desert pb-24">
            {/* Header */}
            <div className="px-4 pt-6 pb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center gap-2 text-white hover:bg-white/20 transition-colors mb-6 justify-center"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="max-w-lg mx-auto text-center">
                    <div className="w-16 h-16 rounded-full bg-titan-orange/20 flex items-center justify-center mx-auto mb-4 border border-titan-orange/30">
                        <Zap size={32} className="text-titan-orange-light" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        {isSubscribed ? 'Tu Suscripción' : 'Desbloquea tu potencial'}
                    </h1>
                    <p className="text-white/70 text-sm px-4">
                        {isSubscribed
                            ? 'Gracias por confiar en Titan Desert Trainer. Tu plan Pro está activo.'
                            : 'Únete hoy y obtén un plan de entrenamiento evolutivo generado por IA.'}
                    </p>
                </div>
            </div>

            <div className="px-4 max-w-lg mx-auto">
                {error && (
                    <div className="bg-titan-danger/20 border border-titan-danger text-white text-sm p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {/* Pricing Card */}
                <div className="bg-white rounded-2xl p-6 shadow-xl relative overflow-hidden animate-fade-in">
                    {/* Badge */}
                    <div className="absolute top-0 right-0 bg-titan-orange text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                        Recomendado
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-titan-blue mb-1">Plan Pro</h2>
                        <div className="flex items-end gap-1 mb-2">
                            <span className="text-4xl font-black text-titan-orange">€14.99</span>
                            <span className="text-titan-blue/50 pb-1 font-medium">/ mes</span>
                        </div>
                        <p className="text-sm text-titan-blue/60">Facturado mensualmente. Cancela cuando quieras.</p>
                    </div>

                    <ul className="space-y-3 mb-8">
                        {[
                            'Plan de entrenamiento IA personalizado',
                            'Ajuste inteligente basado en tu feedback',
                            'Sincronización semanal automática',
                            'Análisis de zonas de frecuencia cardíaca',
                            'Soporte prioritario'
                        ].map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <Check size={18} className="text-titan-success shrink-0 mt-0.5" />
                                <span className="text-sm text-titan-blue/80">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    {isSubscribed ? (
                        <button
                            onClick={handlePortal}
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-titan-sand-dark text-titan-blue rounded-xl font-bold hover:bg-titan-sand transition-colors flex justify-center items-center gap-2"
                        >
                            {loading ? 'Redirigiendo...' : 'Gestionar suscripción'}
                        </button>
                    ) : (
                        <button
                            onClick={handleSubscribe}
                            disabled={loading}
                            className="btn-primary w-full py-3.5 text-base shadow-lg shadow-titan-orange/30 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Conectando...' : 'Suscribirse ahora'}
                        </button>
                    )}

                    <div className="mt-4 flex items-center justify-center gap-2 text-titan-blue/40 text-xs">
                        <Shield size={14} />
                        <span>Pago seguro procesado por Stripe</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
