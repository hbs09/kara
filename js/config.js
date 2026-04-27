// ============================================================
// CONFIGURAÇÃO SUPABASE
// Usa a URL do teu projeto e a chave anónima pública.
// NUNCA coloque a chave service_role secret no frontend.
// ============================================================
const SUPABASE_URL = 'https://dhfhamvzlwgxdjxykxxt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZmhhbXZ6bHdneGRqeHlreHh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzU5MzksImV4cCI6MjA5MjgxMTkzOX0.rPL9OLvgRarGTDVwb3CcpmPtO4w0J1wkRBCJIdo3uZY';

const supabaseLib = window.supabase;   // save CDN library reference
const supabaseClient = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = supabaseClient; // expose client under different name

// Indicador de configuração
window.__SUPABASE_CONFIGURED__ = !SUPABASE_URL.includes('SEU_PROJETO');
