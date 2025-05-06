let plasmaData = [];
let centerMarkers = [];

// === Initialize Leaflet map ===
const map = L.map('map').setView([38.89511, -77.03637], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// === Ask for Geolocation Permission ===
setTimeout(() => {
  if (confirm("🔍 PlasWave would like to access your location to show nearby plasma centers. Allow?")) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const userLat = pos.coords.latitude;
          const userLon = pos.coords.longitude;

          map.setView([userLat, userLon], 12);

          L.circleMarker([userLat, userLon], {
            radius: 6,
            fillColor: "#f4f4f4",
            color: "#0e2e1e",
            weight: 2,
            fillOpacity: 0.9
          }).addTo(map).bindPopup("📍 You are here");
        },
        err => console.warn("Geolocation failed:", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    }
  }
}, 500);

// === Optional IP fallback (commented out to avoid 403 error unless token provided) ===
// fetch("https://ipinfo.io/json?token=YOUR_TOKEN_HERE")
//   .then(res => res.json())
//   .then(location => {
//     const [lat, lon] = location.loc.split(',');
//     map.setView([parseFloat(lat), parseFloat(lon)], 11);
//   })
//   .catch(() => {
//     console.warn("IP geolocation failed, using DC default.");
//   });

// === Custom Pin ===
const customGreenPin = L.icon({
  iconUrl: 'assets/phthalo-pin-glow.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -40],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// === Load Center Data ===
fetch("dmv_plasma_centers.json")
  .then(response => response.json())
  .then(data => {
    plasmaData = data;
    renderCenters(plasmaData);
  })
  .catch(err => {
    console.error("Failed to load plasma center data:", err);
  });

// === Render Center Markers ===
function renderCenters(data, minIncentive = 0) {
  centerMarkers.forEach(marker => map.removeLayer(marker));
  centerMarkers = [];

  data.forEach(center => {
    const incentiveAmount = parseInt(center.incentive.replace(/\D/g, "")) || 0;

    if (incentiveAmount >= minIncentive) {
      const marker = L.marker([center.lat, center.lon], { icon: customGreenPin }).addTo(map);
      marker.bindPopup(`
        <strong>${center.name}</strong><br/>
        ${center.address}<br/>
        <em>${center.incentive}</em><br/>
        <a href="${center.signup}" target="_blank">Sign Up</a>
      `);
      centerMarkers.push(marker);
    }
  });
}

// === Incentive Filter ===
const filterDropdown = document.getElementById("filter");
if (filterDropdown) {
  filterDropdown.addEventListener("change", (e) => {
    const min = parseInt(e.target.value) || 0;
    renderCenters(plasmaData, min);
  });
}

// === Notifications ===
const modal = document.createElement("div");
modal.id = "notificationModal";
modal.classList.add("hidden");
modal.innerHTML = `<img src="assets/Special-Offer-Biolife.png" alt="Special Offer from BioLife">`;
document.body.appendChild(modal);

const notificationBtn = document.getElementById("notificationBtn");
const bubble = document.querySelector(".notification-bubble");

if (notificationBtn) {
  notificationBtn.addEventListener("click", () => {
    bubble.style.display = "none";
    modal.classList.remove("hidden");
  });
}

modal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

