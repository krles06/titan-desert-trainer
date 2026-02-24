import { createClient } from '@supabase/supabase-js'

const url = 'https://joshtweeabyroiqkudph.supabase.co'
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvc2h0d2VlYWJ5cm9pcWt1ZHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDk4NjgsImV4cCI6MjA4NzUyNTg2OH0.ZDb_h2MhxTA_etnp_0u5PabNvT4AzkM9YL5CvM1ktlk'

const sb = createClient(url, anon)

async function run() {
   const email = 'test' + Date.now() + '@titandesert.com'
   console.log('Signing up:', email)
   const { data: authData, error: authError } = await sb.auth.signUp({ email, password: 'password123' })
   if (authError) { console.error('Auth Error:', authError.message); return; }

   const token = authData.session?.access_token
   console.log('Session Token:', token ? token.substring(0, 20) + '...' : 'NULL')

   if (!token) {
      console.log('No session created, likely email confirmation required.')
      return
   }

   console.log('Invoking function...')
   const res = await fetch(`${url}/functions/v1/generate-plan`, {
      method: 'POST',
      headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json'
      },
      body: JSON.stringify({ profile: { nombre: 'Test', dias_entreno_semana: 4, minutos_dia: 60, velocidad_media: 25, distancia_maxima: 100, fc_reposo: 60, nivel_experiencia: 'intermedio', participado_antes: false, edad: 30, peso: 70, altura: 180 }, reason: null })
   })

   console.log('Status:', res.status)
   console.log('Response:', await res.text())
}

run()
