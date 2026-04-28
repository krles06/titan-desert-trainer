// Supabase Edge Function: generate-plan
// Deploy with: supabase functions deploy generate-plan

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
        const { profile, reason } = await req.json()

        if (!profile) {
            return new Response(
                JSON.stringify({ error: 'Profile data is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
        if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured')

        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]

        const RACES = [
            { id: 'morocco-2026', name: 'Škoda Morocco Titan Desert', date: '2026-04-26' },
            { id: 'almeria-2026', name: 'Titan Desert Almería', date: '2026-10-01' }
        ]

        let raceName = ''
        let raceDateStr = ''

        if (profile.carrera_id === 'custom') {
            raceName = `Objetivo Personalizado (${profile.objetivo_distancia}km, ${profile.objetivo_desnivel}m desnivel, terreno: ${profile.objetivo_terreno})`
            raceDateStr = profile.objetivo_fecha
        } else {
            const race = RACES.find(r => r.id === profile.carrera_id) || RACES.find(r => new Date(r.date) > today) || RACES[RACES.length - 1]
            raceName = race.name
            raceDateStr = race.date
        }

        const raceDate = new Date(raceDateStr)
        if (raceDate <= today) {
            throw new Error('La fecha de este objetivo ya ha empezado o ha pasado. Elige una carrera futura o crea un objetivo personalizado.')
        }
        const diffTime = raceDate.getTime() - today.getTime()
        let totalWeeks = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)), 1)
        let isPhase1 = false

        if (totalWeeks > 16) {
            totalWeeks = 12
            isPhase1 = true
        }

        // ── Build athlete profile context ──
        const objetivoDesc = profile.objetivo_carrera === 'competir'
            ? 'COMPETIR y lograr el mejor tiempo posible — incluir trabajo de umbral, ritmo de carrera, series de calidad y sesiones de tempo'
            : 'TERMINAR la carrera con seguridad — prioridad absoluta en resistencia aeróbica, gestión del esfuerzo y prevención de lesiones'

        const intensityMode = profile.tiene_pulsometro
            ? 'El atleta TIENE pulsómetro/potenciómetro: prescribe zonas de FC exactas (Z1-Z5) en cada sesión con rangos numéricos de ppm si es posible.'
            : 'El atleta NO tiene pulsómetro: describe intensidades exclusivamente con escala de esfuerzo percibido RPE (1-10). Evita mencionar zonas FC.'

        const lesionesRaw = (profile.lesiones || []).filter((l: string) => l !== 'ninguna')
        const lesionesDesc = lesionesRaw.length > 0
            ? `LIMITACIONES FÍSICAS: ${lesionesRaw.join(', ')}. ADAPTA los ejercicios de fuerza y las sesiones técnicas para NO sobrecargar estas zonas. Evita ejercicios que impliquen impacto o tensión directa sobre ellas.`
            : 'Sin lesiones ni limitaciones físicas conocidas.'

        const terrenoDesc = {
            montana: 'montaña y pistas de tierra — diseña sesiones realistas en tierra/grava con desnivel; los rodajes pueden ser en monte',
            mixto: 'mixto asfalto y tierra — alterna sesiones en carretera con sesiones en pistas; adapta las descripciones a ambos entornos',
            asfalto: 'principalmente asfalto — adapta todas las sesiones a carretera o carril bici; simula el esfuerzo de desnivel con series en llano cuando sea necesario'
        }[profile.terreno_habitual || 'mixto'] || 'mixto'

        const systemPrompt = `Eres un entrenador de ciclismo de élite especializado en MTB y carreras por etapas como la Titan Desert.
Genera un plan de entrenamiento de ${totalWeeks} semanas para: ${raceName}.

══ PERFIL COMPLETO DEL ATLETA ══
- Nombre: ${profile.nombre} | Nivel: ${profile.nivel_experiencia}
- Edad: ${profile.edad} años | Peso: ${profile.peso} kg | Altura: ${profile.altura} cm
- Velocidad media: ${profile.velocidad_media} km/h | Distancia máxima rodada: ${profile.distancia_maxima} km
- FC en reposo: ${profile.fc_reposo} ppm
- Tipo de bici: ${profile.tipo_bici || 'MTB hardtail'}
- Terreno habitual: ${terrenoDesc}
- Experiencia previa en la Titan: ${profile.participado_antes ? 'SÍ — conoce el formato y el desgaste de etapas' : 'NO — primer contacto con este tipo de carrera'}
- Días de entreno: ${profile.dias_preferidos?.join(', ') || 'Lunes, Miércoles, Viernes, Domingo'} | Día fuerte: ${profile.dia_fuerte}
- Disponibilidad diaria: ${profile.minutos_dia} min/sesión

══ OBJETIVO DE CARRERA ══
${objetivoDesc}

══ PRESCRIPCIÓN DE INTENSIDAD ══
${intensityMode}

══ SALUD Y LIMITACIONES ══
${lesionesDesc}

${reason ? `══ MOTIVO DE AJUSTE ══\n${reason}\n` : ''}

══ REGLAS CRÍTICAS DE PLANIFICACIÓN ══
- NINGUNA sesión puede programarse en la fecha del evento (${raceDateStr}) ni después.
- La ÚLTIMA sesión del plan debe ser al menos 2 días antes del evento (tapering).
- PRIORIDAD DÍA FUERTE: "${profile.dia_fuerte}" siempre recibe la sesión más exigente de la semana (Largo o Intervalos de alta intensidad).
- DESCANSO ACTIVO: solo cada 3–4 semanas, nunca en semanas consecutivas.
- PROGRESIÓN: distancia de rodajes y largos debe aumentar cada semana. Nunca repitas la misma distancia dos semanas seguidas.
- EL PLAN EMPIEZA HOY: ${todayStr}.
- Genera exactamente una sesión por día de entreno solicitado: ${profile.dias_preferidos?.join(', ')}.
- Tipos válidos: 'rodaje', 'intervalos', 'fuerza', 'descanso activo', 'largo'.

══ DESCRIPCIONES OBLIGATORIAS POR TIPO ══
- INTERVALOS: calentamiento específico (duración y zona), series exactas (número × duración × intensidad ${profile.tiene_pulsometro ? 'en FC/zona' : 'en RPE'}), recuperación entre series, vuelta a la calma.
- FUERZA (subidas): pendiente objetivo en %, desarrollo/marcha recomendado, nº de repeticiones, duración de cada subida, recuperación.
- LARGO: zona de intensidad predominante, estrategia de nutrición e hidratación (qué comer y cada cuánto), consejos técnicos para el tipo de bici "${profile.tipo_bici || 'MTB'}".
- RODAJE: objetivo fisiológico en una frase, zona/RPE de trabajo, sensación buscada.
- DESCANSO ACTIVO: explicación del motivo fisiológico (supercompensación), actividad alternativa sugerida si aplica.

══ METADATOS ESTRUCTURADOS (campo "metadata" OBLIGATORIO en cada sesión) ══
Según el tipo, genera el objeto "metadata" correspondiente con valores reales coherentes con la sesión:
- 'intervalos': {"cal_min":int,"series":int,"ser_min":float,"ser_zona":int,"ser_rpe":int,"rec_min":float,"cal_final_min":int}
- 'fuerza':     {"cal_min":int,"reps":int,"rep_min":float,"pendiente_pct":int,"zona":int,"rpe":int,"rec_min":float,"cal_final_min":int}
- 'largo':      {"zona":int,"nutricion_min":int,"hidratacion_min":int,"calorias_hora":int}
- 'rodaje':     {"zona":int,"rpe":int,"objetivo":"frase corta max 6 palabras"}
- 'descanso activo': {"zona_max":1,"rpe_max":int,"actividades":["string","string","string"]}

Responde EXCLUSIVAMENTE en JSON:
{"sesiones":[{"semana":int,"dia_semana":string,"fecha":"YYYY-MM-DD","tipo":string,"duracion_min":int,"distancia_km":float,"intensidad_zona":1-5,"descripcion":string,"metadata":{}}],"advertencias":[{"semana":int,"tipo":"alerta_media","mensaje":string}]}`

        const userPrompt = `Genera el plan completo de ${totalWeeks} semanas.
Atleta: ${profile.nombre} | Nivel: ${profile.nivel_experiencia} | Objetivo: ${profile.objetivo_carrera === 'competir' ? 'competir' : 'terminar'} | Día fuerte: ${profile.dia_fuerte}
Inicio: ${todayStr} | Carrera: ${raceName} (${raceDateStr})
${isPhase1 ? 'GENERAR SOLO LAS PRIMERAS 12 SEMANAS (Fase 1 de 2).' : ''}`

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

        const sessionsRaw = planData.sesiones || planData.sessions ||
            planData.plan?.sesiones || planData.plan?.sessions || []

        if (!Array.isArray(sessionsRaw) || sessionsRaw.length === 0) {
            throw new Error('No se detectaron sesiones en la respuesta de la IA.')
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '') ?? ''
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) throw new Error('Sesión no autorizada')

        console.log(`Generating plan for user: ${user.id} (${totalWeeks} weeks) ${isPhase1 ? '(Phase 1)' : ''}`)

        // Delete old plans
        const { error: deleteError } = await supabase.from('training_plans').delete().eq('user_id', user.id)
        if (deleteError) console.warn('Warning deleting old plans:', deleteError)

        // Insert new plan
        const { data: plan, error: planError } = await supabase.from('training_plans').insert({
            user_id: user.id,
            plan_json: planData,
            activo: true
        }).select().single()

        if (planError || !plan) throw new Error(`Error al crear plan: ${planError?.message}`)

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

        const sessionsToInsert = sessionsRaw.map((s: any) => ({
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

        console.log(`Inserting ${sessionsToInsert.length} sessions...`)

        const CHUNK_SIZE = 40
        for (let i = 0; i < sessionsToInsert.length; i += CHUNK_SIZE) {
            const chunk = sessionsToInsert.slice(i, i + CHUNK_SIZE)
            const { error: sessionsError } = await supabase.from('sessions').insert(chunk)
            if (sessionsError) throw new Error(`Error DB Sesiones: ${sessionsError.message}`)
        }

        const { count } = await supabase
            .from('sessions')
            .select('*', { count: 'exact', head: true })
            .eq('plan_id', plan.id)

        console.log(`Verified: ${count} sessions in DB.`)

        return new Response(JSON.stringify({
            success: true,
            is_phase_1: isPhase1,
            count,
            plan_id: plan.id
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    } catch (error) {
        console.error('Final error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
