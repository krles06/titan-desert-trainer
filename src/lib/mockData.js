// Mock data for development/demo when Supabase is not configured

export const DEMO_MODE = import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co'

export const DEMO_USER = {
    id: 'demo-user-001',
    email: 'demo@titandesert.com',
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
        'Rodaje suave en zona 2 para trabajar la base aeróbica.',
        'Pedaleo continuo a ritmo cómodo. Mantén cadencia alta (85-95 rpm).',
        'Rodaje de recuperación activa. No superar zona 2 en ningún momento.',
    ],
    intervalos: [
        'Calentamiento 15 min + 6x3 min en zona 4 con 3 min recuperación + 10 min vuelta a la calma.',
        'Calentamiento 20 min + 4x5 min en zona 3-4 con 4 min recuperación.',
        'Series cortas: 10x1 min en zona 5 con 2 min recuperación entre series.',
    ],
    fuerza: [
        'Rodaje con tramos de fuerza: 5x5 min en desarrollo largo a cadencia baja (50-60 rpm) en zona 3.',
        'Subidas sentado a cadencia baja. Busca pendientes del 5-8%. 4 repeticiones de 8 min.',
        'Trabajo de torque en llano: tramos de 10 min a cadencia 55-65 rpm en zona 3.',
    ],
    'descanso activo': [
        'Paseo suave en bici o caminata de 30-40 min. Mantén pulsaciones bajas.',
        'Rodaje muy suave en zona 1. Pedaleo recreativo sin esfuerzo.',
        'Estiramientos + rodillo suave 20 min. Día de recuperación activa.',
    ],
    largo: [
        'Salida larga simulando condiciones de carrera. Lleva hidratación y nutrición.',
        'Ruta larga a ritmo constante en zona 2-3. Practica tu estrategia de alimentación.',
        'Salida de fondo con tramos variados. Incluye algo de desnivel si es posible.',
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
