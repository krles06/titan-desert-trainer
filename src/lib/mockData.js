// Mock data for development/demo when Supabase is not configured

export const DEMO_MODE = import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co'

export const DEMO_USER = {
    id: 'demo-user-001',
    email: 'demo@dunr.com',
}

export const DEMO_PROFILE = {
    id: 'demo-user-001',
    nombre: 'Carlos Martínez',
    edad: 35,
    peso: 75,
    altura: 178,
    nivel_experiencia: 'intermedio',
    velocidad_media: 25,
    distancia_maxima: 120,
    fc_reposo: 58,
    dias_entreno_semana: 4,
    minutos_dia: 90,
    participado_antes: false,
    subscription_status: 'active',
}

const SESSION_TYPES = ['rodaje', 'intervalos', 'fuerza', 'descanso activo', 'largo']
const DESCRIPTIONS = {
    rodaje: [
        'Rodaje suave en Z2 para base aeróbica. Tip: No te cebes con el ritmo.',
        'Pedaleo continuo a ritmo cómodo. Tip: Mantén cadencia alta.',
        'Recuperación activa en Z1-Z2. Tip: Revisa la presión de tus neumáticos.',
    ],
    intervalos: [
        'Series de 6x3 min en Z4 con 3 min recuper. Tip: Aprende a sufrir un poco.',
        '4 bloques de 5 min en Z3-Z4 con 4 min de recuperación activa.',
        'Intervalos cortos: 10x1 min en Z5 con 2 min de descanso total.',
    ],
    fuerza: [
        '5 series de 6 min a baja cadencia (60 rpm) en subida. Fuerza pura.',
        'Rodaje con tramos de 10 min en desarrollo largo en llano. Zona 3.',
        '4 subidas de 8 min alternando sentado y de pie. Mejora tu torque.',
    ],
    'descanso activo': [
        '30-40 min de pedaleo suave. Tip: Limpia hoy tu transmisión.',
        'Rodaje regenerativo de 45 min en Z1. La mente también descansa.',
        '30 min de rodillo suave. Tip: Repasa tu kit de herramientas.',
    ],
    largo: [
        'Entrenamiento de fondo (+2h). Practica tu hidratación y nutrición.',
        'Rodaje largo en Z2 con navegación. Tip: No te desvíes del track.',
        'Salida de fondo con desnivel variado. Acostumbra el cuerpo al sillín.',
    ],
}

function generateDemoSessions() {
    const sessions = []
    const startDate = new Date('2026-02-25')
    const raceDate = new Date('2026-04-26')
    const totalDays = Math.ceil((raceDate - startDate) / (1000 * 60 * 60 * 24))
    const totalWeeks = Math.ceil(totalDays / 7)

    const daysPerWeek = DEMO_PROFILE.dias_entreno_semana
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

    // Training days pattern based on days per week
    const trainingDayPatterns = {
        2: [1, 5], // Tue, Sat
        3: [1, 3, 5], // Tue, Thu, Sat
        4: [0, 2, 4, 5], // Mon, Wed, Fri, Sat
        5: [0, 1, 3, 4, 5], // Mon, Tue, Thu, Fri, Sat
        6: [0, 1, 2, 3, 4, 5], // Mon-Sat
    }

    const trainingDays = trainingDayPatterns[daysPerWeek] || trainingDayPatterns[4]

    for (let week = 0; week < totalWeeks; week++) {
        const isRecoveryWeek = (week + 1) % 4 === 0
        const isTaperingWeek = week >= totalWeeks - 1
        const weekPhase = isTaperingWeek
            ? 'tapering'
            : isRecoveryWeek
                ? 'descarga'
                : week < totalWeeks / 3
                    ? 'base'
                    : week < (totalWeeks * 2) / 3
                        ? 'desarrollo'
                        : 'pico'

        for (const dayIdx of trainingDays) {
            const date = new Date(startDate)
            date.setDate(startDate.getDate() + week * 7 + dayIdx)

            if (date >= raceDate) continue

            let type, duration, distance, zone
            if (isTaperingWeek) {
                type = 'rodaje'
                duration = 30 + Math.floor(Math.random() * 20)
                distance = Math.round(duration * 0.4)
                zone = 1
            } else if (isRecoveryWeek) {
                type = Math.random() > 0.5 ? 'rodaje' : 'descanso activo'
                duration = 40 + Math.floor(Math.random() * 20)
                distance = Math.round(duration * 0.45)
                zone = 1 + Math.floor(Math.random() * 2)
            } else {
                // Distribute types through the week
                const weekSessionIdx = trainingDays.indexOf(dayIdx)
                if (dayIdx === 5 || dayIdx === 6) {
                    type = 'largo'
                    duration = 90 + Math.floor(Math.random() * 60) + week * 3
                    distance = Math.round(duration * 0.55)
                    zone = 2
                } else if (weekSessionIdx === 1) {
                    type = 'intervalos'
                    duration = 60 + Math.floor(Math.random() * 20)
                    distance = Math.round(duration * 0.45)
                    zone = 3 + Math.floor(Math.random() * 2)
                } else if (weekSessionIdx === 2) {
                    type = 'fuerza'
                    duration = 60 + Math.floor(Math.random() * 30)
                    distance = Math.round(duration * 0.4)
                    zone = 3
                } else {
                    type = 'rodaje'
                    duration = 50 + Math.floor(Math.random() * 30)
                    distance = Math.round(duration * 0.5)
                    zone = 2
                }
            }

            // Cap duration
            duration = Math.min(duration, DEMO_PROFILE.minutos_dia + 30)

            const descs = DESCRIPTIONS[type]
            const desc = descs[Math.floor(Math.random() * descs.length)]

            const dateStr = date.toISOString().split('T')[0]
            const isPast = date < new Date()

            sessions.push({
                id: `session-${week}-${dayIdx}`,
                plan_id: 'demo-plan-001',
                fecha: dateStr,
                semana: week + 1,
                dia_semana: dayNames[dayIdx],
                tipo: type,
                duracion_min: duration,
                distancia_km: distance,
                intensidad_zona: zone,
                descripcion: desc,
                completada: isPast && Math.random() > 0.15,
                dificultad_percibida: isPast ? (Math.random() > 0.7 ? 'muy_facil' : 'normal') : null,
                nota_usuario: null,
            })
        }
    }

    return sessions
}

export const DEMO_SESSIONS = generateDemoSessions()

export const DEMO_PLAN = {
    id: 'demo-plan-001',
    user_id: 'demo-user-001',
    created_at: '2026-02-24T12:00:00Z',
    activo: true,
    plan_json: { sessions: DEMO_SESSIONS },
}
