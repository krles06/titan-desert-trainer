import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import DunrLogo from './DunrLogo'

export default function InstallBanner() {
    const [prompt, setPrompt] = useState(null)
    const [show, setShow] = useState(false)
    const [installed, setInstalled] = useState(false)

    useEffect(() => {
        // Don't show if already running as standalone PWA
        if (window.matchMedia('(display-mode: standalone)').matches) return
        if (localStorage.getItem('pwa-banner-dismissed')) return

        const handler = (e) => {
            e.preventDefault()
            setPrompt(e)
            setShow(true)
        }
        window.addEventListener('beforeinstallprompt', handler)
        window.addEventListener('appinstalled', () => setInstalled(true))
        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    async function install() {
        if (!prompt) return
        prompt.prompt()
        const { outcome } = await prompt.userChoice
        if (outcome === 'accepted') setInstalled(true)
        setShow(false)
    }

    function dismiss() {
        localStorage.setItem('pwa-banner-dismissed', '1')
        setShow(false)
    }

    if (!show || installed) return null

    return (
        <div className="fixed bottom-20 left-4 right-4 z-40 max-w-lg mx-auto animate-fade-in">
            <div className="glass-card-dark p-4 flex items-center gap-3 border border-dunr-orange/20 shadow-2xl shadow-black/60">
                <div className="w-12 h-10 rounded-2xl bg-dunr-orange flex items-center justify-center shrink-0">
                    <DunrLogo variant="mark" color="dark" className="w-9" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-white uppercase tracking-wider">Instalar DUNR</p>
                    <p className="text-[11px] text-white/50 leading-tight">Accede desde tu pantalla de inicio</p>
                </div>
                <button
                    onClick={install}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dunr-orange text-black text-xs font-black rounded-lg shrink-0 hover:bg-dunr-orange-light transition-colors"
                >
                    <Download size={13} />
                    Instalar
                </button>
                <button onClick={dismiss} className="text-white/20 hover:text-white/60 transition-colors shrink-0">
                    <X size={16} />
                </button>
            </div>
        </div>
    )
}
