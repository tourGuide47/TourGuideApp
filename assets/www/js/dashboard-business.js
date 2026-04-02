async function initBusinessDashboard() {
  try {
    const data = await apiFetch('/owner/my-business');
    document.getElementById('business-name-title').textContent = tField(data.business, 'name');
    document.getElementById('business-name-short').textContent = tField(data.business, 'name').substring(0, 10) + '...';
    document.getElementById('business-address').textContent = data.business.address || 'غرداية، الجزائر';
    document.getElementById('business-type-icon').textContent = data.business.category === 'hotel' ? '🏨' : '🍽️';
    
    if (data.business.category === 'restaurant') {
      document.getElementById('nav-menu').style.display = 'block';
    }

    // Show owner name in form automatically
    const user = getUser();
    const ownerInfo = document.getElementById('form-owner-info');
    if (ownerInfo && user) {
      ownerInfo.textContent = '👤 المالك: ' + user.name;
    }

    updateStats(data.stats);
    fillInfoForm(data.business);
    loadReviews();
    loadOwnerItems();
    if (data.business.category === 'restaurant') loadMenu();
    
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function updateStats(s) {
  document.getElementById('stat-views').textContent = s.views || 0;
  document.getElementById('stat-reviews').textContent = s.reviews || 0;
  document.getElementById('stat-rating').textContent = s.avg_rating ? s.avg_rating.toFixed(1) : '0.0';
  document.getElementById('stat-bookings').textContent = s.bookings || 0;
}

function fillInfoForm(b) {
  const form = document.getElementById('form-business-info');
  form.name_ar.value = b.name_ar || '';
  form.name.value = b.name || '';
  form.description_ar.value = b.description_ar || '';
  form.phone.value = b.phone || '';
  form.website.value = b.website || '';
  form.opening_hours.value = b.opening_hours || '';
}

async function updateBusinessInfo(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  try {
    await apiFetch('/owner/my-business', { method: 'PUT', body: JSON.stringify(data) });
    showToast('تم تحديث البيانات بنجاح', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

// ========== Items Management (إدارة العناصر) ==========

async function addNewItem(e) {
  e.preventDefault();
  const form = e.target;
  const itemData = {
    name: form.item_name.value.trim(),
    price: form.item_price.value.trim(),
    type: form.item_type.value.trim(),
    description: form.item_description.value.trim(),
    image_url: form.item_image.value.trim()
  };

  try {
    await apiFetch('/owner/menu', { method: 'POST', body: JSON.stringify(itemData) });
    showToast('✅ تمت إضافة العنصر بنجاح!', 'success');
    // Reset Form after save
    form.reset();
    // Reload items list
    loadOwnerItems();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadOwnerItems() {
  try {
    // Filter = Owner is Current User (backend already filters by authenticated user's place_id)
    const items = await apiFetch('/owner/menu');
    const container = document.getElementById('owner-items-list');
    const countEl = document.getElementById('items-count');

    if (countEl) countEl.textContent = '(' + items.length + ')';

    if (!items.length) {
      container.innerHTML = '<div class="empty-state"><span class="empty-icon">📭</span><p>لا توجد عناصر حالياً. أضف أول عنصر باستخدام النموذج أعلاه.</p></div>';
      return;
    }

    container.innerHTML = items.map(function(item) {
      return '<div class="item-card" id="item-' + item.item_id + '">' +
        '<img class="item-img" src="' + (item.image_url || 'https://via.placeholder.com/80x80?text=📷') + '" alt="' + item.name + '" onerror="this.src=\'https://via.placeholder.com/80x80?text=📷\'">' +
        '<div class="item-info">' +
          '<div class="item-name">' + item.name + '</div>' +
          (item.type ? '<span class="item-type">' + item.type + '</span>' : '') +
          '<div class="item-price">' + item.price + '</div>' +
          (item.description ? '<div style="font-size:0.85rem; color:#64748b; margin-top:0.25rem;">' + item.description + '</div>' : '') +
        '</div>' +
        '<button class="btn-delete" onclick="deleteItem(' + item.item_id + ')">🗑️ حذف</button>' +
      '</div>';
    }).join('');
  } catch (err) {
    showToast('خطأ في تحميل العناصر: ' + err.message, 'error');
  }
}

async function deleteItem(itemId) {
  if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;
  try {
    await apiFetch('/owner/menu/' + itemId, { method: 'DELETE' });
    showToast('🗑️ تم حذف العنصر', 'success');
    // Animate removal
    var card = document.getElementById('item-' + itemId);
    if (card) {
      card.style.transition = 'all 0.4s ease';
      card.style.opacity = '0';
      card.style.transform = 'translateX(30px)';
      setTimeout(function() {
        loadOwnerItems();
      }, 400);
    } else {
      loadOwnerItems();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ========== Reviews ==========

async function loadReviews() {
  const reviews = await apiFetch('/owner/reviews');
  const container = document.getElementById('all-reviews-list');
  const recent = document.getElementById('recent-reviews-list');
  
  const html = reviews.map(function(r) {
    return '<div class="review-item">' +
      '<div style="display: flex; justify-content: space-between;">' +
        '<strong>' + r.user_name + '</strong>' +
        '<span style="color:var(--primary); font-weight:700;">' + r.rating + ' ★</span>' +
      '</div>' +
      '<p style="margin: 0.5rem 0; font-size: 0.95rem;">' + r.comment + '</p>' +
      '<div id="reply-to-' + r.review_id + '">' +
        (r.reply_text ?
          '<div class="reply-box"><div style="font-size: 0.8rem; font-weight: 600; margin-bottom: 0.25rem;">ردك:</div><div>' + r.reply_text + '</div></div>'
        :
          '<div style="margin-top: 0.5rem;"><textarea id="reply-text-' + r.review_id + '" placeholder="اكتب ردك هنا..." style="width: 100%; border:1px solid #ddd; padding:0.5rem; height: 60px; border-radius:0.5rem;"></textarea><button class="btn-sm" style="background:var(--primary); color:white; margin-top:0.5rem;" onclick="replyToReview(' + r.review_id + ')">إرسال الرد</button></div>'
        ) +
      '</div>' +
    '</div>';
  }).join('');
  
  container.innerHTML = html || '<p>لا توجد مراجعات حالياً</p>';
  recent.innerHTML = reviews.slice(0, 3).map(function(r) {
    return '<div class="review-item" style="padding:0.5rem; font-size:0.8rem;"><strong>' + r.user_name + '</strong>: ' + r.comment.substring(0, 50) + '...</div>';
  }).join('') || '<p>لا توجد مراجعات</p>';
}

async function replyToReview(id) {
  const text = document.getElementById('reply-text-' + id).value;
  if (!text) return showToast('الرجاء كتابة رد', 'warning');
  try {
    await apiFetch('/owner/reviews/' + id + '/reply', { method: 'POST', body: JSON.stringify({ reply_text: text }) });
    showToast('تم الرد بنجاح', 'success');
    loadReviews();
  } catch (err) { showToast(err.message, 'error'); }
}

// ========== Menu (Old Section) ==========

async function loadMenu() {
  const items = await apiFetch('/owner/menu');
  const grid = document.getElementById('menu-items-grid');
  grid.innerHTML = items.map(function(item) {
    return '<div class="menu-card">' +
      '<img src="' + (item.image_url || 'https://via.placeholder.com/60') + '" style="width:60px; height:60px; border-radius:10px; object-fit:cover;">' +
      '<div>' +
        '<div style="font-weight:600;">' + item.name + '</div>' +
        (item.type ? '<div style="font-size:0.75rem; color:#64748b;">' + item.type + '</div>' : '') +
        '<div style="color:var(--primary); font-size:0.8rem; font-weight:bold;">' + item.price + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

// ========== Navigation ==========

function showSection(id) {
  document.querySelectorAll('.dashboard-section').forEach(function(s) { s.classList.remove('active'); });
  document.querySelectorAll('.nav-link').forEach(function(l) { l.classList.remove('active'); });
  document.getElementById('section-' + id).classList.add('active');
  event.currentTarget.classList.add('active');
}

document.addEventListener('DOMContentLoaded', initBusinessDashboard);
