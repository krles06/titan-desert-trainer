import { useState, useEffect } from 'react'
import { ShieldCheck } from 'lucide-react'

export default function CookieBanner() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem('dunr_cookie_consent')
        if (!consent) {
            setVisible(true)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('dunr_cookie_consent', 'true')
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div className="fixed bottom-6 left-4 right-4 z-[100] animate-slide-up">
            <div className="glass-card-dark p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 border-dunr-blue/20 shadow-2xl shadow-black/50 max-w-lg mx-auto">
                <div className="w-10 h-10 rounded-full bg-dunr-blue/10 flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} className="text-dunr-blue" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-dunr-blue mb-1">Privacidad y Cookies</p>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                        Utilizamos cookies para mejorar tu experiencia y analizar el uso de nuestra app. Al continuar navegando, aceptas nuestra política.
                    </p>
                </div>
                <button
                    onClick={handleAccept}
                    className="w-full sm:w-auto px-6 py-2.5 bg-dunr-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-dunr-blue/80 transition-all shadow-lg shadow-dunr-blue/20"
                >
                    Aceptar
                </button>
            </div>
        </div>
    )
}
