const supabaseClient = window.supabase.createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_ANON_KEY
);

window.supabaseClient = supabaseClient;

console.log("✅ Supabase conectado.");