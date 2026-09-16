/* ============================================================
   M.N.A BATI — Admin Menu (Sidebar universel)
   Fichier : admin-menu.js
   Usage : inclure <script src="admin-menu.js"></script> dans chaque page admin
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     CONFIGURATION
     ============================================================ */
  const MENU_ITEMS = [
    {
      section: 'Général',
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie', href: 'admin.html' }
      ]
    },
    {
      section: 'Contenu',
      items: [
        { key: 'index',         label: 'Page d\'accueil',   icon: 'fa-home',        href: 'admin-index.html' },
        { key: 'services',      label: 'Services',          icon: 'fa-tools',       href: 'admin-service.html' },
        { key: 'realisations',  label: 'Réalisations',      icon: 'fa-images',      href: 'admin-realisations.html' },
        { key: 'apropos',       label: 'À propos',          icon: 'fa-info-circle', href: 'admin-apropos.html' }
      ]
    },
    {
      section: 'Messages',
      items: [
        { key: 'devis',    label: 'Demandes de devis', icon: 'fa-file-signature', href: 'admin-devis.html' },
        { key: 'contacts', label: 'Messages contact',  icon: 'fa-envelope',       href: 'admin-contact.html' }
      ]
    },
    {
      section: 'Système',
      items: [
        { key: 'settings', label: 'Paramètres',  icon: 'fa-cog',            href: 'admin-settings.html' },
        { key: 'site',     label: 'Voir le site', icon: 'fa-external-link-alt', href: 'index.html', external: true }
      ]
    }
  ];

  const STORAGE_KEY = 'mna_admin_sidebar_collapsed';

  /* ============================================================
     DÉTECTION DE LA PAGE COURANTE
     ============================================================ */
  function getCurrentPage() {
    const path = window.location.pathname.split('/').pop() || 'admin.html';
    return path.toLowerCase();
  }

  function isCurrentItem(item) {
    const current = getCurrentPage();
    const itemFile = item.href.split('/').pop().split('?')[0].toLowerCase();
    return current === itemFile;
  }

  /* ============================================================
     CONSTRUCTION DU HTML
     ============================================================ */
  function buildMenu() {
    const collapsed = localStorage.getItem(STORAGE_KEY) === '1';
    const wrapper = document.createElement('div');
    wrapper.className = 'mna-admin-wrapper' + (collapsed ? ' collapsed' : '');

    // ===== SIDEBAR =====
    const sidebar = document.createElement('aside');
    sidebar.className = 'mna-admin-sidebar';
    sidebar.innerHTML = `
      <div class="mna-sidebar-head">
        <a href="admin.html" class="mna-sidebar-brand">
          <div class="mna-sidebar-logo">MB</div>
          <div class="mna-sidebar-brand-text">
            <strong>M.N.A BATI</strong>
            <span>Admin</span>
          </div>
        </a>
        <button class="mna-sidebar-toggle" title="Réduire / Étendre" aria-label="Toggle sidebar">
          <i class="fas fa-chevron-left"></i>
        </button>
      </div>

      <nav class="mna-sidebar-nav">
        ${MENU_ITEMS.map(group => `
          <div class="mna-sidebar-group">
            <div class="mna-sidebar-group-label">${group.section}</div>
            <ul>
              ${group.items.map(item => `
                <li>
                  <a href="${item.href}"
                     class="mna-sidebar-link ${isCurrentItem(item) ? 'active' : ''}"
                     ${item.external ? 'target="_blank"' : ''}
                     title="${item.label}">
                    <i class="fas ${item.icon}"></i>
                    <span class="mna-sidebar-link-text">${item.label}</span>
                  </a>
                </li>
              `).join('')}
            </ul>
          </div>
        `).join('')}
      </nav>

      <div class="mna-sidebar-foot">
        <button class="mna-sidebar-logout" id="mna-admin-logout">
          <i class="fas fa-sign-out-alt"></i>
          <span class="mna-sidebar-link-text">Déconnexion</span>
        </button>
      </div>
    `;

    // ===== MOBILE TOP BAR =====
    const mobileBar = document.createElement('div');
    mobileBar.className = 'mna-admin-mobile-bar';
    mobileBar.innerHTML = `
      <button class="mna-mobile-burger" aria-label="Menu">
        <i class="fas fa-bars"></i>
      </button>
      <div class="mna-mobile-brand">
        <div class="mna-mobile-logo">MB</div>
        <span>M.N.A BATI · Admin</span>
      </div>
    `;

    // ===== OVERLAY (mobile) =====
    const overlay = document.createElement('div');
    overlay.className = 'mna-admin-overlay';

    wrapper.appendChild(mobileBar);
    wrapper.appendChild(overlay);
    wrapper.appendChild(sidebar);

    return wrapper;
  }

  /* ============================================================
     INJECTION DU CSS
     ============================================================ */
  function injectStyles() {
    if (document.getElementById('mna-admin-styles')) return;

    const style = document.createElement('style');
    style.id = 'mna-admin-styles';
    style.textContent = `
      /* ============================================================
         VARIABLES
         ============================================================ */
      :root {
        --mna-sidebar-w: 240px;
        --mna-sidebar-w-collapsed: 76px;
        --mna-sidebar-bg: #02111d;
        --mna-sidebar-border: rgba(0,150,171,0.18);
        --mna-sidebar-text: #cbd5e1;
        --mna-sidebar-text-muted: #94a3b8;
        --mna-sidebar-teal: #0096ab;
        --mna-sidebar-teal-light: #00b4cc;
      }

      /* ============================================================
         LAYOUT GLOBAL
         ============================================================ */
      .mna-admin-wrapper {
        display: flex;
        min-height: 100vh;
        width: 100%;
      }

      .mna-admin-wrapper .mna-admin-main {
        flex: 1;
        min-width: 0;
        margin-left: var(--mna-sidebar-w);
        transition: margin-left 0.3s ease;
      }

      .mna-admin-wrapper.collapsed .mna-admin-main {
        margin-left: var(--mna-sidebar-w-collapsed);
      }

      /* ============================================================
         SIDEBAR
         ============================================================ */
      .mna-admin-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: var(--mna-sidebar-w);
        background: var(--mna-sidebar-bg);
        border-right: 1px solid var(--mna-sidebar-border);
        display: flex;
        flex-direction: column;
        z-index: 500;
        transition: width 0.3s ease;
        overflow-y: auto;
        overflow-x: hidden;
        font-family: 'Poppins', system-ui, sans-serif;
      }

      .mna-admin-wrapper.collapsed .mna-admin-sidebar {
        width: var(--mna-sidebar-w-collapsed);
      }

      .mna-admin-sidebar::-webkit-scrollbar { width: 4px; }
      .mna-admin-sidebar::-webkit-scrollbar-thumb {
        background: rgba(0,150,171,0.3);
        border-radius: 2px;
      }

      /* --- Brand --- */
      .mna-sidebar-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.2rem 1rem;
        border-bottom: 1px solid var(--mna-sidebar-border);
        flex-shrink: 0;
        gap: 0.5rem;
      }

      .mna-sidebar-brand {
        display: flex;
        align-items: center;
        gap: 0.7rem;
        text-decoration: none;
        color: inherit;
        min-width: 0;
        flex: 1;
      }

      .mna-sidebar-logo,
      .mna-mobile-logo {
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        background: linear-gradient(135deg, #0096ab, #006e82);
        border-radius: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 800;
        font-size: 0.95rem;
        box-shadow: 0 6px 16px rgba(0,150,171,0.4);
      }

      .mna-sidebar-brand-text {
        display: flex;
        flex-direction: column;
        min-width: 0;
        overflow: hidden;
        white-space: nowrap;
        transition: opacity 0.2s ease;
      }

      .mna-sidebar-brand-text strong {
        color: #fff;
        font-size: 0.9rem;
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: -0.01em;
      }

      .mna-sidebar-brand-text span {
        font-size: 0.6rem;
        font-weight: 700;
        letter-spacing: 1.2px;
        text-transform: uppercase;
        color: var(--mna-sidebar-teal-light);
      }

      .mna-admin-wrapper.collapsed .mna-sidebar-brand-text {
        opacity: 0;
        width: 0;
      }

      .mna-sidebar-toggle {
        width: 32px;
        height: 32px;
        flex-shrink: 0;
        border-radius: 9px;
        background: rgba(255,255,255,0.05);
        border: 1px solid var(--mna-sidebar-border);
        color: var(--mna-sidebar-text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 0.75rem;
        transition: all 0.2s ease;
      }

      .mna-sidebar-toggle:hover {
        background: rgba(0,150,171,0.15);
        border-color: var(--mna-sidebar-teal);
        color: var(--mna-sidebar-teal-light);
      }

      .mna-admin-wrapper.collapsed .mna-sidebar-toggle i {
        transform: rotate(180deg);
      }

      /* --- Nav --- */
      .mna-sidebar-nav {
        flex: 1;
        padding: 1rem 0.6rem;
        overflow-y: auto;
      }

      .mna-sidebar-group {
        margin-bottom: 1rem;
      }

      .mna-sidebar-group-label {
        font-size: 0.6rem;
        font-weight: 700;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: var(--mna-sidebar-text-muted);
        padding: 0.5rem 0.7rem 0.4rem;
        transition: opacity 0.2s ease;
      }

      .mna-admin-wrapper.collapsed .mna-sidebar-group-label {
        opacity: 0;
        height: 0;
        padding: 0;
        overflow: hidden;
      }

      .mna-sidebar-nav ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .mna-sidebar-nav li {
        margin: 0;
      }

      .mna-sidebar-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.65rem 0.8rem;
        border-radius: 10px;
        color: var(--mna-sidebar-text);
        text-decoration: none;
        font-size: 0.85rem;
        font-weight: 500;
        transition: all 0.2s ease;
        white-space: nowrap;
        position: relative;
        overflow: hidden;
      }

      .mna-sidebar-link i {
        width: 18px;
        flex-shrink: 0;
        text-align: center;
        font-size: 0.9rem;
        color: var(--mna-sidebar-teal);
        opacity: 0.75;
        transition: all 0.2s ease;
      }

      .mna-sidebar-link-text {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: opacity 0.2s ease;
      }

      .mna-admin-wrapper.collapsed .mna-sidebar-link-text {
        opacity: 0;
        width: 0;
      }

      .mna-sidebar-link:hover {
        background: rgba(0,150,171,0.1);
        color: #fff;
      }

      .mna-sidebar-link:hover i {
        opacity: 1;
      }

      .mna-sidebar-link.active {
        background: linear-gradient(135deg, rgba(0,150,171,0.28), rgba(0,150,171,0.08));
        color: #fff;
        font-weight: 600;
        box-shadow: inset 0 0 0 1px rgba(0,150,171,0.4);
      }

      .mna-sidebar-link.active i {
        color: var(--mna-sidebar-teal-light);
        opacity: 1;
      }

      .mna-sidebar-link.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 60%;
        background: var(--mna-sidebar-teal-light);
        border-radius: 0 3px 3px 0;
      }

      /* --- Foot --- */
      .mna-sidebar-foot {
        padding: 0.8rem 0.6rem 1rem;
        border-top: 1px solid var(--mna-sidebar-border);
        flex-shrink: 0;
      }

      .mna-sidebar-logout {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.65rem 0.8rem;
        border-radius: 10px;
        background: transparent;
        border: none;
        color: #ff8b8f;
        font-size: 0.85rem;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
        white-space: nowrap;
      }

      .mna-sidebar-logout i {
        width: 18px;
        flex-shrink: 0;
        text-align: center;
        font-size: 0.9rem;
        color: #eb4046;
      }

      .mna-sidebar-logout:hover {
        background: rgba(235,64,70,0.12);
      }

      /* ============================================================
         MOBILE
         ============================================================ */
      .mna-admin-mobile-bar {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: rgba(2,17,29,0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--mna-sidebar-border);
        z-index: 600;
        align-items: center;
        padding: 0 1rem;
        gap: 0.8rem;
      }

      .mna-mobile-burger {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: rgba(0,150,171,0.15);
        border: 1px solid var(--mna-sidebar-border);
        color: var(--mna-sidebar-teal-light);
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .mna-mobile-burger:hover {
        background: rgba(0,150,171,0.25);
      }

      .mna-mobile-brand {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        color: #fff;
        font-size: 0.85rem;
        font-weight: 700;
        font-family: 'Poppins', sans-serif;
      }

      .mna-mobile-logo {
        width: 32px;
        height: 32px;
        font-size: 0.75rem;
        border-radius: 9px;
      }

      .mna-admin-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(2,17,29,0.7);
        backdrop-filter: blur(4px);
        z-index: 450;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .mna-admin-overlay.active {
        display: block;
        opacity: 1;
      }

      /* ============================================================
         RESPONSIVE
         ============================================================ */
      @media (max-width: 900px) {
        .mna-admin-wrapper .mna-admin-main {
          margin-left: 0 !important;
          padding-top: 60px;
        }

        .mna-admin-mobile-bar {
          display: flex;
        }

        .mna-admin-sidebar {
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          width: var(--mna-sidebar-w) !important;
        }

        .mna-admin-wrapper.mobile-open .mna-admin-sidebar {
          transform: translateX(0);
          box-shadow: 20px 0 60px rgba(0,0,0,0.6);
        }

        .mna-admin-wrapper.collapsed .mna-sidebar-brand-text,
        .mna-admin-wrapper.collapsed .mna-sidebar-link-text,
        .mna-admin-wrapper.collapsed .mna-sidebar-group-label {
          opacity: 1;
          width: auto;
          height: auto;
        }

        .mna-sidebar-toggle {
          display: none;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .mna-admin-sidebar,
        .mna-admin-wrapper .mna-admin-main,
        .mna-sidebar-link,
        .mna-admin-overlay {
          transition-duration: 0.01ms !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* ============================================================
     WRAPPING DU CONTENU EXISTANT
     ============================================================ */
  function wrapExistingContent(wrapper) {
    const main = document.createElement('div');
    main.className = 'mna-admin-main';

    // نسخ كل عناصر body (ما عدا السكريبتات)
    const children = Array.from(document.body.childNodes);
    children.forEach(node => {
      // تجاهل السكريبتات
      if (node.nodeType === 1 && node.tagName === 'SCRIPT') return;
      main.appendChild(node);
    });

    wrapper.appendChild(main);
    document.body.appendChild(wrapper);

    // إعادة إضافة السكريبتات
    children.forEach(node => {
      if (node.nodeType === 1 && node.tagName === 'SCRIPT') {
        document.body.appendChild(node);
      }
    });
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    // لا تفتح المنيو إلا على صفحات admin
    const current = getCurrentPage();
    if (!current.startsWith('admin')) return;

    // لا تكرّر
    if (document.querySelector('.mna-admin-wrapper')) return;

    injectStyles();

    // بناء الـ wrapper
    const wrapper = buildMenu();

    // تنظيف body من الـ padding الموجود (باش الـ main ياخد بلاصتو)
    document.body.style.padding = '0';
    document.body.style.margin = '0';

    // لفي المحتوى
    wrapExistingContent(wrapper);

    // ===== ÉVÉNEMENTS =====

    // Toggle collapse
    const toggleBtn = wrapper.querySelector('.mna-sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const isCollapsed = wrapper.classList.toggle('collapsed');
        localStorage.setItem(STORAGE_KEY, isCollapsed ? '1' : '0');
      });
    }

    // Burger (mobile)
    const burger = wrapper.querySelector('.mna-mobile-burger');
    const overlay = wrapper.querySelector('.mna-admin-overlay');
    if (burger) {
      burger.addEventListener('click', () => {
        wrapper.classList.add('mobile-open');
        overlay.classList.add('active');
      });
    }

    // Overlay close
    if (overlay) {
      overlay.addEventListener('click', () => {
        wrapper.classList.remove('mobile-open');
        overlay.classList.remove('active');
      });
    }

    // Fermer sur Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        wrapper.classList.remove('mobile-open');
        overlay.classList.remove('active');
      }
    });

    // Logout
    const logout = wrapper.querySelector('#mna-admin-logout');
    if (logout) {
      logout.addEventListener('click', () => {
        if (confirm('Se déconnecter ?')) {
          sessionStorage.removeItem('mna_admin_auth');
          window.location.href = 'admin.html';
        }
      });
    }
  }

  // Démarrage
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();