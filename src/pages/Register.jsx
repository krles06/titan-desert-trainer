import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, Eye, EyeOff, Mountain } from 'lucide-react'

export default function Register() {
    const { signUp } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            return
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        setLoading(true)
        try {
            const { error: authError } = await signUp(email, password)
            if (authError) {
                setError(authError.message || 'Error al crear la cuenta')
            } else {
                navigate('/onboarding')
            }
        } catch {
            setError('Error al crear la cuenta. Inténtalo de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen gradient-desert flex flex-col items-center justify-center px-4 py-8">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-titan-orange/20 backdrop-blur-sm mb-4">
                        <Mountain size={28} className="text-titan-orange-light" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
                    <p className="text-white/60 text-sm mt-1">Comienza tu preparación para la Titan Desert</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
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

                    <div>
                        <label className="block text-sm font-medium text-titan-blue/70 mb-1.5">Contraseña</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-titan-blue/30" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field pl-10 pr-10"
                                placeholder="Mínimo 6 caracteres"
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-titan-blue/30 hover:text-titan-blue/60 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-3"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-titan-blue/70 mb-1.5">Confirmar contraseña</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-titan-blue/30" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-field pl-10"
                                placeholder="Repite la contraseña"
                                required
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Creando cuenta...
                            </span>
                        ) : (
                            'Crear mi cuenta'
                        )}
                    </button>

                    <p className="text-center text-sm text-titan-blue/50 pt-1">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="text-titan-orange font-semibold hover:underline">
                            Inicia sesión
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
