let allPlaces = [];
let currentCategory = 'all';

async function loadPlaces() {
  try {
    allPlaces = await apiFetch('/places');
    renderCategories();
    renderPlaces(allPlaces);
    updateStats();
  } catch (e) {
    document.getElementById('places-grid').innerHTML = '<div class="empty-state"><div class="empty-icon">😕</div><h3>تعذر تحميل الأماكن</h3><p>تأكد من اتصالك بالإنترنت</p></div>';
  }
}

function updateStats() {
  const el = (id, val) => { const e = document.getElementById(id); if(e) e.textContent = val; };
  el('stat-places', allPlaces.length);
  el('stat-hotels', allPlaces.filter(p => p.category === 'hotel').length);
  el('stat-restaurants', allPlaces.filter(p => p.category === 'restaurant').length);
  el('stat-transport', allPlaces.filter(p => p.category === 'transport').length);
  el('stat-hostels', allPlaces.filter(p => p.category === 'hostel').length);
}

function renderCategories() {
  const container = document.getElementById('categories-filter');
  if (!container) return;
  const cats = ['all', ...new Set(allPlaces.map(p => p.category))];
  container.innerHTML = cats.map(cat => `
    <button class="category-pill ${cat === currentCategory ? 'active' : ''}" onclick="filterCategory('${cat}')">
      ${cat !== 'all' ? (categoryIcons[cat] || '📌') + ' ' : '🌟 '}${t(cat)}
    </button>
  `).join('');
}

function filterCategory(cat) {
  currentCategory = cat;
  renderCategories();
  const filtered = cat === 'all' ? allPlaces : allPlaces.filter(p => p.category === cat);
  renderPlaces(filtered);
}

function searchPlaces() {
  const q = document.getElementById('hero-search-input')?.value?.toLowerCase() || '';
  if (!q) { renderPlaces(allPlaces); return; }
  const filtered = allPlaces.filter(p =>
    p.name?.toLowerCase().includes(q) || p.name_ar?.includes(q) ||
    p.description_ar?.includes(q) || p.category?.includes(q) || p.address?.includes(q)
  );
  renderPlaces(filtered);
  document.getElementById('places-section')?.scrollIntoView({ behavior: 'smooth' });
}

// Enter key search
document.addEventListener('DOMContentLoaded', () => {
  const si = document.getElementById('hero-search-input');
  if (si) si.addEventListener('keydown', e => { if (e.key === 'Enter') searchPlaces(); });
});

function renderPlaces(places) {
  const grid = document.getElementById('places-grid');
  if (!grid) return;

  if (places.length === 0) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><h3>لا توجد نتائج</h3><p>جرب البحث بكلمات أخرى</p></div>';
    return;
  }

  grid.innerHTML = places.map((p, i) => `
    <div class="place-card fade-in" style="animation-delay:${i * 0.08}s" onclick="window.location.href='/place.html?id=${p.place_id}'">
      <div class="place-card-image">
        <img src="${p.image_url?.startsWith('http') ? p.image_url : (API.replace('/api','') + '/' + p.image_url)}" 
             alt="${tField(p, 'name')}" loading="lazy"
             onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ghardaia.jpg/400px-Ghardaia.jpg'">
        <span class="category-tag">${categoryIcons[p.category] || '📌'} ${t(p.category)}</span>
        <button class="fav-btn" onclick="event.stopPropagation();toggleFav(${p.place_id},this)" title="إضافة للمفضلة">♡</button>
      </div>
      <div class="place-card-body">
        <h3>${tField(p, 'name')}</h3>
        <div class="location">📍 ${p.address || 'غرداية، الجزائر'}</div>
        <div class="place-card-footer">
          <div class="rating">
            <span class="stars">${renderStars(p.avg_rating)}</span>
            <span class="score">${p.avg_rating || 0}</span>
            <span class="count">(${p.review_count || 0})</span>
          </div>
          <span class="price-tag">${p.price_range || 'مجاني'}</span>
        </div>
      </div>
    </div>
  `).join('');
}

async function toggleFav(placeId, btn) {
  if (!isLoggedIn()) { showToast('سجل دخولك أولاً', 'warning'); return; }
  try {
    if (btn.classList.contains('active')) {
      await apiFetch(`/favorites/${placeId}`, { method: 'DELETE' });
      btn.classList.remove('active'); btn.textContent = '♡';
      showToast('تم الإزالة من المفضلة', 'info');
    } else {
      await apiFetch(`/favorites/${placeId}`, { method: 'POST' });
      btn.classList.add('active'); btn.textContent = '♥';
      showToast('تم الإضافة للمفضلة ❤️', 'success');
    }
  } catch (e) { showToast(e.message, 'error'); }
}

document.addEventListener('DOMContentLoaded', loadPlaces);
