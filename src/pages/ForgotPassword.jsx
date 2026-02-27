import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Mountain, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
    const { resetPassword } = useAuth()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { error: resetError } = await resetPassword(email)
            if (resetError) {
                setError(resetError.message || 'Error al enviar el email')
            } else {
                setSent(true)
            }
        } catch {
            setError('Error al enviar el email. Inténtalo de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-dunr-black flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-dunr-blue/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-dunr-orange/5 rounded-full blur-3xl -ml-32 -mb-32" />

            <div className="w-full max-w-sm relative z-10">
                <div className="text-center mb-8 sm:mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
                        <Mountain size={28} className="text-dunr-orange" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-2">
                        DUN<span className="text-dunr-orange">R</span>
                    </h1>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Recuperar acceso</p>
                </div>

                <div className="glass-card p-6 border-white/5">
                    {sent ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={32} className="text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">¡EMAIL ENVIADO!</h2>
                            <p className="text-sm text-white/40 mb-8 leading-relaxed font-medium">
                                Revisa tu bandeja de entrada en <span className="text-white">{email}</span> y sigue las instrucciones.
                            </p>
                            <Link to="/login" className="btn-primary w-full text-center !py-4 !text-xs !font-black !uppercase !tracking-widest">
                                Volver al login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-titan-danger/10 border border-titan-danger/20 text-titan-danger text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-3">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 ml-1">Email</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-field !pl-12"
                                        placeholder="tu@email.com"
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary w-full !py-4 !text-xs !font-black !uppercase !tracking-widest shadow-xl shadow-dunr-blue/20">
                                {loading ? 'Enviando...' : 'Enviar enlace'}
                            </button>

                            <Link to="/login" className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/30 hover:text-dunr-orange pt-2 transition-colors">
                                <ArrowLeft size={14} /> Volver al login
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
