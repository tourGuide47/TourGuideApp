const ADMIN_API = 'http://localhost:3000/api/admin';
let adminToken = localStorage.getItem('adminToken');

function adminHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` };
}

async function adminFetch(endpoint, options = {}) {
  const res = await fetch(`${ADMIN_API}${endpoint}`, { ...options, headers: { ...adminHeaders(), ...options.headers } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'خطأ');
  return data;
}

// Check if logged in
if (adminToken) { showDashboard(); }

async function adminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-pass').value;
  try {
    const data = await fetch(`${ADMIN_API}/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(r => r.json());
    if (data.token) {
      adminToken = data.token;
      localStorage.setItem('adminToken', adminToken);
      localStorage.setItem('adminInfo', JSON.stringify(data.admin));
      showDashboard();
    } else { document.getElementById('admin-error').textContent = data.error || 'خطأ'; document.getElementById('admin-error').style.display = 'block'; }
  } catch (e) { document.getElementById('admin-error').textContent = 'خطأ في الاتصال'; document.getElementById('admin-error').style.display = 'block'; }
}

function showDashboard() {
  document.getElementById('admin-login-page').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'grid';
  const info = JSON.parse(localStorage.getItem('adminInfo') || '{}');
  document.getElementById('admin-name').textContent = `مرحباً، ${info.name || 'Admin'}`;
  showTab('stats');
}

function adminLogout() {
  localStorage.removeItem('adminToken'); localStorage.removeItem('adminInfo');
  adminToken = null;
  document.getElementById('admin-login-page').style.display = '';
  document.getElementById('admin-dashboard').style.display = 'none';
}

let currentTab = 'stats';
function showTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.sidebar-item').forEach((el, i) => {
    const tabs = ['stats','places','users','reviews','notifs','logs'];
    el.classList.toggle('active', tabs[i] === tab);
  });
  const c = document.getElementById('admin-content');
  c.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
  if (tab === 'stats') loadStats();
  else if (tab === 'places') loadAdminPlaces();
  else if (tab === 'users') loadAdminUsers();
  else if (tab === 'reviews') loadAdminReviews();
  else if (tab === 'notifs') loadAdminNotifs();
  else if (tab === 'logs') loadAdminLogs();
}

async function loadStats() {
  try {
    const s = await adminFetch('/stats');
    const c = document.getElementById('admin-content');
    c.innerHTML = `
      <h2 style="margin-bottom:24px;">📊 لوحة الإحصائيات</h2>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon places">📍</div><div class="stat-number">${s.places}</div><div class="stat-label">مكان</div></div>
        <div class="stat-card"><div class="stat-icon users">👥</div><div class="stat-number">${s.users}</div><div class="stat-label">مستخدم</div></div>
        <div class="stat-card"><div class="stat-icon reviews">⭐</div><div class="stat-number">${s.reviews}</div><div class="stat-label">مراجعة</div></div>
        <div class="stat-card"><div class="stat-icon trips">🗺️</div><div class="stat-number">${s.trips}</div><div class="stat-label">رحلة</div></div>
      </div>
      <div class="admin-table-card" style="margin-top:24px;">
        <div class="table-header"><h3>📂 توزيع الأماكن حسب الفئة</h3></div>
        <table class="admin-table"><thead><tr><th>الفئة</th><th>العدد</th></tr></thead>
        <tbody>${(s.categories || []).map(c => `<tr><td>${typeof t === 'function' ? t(c.category) : c.category}</td><td>${c.count}</td></tr>`).join('')}</tbody></table>
      </div>`;
  } catch (e) { document.getElementById('admin-content').innerHTML = `<p style="color:var(--error)">خطأ: ${e.message}</p>`; }
}

