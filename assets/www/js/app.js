const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
  ? (window.navigator.userAgent.includes('Android') ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api')
  : window.location.origin + '/api';

// Language state
let CURRENT_LANG = localStorage.getItem('lang') || 'ar';

function setLanguage(lang) {
  localStorage.setItem('lang', lang);
  window.location.reload();
}

function applyLanguageDir() {
  document.documentElement.lang = CURRENT_LANG;
  document.documentElement.dir = CURRENT_LANG === 'ar' ? 'rtl' : 'ltr';
  if (CURRENT_LANG !== 'ar') document.body.classList.add('ltr');
  else document.body.classList.remove('ltr');
}
applyLanguageDir();

// Translations
const i18n = {
  ar: {
    login: 'تسجيل الدخول', signup: 'إنشاء حساب', logout: 'خروج',
    home: '🏠 الرئيسية', trips: '🗺️ رحلاتي', favs: '❤️ المفضلة', notifs: '🔔 الإشعارات', bookings: '📅 حجوزاتي',
    dashboard_admin: 'لوحة التحكم', dashboard_business: 'إدارة المنشأة', tourist_dashboard: 'لوحتي السياحية',
    all: 'استكشف الأماكن', landmark: 'المعالم السياحية', hotel: 'الفنادق', restaurant: 'المطاعم', mosque: 'مساجد', market: 'أسواق', transport: 'محطات نقل', park: 'حدائق', hostel: 'مراقد',
    user: 'مستخدم',
    hero_title: 'اكتشف جمال غرداية',
    hero_subtitle: 'استكشف وادي ميزاب الساحر، مدنه الخمس التاريخية، معالمه الفريدة، فنادقه المريحة ومطاعمه التقليدية الأصيلة',
    search_placeholder: 'ابحث عن مكان (معلم، فندق، مطعم)...'
  },
  en: {
    login: 'Login', signup: 'Sign Up', logout: 'Logout',
    home: '🏠 Home', trips: '🗺️ Trips', favs: '❤️ Favorites', notifs: '🔔 Notifications', bookings: '📅 Bookings',
    dashboard_admin: 'Admin Dashboard', dashboard_business: 'Business Dashboard', tourist_dashboard: 'Tourist Dashboard',
    all: 'All', landmark: 'Landmarks', hotel: 'Hotels', restaurant: 'Restaurants', mosque: 'Mosques', market: 'Markets', transport: 'Transport', park: 'Parks', hostel: 'Hostels',
    user: 'User',
    hero_title: 'Explore Ghardaia Places',
    hero_subtitle: 'Discover the most beautiful landmarks, hotels, and restaurants in the historic M\'zab Valley',
    search_placeholder: 'Search for a place (landmark, hotel, restaurant)...'
  },
  fr: {
    login: 'Connexion', signup: "S'inscrire", logout: 'Déconnexion',
    home: '🏠 Accueil', trips: '🗺️ Voyages', favs: '❤️ Favoris', notifs: 'Notifications', bookings: '📅 Réservations',
    dashboard_admin: 'Tableau Admin', dashboard_business: 'Gestion Établissement', tourist_dashboard: 'Mon Tableau',
    all: 'Tout', landmark: 'Monuments', hotel: 'Hôtels', restaurant: 'Restaurants', mosque: 'Mosquées', market: 'Marchés', transport: 'Transports', park: 'Parcs', hostel: 'Auberges',
    user: 'Utilisateur',
    hero_title: 'Explorez Ghardaïa',
    hero_subtitle: 'Découvrez les plus beaux sites, hôtels et restaurants de la vallée historique du M\'zab',
    search_placeholder: 'Rechercher un lieu (monument, hôtel, restaurant)...'
  }
};

function t(key) {
  return i18n[CURRENT_LANG][key] || key;
}

// Get localized field (e.g. name, description)
function tField(obj, field) {
  if (CURRENT_LANG === 'ar') return obj[`${field}_ar`] || obj[field];
  if (CURRENT_LANG === 'fr') return obj[`${field}_fr`] || obj[field];
  return obj[field]; // English is default field
}

// Auth helpers
function getToken() { return localStorage.getItem('token'); }
function getUser() { try { return JSON.parse(localStorage.getItem('user')); } catch(e) { return null; } }
function isLoggedIn() { return !!getToken(); }
function logout() { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = 'index.html'; }

// API helper
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  let res;
  try {
    res = await fetch(`${API}${endpoint}`, { ...options, headers });
  } catch (err) {
    // Handle network errors like "Failed to fetch"
    const networkErrorMsg = CURRENT_LANG === 'ar' ? 'فشل الاتصال بالخادم. يرجى التأكد من تشغيل الخادم والاتصال بالإنترنت.' 
                           : CURRENT_LANG === 'fr' ? 'Échec de la connexion au serveur.'
                           : 'Failed to connect to server. Please check your connection.';
    throw new Error(networkErrorMsg);
  }

  const data = await res.json();
  if (!res.ok) {
    const defaultError = CURRENT_LANG === 'ar' ? 'حدث خطأ' 
                        : CURRENT_LANG === 'fr' ? 'Une erreur est survenue' 
                        : 'An error occurred';
    throw new Error(data.error || defaultError);
  }
  return data;
}

