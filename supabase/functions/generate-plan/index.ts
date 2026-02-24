// Supabase Edge Function: generate-plan
// Calls Google Gemini API to generate a personalized training plan
// Deploy with: supabase functions deploy generate-plan

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight
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

        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
        if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not configured')
        }

        // Calculate weeks until race
        const today = new Date()
        const raceDate = new Date('2026-04-26T00:00:00+01:00')
        const weeksUntilRace = Math.ceil((raceDate.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000))
        const startDate = today.toISOString().split('T')[0]

        let readjustmentContext = ''
        if (reason === 'hard') {
            readjustmentContext = '\\nATENCIÓN: El ciclista ha indicado que el plan anterior era DEMASIADO EXIGENTE. Reduce ligeramente el volumen (tiempo/distancia) o la intensidad (zonas) respecto a lo que le tocaría por su nivel, asegurando que pueda asimilar el entrenamiento sin sobreentrenarse.'
        } else if (reason === 'easy') {
            readjustmentContext = '\\nATENCIÓN: El ciclista ha indicado que el plan anterior era DEMASIADO FÁCIL. Aumenta ligeramente la exigencia (más tiempo en zonas altas o sesiones más largas) para asegurar una progresión adecuada hacia la carrera, sin exceder su disponibilidad de días.'
        }

        // Build the prompt
        const prompt = `Eres un entrenador de ciclismo experto. Genera un plan JSON MUY BREVE Y OPTIMIZADO para un ciclista que se prepara para la Titan Desert.
Debido a límites de tokens, NO generes todas las semanas posibles. Genera SOLO 4 semanas representativas (semana 1: Inicio, semana 4: Base, semana 8: Volumen, semana 12: Pico/Tapering).

Usuario: ${profile.nombre}, ${profile.edad} años, ${profile.peso}kg, ${profile.altura}cm. Nivel: ${profile.nivel_experiencia}. FC Reposo: ${profile.fc_reposo}.
Velocidad media: ${profile.velocidad_media}km/h. Distancia máx: ${profile.distancia_maxima}km. Titan Desert previa: ${profile.participado_antes ? 'Sí' : 'No'}.
Disponibilidad: ${profile.dias_entreno_semana} días/semana, ${profile.minutos_dia} min/día.

DEVUELVE SOLO UN OBJETO JSON EXACTAMENTE ASÍ:
{
  "sesiones": [
    {
      "semana": 1,
      "dia_semana": "Lunes",
      "tipo": "rodaje", // "rodaje"|"intervalos"|"fuerza"|"descanso activo"|"largo"
      "duracion_min": 60,
      "distancia_km": 25.5,
      "intensidad_zona": 2, // 1-5
      "descripcion": "Breve descripción."
    }
  ]
}

Genera exactamente ${profile.dias_entreno_semana} sesiones por cada una de las 4 semanas. Total: ${profile.dias_entreno_semana * 4} sesiones. No más.`

        console.log("Calling Gemini API...")
        // Call Gemini API
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 65536,
                        responseMimeType: 'application/json',
                    },
                }),
            }
        )

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text()
            throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`)
        }

        const geminiData = await geminiResponse.json()
        const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

        if (!responseText) {
            throw new Error('Empty response from Gemini')
        }

        // Parse the JSON response
        const planData = JSON.parse(responseText)

        if (!planData.sesiones || !Array.isArray(planData.sesiones)) {
            throw new Error('Invalid plan structure from Gemini')
        }

        // Save to Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Get user from auth header
        const authHeader = req.headers.get('Authorization')
        const token = authHeader?.replace('Bearer ', '')
        const { data: { user }, error: userError } = await supabase.auth.getUser(token)

        if (userError || !user) {
            throw new Error('Unauthorized')
        }

        // Deactivate existing plans
        await supabase
            .from('training_plans')
            .update({ activo: false })
            .eq('user_id', user.id)

        // Insert new plan
        const { data: plan, error: planError } = await supabase
            .from('training_plans')
            .insert({
                user_id: user.id,
                plan_json: planData,
                activo: true,
            })
            .select()
            .single()

        if (planError) throw planError

        // Insert sessions
        const sessionsToInsert = planData.sesiones.map((s) => ({
            plan_id: plan.id,
            semana: s.semana,
            dia_semana: s.dia_semana,
            fecha: s.fecha,
            tipo: s.tipo,
            duracion_min: s.duracion_min,
            distancia_km: s.distancia_km,
            intensidad_zona: s.zona_intensidad,
            descripcion: s.descripcion,
            completada: false,
        }))

        const { error: sessionsError } = await supabase
            .from('sessions')
            .insert(sessionsToInsert)

        if (sessionsError) throw sessionsError

        return new Response(
            JSON.stringify({ success: true, plan_id: plan.id, sessions_count: sessionsToInsert.length }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
