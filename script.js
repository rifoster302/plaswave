let plasmaData = [];
let centerMarkers = [];

const map = L.map('map').setView([38.89511, -77.03637], 11);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// === Location Permission Modal ===
setTimeout(() => {
  if (confirm("🔍 PlasWave would like to access your device’s location to help you find the closest plasma donation centers. Do you want to allow this?")) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;
          map.setView([userLat, userLon], 12);

          // Add a subtle user marker
          const userMarker = L.circleMarker([userLat, userLon], {
            radius: 6,
            fillColor: "#f4f4f4",
            color: "#0e2e1e",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
          }).addTo(map).bindPopup("📍 You are here");
        },
        error => {
          console.warn("Geolocation denied or failed. Falling back to IP or default.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    }
  }
}, 500); // Delay slightly after load

// === Optional fallback: auto-center via IP (not precise) ===
fetch("https://ipinfo.io/json?token=YOUR_TOKEN_HERE")
  .then(res => res.json())
  .then(location => {
    const [lat, lon] = location.loc.split(',');
    map.setView([parseFloat(lat), parseFloat(lon)], 11);
  })
  .catch(() => {
    console.warn("Falling back to DC center");
  });

// === Custom green pin icon ===
const customGreenPin = L.icon({
  iconUrl: 'assets/phthalo-pin-glow.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -40],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// === Load JSON data ===
fetch("dmv_plasma_centers.json")
  .then(response => response.json())
  .then(data => {
    plasmaData = data;
    renderCenters(plasmaData);
  })
  .catch(err => {
    console.error("Failed to load plasma center data:", err);
  });

// === Render map pins ===
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

// === Incentive filter event ===
document.getElementById("filter").addEventListener("change", (e) => {
  const min = parseInt(e.target.value) || 0;
  renderCenters(plasmaData, min);
});

