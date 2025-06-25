const map = L.map("map").setView([0, 0], 15);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Map data © OpenStreetMap contributors",
}).addTo(map);

let marker = null;

function updateLocation() {
    fetch("/api/location")
        .then((res) => res.json())
        .then((data) => {
            if (!data || !data.latitude || !data.longitude) return;
            const { latitude, longitude } = data;
            if (marker) {
                marker.setLatLng([latitude, longitude]);
            } else {
                marker = L.marker([latitude, longitude]).addTo(map);
            }
            map.setView([latitude, longitude], 15);
        })
        .catch((err) => {
            console.error("Error fetching location:", err);
        });
}

// Actualise la position toutes les 3 secondes
setInterval(updateLocation, 3000);
updateLocation();