async function loadAdminPlaces() {
  try {
    const places = await apiFetch('/places');
    const catNames = { landmark: 'معلم', hotel: 'فندق', restaurant: 'مطعم', mosque: 'مسجد', market: 'سوق' };
    const c = document.getElementById('admin-content');
    c.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
        <h2>📍 إدارة الأماكن (${places.length})</h2>
        <button class="btn btn-primary" onclick="openAddPlace()">➕ إضافة مكان</button>
      </div>
      <div class="admin-table-card">
        <table class="admin-table"><thead><tr><th>الاسم</th><th>الفئة</th><th>التقييم</th><th>الإجراءات</th></tr></thead>
        <tbody>${places.map(p => `<tr>
          <td><strong>${p.name_ar || p.name}</strong><br><small style="color:var(--text-muted)">${p.address || ''}</small></td>
          <td>${catNames[p.category] || p.category}</td>
          <td>${renderStars(p.avg_rating)} (${p.review_count})</td>
          <td><button class="btn btn-sm btn-secondary" onclick='editPlace(${JSON.stringify(p).replace(/'/g,"&#39;")})'>✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deletePlace(${p.place_id})">🗑️</button></td>
        </tr>`).join('')}</tbody></table>
      </div>`;
  } catch (e) { document.getElementById('admin-content').innerHTML = `<p style="color:var(--error)">خطأ: ${e.message}</p>`; }
}

function openAddPlace() {
  document.getElementById('place-modal-title').textContent = 'إضافة مكان جديد';
  document.getElementById('edit-place-id').value = '';
  ['p-name','p-name-ar','p-desc-ar','p-lat','p-lng','p-address','p-phone','p-image','p-price','p-hours'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('place-modal').classList.add('active');
}

function editPlace(p) {
  document.getElementById('place-modal-title').textContent = 'تعديل المكان';
  document.getElementById('edit-place-id').value = p.place_id;
  document.getElementById('p-name').value = p.name || '';
  document.getElementById('p-name-ar').value = p.name_ar || '';
  document.getElementById('p-category').value = p.category || 'landmark';
  document.getElementById('p-desc-ar').value = p.description_ar || '';
  document.getElementById('p-lat').value = p.latitude || '';
  document.getElementById('p-lng').value = p.longitude || '';
  document.getElementById('p-address').value = p.address || '';
  document.getElementById('p-phone').value = p.phone || '';
  document.getElementById('p-image').value = p.image_url || '';
  document.getElementById('p-price').value = p.price_range || '';
  document.getElementById('p-hours').value = p.opening_hours || '';
  document.getElementById('place-modal').classList.add('active');
}

function closePlaceModal() { document.getElementById('place-modal').classList.remove('active'); }

async function savePlace() {
  const id = document.getElementById('edit-place-id').value;
  const body = {
    name: document.getElementById('p-name').value,
    name_ar: document.getElementById('p-name-ar').value,
    category: document.getElementById('p-category').value,
    description_ar: document.getElementById('p-desc-ar').value,
    latitude: parseFloat(document.getElementById('p-lat').value) || null,
    longitude: parseFloat(document.getElementById('p-lng').value) || null,
    address: document.getElementById('p-address').value,
    phone: document.getElementById('p-phone').value,
    image_url: document.getElementById('p-image').value,
    price_range: document.getElementById('p-price').value,
    opening_hours: document.getElementById('p-hours').value
  };
  if (!body.name) { showToast('الاسم مطلوب', 'warning'); return; }
  try {
    if (id) {
      await fetch(`http://localhost:3000/api/places/${id}`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify(body) });
      showToast('تم تعديل المكان ✅', 'success');
    } else {
      await fetch('http://localhost:3000/api/places', { method: 'POST', headers: adminHeaders(), body: JSON.stringify(body) });
      showToast('تم إضافة المكان ✅', 'success');
    }
    closePlaceModal(); loadAdminPlaces();
  } catch (e) { showToast(e.message, 'error'); }
}

async function deletePlace(id) {
  if (!confirm('هل أنت متأكد من حذف هذا المكان؟')) return;
  try {
    await fetch(`http://localhost:3000/api/places/${id}`, { method: 'DELETE', headers: adminHeaders() });
    showToast('تم حذف المكان', 'info'); loadAdminPlaces();
  } catch (e) { showToast(e.message, 'error'); }
}

