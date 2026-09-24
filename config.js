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
  email: 'M.N.ABATI@outlook.com',
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
// ============================================================
// 🎨 FAVICON + TITLE DYNAMIQUES depuis Supabase
// S'exécute automatiquement sur TOUTES les pages qui chargent config.js
// ============================================================
(async function applyBrandFromSupabase() {
  const client = getSupabase();
  if (!client) return;

  try {
    const { data, error } = await client
      .from('settings')
      .select('logo_url, favicon_url, site_title, name')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      console.warn('⚠️ Favicon: erreur Supabase', error.message);
      return;
    }
    if (!data) return;

    // ---------- 🖼️ FAVICON ----------
    // Priorité : favicon_url > logo_url
    const favUrl = data.favicon_url || data.logo_url;

    if (favUrl && favUrl.trim()) {
      // 1. Supprimer les anciens favicons (statiques + dynamiques)
      document.querySelectorAll(
        'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
      ).forEach(el => el.remove());

      // 2. Détecter le type MIME selon l'extension
      const ext = (favUrl.split('.').pop() || '').toLowerCase().split('?')[0];
      const mimeMap = {
        svg:  'image/svg+xml',
        png:  'image/png',
        ico:  'image/x-icon',
        jpg:  'image/jpeg',
        jpeg: 'image/jpeg',
        webp: 'image/webp',
        gif:  'image/gif'
      };
      const mime = mimeMap[ext] || 'image/png';

      // 3. Cache busting pour forcer le navigateur à recharger
      const finalUrl = favUrl.includes('?')
        ? favUrl + '&v=' + Date.now()
        : favUrl + '?v=' + Date.now();

      // 4. Ajouter les liens favicon (multiple tailles)
      const faviconLinks = [
        { rel: 'icon',             sizes: '32x32', type: mime },
        { rel: 'icon',             sizes: '16x16', type: mime },
        { rel: 'shortcut icon',                    type: mime },
        { rel: 'apple-touch-icon', sizes: '180x180' }
      ];

      faviconLinks.forEach(({ rel, sizes, type }) => {
        const link = document.createElement('link');
        link.rel = rel;
        if (sizes) link.sizes = sizes;
        if (type)  link.type  = type;
        link.href = finalUrl;
        document.head.appendChild(link);
      });

      console.log('✅ Favicon chargé depuis Supabase:', favUrl);
    }

    // ---------- 📝 TITLE ----------
    // Ne remplace que si le title actuel contient "M.N.A BATI" ou est vide
    // (pour préserver les titres spécifiques comme "Nos Réalisations")
    if (data.site_title && data.site_title.trim()) {
      const current = document.title || '';
      // Si le title est vide ou juste "M.N.A BATI", on remplace
      if (!current || current === 'M.N.A BATI' || current.trim() === '') {
        document.title = data.site_title;
      }
    }

    // ---------- 🎨 THEME COLOR ----------
    let theme = document.querySelector('meta[name="theme-color"]');
    if (!theme) {
      theme = document.createElement('meta');
      theme.name = 'theme-color';
      document.head.appendChild(theme);
    }
    theme.content = '#0096ab';

  } catch (err) {
    console.warn('⚠️ Favicon Supabase:', err.message);
  }
})();