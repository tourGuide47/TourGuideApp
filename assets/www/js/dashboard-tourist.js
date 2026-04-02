async function initTouristDashboard() {
  try {
    const user = await apiFetch('/auth/profile');
    loadTrips();
    loadFavorites();
    loadBookings();
    loadReviews();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadTrips() {
  const trips = await apiFetch('/trips');
  document.getElementById('stat-trips').textContent = trips.length;
  const grid = document.getElementById('trips-grid');
  grid.innerHTML = trips.map(t => `
    <div class="info-card" style="text-align: right; padding: 1.5rem;">
      <h3 style="margin-bottom: 0.5rem; color: var(--primary);">${t.trip_name}</h3>
      <p style="font-size: 0.85rem; color: #64748b;">📅 ${t.start_date || 'غير محدد'} - ${t.end_date || ''}</p>
      <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
        <button class="btn-sm" style="background:#e2e8f0; flex: 1;" onclick="viewTrip(${t.trip_id})">عرض التفاصيل</button>
      </div>
    </div>
  `).join('');
}

async function loadFavorites() {
  const favs = await apiFetch('/favorites');
  document.getElementById('stat-favs').textContent = favs.length;
  const grid = document.getElementById('favorites-grid');
  grid.innerHTML = favs.map(f => `
    <div class="info-card" style="text-align: right; padding: 1rem;">
      <img src="${f.image_url}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 0.75rem; margin-bottom: 0.5rem;">
      <h4 style="font-size: 0.95rem;">${tField(f, 'name')}</h4>
      <p style="font-size: 0.8rem; color: #64748b;">📍 ${f.address || ''}</p>
      <button class="btn-sm" style="background:#fee2e2; color: #ef4444; width:100%; margin-top:0.5rem;" onclick="removeFav(${f.place_id})">إزالة</button>
    </div>
  `).join('');
}

async function loadBookings() {
  const bookings = await apiFetch('/bookings');
  document.getElementById('stat-bookings').textContent = bookings.length;
  const grid = document.getElementById('bookings-grid');
  grid.innerHTML = bookings.map(b => `
    <div class="info-card" style="text-align: right; padding: 1.5rem; border-right: 4px solid var(--primary);">
      <div style="font-weight: 700; font-size: 1.1rem; color: #1e293b;">${tField(b, 'place_name')}</div>
      <div style="margin: 0.5rem 0; font-size: 0.9rem; color: #64748b;">📅 ${new Date(b.booking_date).toLocaleDateString('ar-DZ')} في ${b.booking_time}</div>
      <div style="font-size: 0.85rem; color: #16a34a; font-weight: 600;">الحالة: ${b.status === 'pending' ? 'بانتظار التأكيد' : 'مؤكد'}</div>
      <button class="btn-sm" style="background:#f1f5f9; color: #ef4444; width:100%; margin-top:1rem;" onclick="cancelBooking(${b.booking_id})">إلغاء الحجز</button>
    </div>
  `).join('');
}

async function loadReviews() {
  const reviews = await apiFetch('/reviews/my-reviews');
  document.getElementById('stat-reviews').textContent = reviews.length;
  const list = document.getElementById('reviews-list');
  list.innerHTML = reviews.map(r => `
    <div class="review-mini-card">
      <div class="review-meta">
        <strong style="color:var(--primary);">${r.place_name}</strong>
        <span style="font-weight:700;">${r.rating} ★</span>
      </div>
      <p style="font-size: 0.95rem; color: #1e293b; line-height: 1.5;">${r.comment}</p>
      ${r.reply_text ? `
        <div style="margin-top: 1rem; padding: 0.75rem; background: #f8fafc; border-radius: 0.5rem; border-right: 3px solid #10b981;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
            <span style="font-size: 0.8rem; font-weight: 700; color: #065f46;">رد صاحب المنشأة:</span>
            <span class="reply-badge">مبارك</span>
          </div>
          <p style="font-size: 0.9rem; color: #047857;">${r.reply_text}</p>
        </div>
      ` : ''}
    </div>
  `).join('');
}

async function cancelBooking(id) {
  if (!confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) return;
  try {
    await apiFetch(`/bookings/${id}`, { method: 'DELETE' });
    showToast('تم إلغاء الحجز بنجاح', 'success');
    loadBookings();
  } catch (err) { showToast(err.message, 'error'); }
}

async function removeFav(id) {
  try {
    await apiFetch(`/favorites/${id}`, { method: 'DELETE' });
    showToast('تمت الإزالة من المفضلة', 'success');
    loadFavorites();
  } catch (err) { showToast(err.message, 'error'); }
}

function switchTab(id) {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${id}`).classList.add('active');
  event.currentTarget.classList.add('active');
}

document.addEventListener('DOMContentLoaded', initTouristDashboard);
