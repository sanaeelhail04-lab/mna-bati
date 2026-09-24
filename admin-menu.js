/* ============================================================
   M.N.A BATI — Admin Menu (Sidebar universel + Notifications)
   Fichier : admin-menu.js
   Usage : inclure <script src="config.js"></script>
           puis <script src="admin-menu.js"></script>
   ============================================================ */

(function () {
  'use strict';

  const LOGIN_PAGE = 'login.html';
  const STORAGE_KEY = 'mna_admin_sidebar_collapsed';
  const NOTIF_SEEN_KEY = 'mna_admin_notif_seen';

  /* ============================================================
     CONFIGURATION DU MENU
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
        { key: 'services',     label: 'Services',      icon: 'fa-tools',  href: 'admin-service.html' },
        { key: 'realisations', label: 'Réalisations',  icon: 'fa-images', href: 'admin-realisations.html' },
        { key: 'avant-apres',  label: 'Avant / Après', icon: 'fa-magic',  href: 'admin-avant-apres.html' }
      ]
    },
    {
      section: 'Messages',
      items: [
        { key: 'devis',    label: 'Demandes de devis', icon: 'fa-file-signature', href: 'admin-devis.html',    badge: 'devis' },
        { key: 'contacts', label: 'Messages contact',  icon: 'fa-envelope',       href: 'admin-contact.html',  badge: 'contacts' }
      ]
    },
    {
      section: 'Système',
      items: [
        { key: 'settings', label: 'Paramètres',   icon: 'fa-cog',               href: 'admin-parametres.html' },
        { key: 'site',     label: 'Voir le site', icon: 'fa-external-link-alt', href: 'index.html', external: true }
      ]
    }
  ];

  /* ============================================================
     ÉTAT DES NOTIFICATIONS
     ============================================================ */
  const notifState = {
    contacts: 0,
    devis: 0,
    channel: null
  };

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
                     data-badge-key="${item.badge || ''}"
                     ${item.external ? 'target="_blank"' : ''}
                     title="${item.label}">
                    <i class="fas ${item.icon}"></i>
                    <span class="mna-sidebar-link-text">${item.label}</span>
                    ${item.badge ? `<span class="mna-sidebar-badge" data-badge="${item.badge}"></span>` : ''}
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
      <button class="mna-mobile-notif-btn" id="mna-mobile-notif-btn" aria-label="Notifications">
        <i class="fas fa-bell"></i>
        <span class="mna-mobile-notif-count" id="mna-mobile-notif-count"></span>
      </button>
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
     CSS
     ============================================================ */
  function injectStyles() {
    if (document.getElementById('mna-admin-styles')) return;

    const style = document.createElement('style');
    style.id = 'mna-admin-styles';
    style.textContent = `
      :root {
        --mna-sidebar-w: 240px;
        --mna-sidebar-w-collapsed: 76px;
        --mna-sidebar-bg: #02111d;
        --mna-sidebar-border: rgba(0,150,171,0.18);
        --mna-sidebar-text: #cbd5e1;
        --mna-sidebar-text-muted: #94a3b8;
        --mna-sidebar-teal: #0096ab;
        --mna-sidebar-teal-light: #00b4cc;
        --mna-notif-red: #eb4046;
        --mna-mobile-bar-h: 60px;
      }

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
        transition: width 0.3s ease, transform 0.3s ease;
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

      /* ============================================================
         BADGE NOTIFICATIONS (dans le lien)
         ============================================================ */
      .mna-sidebar-badge {
        display: none;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        height: 20px;
        padding: 0 6px;
        background: linear-gradient(135deg, #eb4046, #b91c1c);
        color: #fff;
        font-size: 0.68rem;
        font-weight: 800;
        border-radius: 9999px;
        box-shadow: 0 4px 10px rgba(235,64,70,0.5);
        margin-left: auto;
        flex-shrink: 0;
        animation: mnaBadgePulse 2s ease-in-out infinite;
      }

      .mna-sidebar-badge.show {
        display: inline-flex;
      }

      @keyframes mnaBadgePulse {
        0%, 100% { transform: scale(1); box-shadow: 0 4px 10px rgba(235,64,70,0.5); }
        50%      { transform: scale(1.08); box-shadow: 0 4px 16px rgba(235,64,70,0.8); }
      }

      .mna-admin-wrapper.collapsed .mna-sidebar-badge {
        position: absolute;
        top: 6px;
        right: 6px;
        min-width: 16px;
        height: 16px;
        font-size: 0.6rem;
        padding: 0 4px;
        margin-left: 0;
      }

      /* ============================================================
         FOOT / LOGOUT
         ============================================================ */
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
         MOBILE TOP BAR
         ============================================================ */
      .mna-admin-mobile-bar {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: var(--mna-mobile-bar-h);
        background: rgba(2,17,29,0.95);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
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
        flex-shrink: 0;
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
        flex: 1;
        min-width: 0;
        overflow: hidden;
      }

      .mna-mobile-brand span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .mna-mobile-logo {
        width: 32px;
        height: 32px;
        font-size: 0.75rem;
        border-radius: 9px;
        flex-shrink: 0;
      }

      .mna-mobile-notif-btn {
        position: relative;
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
        flex-shrink: 0;
      }

      .mna-mobile-notif-btn:hover {
        background: rgba(0,150,171,0.25);
      }

      .mna-mobile-notif-count {
        display: none;
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 18px;
        height: 18px;
        padding: 0 4px;
        background: linear-gradient(135deg, #eb4046, #b91c1c);
        color: #fff;
        font-size: 0.65rem;
        font-weight: 800;
        border-radius: 9999px;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 8px rgba(235,64,70,0.6);
        border: 2px solid #02111d;
      }

      .mna-mobile-notif-count.show {
        display: inline-flex;
      }

      /* ============================================================
         OVERLAY MOBILE
         ============================================================ */
      .mna-admin-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(2,17,29,0.7);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 450;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .mna-admin-overlay.active {
        display: block;
        opacity: 1;
      }

      /* ============================================================
         TOAST NOTIFICATIONS (temps réel)
         ============================================================ */
      .mna-notif-toast-container {
        position: fixed;
        top: 80px;
        right: 1.5rem;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 0.7rem;
        pointer-events: none;
        max-width: 380px;
      }

      .mna-notif-toast {
        background: rgba(13,59,92,0.98);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(0,150,171,0.4);
        border-left: 4px solid var(--mna-sidebar-teal);
        border-radius: 14px;
        padding: 1rem 1.1rem;
        color: #fff;
        display: flex;
        align-items: flex-start;
        gap: 0.8rem;
        box-shadow: 0 20px 50px rgba(0,0,0,0.6);
        animation: mnaNotifSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        pointer-events: auto;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .mna-notif-toast:hover {
        transform: translateX(-4px);
        box-shadow: 0 24px 60px rgba(0,0,0,0.7);
      }

      .mna-notif-toast.devis    { border-left-color: #f4b942; }
      .mna-notif-toast.contact  { border-left-color: #0096ab; }

      .mna-notif-toast .mna-notif-icon {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        flex-shrink: 0;
      }

      .mna-notif-toast.devis .mna-notif-icon {
        background: rgba(244,185,66,0.18);
        color: #f4b942;
      }

      .mna-notif-toast.contact .mna-notif-icon {
        background: rgba(0,150,171,0.18);
        color: #00b4cc;
      }

      .mna-notif-toast .mna-notif-content {
        flex: 1;
        min-width: 0;
      }

      .mna-notif-toast .mna-notif-title {
        font-size: 0.9rem;
        font-weight: 700;
        margin-bottom: 0.2rem;
        color: #fff;
        font-family: 'Space Grotesk', sans-serif;
      }

      .mna-notif-toast .mna-notif-msg {
        font-size: 0.82rem;
        color: #cbd5e1;
        line-height: 1.4;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .mna-notif-toast .mna-notif-time {
        font-size: 0.7rem;
        color: #94a3b8;
        margin-top: 0.35rem;
        font-weight: 500;
      }

      .mna-notif-toast .mna-notif-close {
        width: 24px;
        height: 24px;
        border-radius: 7px;
        background: rgba(255,255,255,0.06);
        color: #94a3b8;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        flex-shrink: 0;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .mna-notif-toast .mna-notif-close:hover {
        background: rgba(235,64,70,0.2);
        color: #ff8b8f;
      }

      @keyframes mnaNotifSlideIn {
        from { transform: translateX(120%); opacity: 0; }
        to   { transform: translateX(0); opacity: 1; }
      }

      @keyframes mnaNotifSlideOut {
        from { transform: translateX(0); opacity: 1; }
        to   { transform: translateX(120%); opacity: 0; }
      }

      /* ============================================================
         MEDIA QUERIES — RESPONSIVE COMPLET
         ============================================================ */

      /* Tablette (≤900px) */
      @media (max-width: 900px) {
        .mna-admin-wrapper .mna-admin-main {
          margin-left: 0 !important;
          padding-top: var(--mna-mobile-bar-h);
        }

        .mna-admin-mobile-bar {
          display: flex;
        }

        .mna-admin-sidebar {
          transform: translateX(-100%);
          width: var(--mna-sidebar-w) !important;
          box-shadow: 20px 0 60px rgba(0,0,0,0.6);
        }

        .mna-admin-wrapper.mobile-open .mna-admin-sidebar {
          transform: translateX(0);
        }

        .mna-admin-wrapper.collapsed .mna-sidebar-brand-text,
        .mna-admin-wrapper.collapsed .mna-sidebar-link-text,
        .mna-admin-wrapper.collapsed .mna-sidebar-group-label {
          opacity: 1;
          width: auto;
          height: auto;
        }

        .mna-admin-wrapper.collapsed .mna-sidebar-badge {
          position: static;
          min-width: 20px;
          height: 20px;
          font-size: 0.68rem;
          padding: 0 6px;
          margin-left: auto;
        }

        .mna-sidebar-toggle {
          display: none;
        }

        .mna-notif-toast-container {
          top: 72px;
          right: 0.8rem;
          left: 0.8rem;
          max-width: none;
        }
      }

      /* Mobile (≤480px) */
      @media (max-width: 480px) {
        :root { --mna-mobile-bar-h: 56px; }

        .mna-mobile-brand span {
          font-size: 0.8rem;
        }

        .mna-mobile-burger,
        .mna-mobile-notif-btn {
          width: 38px;
          height: 38px;
        }

        .mna-notif-toast {
          padding: 0.85rem 0.9rem;
          border-radius: 12px;
        }

        .mna-notif-toast .mna-notif-icon {
          width: 36px;
          height: 36px;
          font-size: 0.95rem;
        }

        .mna-notif-toast .mna-notif-title {
          font-size: 0.85rem;
        }

        .mna-notif-toast .mna-notif-msg {
          font-size: 0.76rem;
        }
      }

      /* Très petit mobile (≤360px) */
      @media (max-width: 360px) {
        .mna-mobile-brand span { display: none; }
      }

      /* Accessibilité */
      @media (prefers-reduced-motion: reduce) {
        .mna-admin-sidebar,
        .mna-admin-wrapper .mna-admin-main,
        .mna-sidebar-link,
        .mna-admin-overlay,
        .mna-sidebar-badge,
        .mna-notif-toast {
          transition-duration: 0.01ms !important;
          animation-duration: 0.01ms !important;
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

    const children = Array.from(document.body.childNodes);
    children.forEach(node => {
      if (node.nodeType === 1 && node.tagName === 'SCRIPT') return;
      main.appendChild(node);
    });

    wrapper.appendChild(main);
    document.body.appendChild(wrapper);

    children.forEach(node => {
      if (node.nodeType === 1 && node.tagName === 'SCRIPT') {
        document.body.appendChild(node);
      }
    });
  }

  /* ============================================================
     NOTIFICATIONS EN TEMPS RÉEL
     ============================================================ */
  function getSeenState() {
    try {
      return JSON.parse(localStorage.getItem(NOTIF_SEEN_KEY) || '{}');
    } catch { return {}; }
  }

  function setSeenState(state) {
    try {
      localStorage.setItem(NOTIF_SEEN_KEY, JSON.stringify(state));
    } catch {}
  }

  function updateBadges() {
    document.querySelectorAll('.mna-sidebar-badge').forEach(badge => {
      const key = badge.getAttribute('data-badge');
      const count = notifState[key] || 0;
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.classList.add('show');
      } else {
        badge.textContent = '';
        badge.classList.remove('show');
      }
    });

    const total = (notifState.devis || 0) + (notifState.contacts || 0);
    const mobileCount = document.getElementById('mna-mobile-notif-count');
    if (mobileCount) {
      if (total > 0) {
        mobileCount.textContent = total > 99 ? '99+' : total;
        mobileCount.classList.add('show');
      } else {
        mobileCount.textContent = '';
        mobileCount.classList.remove('show');
      }
    }

    // Titre du navigateur
    if (total > 0) {
      document.title = `(${total}) ${document.title.replace(/^\(\d+\)\s/, '')}`;
    } else {
      document.title = document.title.replace(/^\(\d+\)\s/, '');
    }
  }

  async function loadInitialCounts(supabase) {
    try {
      const seen = getSeenState();
      const [contactsRes, devisRes] = await Promise.all([
        supabase.from('contacts').select('id, created_at', { count: 'exact', head: false })
          .gte('created_at', seen.contacts_after || '1970-01-01'),
        supabase.from('devis').select('id, created_at', { count: 'exact', head: false })
          .gte('created_at', seen.devis_after || '1970-01-01')
      ]);

      // Comptage simple : en fait on veut les NOUVEAUX (status = new)
      // On refait proprement :
      const [cRes, dRes] = await Promise.all([
        supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('devis').select('id', { count: 'exact', head: true }).eq('status', 'new')
      ]);

      notifState.contacts = cRes.count || 0;
      notifState.devis = dRes.count || 0;
      updateBadges();
    } catch (err) {
      console.warn('Notification initial count error:', err);
    }
  }

  function showNotifToast(type, data) {
    let container = document.querySelector('.mna-notif-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'mna-notif-toast-container';
      document.body.appendChild(container);
    }

    const isDevis = type === 'devis';
    const icon = isDevis ? 'fa-file-signature' : 'fa-envelope';
    const title = isDevis ? 'Nouvelle demande de devis' : 'Nouveau message de contact';
    const targetPage = isDevis ? 'admin-devis.html' : 'admin-contact.html';

    const name = [data.prenom, data.nom].filter(Boolean).join(' ') || data.email || 'Anonyme';
    const preview = isDevis
      ? (data.projet || data.message || 'Nouvelle demande')
      : (data.sujet || data.message || 'Nouveau message');

    const toast = document.createElement('div');
    toast.className = `mna-notif-toast ${type}`;
    toast.innerHTML = `
      <div class="mna-notif-icon">
        <i class="fas ${icon}"></i>
      </div>
      <div class="mna-notif-content">
        <div class="mna-notif-title">${title}</div>
        <div class="mna-notif-msg"><strong>${escapeHtml(name)}</strong> — ${escapeHtml(String(preview).substring(0, 80))}</div>
        <div class="mna-notif-time"><i class="fas fa-clock"></i> À l'instant</div>
      </div>
      <button class="mna-notif-close" aria-label="Fermer">
        <i class="fas fa-times"></i>
      </button>
    `;

    // Click → aller sur la page
    toast.addEventListener('click', (e) => {
      if (e.target.closest('.mna-notif-close')) return;
      window.location.href = targetPage;
    });

    // Fermer
    toast.querySelector('.mna-notif-close').addEventListener('click', (e) => {
      e.stopPropagation();
      removeToast(toast);
    });

    container.appendChild(toast);

    // Auto-dismiss après 8s
    setTimeout(() => removeToast(toast), 8000);
  }

  function removeToast(toast) {
    if (!toast.parentNode) return;
    toast.style.animation = 'mnaNotifSlideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function setupRealtimeNotifications(supabase) {
    // Nettoyer ancien channel si existe
    if (notifState.channel) {
      try { supabase.removeChannel(notifState.channel); } catch {}
      notifState.channel = null;
    }

    const channel = supabase
      .channel('mna-admin-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contacts' },
        (payload) => {
          console.log('📬 Nouveau contact:', payload.new);
          // Incrémenter seulement si ce n'est pas la page courante
          if (getCurrentPage() !== 'admin-contact.html') {
            notifState.contacts++;
            updateBadges();
          }
          showNotifToast('contact', payload.new);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'devis' },
        (payload) => {
          console.log('📋 Nouveau devis:', payload.new);
          if (getCurrentPage() !== 'admin-devis.html') {
            notifState.devis++;
            updateBadges();
          }
          showNotifToast('devis', payload.new);
        }
      )
      .subscribe((status) => {
        console.log('📡 Notifications realtime:', status);
      });

    notifState.channel = channel;
  }

  /* ============================================================
     LOGOUT SUPABASE
     ============================================================ */
  async function doLogout() {
    try {
      const supa =
        (window.MNA && typeof window.MNA.getClient === 'function' && window.MNA.getClient()) ||
        window.__mnaSupabase ||
        null;

      if (supa && supa.auth && typeof supa.auth.signOut === 'function') {
        await supa.auth.signOut();
        console.log('✅ Déconnecté de Supabase');
      } else {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
            localStorage.removeItem(key);
          }
        });
        console.log('⚠️ Tokens Supabase supprimés manuellement');
      }
    } catch (err) {
      console.error('❌ Logout error:', err);
    }

    window.location.href = LOGIN_PAGE;
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    const current = getCurrentPage();
    if (!current.startsWith('admin')) return;
    if (document.querySelector('.mna-admin-wrapper')) return;

    injectStyles();

    const wrapper = buildMenu();

    document.body.style.padding = '0';
    document.body.style.margin = '0';

    wrapExistingContent(wrapper);

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
        document.body.style.overflow = 'hidden';
      });
    }

    function closeMobileMenu() {
      wrapper.classList.remove('mobile-open');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (overlay) {
      overlay.addEventListener('click', closeMobileMenu);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });

    // Fermer le menu après clic sur un lien (mobile)
    wrapper.querySelectorAll('.mna-sidebar-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 900) {
          // Laisser la navigation se faire, juste fermer
          setTimeout(closeMobileMenu, 100);
        }
      });
    });

    // Bouton notifications mobile → rediriger vers la page la plus pertinente
    const mobileNotifBtn = document.getElementById('mna-mobile-notif-btn');
    if (mobileNotifBtn) {
      mobileNotifBtn.addEventListener('click', () => {
        // Si devis > contacts → devis, sinon contacts, sinon rien
        if (notifState.devis > 0 && notifState.devis >= notifState.contacts) {
          window.location.href = 'admin-devis.html';
        } else if (notifState.contacts > 0) {
          window.location.href = 'admin-contact.html';
        } else {
          // Rien de neuf → petit feedback
          mobileNotifBtn.style.transform = 'scale(0.9)';
          setTimeout(() => mobileNotifBtn.style.transform = '', 150);
        }
      });
    }

    // Logout
    const logout = wrapper.querySelector('#mna-admin-logout');
    if (logout) {
      logout.addEventListener('click', async () => {
        if (!confirm('Se déconnecter ?')) return;
        await doLogout();
      });
    }

    // ============================================================
    // NOTIFICATIONS EN TEMPS RÉEL
    // ============================================================
    const supabase =
      (window.MNA && typeof window.MNA.getClient === 'function' && window.MNA.getClient()) ||
      null;

    if (supabase) {
      // Charger les compteurs initiaux
      loadInitialCounts(supabase);
      // Écouter les nouveaux inserts
      setupRealtimeNotifications(supabase);
    } else {
      console.warn('⚠️ Notifications désactivées : client Supabase introuvable');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();