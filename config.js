/* ============================================================
   M.N.A BATI — Configuration Supabase
   Fichier : config.js
   ============================================================ */

// 🔑 IDENTIFIANTS SUPABASE
const SUPABASE_CONFIG = {
  url: 'https://tptkefjciwmymjfeicrl.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwdGtlZmpjaXdteW1qZmVpY3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1ODgyMTMsImV4cCI6MjEwNTE2NDIxM30.aL8KpW3IMjUbQSbNVlHPcls6TRrenwEfOpZUmfY2mS0'
};

// 🌍 INFOS SITE (fallback)
const SITE_CONFIG = {
  name: 'M.N.A BATI',
  phone: '06 52 44 68 26',
  email: 'contact@mnabati.fr',
  email2: 'M.N.ABATI@outlook.com',
  zone: 'Salaise-sur-Sanne et ses environs',
  siret: ''
};

// 🚀 CLIENT SUPABASE
let supabaseClient = null;

function initSupabase() {
  if (supabaseClient) return supabaseClient;

  if (typeof window.supabase === 'undefined') {
    console.error('❌ SDK Supabase non chargé. Ajoutez le CDN avant config.js');
    return null;
  }

  if (SUPABASE_CONFIG.url.includes('VOTRE-PROJET')) {
    console.warn('⚠️ Supabase non configuré.');
    return null;
  }

  try {
    supabaseClient = window.supabase.createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey
    );
    console.log('✅ Supabase initialisé :', SUPABASE_CONFIG.url);
    return supabaseClient;
  } catch (err) {
    console.error('❌ Erreur init Supabase :', err);
    return null;
  }
}

function getSupabase() {
  return supabaseClient || initSupabase();
}

async function testSupabaseConnection() {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.from('pages').select('id').limit(1);
    if (error) throw error;
    console.log('✅ Connexion Supabase OK');
    return true;
  } catch (err) {
    console.error('❌ Erreur connexion :', err.message);
    return false;
  }
}

// 🌐 API PUBLIQUE
window.MNA = {
  SUPABASE_CONFIG,
  SITE_CONFIG,
  init: initSupabase,
  getClient: getSupabase,
  testConnection: testSupabaseConnection
};

// 🔥 AUTO-INIT
initSupabase();

console.log('📦 config.js chargé — MNA:', window.MNA);