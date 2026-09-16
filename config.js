/* ============================================================
   M.N.A BATI — Configuration Supabase
   Fichier : config.js
   ============================================================ */

// ============================================================
// 🔑 IDENTIFIANTS SUPABASE
// ============================================================
const SUPABASE_CONFIG = {
  url: 'https://tptkefjciwmymjfeicrl.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwdGtlZmpjaXdteW1qZmVpY3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1ODgyMTMsImV4cCI6MjEwNTE2NDIxM30.aL8KpW3IMjUbQSbNVlHPcls6TRrenwEfOpZUmfY2mS0'
};

// ============================================================
// 🔐 IDENTIFIANTS DASHBOARD
// ============================================================
const ADMIN_CONFIG = {
  user: 'admin',
  pass: 'mna2026'
};

// ============================================================
// 🌍 INFOS SITE (fallback)
// ============================================================
const SITE_CONFIG = {
  name: 'M.N.A BATI',
  phone: '06 52 44 68 26',
  email: 'contact@mnabati.fr',
  email2: 'M.N.ABATI@outlook.com',
  zone: 'Salaise-sur-Sanne et ses environs',
  siret: ''
};

// ============================================================
// 🚀 CLIENT SUPABASE
// ============================================================

let supabaseClient = null;

/**
 * Initialise le client Supabase
 * Peut être appelé plusieurs fois sans problème (retourne le client existant)
 */
function initSupabase() {
  // Déjà initialisé → retourner
  if (supabaseClient) return supabaseClient;

  // SDK non chargé
  if (typeof window.supabase === 'undefined') {
    console.error('❌ SDK Supabase non chargé. Ajoutez le CDN avant config.js');
    return null;
  }

  // Config invalide
  if (SUPABASE_CONFIG.url.includes('VOTRE-PROJET')) {
    console.warn('⚠️ Supabase non configuré. Modifiez SUPABASE_CONFIG.');
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

/**
 * Récupère le client (initialise si nécessaire)
 * ⚠️ C'est la fonction à utiliser partout — JAMAIS d'accès direct à supabaseClient
 */
function getSupabase() {
  return supabaseClient || initSupabase();
}

// ============================================================
// 🧪 TEST DE CONNEXION
// ============================================================
async function testSupabaseConnection() {
  const client = getSupabase();
  if (!client) {
    console.warn('❌ Client Supabase indisponible');
    return false;
  }
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

// ============================================================
// 🌐 API PUBLIQUE
// ============================================================
window.MNA = {
  SUPABASE_CONFIG,
  ADMIN_CONFIG,
  SITE_CONFIG,
  init: initSupabase,
  getClient: getSupabase,          // ← utiliser CELUI-CI partout
  testConnection: testSupabaseConnection
};

// ============================================================
// 🔥 AUTO-INIT
// ============================================================
// Initialiser immédiatement (pas besoin d'attendre DOMContentLoaded)
// car le client Supabase ne dépend pas du DOM.
initSupabase();

console.log('📦 config.js chargé — MNA:', window.MNA);