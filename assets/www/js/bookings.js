async function loadBookings() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  const container = document.getElementById('bookings-container');
  try {
    const bookings = await apiFetch('/bookings');
    
    if (bookings.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">📅</div>
          <h3>لا توجد حجوزات</h3>
          <p>لم تقم بإجراء أي حجوزات في الفنادق أو المطاعم بعد.</p>
          <a href="index.html" class="btn btn-primary" style="margin-top:10px;">تصفح الأماكن</a>
        </div>
      `;
      return;
    }

    container.innerHTML = bookings.map((b, i) => `
      <div class="place-card fade-in" style="animation-delay:${i * 0.08}s">
        <div class="place-card-image" style="height: 150px; cursor:pointer;" onclick="window.location.href='/place.html?id=${b.place_id}'">
          <img src="${b.image_url || 'https://via.placeholder.com/400x200?text=Booking'}" alt="Booking Image" loading="lazy">
          <span class="category-tag" style="background:var(--primary);color:white;">
            التاريخ: ${new Date(b.booking_date).toLocaleDateString()} ${b.booking_time ? ' - ' + b.booking_time.substring(0, 5) : ''}
          </span>
        </div>
        <div class="place-card-body">
          <h3 style="cursor:pointer;" onclick="window.location.href='/place.html?id=${b.place_id}'">${tField(b, 'place_name')}</h3>
          <div class="location">👥 الأشخاص: ${b.guests}</div>
          ${b.special_requests ? `<div style="font-size:0.85rem;margin-top:8px;color:var(--text-muted);border-top:1px solid var(--border-light);padding-top:8px;">📝 "${b.special_requests}"</div>` : ''}
          
          <div class="place-card-footer" style="margin-top:15px; border-top:none;">
            <span class="badge" style="background:${b.status === 'pending' ? 'var(--warning)' : (b.status === 'confirmed' ? 'var(--success)' : 'var(--error)')};">
              ${b.status === 'pending' ? '⏳ قيد الانتظار' : (b.status === 'confirmed' ? '✅ مؤكد' : '❌ ملغى')}
            </span>
            <button class="btn btn-ghost" style="color:var(--error);padding:4px 8px;font-size:0.85rem;" onclick="cancelBooking(${b.booking_id})">إلغاء الحجز</button>
          </div>
        </div>
      </div>
    `).join('');

  } catch (e) {
    container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1; color:var(--error);"><div class="empty-icon">⚠️</div><h3>تعذر تحميل الحجوزات</h3><p>${e.message}</p></div>`;
  }
}

async function cancelBooking(id) {
  if (!confirm('هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟')) return;
  try {
    await apiFetch(`/bookings/${id}`, { method: 'DELETE' });
    showToast('تم إلغاء الحجز بنجاح', 'success');
    loadBookings();
  } catch (e) {
    showToast('فشل في إلغاء الحجز', 'error');
  }
}

document.addEventListener('DOMContentLoaded', loadBookings);
