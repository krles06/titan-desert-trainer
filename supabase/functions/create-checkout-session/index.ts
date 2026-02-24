// Supabase Edge Function: create-checkout-session
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("create-checkout-session function initialized")

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { returnUrl } = await req.json()
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')

        if (!stripeSecretKey || stripeSecretKey.includes('placeholder')) {
            return new Response(
                JSON.stringify({ url: returnUrl + '?mock_checkout=success' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        return new Response(
            JSON.stringify({ url: returnUrl + '?checkout_session=mock123' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
