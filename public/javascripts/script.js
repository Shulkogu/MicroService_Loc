// Destination passée depuis index.ejs (assure-toi que cette variable est définie globalement)
console.log("Destination:", destinationAddress);

const map = L.map('map').setView([48.8566, 2.3522], 13); // Paris par défaut

// Couches OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let phoneMarker = null;
let homeMarker = null;
let routingControl = null;

// Icône maison personnalisée
const homeIcon = L.icon({
    iconUrl: '/icons/home.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
});

// Géocodage de l'adresse destination
fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationAddress)}`)
    .then(res => res.json())
    .then(data => {
        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);

            // Marqueur maison
            homeMarker = L.marker([lat, lon], { icon: homeIcon }).addTo(map).bindPopup("Destination").openPopup();

            // Centrer la carte sur la destination
            map.setView([lat, lon], 13);

            // Surveillance en temps réel de la position téléphone
            if ("geolocation" in navigator) {
                navigator.geolocation.watchPosition(
                    position => {
                        updateAndSendPosition(position, lat, lon);
                    },
                    error => {
                        alert("Géolocalisation non disponible ou refusée.");
                    },
                    { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
                );
            } else {
                alert("Géolocalisation non disponible ou appareil non mobile.");
            }
        } else {
            alert("Adresse de destination introuvable.");
        }
    })
    .catch(err => {
        console.error("Erreur géocodage:", err);
        alert("Erreur lors du géocodage de l'adresse.");
    });

// Fonction appelée à chaque changement de position sur téléphone
function updateAndSendPosition(position, destLat, destLon) {
    const { latitude, longitude } = position.coords;
    console.log("Position actuelle (bdd) :", latitude, longitude);

    if (!phoneMarker) {
        phoneMarker = L.marker([latitude, longitude]).addTo(map).bindPopup("Téléphone").openPopup();
    } else {
        phoneMarker.setLatLng([latitude, longitude]);
    }
    //map.setView([latitude, longitude], 13);

    // Suppression du tracé bleu (polyline) : on ne met plus à jour phonePositions ni la polyline

    if (routingControl) map.removeControl(routingControl);
    console.log("Position mise à jour test :", latitude, longitude);
    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(latitude, longitude),
            L.latLng(destLat, destLon)
        ],
        routeWhileDragging: false,
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        createMarker: () => null,
    }).addTo(map);

    // Envoi de la position au serveur
    fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
    }).catch(console.error);
}
