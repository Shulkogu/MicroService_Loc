const express = require("express");
const app = express();
const path = require("path");
const db = require("./db");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// API pour stocker la position GPS (uniquement téléphone)
app.post("/api/location", (req, res) => {
    const { latitude, longitude } = req.body;
    if (
        typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        isNaN(latitude) ||
        isNaN(longitude)
    ) {
        return res.status(400).send("Invalid latitude or longitude");
    }
    console.log("Position reçue :", latitude, longitude);
    db.run(
        "INSERT INTO positions (latitude, longitude) VALUES (?, ?)",

        [latitude, longitude],
        (err) => {
            if (err) {
                console.error("Erreur sauvegarde position :", err);
                return res.status(500).send("Error saving location");
            }
            res.sendStatus(200);
        }
    );
});

// API pour récupérer la dernière position (pour tous)
app.get("/api/location/latest", (req, res) => {
    db.get(
        "SELECT latitude, longitude FROM positions ORDER BY timestamp DESC LIMIT 1",
        (err, row) => {
            if (err) {
                console.error("Erreur récupération position :", err);
                return res.status(500).send("Error fetching location");
            }
            console.log("Position renvoyée :", row);
            res.json(row || {});
        }
    );
});

// Vue principale, adresse destination injectée
app.get("/", (req, res) => {
    res.render("index", { destinationAddress: "6 Av. du Général Leclerc, 54500 Vandœuvre-lès-Nancy" });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
