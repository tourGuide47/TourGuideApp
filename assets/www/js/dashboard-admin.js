async function initAdminDashboard() {
  try {
    const stats = await apiFetch('/admin/stats');
    updateStatsGrid(stats);
    loadActivities();
    loadUsers();
    loadPlaces();
    loadReviews();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function updateStatsGrid(s) {
  document.getElementById('stat-total-users').textContent = s.users;
  document.getElementById('stat-total-places').textContent = s.places;
  document.getElementById('stat-total-hotels').textContent = s.hotels;
  document.getElementById('stat-total-restaurants').textContent = s.restaurants;
  document.getElementById('stat-total-reviews').textContent = s.reviews;
  document.getElementById('stat-total-views').textContent = s.views;
}

async function loadActivities() {
  const activities = await apiFetch('/admin/activities');
  const tbody = document.querySelector('#table-activities tbody');
  tbody.innerHTML = activities.map(a => `
    <tr>
      <td><span class="role-badge badge-admin">${a.action_type}</span></td>
      <td>${a.target_table} (${a.target_id || ''})</td>
      <td>${a.details || ''}</td>
      <td style="font-size: 0.8rem; color: #64748b;">${new Date(a.created_at).toLocaleString('ar-DZ')}</td>
    </tr>
  `).join('');
}

async function loadUsers() {
  const users = await apiFetch('/admin/users');
  const tbody = document.querySelector('#table-users tbody');
  tbody.innerHTML = users.map(u => `
    <tr>
      <td style="font-weight: 500;">${u.name}</td>
      <td style="color: #64748b;">${u.email}</td>
      <td><span class="role-badge badge-${u.role === 'admin' ? 'admin' : (u.role.includes('owner') ? 'owner' : 'tourist')}">${u.role}</span></td>
      <td style="font-size: 0.85rem;">${new Date(u.created_at).toLocaleDateString('ar-DZ')}</td>
      <td>
        <button class="btn-sm btn-danger" onclick="deleteUser(${u.user_id})">حذف</button>
      </td>
    </tr>
  `).join('');
}

async function loadPlaces() {
  const places = await apiFetch('/places');
  const tbody = document.querySelector('#table-places tbody');
  tbody.innerHTML = places.map(p => `
    <tr>
      <td style="font-weight:500;">${p.name_ar || p.name}</td>
      <td><span class="role-badge badge-tourist">${p.category}</span></td>
      <td style="font-size:0.85rem;">${p.address || ''}</td>
      <td style="font-weight:600;color:var(--primary);">${p.views || 0}</td>
      <td>
        <button class="btn-sm" style="background:#e2e8f0;" onclick="editPlace(${p.place_id})">تعديل</button>
        <button class="btn-sm btn-danger" onclick="deletePlace(${p.place_id})">حذف</button>
      </td>
    </tr>
  `).join('');
}

async function loadReviews() {
  const reviews = await apiFetch('/admin/reviews');
  const tbody = document.querySelector('#table-reviews tbody');
  tbody.innerHTML = reviews.map(r => `
    <tr>
      <td style="font-weight:500;">${r.user_name}</td>
      <td>${r.place_name}</td>
      <td><span style="color:var(--primary); font-weight:700;">${r.rating} ★</span></td>
      <td style="max-width: 200px; font-size: 0.85rem;" title="${r.comment}">${r.comment}</td>
      <td>
        <button class="btn-sm btn-danger" onclick="deleteReview(${r.review_id})">حذف</button>
      </td>
    </tr>
  `).join('');
}

async function deleteUser(id) {
  if (!confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) return;
  try {
    await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
    showToast('تم حذف المستخدم بنجاح', 'success');
    loadUsers();
  } catch (err) { showToast(err.message, 'error'); }
}

async function deletePlace(id) {
  if (!confirm('هل أنت متأكد من حذف هذا المكان؟')) return;
  try {
    await apiFetch(`/places/${id}`, { method: 'DELETE' });
    showToast('تم حذف المكان بنجاح', 'success');
    loadPlaces();
  } catch (err) { showToast(err.message, 'error'); }
}

async function deleteReview(id) {
  if (!confirm('هل أنت متأكد من حذف هذه المراجعة؟')) return;
  try {
    await apiFetch(`/admin/reviews/${id}`, { method: 'DELETE' });
    showToast('تم حذف المراجعة بنجاح', 'success');
    loadReviews();
  } catch (err) { showToast(err.message, 'error'); }
}

async function sendGlobalNotif() {
  const title = document.getElementById('notif-title').value;
  const message_text = document.getElementById('notif-text').value;
  if (!title || !message_text) return showToast('الرجاء تعبئة العنوان والمحتوى', 'warning');
  try {
    await apiFetch('/admin/notifications', { method: 'POST', body: JSON.stringify({ title, message_text }) });
    showToast('تم إرسال الإشعار لجميع المستخدمين', 'success');
    document.getElementById('notif-title').value = '';
    document.getElementById('notif-text').value = '';
  } catch (err) { showToast(err.message, 'error'); }
}

function showSection(id) {
  document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById(`section-${id}`).classList.add('active');
  event.currentTarget.classList.add('active');
}

document.addEventListener('DOMContentLoaded', initAdminDashboard);
