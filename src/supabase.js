import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '⚠️ Supabase env vars missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). ' +
        'Database features are disabled — see SUPABASE_MIGRATION.md.'
    );
}

// Placeholder values keep the app rendering (home/shop use local data)
// even before the project keys are configured.
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key'
);
