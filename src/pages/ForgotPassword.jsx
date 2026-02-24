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
        <div className="min-h-screen gradient-desert flex flex-col items-center justify-center px-4 py-8">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-titan-orange/20 backdrop-blur-sm mb-4">
                        <Mountain size={28} className="text-titan-orange-light" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Recuperar contraseña</h1>
                    <p className="text-white/60 text-sm mt-1">Te enviaremos un enlace de recuperación</p>
                </div>

                <div className="glass-card p-6">
                    {sent ? (
                        <div className="text-center py-4">
                            <CheckCircle size={48} className="text-titan-success mx-auto mb-4" />
                            <h2 className="text-lg font-semibold text-titan-blue mb-2">¡Email enviado!</h2>
                            <p className="text-sm text-titan-blue/60 mb-6">
                                Revisa tu bandeja de entrada en <strong>{email}</strong> y sigue las instrucciones.
                            </p>
                            <Link to="/login" className="btn-primary w-full text-center">
                                Volver al login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-titan-danger/10 border border-titan-danger/20 text-titan-danger text-sm rounded-xl px-4 py-3">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-titan-blue/70 mb-1.5">Email</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-titan-blue/30" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-field pl-10"
                                        placeholder="tu@email.com"
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary w-full">
                                {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                            </button>

                            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-titan-blue/50 hover:text-titan-orange pt-1">
                                <ArrowLeft size={16} /> Volver al login
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