// Toast notifications
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) { container = document.createElement('div'); container.className = 'toast-container'; document.body.appendChild(container); }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Category translations are now handled by t() dynamically
const categoryIcons = {
  landmark: '🏛️', hotel: '🏨', restaurant: '🍽️', mosque: '🕌', market: '🛍️', transport: '🚌', park: '🌳', hostel: '🏘️'
};

// Stars rendering
function renderStars(rating) {
  let s = '';
  for (let i = 1; i <= 5; i++) s += i <= Math.round(rating) ? '★' : '☆';
  return s;
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Time ago
function timeAgo(dateStr) {
  const now = new Date(); const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'الآن';
  if (diff < 3600) return `منذ ${Math.floor(diff/60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff/3600)} ساعة`;
  if (diff < 604800) return `منذ ${Math.floor(diff/86400)} يوم`;
  return formatDate(dateStr);
}

function updateNavbar() {
  const authArea = document.getElementById('navbar-auth');
  const navLinks = document.getElementById('nav-links');
  
  if (navLinks) {
    const linksHtml = `
      <a href="index.html" class="${location.pathname === '/' ? 'active' : ''}">${t('home')}</a>
      <a href="trips.html" class="${location.pathname === '/trips.html' ? 'active' : ''}">${t('trips')}</a>
      <a href="favorites.html" class="${location.pathname === '/favorites.html' ? 'active' : ''}">${t('favs')}</a>
      <a href="notifications.html" class="${location.pathname === '/notifications.html' ? 'active' : ''}">${t('notifs')} <span class="badge" id="notif-badge" style="display:none">0</span></a>
    `;
    navLinks.innerHTML = linksHtml;
  }

  if (!authArea) return;

  const langSwitcher = `
    <div style="display:flex; align-items:center; gap:8px;">
      <button class="theme-toggle" onclick="toggleTheme()" title="تبديل الوضع">
        <i class="fas ${localStorage.getItem('theme') === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
      </button>
      <select onchange="setLanguage(this.value)" style="margin: 0 5px; padding: 4px; border-radius: 4px; border: 1px solid var(--border); font-size: 0.85rem; font-weight: 700; cursor:pointer; background:var(--bg-card); color:var(--text);" title="تغيير اللغة">
        <option value="ar" ${CURRENT_LANG === 'ar' ? 'selected' : ''}>AR</option>
        <option value="fr" ${CURRENT_LANG === 'fr' ? 'selected' : ''}>FR</option>
        <option value="en" ${CURRENT_LANG === 'en' ? 'selected' : ''}>EN</option>
      </select>
    </div>
  `;

  if (isLoggedIn()) {
    const user = getUser();
    const initial = user?.name?.charAt(0) || '?';
    authArea.innerHTML = `
      ${langSwitcher}
      <div class="navbar-user" id="navbar-user-btn">
        <div class="user-avatar">${initial}</div>
        <span>${user?.name || t('user')}</span>
      </div>
      <div id="user-dropdown">
        ${user?.role === 'admin' ? `<a href="dashboard-admin.html">🛠️ ${t('dashboard_admin')}</a>` : ''}
        ${user?.role === 'hotel_owner' || user?.role === 'restaurant_owner' ? `<a href="dashboard-business.html">🏢 ${t('dashboard_business')}</a>` : ''}
        <a href="dashboard-tourist.html">🗺️ ${t('tourist_dashboard')}</a>
        <a href="bookings.html">📅 ${t('bookings')}</a>
        <a href="favorites.html">❤️ ${t('favs')}</a>
        <div style="height:1px;background:var(--border-light);margin:4px 0;"></div>
        <a href="#" class="logout-btn" onclick="logout();return false;">🚪 ${t('logout')}</a>
      </div>`;
    
    // Toggle dropdown
    const btn = document.getElementById('navbar-user-btn');
    const dd = document.getElementById('user-dropdown');
    if (btn && dd) {
      btn.onclick = (e) => {
        e.stopPropagation();
        dd.classList.toggle('active');
      };
      document.addEventListener('click', () => dd.classList.remove('active'));
    }
  } else {
    authArea.innerHTML = `${langSwitcher}<a href="login.html" class="btn btn-sm btn-secondary">${t('login')}</a><a href="signup.html" class="btn btn-sm btn-primary">${t('signup')}</a>`;
  }
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile menu
function toggleMobileMenu() {
  document.querySelector('.navbar-links')?.classList.toggle('active');
}

// Load notification count
async function loadNotifCount() {
  if (!isLoggedIn()) return;
  try {
    const data = await apiFetch('/notifications');
    const badge = document.getElementById('notif-badge');
    if (badge) {
      badge.textContent = data.unread_count;
      badge.style.display = data.unread_count > 0 ? 'inline' : 'none';
    }
  } catch(e) {}
}

// Theme Toggle
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('.theme-toggle i');
  if (icon) {
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
  }
}

function applyInitialTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  // Theme toggle button might not be in DOM yet, will be updated in updateNavbar
}

applyInitialTheme();

// Init
document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  loadNotifCount();
  
  const savedTheme = localStorage.getItem('theme') || 'light';
  updateThemeIcon(savedTheme);
  
  // Translate static data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[CURRENT_LANG] && i18n[CURRENT_LANG][key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = i18n[CURRENT_LANG][key];
      } else {
        el.innerHTML = i18n[CURRENT_LANG][key];
      }
    }
  });
});