async function loadAdminUsers() {
  try {
    const users = await adminFetch('/users');
    document.getElementById('admin-content').innerHTML = `
      <h2 style="margin-bottom:24px;">👥 المستخدمين (${users.length})</h2>
      <div class="admin-table-card"><table class="admin-table"><thead><tr><th>الاسم</th><th>البريد</th><th>تاريخ التسجيل</th><th>إجراء</th></tr></thead>
      <tbody>${users.map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td>${formatDate(u.created_at)}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteUser(${u.user_id})">🗑️</button></td></tr>`).join('')}</tbody></table></div>`;
  } catch (e) { document.getElementById('admin-content').innerHTML = `<p style="color:var(--error)">خطأ: ${e.message}</p>`; }
}

async function deleteUser(id) {
  if (!confirm('هل تريد حذف هذا المستخدم؟')) return;
  try { await adminFetch(`/users/${id}`, { method: 'DELETE' }); showToast('تم حذف المستخدم', 'info'); loadAdminUsers(); }
  catch (e) { showToast(e.message, 'error'); }
}

async function loadAdminReviews() {
  try {
    const reviews = await adminFetch('/reviews');
    document.getElementById('admin-content').innerHTML = `
      <h2 style="margin-bottom:24px;">⭐ المراجعات (${reviews.length})</h2>
      <div class="admin-table-card"><table class="admin-table"><thead><tr><th>المستخدم</th><th>المكان</th><th>التقييم</th><th>التعليق</th><th>إجراء</th></tr></thead>
      <tbody>${reviews.map(r => `<tr><td>${r.user_name}</td><td>${r.place_name}</td><td>${renderStars(r.rating)}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.comment || '-'}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteReview(${r.review_id})">🗑️</button></td></tr>`).join('')}</tbody></table></div>`;
  } catch (e) { document.getElementById('admin-content').innerHTML = `<p style="color:var(--error)">خطأ: ${e.message}</p>`; }
}

async function deleteReview(id) {
  if (!confirm('حذف هذه المراجعة؟')) return;
  try { await adminFetch(`/reviews/${id}`, { method: 'DELETE' }); showToast('تم الحذف', 'info'); loadAdminReviews(); }
  catch (e) { showToast(e.message, 'error'); }
}

async function loadAdminNotifs() {
  document.getElementById('admin-content').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
      <h2>🔔 إدارة الإشعارات</h2>
      <button class="btn btn-primary" onclick="document.getElementById('notif-modal').classList.add('active')">📢 إرسال إشعار جديد</button>
    </div>
    <div class="admin-table-card"><div style="padding:40px;text-align:center;color:var(--text-muted);">
      <p>استخدم الزر أعلاه لإرسال إشعارات لجميع المستخدمين</p>
    </div></div>`;
}

async function sendNotification() {
  const title = document.getElementById('n-title').value;
  const message_text = document.getElementById('n-message').value;
  if (!title || !message_text) { showToast('العنوان والرسالة مطلوبان', 'warning'); return; }
  try {
    await adminFetch('/notifications', { method: 'POST', body: JSON.stringify({ title, message_text }) });
    showToast('تم إرسال الإشعار 📢', 'success');
    document.getElementById('notif-modal').classList.remove('active');
    document.getElementById('n-title').value = '';
    document.getElementById('n-message').value = '';
  } catch (e) { showToast(e.message, 'error'); }
}

async function loadAdminLogs() {
  try {
    const logs = await adminFetch('/activities');
    const actionNames = { add: 'إضافة', edit: 'تعديل', delete: 'حذف' };
    document.getElementById('admin-content').innerHTML = `
      <h2 style="margin-bottom:24px;">📋 سجل النشاطات</h2>
      <div class="admin-table-card"><table class="admin-table"><thead><tr><th>المسؤول</th><th>الإجراء</th><th>الجدول</th><th>التفاصيل</th><th>التاريخ</th></tr></thead>
      <tbody>${logs.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px;">لا توجد نشاطات بعد</td></tr>' :
      logs.map(l => `<tr><td>${l.admin_name}</td><td><span style="padding:3px 10px;border-radius:20px;font-size:0.8rem;background:${l.action_type==='add'?'rgba(76,175,80,0.1);color:#4CAF50':l.action_type==='delete'?'rgba(244,67,54,0.1);color:#F44336':'rgba(255,152,0,0.1);color:#FF9800'}">${actionNames[l.action_type] || l.action_type}</span></td>
      <td>${l.target_table}</td><td>${l.details || '-'}</td><td>${timeAgo(l.created_at)}</td></tr>`).join('')}</tbody></table></div>`;
  } catch (e) { document.getElementById('admin-content').innerHTML = `<p style="color:var(--error)">خطأ: ${e.message}</p>`; }
}
