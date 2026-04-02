let currentPlace = null;
let selectedRating = 0;

async function loadPlaceDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { window.location.href = 'index.html'; return; }

  try {
    currentPlace = await apiFetch(`/places/${id}`);
    const reviews = await apiFetch(`/reviews/place/${id}`);
    document.title = `${tField(currentPlace, 'name')} | TourGuide Ghardaia`;
    renderPlaceDetail(currentPlace, reviews);
  } catch (e) {
    document.getElementById('place-content').innerHTML = '<div class="empty-state"><div class="empty-icon">😕</div><h3>المكان غير موجود</h3><a href="index.html" class="btn btn-primary">العودة للرئيسية</a></div>';
  }
}

function renderPlaceDetail(place, reviews) {
  const catNames = { landmark: 'معلم سياحي', hotel: 'فندق', restaurant: 'مطعم', mosque: 'مسجد', market: 'سوق' };
  const catIcons = { landmark: '🏛️', hotel: '🏨', restaurant: '🍽️', mosque: '🕌', market: '🛍️' };

  document.getElementById('place-content').innerHTML = `
    <div class="place-gallery">
      <img src="${place.image_url?.startsWith('http') ? place.image_url : (API.replace('/api','') + '/' + place.image_url)}" 
           alt="${tField(place, 'name')}"
           onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ghardaia.jpg/1280px-Ghardaia.jpg'">
      <div class="gallery-overlay">
        <span style="font-size:0.85rem;opacity:0.8">${catIcons[place.category] || '📌'} ${t(place.category)}</span>
      </div>
    </div>

    <div class="place-info">
      <div class="place-main">
        <h1>${tField(place, 'name')}</h1>
        <div class="meta-row">
          <div class="meta-item"><span class="stars" style="color:#FFC107">${renderStars(place.avg_rating)}</span> <strong>${place.avg_rating}</strong> (${place.review_count} مراجعة)</div>
          <div class="meta-item">📍 ${place.address || 'غرداية'}</div>
          ${place.price_range ? `<div class="meta-item">💰 ${place.price_range}</div>` : ''}
        </div>

        <div class="action-buttons">
          <button class="btn btn-primary" id="fav-detail-btn" onclick="toggleFavDetail()">♡ إضافة للمفضلة</button>
          <button class="btn btn-secondary" onclick="addToTripModal()">🗺️ إضافة للرحلة</button>
          ${['hotel', 'restaurant'].includes(place.category) ? `<button class="btn btn-primary" onclick="openBookingModal()" style="background:var(--success);border-color:var(--success);">📅 احجز الآن</button>` : ''}
          ${place.latitude ? `<a class="btn btn-ghost" href="https://www.google.com/maps?q=${place.latitude},${place.longitude}" target="_blank">🧭 فتح في خرائط Google</a>` : ''}
        </div>

        <div class="description">${tField(place, 'description') || ''}</div>

        <!-- Reviews -->
        <div class="reviews-section">
          <h2>⭐ المراجعات والتقييمات (${reviews.length})</h2>

          ${isLoggedIn() ? `
          <div class="review-form" id="review-form">
            <h3 style="margin-bottom:12px;">أضف مراجعتك</h3>
            <div class="star-rating-input" id="star-input">
              ${[1,2,3,4,5].map(i => `<span class="star" data-val="${i}" onclick="setRating(${i})">☆</span>`).join('')}
            </div>
            <div class="form-group">
              <textarea class="form-control" id="review-comment" placeholder="اكتب تعليقك هنا..." rows="3"></textarea>
            </div>
            <button class="btn btn-primary btn-sm" onclick="submitReview()">📝 إرسال المراجعة</button>
          </div>` : `<div style="background:var(--surface);padding:20px;border-radius:var(--radius-md);margin-bottom:24px;text-align:center;">
            <p>🔒 <a href="login.html" style="color:var(--primary);font-weight:600;">سجل دخولك</a> لإضافة مراجعة</p>
          </div>`}

          <div id="reviews-list">
            ${reviews.length === 0 ? '<p style="color:var(--text-muted);text-align:center;padding:24px;">لا توجد مراجعات بعد. كن أول من يراجع!</p>' :
              reviews.map(r => `
                <div class="review-card fade-in">
                  <div class="review-header">
                    <div class="avatar">${r.user_name?.charAt(0) || '?'}</div>
                    <div class="reviewer-info">
                      <h4>${r.user_name}</h4>
                      <span class="date">${timeAgo(r.created_at)}</span>
                    </div>
                    <div class="review-stars">${renderStars(r.rating)}</div>
                  </div>
                  <p>${r.comment || ''}</p>
                </div>
              `).join('')}
          </div>
        </div>
      </div>

      <div class="place-sidebar">
        <div class="info-card">
          <h3>📋 معلومات</h3>
          ${place.opening_hours ? `<div class="info-row"><i>🕐</i> ${place.opening_hours}</div>` : ''}
          ${place.phone ? `<div class="info-row"><i>📞</i> ${place.phone}</div>` : ''}
          ${place.address ? `<div class="info-row"><i>📍</i> ${place.address}</div>` : ''}
          ${place.price_range ? `<div class="info-row"><i>💰</i> ${place.price_range}</div>` : ''}
        </div>
        ${place.latitude ? `<div class="info-card"><h3>🗺️ الموقع</h3><div id="detail-map"></div></div>` : ''}
      </div>
    </div>
  `;

  // Init map
  if (place.latitude && place.longitude) {
    setTimeout(() => initDetailMap(place.latitude, place.longitude, place.name_ar || place.name), 200);
  }

  // Check favorite
  checkFavStatus();
}

