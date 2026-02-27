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
        <div className="min-h-screen bg-dunr-black flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-dunr-blue/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-dunr-orange/5 rounded-full blur-3xl -ml-32 -mb-32" />

            <div className="w-full max-w-sm relative z-10">
                {/* Logo */}
                <div className="text-center mb-8 sm:mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
                        <Mountain size={28} className="text-dunr-blue" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-2">
                        DUN<span className="text-dunr-orange">R</span>
                    </h1>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Domina el desierto</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5 border-white/5">
                    <h2 className="text-lg font-bold text-white uppercase tracking-tight text-center mb-2">Crear cuenta</h2>
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

                    <div>
                        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field !pl-12 !pr-10"
                                placeholder="Mínimo 6 caracteres"
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center -mr-3"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 ml-1">Confirmar contraseña</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-field !pl-12"
                                placeholder="Repite la contraseña"
                                required
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full !text-xs !font-black !uppercase !tracking-widest !py-4 shadow-xl shadow-dunr-blue/20">
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                CREANDO...
                            </span>
                        ) : (
                            'Crear mi cuenta'
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-[11px] text-white/30 font-bold uppercase tracking-wider">
                            ¿Ya tienes cuenta?{' '}
                            <Link to="/login" className="text-dunr-orange hover:underline">
                                Inicia sesión
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
