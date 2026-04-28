import { useState, useEffect, useRef, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { DEMO_MODE, DEMO_SESSIONS } from '../lib/mockData'
import { Send, ChevronLeft, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import DunrLogo from '../components/DunrLogo'

const QUICK_QUESTIONS = [
    '¿Cómo voy de cara a la carrera?',
    'Me siento cansado, ¿descanso mañana?',
    '¿Qué como antes de un entreno largo?',
    '¿Cómo mejoro en los puertos?',
]

const WELCOME = `¡Hola! Soy tu coach DUNR. Tengo acceso a tu plan y tu progreso, así que puedo darte consejos 100% personalizados.

¿En qué puedo ayudarte hoy?`

function TypingDots() {
    return (
        <div className="flex items-center gap-1 px-4 py-3">
            {[0, 1, 2].map(i => (
                <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-white/30"
                    style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
            ))}
            <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
        </div>
    )
}

export default function CoachChat() {
    const { profile, user } = useAuth()
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingHistory, setLoadingHistory] = useState(true)
    const [sessions, setSessions] = useState([])
    const [stats, setStats] = useState(null)
    const bottomRef = useRef(null)
    const inputRef = useRef(null)

    // Load training data and chat history on mount
    useEffect(() => {
        async function loadAll() {
            if (DEMO_MODE) {
                const saved = localStorage.getItem('demo_sessions')
                const s = saved ? JSON.parse(saved) : DEMO_SESSIONS
                setSessions(s)
                buildStats(s)
                setMessages([{ role: 'assistant', content: WELCOME, id: 'welcome' }])
                setLoadingHistory(false)
                return
            }

            const [sessionsRes, historyRes] = await Promise.all([
                supabase.from('sessions').select('*').order('fecha', { ascending: false }).limit(50),
                supabase.from('chat_messages').select('*').order('created_at', { ascending: true }).limit(100)
            ])

            if (sessionsRes.data) {
                setSessions(sessionsRes.data)
                buildStats(sessionsRes.data)
            }

            if (historyRes.data && historyRes.data.length > 0) {
                setMessages(historyRes.data.map(m => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    created_at: m.created_at,
                })))
            } else {
                setMessages([{ role: 'assistant', content: WELCOME, id: 'welcome' }])
                // Save welcome message
                await supabase.from('chat_messages').insert({
                    user_id: user.id,
                    role: 'assistant',
                    content: WELCOME,
                })
            }
            setLoadingHistory(false)
        }
        loadAll()
    }, [user])

    function buildStats(s) {
        const total = s.length
        const completed = s.filter(x => x.completada).length
        const hoursTotal = s.filter(x => x.completada)
            .reduce((sum, x) => sum + (x.tiempo_real_min || x.duracion_min || 0), 0) / 60
        const today = new Date().toISOString().split('T')[0]
        const completedDates = s.filter(x => x.completada).map(x => x.fecha)
        let streak = 0
        const d = new Date()
        for (let i = 0; i < 30; i++) {
            const ds = d.toISOString().split('T')[0]
            const has = s.some(x => x.fecha === ds)
            if (has && completedDates.includes(ds)) streak++
            else if (has && ds < today) break
            d.setDate(d.getDate() - 1)
        }
        setStats({ total, completed, percentComplete: total ? Math.round((completed / total) * 100) : 0, hoursTotal, streak })
    }

    useEffect(() => {
        if (!loadingHistory) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, loading, loadingHistory])

    const recentSessions = useMemo(() =>
        sessions.filter(s => s.completada).slice(0, 5),
        [sessions]
    )

    async function send(text) {
        const msg = text || input.trim()
        if (!msg || loading) return

        setInput('')
        const userMsg = { role: 'user', content: msg, id: Date.now().toString() }
        setMessages(prev => [...prev, userMsg])
        setLoading(true)

        try {
            const history = messages
                .filter(m => m.role !== 'system')
                .slice(-10)
                .map(m => ({ role: m.role, content: m.content }))

            if (DEMO_MODE) {
                await new Promise(r => setTimeout(r, 1200))
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'En modo demo el coach no está disponible.',
                    id: Date.now().toString()
                }])
                return
            }

            // Save user message to DB
            await supabase.from('chat_messages').insert({
                user_id: user.id,
                role: 'user',
                content: msg,
            })

            const { data, error } = await supabase.functions.invoke('coach-chat', {
                body: { message: msg, profile, recentSessions, stats, history }
            })
            if (error || data?.error) throw new Error(error?.message || data?.error)

            // Save assistant reply to DB
            await supabase.from('chat_messages').insert({
                user_id: user.id,
                role: 'assistant',
                content: data.reply,
            })

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.reply,
                id: Date.now().toString()
            }])
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Ha habido un error. Inténtalo de nuevo en un momento.',
                id: Date.now().toString()
            }])
        } finally {
            setLoading(false)
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }

    async function clearHistory() {
        if (!confirm('¿Borrar todo el historial del chat?')) return
        if (!DEMO_MODE) {
            await supabase.from('chat_messages').delete().eq('user_id', user.id)
        }
        setMessages([{ role: 'assistant', content: WELCOME, id: 'welcome' }])
        if (!DEMO_MODE) {
            await supabase.from('chat_messages').insert({
                user_id: user.id, role: 'assistant', content: WELCOME,
            })
        }
    }

    function handleKey(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
    }

    const showQuickQuestions = messages.length <= 1

    return (
        <div className="flex flex-col h-dvh bg-dunr-black">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-6 pb-4 border-b border-white/5 shrink-0">
                <Link to="/dashboard" className="p-2 rounded-xl text-white/40 hover:text-white transition-colors">
                    <ChevronLeft size={20} />
                </Link>
                <div className="w-11 h-9 rounded-2xl bg-dunr-orange flex items-center justify-center shrink-0">
                    <DunrLogo variant="mark" color="dark" className="w-8" />
                </div>
                <div>
                    <p className="text-sm font-black text-white leading-none">DUNR Coach</p>
                    <p className="text-[10px] text-white/40 mt-0.5">Entrenador personal IA</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-titan-success animate-pulse" />
                        <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Activo</span>
                    </div>
                    {messages.length > 1 && (
                        <button
                            onClick={clearHistory}
                            className="p-1.5 rounded-lg text-white/20 hover:text-white/60 transition-colors"
                        >
                            <Trash2 size={15} />
                        </button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {loadingHistory ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="flex gap-2">
                            <div className="w-7 h-7 rounded-xl bg-white/5 shrink-0" />
                            <div className="h-16 bg-white/5 rounded-2xl flex-1" />
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((m, i) => (
                            <div key={m.id || i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                {m.role === 'assistant' && (
                                    <div className="w-8 h-7 rounded-xl bg-dunr-orange/20 flex items-center justify-center shrink-0 mr-2 mt-1">
                                        <DunrLogo variant="mark" className="w-6" />
                                    </div>
                                )}
                                <div className="flex flex-col gap-1" style={{ maxWidth: '82%' }}>
                                    <div
                                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                                            m.role === 'user'
                                                ? 'bg-dunr-orange text-black font-medium rounded-br-sm'
                                                : 'bg-white/5 text-white/90 border border-white/5 rounded-bl-sm'
                                        }`}
                                    >
                                        {m.content}
                                    </div>
                                    {m.created_at && (
                                        <span className={`text-[10px] text-white/20 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            {new Date(m.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start animate-fade-in">
                                <div className="w-8 h-7 rounded-xl bg-dunr-orange/20 flex items-center justify-center shrink-0 mr-2 mt-1">
                                    <DunrLogo variant="mark" className="w-6" />
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-sm">
                                    <TypingDots />
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Quick questions */}
            {showQuickQuestions && !loadingHistory && (
                <div className="px-4 pb-3 flex gap-2 overflow-x-auto shrink-0 no-scrollbar">
                    {QUICK_QUESTIONS.map(q => (
                        <button
                            key={q}
                            onClick={() => send(q)}
                            className="shrink-0 px-3 py-2 rounded-xl bg-white/5 border border-white/8 text-xs text-white/60 hover:text-white hover:border-dunr-orange/40 transition-all whitespace-nowrap"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="px-4 pb-6 pt-2 border-t border-white/5 shrink-0">
                <div className="flex gap-2 items-end">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Pregunta a tu coach..."
                        rows={1}
                        className="flex-1 input-field resize-none py-3 leading-tight max-h-28"
                        style={{ fieldSizing: 'content' }}
                    />
                    <button
                        onClick={() => send()}
                        disabled={!input.trim() || loading}
                        className="w-11 h-11 rounded-2xl bg-dunr-orange flex items-center justify-center shrink-0 transition-all disabled:opacity-30 hover:bg-dunr-orange-light active:scale-95"
                    >
                        <Send size={16} className="text-black" />
                    </button>
                </div>
            </div>
        </div>
    )
}
