async function loadFavorites() {
  if (!isLoggedIn()) {
    document.getElementById('favs-container').innerHTML = '<div class="empty-state"><div class="empty-icon">🔒</div><h3>سجل دخولك</h3><p>تحتاج لتسجيل الدخول لعرض المفضلة</p><a href="login.html" class="btn btn-primary">تسجيل الدخول</a></div>';
    return;
  }
  try {
    const favs = await apiFetch('/favorites');
    renderFavorites(favs);
  } catch (e) {
    document.getElementById('favs-container').innerHTML = '<div class="empty-state"><div class="empty-icon">😕</div><h3>خطأ في التحميل</h3></div>';
  }
}

function renderFavorites(favs) {
  const c = document.getElementById('favs-container');
  const catIcons = { landmark: '🏛️', hotel: '🏨', restaurant: '🍽️', mosque: '🕌', market: '🛍️' };
  const catNames = { landmark: 'معلم سياحي', hotel: 'فندق', restaurant: 'مطعم', mosque: 'مسجد', market: 'سوق' };

  if (favs.length === 0) {
    c.innerHTML = '<div class="empty-state"><div class="empty-icon">❤️</div><h3>لا توجد أماكن مفضلة</h3><p>استكشف الأماكن وأضف ما يعجبك للمفضلة</p><a href="index.html" class="btn btn-primary">استكشف الأماكن</a></div>';
    return;
  }

  c.innerHTML = `<div class="favorites-grid">${favs.map((f, i) => `
    <div class="place-card fade-in" style="animation-delay:${i * 0.08}s">
      <div class="place-card-image" onclick="window.location.href='/place.html?id=${f.place_id}'">
        <img src="${f.image_url || 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ghardaia.jpg/400px-Ghardaia.jpg'}" alt="${f.name_ar || f.name}" loading="lazy"
             onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ghardaia.jpg/400px-Ghardaia.jpg'">
        <span class="category-tag">${catIcons[f.category] || '📌'} ${catNames[f.category] || f.category}</span>
        <button class="fav-btn active" onclick="event.stopPropagation();removeFav(${f.place_id})" title="إزالة من المفضلة">♥</button>
      </div>
      <div class="place-card-body" onclick="window.location.href='/place.html?id=${f.place_id}'">
        <h3>${f.name_ar || f.name}</h3>
        <div class="location">📍 ${f.address || 'غرداية'}</div>
        <div class="place-card-footer">
          <div class="rating"><span class="stars">${renderStars(f.avg_rating)}</span><span class="score">${f.avg_rating}</span><span class="count">(${f.review_count})</span></div>
        </div>
      </div>
    </div>
  `).join('')}</div>`;
}

async function removeFav(placeId) {
  try {
    await apiFetch(`/favorites/${placeId}`, { method: 'DELETE' });
    showToast('تم الإزالة من المفضلة', 'info');
    loadFavorites();
  } catch (e) { showToast(e.message, 'error'); }
}

document.addEventListener('DOMContentLoaded', loadFavorites);
