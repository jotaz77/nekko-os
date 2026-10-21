const supabaseClient = window.supabase.createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_ANON_KEY,
    {
        auth: {
            // Mantém a sessão entre recargas e navegação entre páginas.
            persistSession: true,
            // Renova o access token automaticamente enquanto o app estiver aberto.
            autoRefreshToken: true,
            // Permite que o Supabase processe callbacks de autenticação quando aplicável.
            detectSessionInUrl: true
        }
    }
);

window.supabaseClient = supabaseClient;

console.log("✅ Supabase conectado.");