async function checkFavStatus() {
  if (!isLoggedIn() || !currentPlace) return;
  try {
    const r = await apiFetch(`/favorites/check/${currentPlace.place_id}`);
    const btn = document.getElementById('fav-detail-btn');
    if (btn && r.isFavorite) { btn.innerHTML = '♥ في المفضلة'; btn.classList.add('active'); btn.style.background = 'var(--error)'; btn.style.color = 'white'; btn.style.borderColor = 'var(--error)'; }
  } catch(e) {}
}

async function toggleFavDetail() {
  if (!isLoggedIn()) { showToast('سجل دخولك أولاً', 'warning'); return; }
  const btn = document.getElementById('fav-detail-btn');
  try {
    if (btn.classList.contains('active')) {
      await apiFetch(`/favorites/${currentPlace.place_id}`, { method: 'DELETE' });
      btn.innerHTML = '♡ إضافة للمفضلة'; btn.classList.remove('active'); btn.style = '';
      showToast('تم الإزالة من المفضلة', 'info');
    } else {
      await apiFetch(`/favorites/${currentPlace.place_id}`, { method: 'POST' });
      btn.innerHTML = '♥ في المفضلة'; btn.classList.add('active'); btn.style.background = 'var(--error)'; btn.style.color = 'white';
      showToast('تم الإضافة للمفضلة ❤️', 'success');
    }
  } catch (e) { showToast(e.message, 'error'); }
}

function setRating(val) {
  selectedRating = val;
  document.querySelectorAll('#star-input .star').forEach((s, i) => {
    s.textContent = i < val ? '★' : '☆';
    s.classList.toggle('active', i < val);
  });
}

async function submitReview() {
  if (!selectedRating) { showToast('اختر التقييم أولاً', 'warning'); return; }
  const comment = document.getElementById('review-comment')?.value;
  try {
    await apiFetch('/reviews', { method: 'POST', body: JSON.stringify({ place_id: currentPlace.place_id, rating: selectedRating, comment }) });
    showToast('تم إضافة المراجعة بنجاح ⭐', 'success');
    setTimeout(() => location.reload(), 1000);
  } catch (e) { showToast(e.message, 'error'); }
}

function addToTripModal() {
  if (!isLoggedIn()) { showToast('سجل دخولك أولاً', 'warning'); return; }
  showToast('يمكنك إضافة هذا المكان من صفحة رحلاتي 🗺️', 'info');
  setTimeout(() => window.location.href = 'trips.html', 1500);
}

function openBookingModal() {
  if (!isLoggedIn()) { showToast('سجل دخولك أولاً للحجز', 'warning'); return; }
  
  let modal = document.getElementById('booking-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'booking-modal';
    modal.innerHTML = `
      <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:999;" onclick="document.getElementById('booking-modal').style.display='none'"></div>
      <div class="modal-content fade-in" style="background:var(--bg-card);padding:24px;border-radius:var(--radius-lg);position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1000;box-shadow:var(--shadow-xl);width:90%;max-width:500px;">
        <h2 style="margin-bottom:20px;">📅 حجز في ${currentPlace.name_ar || currentPlace.name}</h2>
        <div class="form-group" style="margin-bottom:15px;">
          <label style="display:block;margin-bottom:8px;font-weight:bold;">التاريخ <span style="color:var(--error);">*</span></label>
          <input type="date" id="booking-date" class="form-control" style="width:100%;padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border);" min="${new Date().toISOString().split('T')[0]}" required>
        </div>
        <div class="form-group" style="margin-bottom:15px;">
          <label style="display:block;margin-bottom:8px;font-weight:bold;">الوقت (اختياري)</label>
          <input type="time" id="booking-time" class="form-control" style="width:100%;padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border);">
        </div>
        <div class="form-group" style="margin-bottom:15px;">
          <label style="display:block;margin-bottom:8px;font-weight:bold;">عدد الأشخاص <span style="color:var(--error);">*</span></label>
          <input type="number" id="booking-guests" class="form-control" value="1" min="1" max="20" style="width:100%;padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border);" required>
        </div>
        <div class="form-group" style="margin-bottom:20px;">
          <label style="display:block;margin-bottom:8px;font-weight:bold;">طلبات خاصة (اختياري)</label>
          <textarea id="booking-requests" class="form-control" rows="3" placeholder="ملاحظات، حساسيات للطعام..." style="width:100%;padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border);resize:none;"></textarea>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button class="btn btn-ghost" onclick="document.getElementById('booking-modal').style.display='none'">إلغاء</button>
          <button class="btn btn-primary" onclick="submitBooking()" style="background:var(--success);border-color:var(--success);">تأكيد الحجز</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    modal.style.display = 'block';
  }
}

async function submitBooking() {
  const date = document.getElementById('booking-date').value;
  const time = document.getElementById('booking-time').value;
  const guests = document.getElementById('booking-guests').value;
  const requests = document.getElementById('booking-requests').value;
  
  if (!date || !guests) { showToast('يرجى تعبئة الحقول المطلوبة (التاريخ وعدد الأشخاص)', 'warning'); return; }
  
  try {
    await apiFetch('/bookings', { 
      method: 'POST', 
      body: JSON.stringify({ place_id: currentPlace.place_id, booking_date: date, booking_time: time, guests: parseInt(guests), special_requests: requests }) 
    });
    
    document.getElementById('booking-modal').style.display = 'none';
    showToast('تم الحجز بنجاح! سيصلك إشعار بالتأكيد. 📅', 'success');
  } catch(e) { showToast(e.message, 'error'); }
}

document.addEventListener('DOMContentLoaded', loadPlaceDetails);
