import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, Eye, EyeOff, Mountain } from 'lucide-react'

export default function Login() {
    const { signIn } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { error: authError } = await signIn(email, password)
            if (authError) {
                setError('Email o contraseña incorrectos')
            } else {
                navigate('/dashboard')
            }
        } catch {
            setError('Error al iniciar sesión. Inténtalo de nuevo.')
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
                    <h1 className="text-2xl font-bold text-white">Iniciar sesión</h1>
                    <p className="text-white/60 text-sm mt-1">Accede a tu plan de entrenamiento</p>
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
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
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

                    <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Entrando...
                            </span>
                        ) : (
                            'Iniciar sesión'
                        )}
                    </button>

                    <div className="text-center space-y-2 pt-1">
                        <Link to="/forgot-password" className="text-sm text-titan-orange hover:underline block">
                            ¿Olvidaste tu contraseña?
                        </Link>
                        <p className="text-sm text-titan-blue/50">
                            ¿No tienes cuenta?{' '}
                            <Link to="/register" className="text-titan-orange font-semibold hover:underline">
                                Regístrate
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
