import { createClient } from '@supabase/supabase-js';

// Server-side client using the SERVICE ROLE key (bypasses RLS).
// Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel env vars.
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
    console.warn('⚠️ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing. Server DB access disabled.');
}

export const supabaseAdmin = (url && serviceKey)
    ? createClient(url, serviceKey, { auth: { persistSession: false } })
    : null;
