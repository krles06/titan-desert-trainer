// Supabase Edge Function: adjust-plan
// Regenerates future (uncompleted) sessions keeping history intact.
// Deploy: supabase functions deploy adjust-plan --no-verify-jwt

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { reason } = await req.json()

        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
        if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured')

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Auth
        const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '') ?? ''
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        if (authError || !user) throw new Error('Sesión no autorizada')

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
        if (profileError || !profile) throw new Error('No se encontró el perfil del atleta')

        // Fetch active plan
        const { data: plan } = await supabase
            .from('training_plans')
            .select('id')
            .eq('user_id', user.id)
            .eq('activo', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (!plan) throw new Error('No hay un plan activo para ajustar')

        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]

        // Get stats on completed sessions
        const { data: allSessions } = await supabase
            .from('sessions')
            .select('semana, fecha, tipo, completada, duracion_min')
            .eq('plan_id', plan.id)
            .order('fecha', { ascending: true })

        const completedSessions = (allSessions || []).filter(s => s.completada)
        const futureSessions = (allSessions || []).filter(s => !s.completada && s.fecha >= todayStr)

        const weeksCompleted = new Set(completedSessions.map(s => s.semana)).size
        const lastCompletedDate = completedSessions.length > 0
            ? completedSessions[completedSessions.length - 1].fecha
            : null
        const totalCompletedMin = completedSessions.reduce((sum, s) => sum + (s.duracion_min || 0), 0)

        // Determine race info
        const RACES = [
            { id: 'morocco-2026', name: 'Škoda Morocco Titan Desert', date: '2026-04-26' },
            { id: 'almeria-2026', name: 'Titan Desert Almería', date: '2026-10-01' }
        ]

        let raceName = ''
        let raceDateStr = ''

        if (profile.carrera_id === 'custom') {
            raceName = `Objetivo Personalizado (${profile.objetivo_distancia}km, terreno: ${profile.objetivo_terreno})`
            raceDateStr = profile.objetivo_fecha
        } else {
            const race = RACES.find((r: any) => r.id === profile.carrera_id) || RACES[0]
            raceName = race.name
            raceDateStr = race.date
        }

        const raceDate = new Date(raceDateStr)
        const diffTime = raceDate.getTime() - today.getTime()
        const totalWeeks = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)), 1)

        if (totalWeeks < 1) throw new Error('La carrera ya ha pasado, no se puede generar un plan.')

        // Build enriched context (same as generate-plan)
        const objetivoDesc = profile.objetivo_carrera === 'competir'
            ? 'COMPETIR — incluir umbral, ritmo de carrera y series de calidad'
            : 'TERMINAR con seguridad — prioridad en resistencia aeróbica y prevención de lesiones'

        const intensityMode = profile.tiene_pulsometro
            ? 'Prescribe zonas FC (Z1-Z5) en cada sesión.'
            : 'Describe intensidades con escala RPE (1-10). Sin zonas FC.'

        const lesionesRaw = (profile.lesiones || []).filter((l: string) => l !== 'ninguna')
        const lesionesDesc = lesionesRaw.length > 0
            ? `LIMITACIONES: ${lesionesRaw.join(', ')} — adapta ejercicios de fuerza y técnica.`
            : 'Sin lesiones conocidas.'

        const terrenoDesc = {
            montana: 'montaña y pistas de tierra',
            mixto: 'mixto asfalto y tierra',
            asfalto: 'principalmente asfalto',
        }[profile.terreno_habitual || 'mixto'] || 'mixto'

        const systemPrompt = `Eres un entrenador de ciclismo experto en MTB y carreras por etapas.
Debes REGENERAR las sesiones futuras de un plan de entrenamiento ya iniciado.

══ HISTORIAL DEL ATLETA ══
- Semanas completadas: ${weeksCompleted}
- Sesiones completadas: ${completedSessions.length} (${Math.round(totalCompletedMin / 60)}h de entrenamiento)
- Última sesión completada: ${lastCompletedDate || 'ninguna'}
- Sesiones futuras que vas a sustituir: ${futureSessions.length}

══ MOTIVO DEL AJUSTE ══
${reason || 'Reajuste general del plan'}

══ PERFIL DEL ATLETA ══
- ${profile.nombre} | Nivel: ${profile.nivel_experiencia}
- Edad: ${profile.edad}a | Peso: ${profile.peso}kg | Bici: ${profile.tipo_bici || 'MTB'}
- Velocidad media: ${profile.velocidad_media} km/h | Distancia máxima: ${profile.distancia_maxima} km
- Objetivo en carrera: ${objetivoDesc}
- ${intensityMode}
- ${lesionesDesc}
- Terreno habitual: ${terrenoDesc}
- Días de entreno: ${profile.dias_preferidos?.join(', ')} | Día fuerte: ${profile.dia_fuerte}
- Disponibilidad diaria: ${profile.minutos_dia} min/sesión

══ INSTRUCCIONES ══
- Genera SOLO las sesiones desde HOY (${todayStr}) hasta la carrera (${raceDateStr}).
- Semanas restantes: ${totalWeeks}.
- Ten en cuenta el historial completado para calibrar la carga de las nuevas semanas.
- NINGUNA sesión en la fecha del evento ni después.
- Última sesión al menos 2 días antes de ${raceDateStr} (tapering).
- Día fuerte: "${profile.dia_fuerte}" siempre tiene la sesión más exigente.
- Descanso activo solo cada 3-4 semanas.
- Progresión creciente en distancia de rodajes.
- Tipos válidos: 'rodaje', 'intervalos', 'fuerza', 'descanso activo', 'largo'.

DESCRIPCIONES OBLIGATORIAS:
- INTERVALOS: calentamiento, series exactas (×, duración, ${profile.tiene_pulsometro ? 'zona FC' : 'RPE'}), recuperación.
- FUERZA: pendiente %, desarrollo, repeticiones, duración, recuperación.
- LARGO: zona/RPE, nutrición (qué y cada cuánto), consejos para "${profile.tipo_bici || 'MTB'}".
- RODAJE: objetivo fisiológico, zona/RPE, sensación buscada.
- DESCANSO ACTIVO: motivo fisiológico, actividad sugerida.

METADATOS ESTRUCTURADOS (campo "metadata" OBLIGATORIO en cada sesión):
- 'intervalos': {"cal_min":int,"series":int,"ser_min":float,"ser_zona":int,"ser_rpe":int,"rec_min":float,"cal_final_min":int}
- 'fuerza':     {"cal_min":int,"reps":int,"rep_min":float,"pendiente_pct":int,"zona":int,"rpe":int,"rec_min":float,"cal_final_min":int}
- 'largo':      {"zona":int,"nutricion_min":int,"hidratacion_min":int,"calorias_hora":int}
- 'rodaje':     {"zona":int,"rpe":int,"objetivo":"frase corta max 6 palabras"}
- 'descanso activo': {"zona_max":1,"rpe_max":int,"actividades":["string","string","string"]}

Responde EXCLUSIVAMENTE en JSON:
{"sesiones":[{"semana":int,"dia_semana":string,"fecha":"YYYY-MM-DD","tipo":string,"duracion_min":int,"distancia_km":float,"intensidad_zona":1-5,"descripcion":string,"metadata":{}}],"advertencias":[{"semana":int,"tipo":"alerta_media","mensaje":string}]}`

        const userPrompt = `Regenera las sesiones desde ${todayStr} hasta ${raceDateStr} (${totalWeeks} semanas).
Atleta: ${profile.nombre} | Nivel: ${profile.nivel_experiencia} | Objetivo: ${profile.objetivo_carrera || 'terminar'} | Día fuerte: ${profile.dia_fuerte}
Motivo: ${reason || 'Reajuste general'}`

        const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
                response_format: { type: "json_object" },
                temperature: 0.1,
            }),
        })

        if (!gptResponse.ok) throw new Error(`OpenAI error: ${gptResponse.status}`)
        const gptData = await gptResponse.json()
        let responseText: string | null = gptData.choices[0].message.content
        const planData = JSON.parse(responseText!)
        responseText = null

        const sessionsRaw = planData.sesiones || planData.sessions || []
        if (!Array.isArray(sessionsRaw) || sessionsRaw.length === 0) {
            throw new Error('La IA no generó sesiones válidas.')
        }

        // Delete only future uncompleted sessions
        const { error: deleteError } = await supabase
            .from('sessions')
            .delete()
            .eq('plan_id', plan.id)
            .eq('completada', false)
            .gte('fecha', todayStr)

        if (deleteError) throw new Error(`Error al borrar sesiones futuras: ${deleteError.message}`)

        const mapType = (type: string) => {
            const t = type?.toLowerCase() || 'rodaje'
            if (t.includes('interv') || t.includes('seri')) return 'intervalos'
            if (t.includes('fuerz') || t.includes('cuest')) return 'fuerza'
            if (t.includes('descans') || t.includes('activ') || t.includes('recup')) return 'descanso activo'
            if (t.includes('larg') || t.includes('fond')) return 'largo'
            return 'rodaje'
        }

        const normalizeDate = (dateStr: string) => {
            if (!dateStr) return todayStr
            if (dateStr.endsWith('-02-29')) {
                const year = parseInt(dateStr.split('-')[0])
                const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
                if (!isLeap) return `${year}-03-01`
            }
            return dateStr
        }

        const sessionsToInsert = sessionsRaw
            .filter((s: any) => s.fecha >= todayStr) // safety: only future dates
            .map((s: any) => ({
                plan_id: plan.id,
                semana: s.semana || 1,
                dia_semana: s.dia_semana || 'Lunes',
                fecha: normalizeDate(s.fecha),
                tipo: mapType(s.tipo),
                duracion_min: s.duracion_min || 60,
                distancia_km: s.distancia_km || 20,
                intensidad_zona: Math.max(1, Math.min(5, parseInt(s.intensidad_zona) || 2)),
                descripcion: s.descripcion || 'Entrenamiento del día',
                metadata: s.metadata || null,
                completada: false
            }))

        const CHUNK_SIZE = 40
        for (let i = 0; i < sessionsToInsert.length; i += CHUNK_SIZE) {
            const chunk = sessionsToInsert.slice(i, i + CHUNK_SIZE)
            const { error: insertError } = await supabase.from('sessions').insert(chunk)
            if (insertError) throw new Error(`Error al insertar sesiones: ${insertError.message}`)
        }

        // Update plan_json with new advertencias if provided
        if (planData.advertencias?.length) {
            await supabase
                .from('training_plans')
                .update({ plan_json: { ...planData } })
                .eq('id', plan.id)
        }

        console.log(`Adjusted plan for ${user.id}: deleted ${futureSessions.length} old, inserted ${sessionsToInsert.length} new sessions.`)

        return new Response(JSON.stringify({
            success: true,
            inserted: sessionsToInsert.length,
            completed_kept: completedSessions.length,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    } catch (error) {
        console.error('adjust-plan error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
