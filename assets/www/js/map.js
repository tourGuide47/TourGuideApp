let map = null;

function initMap(places) {
  const container = document.getElementById('map-container');
  if (!container || map) return;

  map = L.map('map-container').setView([32.49, 3.67], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  if (places && places.length > 0) {
    const bounds = [];
    places.forEach(place => {
      if (!place.latitude || !place.longitude) return;
      const icon = L.divIcon({
        html: `<div style="background:linear-gradient(135deg,#2E7D32,#4CAF50);width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">${categoryIcons[place.category] || '📌'}</div>`,
        className: '', iconSize: [32, 32], iconAnchor: [16, 16]
      });
      const marker = L.marker([place.latitude, place.longitude], { icon }).addTo(map);
      marker.bindPopup(`
        <div class="map-popup">
          <h4>${place.name_ar || place.name}</h4>
          <p>${typeof t === 'function' ? t(place.category) : place.category}</p>
          <a href="place.html?id=${place.place_id}">عرض التفاصيل →</a>
        </div>
      `);
      bounds.push([place.latitude, place.longitude]);
    });
    if (bounds.length > 1) map.fitBounds(bounds, { padding: [30, 30] });
  }
}

function initDetailMap(lat, lng, name) {
  const container = document.getElementById('detail-map');
  if (!container) return;

  const detailMap = L.map('detail-map').setView([lat, lng], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(detailMap);

  const icon = L.divIcon({
    html: `<div style="background:linear-gradient(135deg,#2E7D32,#4CAF50);width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:3px solid white;">📍</div>`,
    className: '', iconSize: [36, 36], iconAnchor: [18, 18]
  });
  L.marker([lat, lng], { icon }).addTo(detailMap).bindPopup(name).openPopup();
}

// Wait for places to load then init map
document.addEventListener('DOMContentLoaded', () => {
  const checkPlaces = setInterval(() => {
    if (typeof allPlaces !== 'undefined' && allPlaces.length > 0) {
      clearInterval(checkPlaces);
      initMap(allPlaces);
    }
  }, 500);
  setTimeout(() => clearInterval(checkPlaces), 10000);
});
