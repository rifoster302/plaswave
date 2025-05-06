let plasmaData = [];
let centerMarkers = [];

const map = L.map('map').setView([38.89511, -77.03637], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Optional: auto-center on user IP (remove if unnecessary)
fetch("https://ipinfo.io/json?token=YOUR_TOKEN_HERE")
  .then(res => res.json())
  .then(location => {
    const [lat, lon] = location.loc.split(',');
    map.setView([parseFloat(lat), parseFloat(lon)], 11);
  })
  .catch(() => {
    console.warn("Falling back to DC center");
  });

// Load your updated JSON file
fetch("dmv_plasma_centers.json")
  .then(response => response.json())
  .then(data => {
    plasmaData = data;
    renderCenters(plasmaData);
  })
  .catch(err => {
    console.error("Failed to load plasma center data:", err);
  });

// Render pins based on incentive filter
function renderCenters(data, minIncentive = 0) {
  centerMarkers.forEach(marker => map.removeLayer(marker));
  centerMarkers = [];

  data.forEach(center => {
    const incentiveAmount = parseInt(center.incentive.replace(/\D/g, "")) || 0;

    if (incentiveAmount >= minIncentive) {
      const marker = L.marker([center.lat, center.lon]).addTo(map);
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

// Filter event
document.getElementById("filter").addEventListener("change", (e) => {
  const min = parseInt(e.target.value) || 0;
  renderCenters(plasmaData, min);
});

