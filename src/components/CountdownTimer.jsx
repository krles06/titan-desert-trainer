import { useState, useEffect, useRef } from 'react'

const RACE_DATE = new Date('2026-04-26T00:00:00+01:00').getTime()

function getTimeRemaining() {
    const now = Date.now()
    const diff = RACE_DATE - now

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true }
    }

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        finished: false,
    }
}

function CountdownUnit({ value, label, mini }) {
    const prevValue = useRef(value)
    const [animate, setAnimate] = useState(false)

    useEffect(() => {
        if (prevValue.current !== value) {
            setAnimate(true)
            const t = setTimeout(() => setAnimate(false), 300)
            prevValue.current = value
            return () => clearTimeout(t)
        }
    }, [value])

    if (mini) {
        return (
            <div className="flex items-baseline gap-1">
                <span className={`text-xl font-bold tabular-nums ${animate ? 'animate-countdown-tick' : ''}`}>
                    {String(value).padStart(2, '0')}
                </span>
                <span className="text-xs text-white/60 font-medium">{label}</span>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center">
            <div className={`glass-card-dark px-4 py-3 min-w-[70px] text-center ${animate ? 'animate-countdown-tick' : ''}`}>
                <span className="text-3xl sm:text-4xl font-bold tabular-nums text-white">
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span className="text-xs mt-1.5 font-medium text-titan-blue/60 uppercase tracking-wider">{label}</span>
        </div>
    )
}

export default function CountdownTimer({ mini = false }) {
    const [time, setTime] = useState(getTimeRemaining)

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(getTimeRemaining())
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    if (time.finished) {
        return (
            <div className={`text-center ${mini ? 'py-2' : 'py-6'}`}>
                <div className={`font-bold ${mini ? 'text-lg' : 'text-2xl'} text-titan-orange`}>
                    🎉 ¡La carrera ha comenzado!
                </div>
                {!mini && (
                    <p className="text-titan-blue/60 mt-2">La Škoda Morocco Titan Desert está en marcha.</p>
                )}
            </div>
        )
    }

    if (mini) {
        return (
            <div className="glass-card-dark px-4 py-3 flex items-center gap-3">
                <span className="text-xs text-white/60 font-medium">🏁 Faltan</span>
                <div className="flex items-center gap-2 text-white">
                    <CountdownUnit value={time.days} label="d" mini />
                    <span className="text-white/30">:</span>
                    <CountdownUnit value={time.hours} label="h" mini />
                    <span className="text-white/30">:</span>
                    <CountdownUnit value={time.minutes} label="m" mini />
                    <span className="text-white/30">:</span>
                    <CountdownUnit value={time.seconds} label="s" mini />
                </div>
            </div>
        )
    }

    return (
        <div className="text-center">
            <p className="text-sm font-medium text-titan-blue/60 mb-3 uppercase tracking-wider">
                Cuenta atrás para la carrera
            </p>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
                <CountdownUnit value={time.days} label="días" />
                <span className="text-2xl font-bold text-titan-blue/20 pt-[-10px]">:</span>
                <CountdownUnit value={time.hours} label="horas" />
                <span className="text-2xl font-bold text-titan-blue/20">:</span>
                <CountdownUnit value={time.minutes} label="minutos" />
                <span className="text-2xl font-bold text-titan-blue/20">:</span>
                <CountdownUnit value={time.seconds} label="segundos" />
            </div>
        </div>
    )
}
