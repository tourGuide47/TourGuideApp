let availablePlaces = [];

async function loadTrips() {
  if (!isLoggedIn()) {
    document.getElementById('trips-container').innerHTML = '<div class="empty-state"><div class="empty-icon">🔒</div><h3>سجل دخولك</h3><p>تحتاج لتسجيل الدخول لعرض رحلاتك</p><a href="login.html" class="btn btn-primary">تسجيل الدخول</a></div>';
    return;
  }
  try {
    const trips = await apiFetch('/trips');
    availablePlaces = await apiFetch('/places');
    renderTrips(trips);
  } catch (e) {
    document.getElementById('trips-container').innerHTML = '<div class="empty-state"><div class="empty-icon">😕</div><h3>خطأ في التحميل</h3></div>';
  }
}

function renderTrips(trips) {
  const c = document.getElementById('trips-container');
  if (trips.length === 0) {
    c.innerHTML = '<div class="empty-state"><div class="empty-icon">🗺️</div><h3>لا توجد رحلات بعد</h3><p>أنشئ رحلتك الأولى واستكشف غرداية</p></div>';
    return;
  }
  const catIcons = { landmark: '🏛️', hotel: '🏨', restaurant: '🍽️', mosque: '🕌', market: '🛍️' };
  c.innerHTML = `<div class="trips-grid">${trips.map(t => `
    <div class="trip-card fade-in">
      <h3>${t.trip_name}</h3>
      <div class="trip-dates">📅 ${t.start_date ? formatDate(t.start_date) + ' - ' + formatDate(t.end_date) : 'بدون تاريخ'}</div>
      ${t.notes ? `<p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:12px;">${t.notes}</p>` : ''}
      <div class="trip-places">${(t.place_details || []).map(p => `
        <a href="place.html?id=${p.place_id}" class="trip-place-tag">${catIcons[p.category] || '📌'} ${p.name_ar || p.name}</a>
      `).join('') || '<span style="color:var(--text-muted);font-size:0.85rem;">لم تُضف أماكن بعد</span>'}</div>
      <div class="trip-actions">
        <button class="btn btn-sm btn-danger" onclick="deleteTrip(${t.trip_id})">🗑️ حذف</button>
      </div>
    </div>
  `).join('')}</div>`;
}

function showNewTripModal() {
  if (!isLoggedIn()) { showToast('سجل دخولك أولاً', 'warning'); return; }
  const checklist = document.getElementById('places-checklist');
  const catNames = { landmark: 'معلم', hotel: 'فندق', restaurant: 'مطعم', mosque: 'مسجد', market: 'سوق' };
  checklist.innerHTML = availablePlaces.map(p => `
    <label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;">
      <input type="checkbox" value="${p.place_id}" style="width:18px;height:18px;accent-color:var(--primary);">
      <span>${p.name_ar || p.name} <small style="color:var(--text-muted);">(${catNames[p.category] || p.category})</small></span>
    </label>
  `).join('');
  document.getElementById('trip-modal').classList.add('active');
}

function closeTripModal() { document.getElementById('trip-modal').classList.remove('active'); }

async function createTrip() {
  const trip_name = document.getElementById('trip-name').value;
  if (!trip_name) { showToast('أدخل اسم الرحلة', 'warning'); return; }
  const places = [...document.querySelectorAll('#places-checklist input:checked')].map(c => parseInt(c.value));
  const start_date = document.getElementById('trip-start').value || null;
  const end_date = document.getElementById('trip-end').value || null;
  const notes = document.getElementById('trip-notes').value;

  try {
    await apiFetch('/trips', { method: 'POST', body: JSON.stringify({ trip_name, places, start_date, end_date, notes }) });
    showToast('تم إنشاء الرحلة بنجاح 🎉', 'success');
    closeTripModal();
    loadTrips();
  } catch (e) { showToast(e.message, 'error'); }
}

async function deleteTrip(id) {
  if (!confirm('هل تريد حذف هذه الرحلة؟')) return;
  try {
    await apiFetch(`/trips/${id}`, { method: 'DELETE' });
    showToast('تم حذف الرحلة', 'info');
    loadTrips();
  } catch (e) { showToast(e.message, 'error'); }
}

document.addEventListener('DOMContentLoaded', loadTrips);
