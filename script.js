let plasmaData = [];
let centerMarkers = [];

// === Initialize Leaflet map ===
const map = L.map('map').setView([38.89511, -77.03637], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// === Custom Pin ===
const customGreenPin = L.icon({
  iconUrl: 'assets/phthalo-pin-glow.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -40],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// === Ask for Geolocation Permission (Mobile-safe) ===
const allowLocationBtn = document.getElementById("allowLocationBtn");
if (allowLocationBtn) {
  allowLocationBtn.addEventListener("click", () => {
    document.getElementById("locationModal").classList.add("hidden");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const userLat = pos.coords.latitude;
          const userLon = pos.coords.longitude;

          map.setView([userLat, userLon], 13);

          L.circleMarker([userLat, userLon], {
            radius: 8,
            fillColor: "#FFD700", // bright gold for visibility
            color: "#000",
            weight: 2,
            fillOpacity: 1
          }).addTo(map)
            .bindPopup("📍 You are here")
            .bringToFront();

          document.getElementById("questionnaireModal").classList.remove("hidden");
        },
        err => {
          console.warn("Geolocation failed:", err);
          alert("We couldn't access your location. You can still explore centers manually.");
          document.getElementById("questionnaireModal").classList.remove("hidden");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    }
  });
}
// === I used ChatGPT to help me write this segment. I understood how to proceed if the user allowed geolocation, but I was unsure how to handle the case where they denied it. ChatGPT suggested using a default location (Washington, DC) and provided a fallback using the IP address. I implemented the geolocation part and commented out the IP fallback to avoid a 403 error without a token. ===
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
modal.innerHTML = `<img src="assets/PlasWave-FAQ1.png" alt="PlasWave FAQ">`;
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