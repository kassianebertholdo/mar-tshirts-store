/* CONFIGURAÇÃO DO SUPABASE
   1. Crie um projeto em https://supabase.com
   2. Em Project Settings > API, copie Project URL e anon/public key.
   3. Cole os valores abaixo. A chave anon pode ficar no frontend quando as políticas RLS estiverem corretas.
   NUNCA coloque a service_role key neste arquivo.
*/
window.MAR_CONFIG = {
    supabaseUrl: "https://udzddfdhkrvbnujdlcyb.supabase.co",
    supabaseAnonKey: "sb_publishable_uXsSJcGayZw8KtOchWI5RA_Bg6O4TLB",
    whatsappNumber: "5573998211690",
    clubUrl: ""
};
window.marSupabase = null;
if (window.supabase && window.MAR_CONFIG.supabaseUrl.startsWith("https://") && !window.MAR_CONFIG.supabaseAnonKey.startsWith("COLE_")) {
    window.marSupabase = window.supabase.createClient(window.MAR_CONFIG.supabaseUrl, window.MAR_CONFIG.supabaseAnonKey);
}