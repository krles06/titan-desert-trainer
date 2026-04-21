import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const TYPE_META = {
    rodaje:          { label: 'Rodaje',   color: '#FACC15' },
    intervalos:      { label: 'Intervalos', color: '#EF4444' },
    fuerza:          { label: 'Fuerza',   color: '#F59E0B' },
    'descanso activo': { label: 'Descanso', color: '#10B981' },
    largo:           { label: 'Largo',    color: '#ffffff' },
}

function getMonday(date) {
    const d = new Date(date)
    const day = d.getDay() || 7
    d.setDate(d.getDate() + 1 - day)
    return d.toISOString().split('T')[0]
}

function weekLabel(mondayStr) {
    const [, m, dd] = mondayStr.split('-')
    return `${parseInt(dd)}/${parseInt(m)}`
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 2 }}>{label}</p>
            <p style={{ color: '#FACC15', fontSize: 13, fontWeight: 700 }}>{Math.round(payload[0].value)} km</p>
        </div>
    )
}

export default function ProgressCharts({ sessions }) {
    const weeklyData = useMemo(() => {
        const weeks = {}
        const now = new Date()
        for (let i = 7; i >= 0; i--) {
            const d = new Date(now)
            d.setDate(d.getDate() - i * 7)
            const key = getMonday(d)
            weeks[key] = { week: weekLabel(key), km: 0, hasData: false }
        }
        sessions
            .filter(s => s.completada)
            .forEach(s => {
                const key = getMonday(new Date(s.fecha))
                if (weeks[key]) {
                    weeks[key].km += parseFloat(s.distancia_real_km || s.distancia_km || 0)
                    weeks[key].hasData = true
                }
            })
        return Object.values(weeks)
    }, [sessions])

    const typeData = useMemo(() => {
        const acc = {}
        sessions
            .filter(s => s.completada)
            .forEach(s => {
                acc[s.tipo] = (acc[s.tipo] || 0) + (s.tiempo_real_min || s.duracion_min || 0)
            })
        const total = Object.values(acc).reduce((a, b) => a + b, 0)
        return Object.entries(acc)
            .map(([tipo, min]) => ({
                tipo,
                min,
                pct: total > 0 ? Math.round((min / total) * 100) : 0,
                h: (min / 60).toFixed(1),
                ...(TYPE_META[tipo] || { label: tipo, color: '#888' }),
            }))
            .sort((a, b) => b.min - a.min)
    }, [sessions])

    const hasCompleted = sessions.some(s => s.completada)
    if (!hasCompleted) return null

    const totalKm = Math.round(sessions.filter(s => s.completada).reduce((sum, s) => sum + parseFloat(s.distancia_real_km || s.distancia_km || 0), 0))

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 px-1 mb-1">
                <div className="w-1 h-4 bg-dunr-orange rounded-full" />
                <span className="text-xs font-black text-white/90 uppercase tracking-wider">Progreso</span>
            </div>

            {/* Weekly volume bar chart */}
            <div className="glass-card p-5">
                <div className="flex items-end justify-between mb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        Volumen semanal
                    </h3>
                    <span className="text-2xl font-black text-white">
                        {totalKm} <span className="text-xs font-normal text-white/30">km totales</span>
                    </span>
                </div>
                <ResponsiveContainer width="100%" height={110}>
                    <BarChart data={weeklyData} barSize={22} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <XAxis
                            dataKey="week"
                            tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis hide domain={[0, 'auto']} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Bar dataKey="km" radius={[5, 5, 0, 0]}>
                            {weeklyData.map((entry, i) => (
                                <Cell
                                    key={i}
                                    fill={entry.km > 0 ? '#FACC15' : 'rgba(255,255,255,0.05)'}
                                    fillOpacity={entry.km > 0 ? 1 : 1}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Type distribution */}
            {typeData.length > 0 && (
                <div className="glass-card p-5">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">
                        Distribución por tipo
                    </h3>
                    <div className="space-y-3">
                        {typeData.map(({ tipo, label, min, pct, h, color }) => (
                            <div key={tipo}>
                                <div className="flex justify-between items-center mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                                        <span className="text-xs font-bold text-white/80">{label}</span>
                                    </div>
                                    <span className="text-[11px] text-white/30 font-bold">{h}h · {pct}%</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${pct}%`, background: color, opacity: 0.85 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
