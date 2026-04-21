// Supabase Edge Function: coach-chat
// Conversational AI coach — does NOT modify the training plan
// Deploy with: supabase functions deploy coach-chat

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { message, profile, recentSessions, stats, history } = await req.json()

        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
        if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured')

        const RACE_DATES: Record<string, string> = {
            'morocco-2026': '2026-04-26',
            'almeria-2026': '2026-10-01',
        }
        const RACE_NAMES: Record<string, string> = {
            'morocco-2026': 'Škoda Morocco Titan Desert 2026 (26 abril)',
            'almeria-2026': 'Titan Desert Almería 2026 (1 octubre)',
        }

        const raceDate = profile?.carrera_id === 'custom'
            ? profile.objetivo_fecha
            : (RACE_DATES[profile?.carrera_id] || '2026-04-26')
        const raceName = profile?.carrera_id === 'custom'
            ? `objetivo personalizado el ${profile.objetivo_fecha}`
            : (RACE_NAMES[profile?.carrera_id] || 'Titan Desert')

        const today = new Date().toISOString().split('T')[0]
        const daysLeft = Math.max(0, Math.ceil((new Date(raceDate).getTime() - Date.now()) / 86400000))
        const weeksLeft = Math.round(daysLeft / 7)

        const recentStr = recentSessions?.length
            ? recentSessions.slice(0, 5).map((s: any) =>
                `${s.fecha} | ${s.tipo} | RPE:${s.percepcion_esfuerzo ?? '–'} | ${s.completada ? 'completada' : 'no completada'}`
            ).join('\n')
            : 'Sin sesiones recientes'

        const systemPrompt = `Eres DUNR Coach, entrenador personal experto en ciclismo MTB y ultra-endurance (Titan Desert, Cape Epic, etc.).

CONTEXTO DEL ATLETA:
- Nombre: ${profile?.nombre || 'Atleta'}
- Nivel: ${profile?.nivel_experiencia || 'intermedio'}
- Edad: ${profile?.edad || '–'} años | Peso: ${profile?.peso || '–'} kg
- Objetivo: ${raceName}
- Tiempo restante: ${weeksLeft} semanas (${daysLeft} días) — hoy es ${today}
- Disponibilidad: ${profile?.dias_entreno_semana || 3} días/semana, ${profile?.minutos_dia || 90} min/día

PROGRESO ACTUAL:
- Sesiones completadas: ${stats?.completed || 0} de ${stats?.total || 0} (${stats?.percentComplete || 0}%)
- Horas entrenadas: ${Number(stats?.hoursTotal || 0).toFixed(0)}h
- Racha actual: ${stats?.streak || 0} días

ÚLTIMAS 5 SESIONES:
${recentStr}

INSTRUCCIONES:
- Responde SIEMPRE en español, de forma concisa (máximo 3 párrafos)
- Tono: entrenador de élite, directo, motivador y cercano
- Personaliza cada respuesta usando el contexto del atleta
- NO generes planes completos en tabla ni JSON
- Si el usuario quiere cambiar el plan, dile que pulse "Recalcular plan" en el dashboard
- Puedes sugerir ajustes concretos de una sesión puntual, pero sin reescribir el plan entero`

        const messages = [
            { role: 'system', content: systemPrompt },
            ...(history || []).slice(-8),
            { role: 'user', content: message }
        ]

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                temperature: 0.7,
                max_tokens: 400,
                messages,
            }),
        })

        const data = await response.json()
        const reply = data.choices?.[0]?.message?.content

        if (!reply) throw new Error('Empty response from AI')

        return new Response(
            JSON.stringify({ reply }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (err: any) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
