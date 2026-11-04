/* CONFIGURAÇÃO DO SUPABASE
   Project URL e chave publishable/anon ficam no frontend.
   NUNCA coloque a chave service_role neste arquivo.
*/
window.MAR_CONFIG = {
    supabaseUrl: "https://udzddfdhkrvbnujdlcyb.supabase.co",
    supabaseAnonKey: "sb_publishable_uXsSJcGayZw8KtOchWI5RA_Bg6O4TLB",
    whatsappNumber: "5573998211690",
    clubUrl: ""
};
window.marSupabase = null;
if (window.supabase && window.MAR_CONFIG.supabaseUrl.startsWith("https://") && window.MAR_CONFIG.supabaseAnonKey && !window.MAR_CONFIG.supabaseAnonKey.startsWith("COLE_")) {
    window.marSupabase = window.supabase.createClient(window.MAR_CONFIG.supabaseUrl, window.MAR_CONFIG.supabaseAnonKey);
}
