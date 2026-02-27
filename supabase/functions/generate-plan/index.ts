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

        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
        if (!OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY not configured')
        }

        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]

        // Races definition (must match src/lib/races.js)
        const RACES = [
            { id: 'morocco-2026', name: 'Škoda Morocco Titan Desert', date: '2026-04-26' },
            { id: 'almeria-2026', name: 'Titan Desert Almería', date: '2026-10-01' }
        ]
        const race = RACES.find(r => r.id === profile.carrera_id) || RACES[0]
        const raceDate = new Date(race.date)

        // Calculate weeks until race
        const diffTime = raceDate.getTime() - today.getTime()
        let totalWeeks = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)), 1)
        let isPhase1 = false

        // CAP: If more than 16 weeks, generate only phase 1 (12 weeks) to avoid WORKER_LIMIT
        if (totalWeeks > 16) {
            totalWeeks = 12
            isPhase1 = true
        }

        const systemPrompt = `Entrenador de ciclismo experto en MTB y carreras por etapas como la Titan Desert. 
Genera un plan de entrenamiento de ${totalWeeks} semanas para la carrera ${race.name}.

REGLAS CRÍTICAS:
- LAS SESIONES DEBEN EXPLICAR EXACTAMENTE CÓMO EJECUTAR EL ENTRENAMIENTO.
- NINGUNA SESIÓN PUEDE TENER UNA FECHA IGUAL O POSTERIOR AL ${race.date} (Día de la carrera). La última sesión debe ser el día anterior.
- EL PLAN EMPIEZA HOY: ${todayStr}.
- Genera una sesión para cada día de entrenamiento solicitado: ${profile.dias_preferidos?.join(', ') || 'Lunes, Miércoles, Viernes, Domingo'}.
- Tipos de sesión: 'rodaje', 'intervalos', 'fuerza', 'descanso activo', 'largo'.
- DESCRIPCIONES DETALLADAS OBLIGATORIAS:
  - Para INTERVALOS: Escribe el calentamiento, las series exactas con su duración e intensidad, y el tiempo de recuperación exacto entre series.
  - Para FUERZA: Escribe la pendiente buscada (en %), desarrollos (marchas) recomendados, número de repeticiones y recuperación.
  - Para LARGO: Indica zona de intensidad, técnica de pedaleo y consejos precisos de nutrición e hidratación.
  - Para RODAJE: Indica el objetivo fisiológico de la sesión en una frase concisa.
  - Para DESCANSO ACTIVO: Explica por qué es vital para la supercompensación ese día concreto.

- Responde EXCLUSIVAMENTE en JSON con este formato:
{
  "sesiones": [{"semana": int, "dia_semana": string, "fecha": "YYYY-MM-DD", "tipo": string, "duracion_min": int, "distancia_km": float, "intensidad_zona": 1-5, "descripcion": string}],
  "advertencias": [{"semana": int, "tipo": "alerta_media", "mensaje": string}]
}`;

        const userPrompt = `Usuario: ${profile.nombre}, Nivel: ${profile.nivel_experiencia}. INICIO: ${todayStr}. ${isPhase1 ? 'GENERAR SOLO PRIMERAS 12 SEMANAS.' : ''}`;

        const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
                response_format: { type: "json_object" },
                temperature: 0.1,
            }),
        });

        if (!gptResponse.ok) throw new Error(`OpenAI error: ${gptResponse.status}`);
        const gptData = await gptResponse.json();
        let responseText: string | null = gptData.choices[0].message.content;
        const planData = JSON.parse(responseText!);

        // Memory Cleanup: Nullify large strings as soon as possible
        responseText = null;

        // --- Robust Session Extraction ---
        const sessionsRaw = planData.sesiones || planData.sessions ||
            planData.plan?.sesiones || planData.plan?.sessions || [];

        if (!Array.isArray(sessionsRaw) || sessionsRaw.length === 0) {
            throw new Error('No se detectaron sesiones en la respuesta de la IA.');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '') ?? '';
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            throw new Error('Sesión no autorizada');
        }

        console.log(`Generating plan for user: ${user.id} (${totalWeeks} weeks) ${isPhase1 ? '(Phase 1)' : ''}`);

        // Borrar planes y sesiones antiguos
        const { error: deleteError } = await supabase.from('training_plans').delete().eq('user_id', user.id);
        if (deleteError) console.warn('Warning deleting old plans:', deleteError);

        // Insertar nuevo plan
        const { data: plan, error: planError } = await supabase.from('training_plans').insert({
            user_id: user.id,
            plan_json: planData,
            activo: true
        }).select().single();

        if (planError || !plan) throw new Error(`Error al crear plan: ${planError?.message}`);

        // --- Session Type Mapping ---
        const mapType = (type: string) => {
            const t = type?.toLowerCase() || 'rodaje';
            if (t.includes('interv') || t.includes('seri')) return 'intervalos';
            if (t.includes('fuerz') || t.includes('cuest')) return 'fuerza';
            if (t.includes('descans') || t.includes('activ') || t.includes('recup')) return 'descanso activo';
            if (t.includes('larg') || t.includes('fond')) return 'largo';
            return 'rodaje';
        };

        // --- Date Normalization Helper ---
        const normalizeDate = (dateStr: string) => {
            if (!dateStr) return todayStr;
            if (dateStr.endsWith('-02-29')) {
                const year = parseInt(dateStr.split('-')[0]);
                const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
                if (!isLeap) return `${year}-03-01`;
            }
            return dateStr;
        };

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
            completada: false
        }));

        console.log(`Inserting ${sessionsToInsert.length} sessions in chunks...`);

        const CHUNK_SIZE = 40; // Slightly smaller chunks to be extra safe
        for (let i = 0; i < sessionsToInsert.length; i += CHUNK_SIZE) {
            const chunk = sessionsToInsert.slice(i, i + CHUNK_SIZE);
            const { error: sessionsError } = await supabase.from('sessions').insert(chunk);
            if (sessionsError) {
                console.error(`Error in chunk ${i}:`, sessionsError);
                throw new Error(`Error DB Sesiones: ${sessionsError.message}`);
            }
        }

        // Final Verify
        const { count } = await supabase
            .from('sessions')
            .select('*', { count: 'exact', head: true })
            .eq('plan_id', plan.id);

        console.log(`Verified insertion: ${count} sessions in DB.`);

        return new Response(JSON.stringify({
            success: true,
            is_phase_1: isPhase1,
            count: count,
            plan_id: plan.id
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('Final error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});
