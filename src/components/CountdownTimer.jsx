import { useState, useEffect, useRef } from 'react'

const DEFAULT_DATE = '2026-04-26T00:00:00+01:00'

function getTimeRemaining(targetDate) {
    const raceDate = new Date(targetDate || DEFAULT_DATE).getTime()
    const now = Date.now()
    const diff = raceDate - now

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
            <div className="flex flex-col items-center">
                <span className={`text-base font-black tabular-nums tracking-tighter text-white ${animate ? 'animate-countdown-tick' : ''}`}>
                    {String(value).padStart(2, '0')}
                </span>
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest -mt-1">{label}</span>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center">
            <div className={`glass-card-dark px-2 sm:px-4 py-3 min-w-[60px] sm:min-w-[80px] text-center border-white/5 relative overflow-hidden ${animate ? 'animate-countdown-tick' : ''}`}>
                <span className="text-3xl sm:text-5xl font-black tabular-nums text-white tracking-tighter">
                    {String(value).padStart(2, '0')}
                </span>
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            </div>
            <span className="text-[10px] sm:text-xs mt-3 font-black text-white/30 uppercase tracking-[0.2em] ml-1">{label}</span>
        </div>
    )
}

export default function CountdownTimer({ mini = false, targetDate, raceName }) {
    const [time, setTime] = useState(() => getTimeRemaining(targetDate))

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(getTimeRemaining(targetDate))
        }, 1000)
        return () => clearInterval(interval)
    }, [targetDate])

    if (time.finished) {
        return (
            <div className={`text-center ${mini ? 'py-1' : 'py-8'}`}>
                <div className={`font-black uppercase tracking-tighter ${mini ? 'text-sm' : 'text-3xl'} text-dunr-orange`}>
                    🎉 ¡MISIÓN INICIADA!
                </div>
                {!mini && (
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-4">La {raceName || 'Titan Desert'} está en curso.</p>
                )}
            </div>
        )
    }

    if (mini) {
        return (
            <div className="glass-card !bg-white/5 px-4 py-3 flex items-center justify-between border-white/5 backdrop-blur-md">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">T-MINUS</span>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">TITAN DESERT</span>
                </div>
                <div className="flex items-center gap-4">
                    <CountdownUnit value={time.days} label="days" mini />
                    <CountdownUnit value={time.hours} label="hours" mini />
                    <CountdownUnit value={time.minutes} label="min" mini />
                    <CountdownUnit value={time.seconds} label="sec" mini />
                </div>
            </div>
        )
    }

    return (
        <div className="text-center">
            <p className="text-[10px] sm:text-xs font-black text-white/30 mb-8 uppercase tracking-[0.4em] ml-1">
                STATUS: DESIERTO APROXIMÁNDOSE
            </p>
            <div className="flex items-center justify-center gap-3 sm:gap-4">
                <CountdownUnit value={time.days} label="DÍAS" />
                <span className="text-2xl sm:text-4xl font-black text-white/5 mb-8">:</span>
                <CountdownUnit value={time.hours} label="HORAS" />
                <span className="text-2xl sm:text-4xl font-black text-white/5 mb-8">:</span>
                <CountdownUnit value={time.minutes} label="MIN" />
                <span className="text-2xl sm:text-4xl font-black text-white/5 mb-8">:</span>
                <CountdownUnit value={time.seconds} label="SEG" />
            </div>
        </div>
    )
}
