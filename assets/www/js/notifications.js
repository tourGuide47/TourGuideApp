async function loadNotifications() {
  if (!isLoggedIn()) {
    document.getElementById('notif-container').innerHTML = '<div class="empty-state"><div class="empty-icon">🔒</div><h3>سجل دخولك</h3><p>تحتاج لتسجيل الدخول لعرض الإشعارات</p><a href="login.html" class="btn btn-primary">تسجيل الدخول</a></div>';
    return;
  }
  try {
    const data = await apiFetch('/notifications');
    renderNotifications(data.notifications, data.unread_count);
  } catch (e) {
    document.getElementById('notif-container').innerHTML = '<div class="empty-state"><div class="empty-icon">😕</div><h3>خطأ في التحميل</h3></div>';
  }
}

function renderNotifications(items, unread) {
  const c = document.getElementById('notif-container');
  const title = document.getElementById('notif-title');
  if (title) title.textContent = `الإشعارات (${unread} غير مقروء)`;

  if (items.length === 0) {
    c.innerHTML = '<div class="empty-state"><div class="empty-icon">🔔</div><h3>لا توجد إشعارات</h3><p>سنخبرك بأحدث العروض والأخبار</p></div>';
    return;
  }

  const icons = { system: '📢', place: '📍', trip: '🗺️' };
  c.innerHTML = items.map(n => `
    <div class="notification-item ${n.is_read ? '' : 'unread'}" onclick="markRead(${n.message_id}, this)">
      <div class="notification-icon">${icons[n.reference_type] || '🔔'}</div>
      <div class="notification-body">
        <h4>${n.title || 'إشعار'}</h4>
        <p>${n.message_text}</p>
        <span class="time">${timeAgo(n.created_at)}</span>
      </div>
    </div>
  `).join('');
}

async function markRead(id, el) {
  try {
    await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
    el.classList.remove('unread');
    loadNotifCount();
  } catch (e) {}
}

async function markAllRead() {
  if (!isLoggedIn()) return;
  try {
    await apiFetch('/notifications/read-all', { method: 'PUT' });
    showToast('تم تحديد الكل كمقروء ✓', 'success');
    loadNotifications();
    loadNotifCount();
  } catch (e) { showToast(e.message, 'error'); }
}

document.addEventListener('DOMContentLoaded', loadNotifications);
